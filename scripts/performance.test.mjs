import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { distribution, cov, summarize, installProbe } from './performance-metrics.mjs';
import { instrument } from './performance.mjs';

const run = samples => ({ samples, cadenceMs: [16.7], errors: [], interruptions: [], actions: [], skippedInputs: 0 });
test('a slow tail survives quantiles and hitch counting', () => {
  const values = [...Array(1484).fill(2), ...Array(16).fill(80)];
  assert.deepEqual(distribution(values), { n: 1500, p50: 2, p99: 80, hitches: 16 });
  assert.equal(distribution([50, 50.01]).hitches, 1);
  assert.throws(() => distribution([NaN]));
});
test('missing timings never become fast GPU samples and five runs never imply a release PASS', () => {
  const samples = Array.from({ length: 1500 }, () => ({ cpuMs: 1, gpuMs: null }));
  const result = summarize(Array.from({ length: 5 }, () => run(samples)));
  assert.equal(result.runs[0].gpu.n, 0);
  assert.equal(result.runs[0].gpu.p50, null);
  assert.equal(result.runs[0].missingGpu, 1500);
  assert.equal(result.status, 'LOW-TRUST');
  assert.equal(result.releaseGate, 'pending');
});
test('cadence does not fill render samples; one hitch in five remains visible', () => {
  const runs = Array.from({ length: 5 }, () => run([{ cpuMs: 1, gpuMs: 1 }]));
  runs[4].samples.push({ cpuMs: 100, gpuMs: 75 });
  const result = summarize(runs);
  assert.equal(result.cpu.totalHitches, 1);
  assert.equal(result.gpu.totalHitches, 1);
  assert.match(result.reasons.join(' '), /fewer than 1500/);
  assert.equal(result.runs[0].renderSamples, 1);
  assert.equal(cov([10, 20, 30]), .5);
});
test('empty, short and unstable trials remain explicit', () => {
  assert.equal(summarize([]).cpu.n, 0);
  assert.equal(summarize([]).cpu.medianP50, null);
  const runs = [1, 1, 1, 1, 100].map(v => run([{ cpuMs: v, gpuMs: v }]));
  runs[0].skippedInputs = 2;
  runs[1].errors.push('lost context');
  const result = summarize(runs, true);
  assert.ok(result.cpu.covP50 > .2);
  assert.match(result.reasons.join(' '), /Shortened smoke/);
  assert.match(result.reasons.join(' '), /skipped or late/);
  assert.match(result.reasons.join(' '), /Errors or lifecycle/);
});
test('instrumentation rejects drift and ambiguous anchors', () => {
  const anchor = '    studio.render();\n    if (!ready)';
  assert.throws(() => instrument('different source'), /exactly one/);
  assert.throws(() => instrument(anchor + anchor), /exactly one/);
  assert.match(instrument(anchor), /__plinthPerf.measure/);
});

function probeHarness(supported = true) {
  let clock = 0, nextRaf = 0, disjoint = false;
  const rafs = new Map(), queries = [], deleted = [];
  const ext = { TIME_ELAPSED_EXT: 1, GPU_DISJOINT_EXT: 2 };
  const gl = {
    RENDERER: 3, VENDOR: 4, QUERY_RESULT_AVAILABLE: 5, QUERY_RESULT: 6,
    getExtension: name => name === 'EXT_disjoint_timer_query_webgl2' && supported ? ext : null,
    getParameter: p => p === ext.GPU_DISJOINT_EXT ? disjoint : 'mock GPU',
    createQuery: () => { const query = { ready: false, nanos: 3000000 }; queries.push(query); return query; },
    beginQuery() {}, endQuery() {}, isContextLost: () => false,
    getQueryParameter: (q, p) => p === 5 ? q.ready : q.nanos,
    deleteQuery: q => deleted.push(q),
  };
  const context = vm.createContext({ window: {}, navigator: {}, devicePixelRatio: 1, innerWidth: 1280, innerHeight: 800,
    document: { hidden: false, addEventListener() {} }, performance: { now: () => clock },
    requestAnimationFrame: fn => { rafs.set(++nextRaf, fn); return nextRaf; },
    cancelAnimationFrame: id => rafs.delete(id),
    setTimeout: fn => { clock += 16; queueMicrotask(fn); },
  });
  vm.runInContext(`(${installProbe.toString()})()`, context);
  const probe = context.window.__plinthPerf;
  probe.measure(() => {}, gl); // Normal pre-measurement initialization is not a sample.
  return { probe, gl, queries, deleted,
    render(ms) { probe.measure(() => { clock += ms; }, gl); },
    advance(ms) { clock += ms; const callbacks = [...rafs.values()]; rafs.clear(); callbacks.forEach(fn => fn(clock)); },
    disjoint() { disjoint = true; },
  };
}
test('GPU results are asynchronous, and CPU/GPU timings stay separate', async () => {
  const h = probeHarness(); h.probe.begin(60000); h.render(7);
  h.advance(16); assert.equal(h.deleted.length, 0);
  h.queries[0].ready = true; h.advance(16);
  const result = await h.probe.finish();
  assert.equal(result.samples.length, 1);
  assert.equal(result.samples[0].cpuMs, 7);
  assert.equal(result.samples[0].gpuMs, 3);
  assert.equal(result.samples[0].gpuStatus, 'available');
  assert.equal(h.deleted.length, 1);
});
test('disjoint and unresolved queries retain CPU samples and null GPU evidence', async () => {
  for (const kind of ['disjoint', 'timeout']) {
    const h = probeHarness(); h.probe.begin(60000); h.render(80);
    if (kind === 'disjoint') { h.disjoint(); h.advance(16); }
    const result = await h.probe.finish();
    assert.equal(result.samples[0].cpuMs, 80);
    assert.equal(result.samples[0].gpuMs, null);
    assert.equal(result.samples[0].gpuStatus, kind);
    assert.equal(h.deleted.length, 1);
  }
});
test('idle callbacks and out-of-window renders do not inflate actual sample count', async () => {
  const h = probeHarness(false); h.probe.begin(100);
  h.advance(16); h.advance(16); h.render(80); // Slow render starts inside window, ends outside.
  h.render(5); // Must not count.
  const result = await h.probe.finish();
  assert.equal(result.samples.length, 1);
  assert.equal(result.samples[0].cpuMs, 80);
  assert.equal(result.samples[0].gpuStatus, 'unsupported');
  assert.equal(result.cadenceMs.length, 1);
});
