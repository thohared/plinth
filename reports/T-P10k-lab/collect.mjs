// Reproduce the mobile startup comparison, not the §6/P-19 release test.
// Build both checkouts first. Supply CHROME_PATH and LIGHTHOUSE_CLI from a
// separate tool installation; this script adds no production dependencies.
import { preview } from 'vite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const run = promisify(execFile);
const candidate = resolve('.'), baseline = resolve(process.argv[2] ?? '/tmp/plinth-startup-base');
const out = resolve('reports/T-P10k-lab');
if (!process.env.CHROME_PATH || !process.env.LIGHTHOUSE_CLI) throw new Error('Set CHROME_PATH and LIGHTHOUSE_CLI');
await mkdir(out, { recursive: true });
const servers = [];
const records = [];
try {
  for (const [i, root] of [baseline, candidate].entries()) {
    servers.push(await preview({ configFile: false, root, logLevel: 'silent',
      build: { outDir: resolve(root, 'dist') }, preview: { host: '127.0.0.1', port: 4196 + i, strictPort: true } }));
  }
  for (let trial = 1; trial <= Number(process.env.TRIALS ?? 3); trial++) {
    for (const [i, kind] of ['base', 'candidate'].entries()) {
      const url = servers[i].resolvedUrls.local[0];
      const file = `/tmp/plinth-tp10k-${kind}-${trial}.json`;
      await run(process.execPath, [process.env.LIGHTHOUSE_CLI, url,
        '--only-categories=performance,seo', '--form-factor=mobile', '--throttling-method=simulate',
        '--output=json', `--output-path=${file}`, '--quiet',
        '--chrome-flags=--headless --no-sandbox --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist'],
      { env: process.env, timeout: 180_000, maxBuffer: 4 * 1024 * 1024 });
      const raw = await readFile(file), report = JSON.parse(raw);
      await writeFile(resolve(out, `${kind}-${trial}.json.gz`), gzipSync(raw));
      if (report.runtimeError) throw new Error(JSON.stringify(report.runtimeError));
      const record = { kind, trial, lighthouseVersion: report.lighthouseVersion, fetchTime: report.fetchTime,
        environment: report.environment, config: report.configSettings,
        scores: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, value.score])),
        metrics: Object.fromEntries(['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time',
          'cumulative-layout-shift', 'speed-index'].map(key => [key, report.audits[key]?.numericValue])),
        warnings: report.runWarnings,
        failedAudits: Object.entries(report.audits).filter(([, value]) => value.score !== null && value.score < 1)
          .map(([id, value]) => ({ id, title: value.title, score: value.score, displayValue: value.displayValue })) };
      records.push(record); await writeFile(resolve(out, 'summary.json'), JSON.stringify(records, null, 2) + '\n');
      console.log(JSON.stringify({ kind, trial, scores: record.scores, metrics: record.metrics }));
    }
  }
} finally {
  await Promise.all(servers.map(server => new Promise(done => server.httpServer.close(done))));
}
