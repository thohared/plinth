import { build, preview } from 'vite';
import { chromium } from 'playwright';
import { parseArgs } from 'node:util';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { installProbe, summarize } from './performance-metrics.mjs';

export const TRACE = {
  id: 'P19-desktop-diagnostic-v1', viewport: { width: 1280, height: 800 }, dpr: 1,
  durationMs: 60000, runs: 5, warmup: 'one full trace, reset, 2000 ms settle',
  devices: ['phone', 'tablet', 'laptop', 'browser', 'card'],
  scenes: ['soft-studio', 'dark-glass', 'warm-sunset', 'clean-white'],
  poses: ['front', 'top', 'lean'],
  horizontal: [[.2, .5], [.8, .5]], vertical: [[.5, .2], [.5, .8]],
  dragSteps: 180, dragCount: 12, dragMs: 3000,
};
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const hash = text => createHash('sha256').update(text).digest('hex');
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();

export function instrument(code) {
  const anchor = '    studio.render();\n    if (!ready)';
  if (code.split(anchor).length !== 2) throw new Error('Expected exactly one main render anchor');
  return code.replace(anchor, '    window.__plinthPerf.measure(() => studio.render(), renderer.getContext());\n    if (!ready)');
}

async function treeHashes(root, prefix = '') {
  const result = {};
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const name = join(prefix, entry.name);
    if (entry.isDirectory()) Object.assign(result, await treeHashes(root, name));
    else result[name] = hash(await readFile(join(root, name)));
  }
  return result;
}

async function trace(page, box, scale, start, inputLog = { actions: [], skippedInputs: 0 }) {
  const { actions } = inputLog;
  const at = async (ms, name, action) => {
    const target = start + ms * scale;
    while (performance.now() < target) await sleep(Math.max(1, target - performance.now()));
    const actual = performance.now();
    const entry = { name, targetMs: ms * scale, atMs: actual - start, latenessMs: actual - target };
    actions.push(entry);
    await action(); entry.durationMs = performance.now() - actual;
  };
  const select = (name, value) => page.locator(`#control-${name}`).selectOption(value);
  for (let i = 0; i < TRACE.devices.length; i++) await at(i * 2000, `device:${TRACE.devices[i]}`, () => select('device', TRACE.devices[i]));
  for (let i = 0; i < TRACE.scenes.length; i++) await at(10000 + i * 2000, `scene:${TRACE.scenes[i]}`, () => select('scene', TRACE.scenes[i]));
  for (let i = 0; i < TRACE.poses.length; i++) await at(18000 + i * 2000, `pose:${TRACE.poses[i]}`, () => select('pose', TRACE.poses[i]));
  await at(24000, 'laptop:free-view', async () => {
    await select('device', 'laptop');
    if (await page.locator('#free-view').getAttribute('aria-pressed') !== 'true') await page.locator('#free-view').click();
    const current = await page.locator('canvas').first().boundingBox();
    if (JSON.stringify(current) !== JSON.stringify(box)) throw new Error('Canvas rectangle changed during trace');
  });
  for (let k = 0; k < TRACE.dragCount; k++) {
    const [from, to] = k % 2 ? TRACE.vertical : TRACE.horizontal;
    const xy = f => [box.x + box.width * (from[0] + (to[0] - from[0]) * f), box.y + box.height * (from[1] + (to[1] - from[1]) * f)];
    await at(24000 + k * TRACE.dragMs, `drag:${k}:start`, async () => {
      await page.mouse.up(); await page.mouse.move(...xy(0)); await page.mouse.down();
    });
    for (let j = 1; j < TRACE.dragSteps; j++) {
      const ms = 24000 + k * TRACE.dragMs + j * TRACE.dragMs / TRACE.dragSteps;
      if (performance.now() > start + (ms + TRACE.dragMs / TRACE.dragSteps) * scale) { inputLog.skippedInputs++; continue; }
      await at(ms, `drag:${k}:${j}`, () => page.mouse.move(...xy(j / TRACE.dragSteps)));
    }
  }
  await at(60000, 'end', () => page.mouse.up());
  return inputLog;
}

async function main() {
  const { values } = parseArgs({ options: {
    out: { type: 'string' }, hardware: { type: 'string' }, channel: { type: 'string' },
    smoke: { type: 'boolean' }, headless: { type: 'boolean' }, software: { type: 'boolean' },
    'build-only': { type: 'boolean' },
  } });
  if (!values.out) throw new Error('Required: --out NEW_DIRECTORY');
  if (!values['build-only'] && !values.hardware) throw new Error('Required: --hardware description (include physical/cloud, CPU/GPU/RAM/display Hz/power mode)');
  const output = resolve(values.out);
  // Intentionally reject existing directories; never overwrite a previous trial.
  await mkdir(dirname(output), { recursive: true });
  await mkdir(output, { recursive: false });
  const save = (name, data) => writeFile(join(output, name), JSON.stringify(data, null, 2) + '\n');
  const buildDir = join(output, 'site');
  const manifest = { trace: TRACE, smoke: !!values.smoke, startedAt: new Date().toISOString(),
    commit: git('rev-parse', 'HEAD'), tree: git('rev-parse', 'HEAD^{tree}'), dirty: git('status', '--porcelain'),
    hardware: values.hardware ?? 'build only', headless: !!values.headless, forcedSoftware: !!values.software,
    browserChannel: values.channel ?? 'playwright-chromium',
    host: { os: os.platform(), release: os.release(), arch: os.arch(), cpu: os.cpus()[0]?.model, logicalCpus: os.cpus().length, ramBytes: os.totalmem(), node: process.version },
    scripts: Object.fromEntries(await Promise.all(['performance.mjs', 'performance-metrics.mjs'].map(async name => [name, hash(await readFile(`scripts/${name}`))]))),
    sourceMainSha256: hash(await readFile('src/main.ts')),
    limitation: 'Instrumented partial CPU/GPU metrics; no complete-frame or physical-device PASS.',
  };
  const runs = []; let browser, server;
  await save('manifest.json', manifest);
  try {
    let transformed = 0;
    await build({ build: { outDir: buildDir }, plugins: [{ name: 'plinth-local-perf-probe', enforce: 'pre',
      transform(code, id) { if (id === resolve('src/main.ts')) { transformed++; return instrument(code); } },
    }] });
    if (transformed !== 1) throw new Error('Benchmark build did not instrument exactly one module');
    manifest.buildHashes = await treeHashes(buildDir);
    await save('manifest.json', manifest);
    if (values['build-only']) return;
    server = await preview({ build: { outDir: buildDir }, preview: { host: '127.0.0.1', port: 4175, strictPort: true } });
    browser = await chromium.launch({ headless: !!values.headless, ...(values.channel ? { channel: values.channel } : {}),
      args: values.software ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [] });
    manifest.browserVersion = browser.version(); await save('manifest.json', manifest);
    const scale = values.smoke ? .1 : 1;
    for (let i = 0; i < (values.smoke ? 1 : TRACE.runs); i++) {
      const context = await browser.newContext({ viewport: TRACE.viewport, deviceScaleFactor: TRACE.dpr });
      await context.addInitScript(installProbe);
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      let measured = false;
      const inputs = { actions: [], skippedInputs: 0 };
      let warmup;
      try {
        await page.goto('http://127.0.0.1:4175/', { waitUntil: 'networkidle' });
        await page.waitForFunction(() => document.documentElement.dataset.plinthReady === '1', null, { timeout: 120000 });
        const box = await page.locator('canvas').first().boundingBox();
        if (!box || box.width <= 0 || box.height <= 0) throw new Error('No visible canvas');
        console.log(`Run ${i + 1}: explicit warm-up`);
        warmup = await trace(page, box, scale, performance.now());
        await page.locator('#free-view').click();
        await page.locator('#control-device').selectOption('phone');
        await page.locator('#control-scene').selectOption('soft-studio');
        await page.locator('#control-pose').selectOption('hero');
        await sleep(2000);
        if (errors.length) throw new Error('Page errors during warm-up');
        const beforeStart = performance.now();
        await page.evaluate(ms => window.__plinthPerf.begin(ms), TRACE.durationMs * scale);
        const start = performance.now(), startHandshakeMs = start - beforeStart;
        measured = true;
        console.log(`Run ${i + 1}: collecting ${TRACE.durationMs * scale / 1000}s`);
        await trace(page, box, scale, start, inputs);
        const data = await page.evaluate(() => window.__plinthPerf.finish());
        measured = false;
        runs.push({ ...data, ...inputs, warmup, errors, canvas: box, startHandshakeMs });
        await save(`run-${i + 1}.json`, runs.at(-1));
        await save('summary.json', summarize(runs, !!values.smoke));
        if (!data.samples.length) throw new Error('Probe collected no actual render samples');
        for (const [control, expected] of [['device', TRACE.devices], ['scene', TRACE.scenes], ['pose', TRACE.poses]]) {
          const observed = new Set(data.events.filter(e => e.type === 'change' && e.target === `control-${control}`).map(e => e.value));
          if (expected.some(value => !observed.has(value))) throw new Error(`Missing measured ${control} input receipts`);
        }
        if (!data.events.some(e => e.type === 'pointermove' && e.atMs >= 24000 * scale)) throw new Error('Missing measured drag input receipts');
        if (errors.length || data.interruptions.length) throw new Error('Run has page errors or lifecycle interruptions');
      } catch (error) {
        if (measured) {
          const partial = await page.evaluate(() => window.__plinthPerf.finish()).catch(() => null);
          await save(`run-${i + 1}-partial.json`, { partial, ...inputs, warmup, errors, error: String(error) });
        }
        throw error;
      } finally { await context.close(); }
    }
  } catch (error) {
    await save('failure.json', { error: String(error), completedRuns: runs.length, releaseGate: 'pending' });
    throw error;
  } finally {
    await browser?.close();
    if (server) await new Promise(resolve => server.httpServer.close(resolve));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
