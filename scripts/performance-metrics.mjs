// Diagnostic distributions only: neither metric covers an entire displayed frame.
export function distribution(values) {
  if (values.some(v => !Number.isFinite(v) || v < 0)) throw new Error('Invalid timing sample');
  const sorted = [...values].sort((a, b) => a - b);
  const quantile = p => sorted.length ? sorted[Math.max(0, Math.ceil(p * sorted.length) - 1)] : null;
  return { n: sorted.length, p50: quantile(0.5), p99: quantile(0.99), hitches: values.filter(v => v > 50).length };
}

export function cov(values) {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return null;
  return Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1)) / mean;
}

export function summarize(runs, smoke = false) {
  const summaries = runs.map(run => ({
    renderSamples: run.samples.length,
    cpu: distribution(run.samples.map(s => s.cpuMs)),
    gpu: distribution(run.samples.filter(s => s.gpuMs !== null).map(s => s.gpuMs)),
    missingGpu: run.samples.filter(s => s.gpuMs === null).length,
    cadence: distribution(run.cadenceMs),
  }));
  const aggregate = key => {
    const p50 = summaries.map(s => s[key].p50).filter(v => v !== null);
    const p99 = summaries.map(s => s[key].p99).filter(v => v !== null);
    return { n: p50.length, medianP50: distribution(p50).p50, medianP99: distribution(p99).p50,
      covP50: cov(p50), covP99: cov(p99), totalHitches: summaries.reduce((n, s) => n + s[key].hitches, 0) };
  };
  const cpu = aggregate('cpu'), gpu = aggregate('gpu');
  const reasons = ['Partial render metrics cannot certify the complete §6 frame-time gate.'];
  if (smoke) reasons.push('Shortened smoke workload, not P-19.');
  if (runs.length !== 5) reasons.push(`Expected five runs; received ${runs.length}.`);
  if (summaries.some(s => s.renderSamples < 1500)) reasons.push('A run has fewer than 1500 actual render samples.');
  if (summaries.some(s => s.missingGpu)) reasons.push('Missing GPU timings; null samples retained.');
  if ([cpu, gpu].some(s => s.n < 3 || s.covP50 === null || s.covP99 === null || s.covP50 > .2 || s.covP99 > .2)) reasons.push('Insufficient or variable diagnostic distributions.');
  if (cpu.totalHitches || gpu.totalHitches) reasons.push('Diagnostic hitches exist; no averaging away of outliers.');
  if (runs.some(r => r.errors.length || r.interruptions.length)) reasons.push('Errors or lifecycle interruptions occurred.');
  if (runs.some(r => r.skippedInputs || r.actions.some(a => a.latenessMs > 50))) reasons.push('Input trace has skipped or late actions.');
  if (runs.some(r => r.startHandshakeMs > 50 || r.stoppedAtMs < r.durationMs)) reasons.push('Start alignment or measured window is incomplete.');
  return { status: 'LOW-TRUST', releaseGate: 'pending', reasons, runs: summaries, cpu, gpu };
}

// Serialized by Playwright. Keep this function self-contained.
export function installProbe() {
  let gl, ext, environment, start = null, duration = 0, active = false, raf = null;
  let samples = [], cadenceMs = [], events = [], interruptions = [], pending = [], previous = null;
  const elapsed = () => start === null ? null : performance.now() - start;
  const inside = () => active && elapsed() < duration;
  const discard = reason => {
    for (const { query, sample } of pending) { sample.gpuStatus = reason; gl.deleteQuery(query); }
    pending = [];
  };
  function poll() {
    if (!gl || !ext || !pending.length) return;
    if (gl.isContextLost()) { discard('context-lost'); return; }
    if (gl.getParameter(ext.GPU_DISJOINT_EXT)) { discard('disjoint'); return; }
    pending = pending.filter(({ query, sample }) => {
      if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) return true;
      const ms = gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6;
      sample.gpuMs = Number.isFinite(ms) && ms >= 0 ? ms : null;
      sample.gpuStatus = sample.gpuMs === null ? 'invalid' : 'available';
      gl.deleteQuery(query); return false;
    });
  }
  function tick(timestamp) {
    if (!inside()) { active = false; raf = null; return; }
    if (previous !== null) cadenceMs.push(timestamp - previous);
    previous = timestamp;
    poll(); raf = requestAnimationFrame(tick);
  }
  const receipt = event => {
    if (!inside()) return;
    events.push({ atMs: elapsed(), type: event.type, target: event.target?.id,
      value: event.target?.value, x: event.clientX, y: event.clientY, trusted: event.isTrusted });
  };
  for (const type of ['change', 'click', 'pointerdown', 'pointermove', 'pointerup']) document.addEventListener(type, receipt, true);
  document.addEventListener('visibilitychange', () => { if (inside()) interruptions.push({ atMs: elapsed(), type: 'visibility', state: document.visibilityState }); });
  document.addEventListener('webglcontextlost', () => { if (inside()) interruptions.push({ atMs: elapsed(), type: 'context-lost' }); }, true);
  window.__plinthPerf = {
    measure(render, context) {
      if (!gl) {
        gl = context; ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
        const debug = gl.getExtension('WEBGL_debug_renderer_info');
        environment = { userAgent: navigator.userAgent, platform: navigator.platform,
          hardwareConcurrency: navigator.hardwareConcurrency, dpr: devicePixelRatio,
          viewport: [innerWidth, innerHeight], gpuTimer: !!ext,
          renderer: gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
          vendor: gl.getParameter(debug ? debug.UNMASKED_VENDOR_WEBGL : gl.VENDOR) };
      }
      if (!inside()) return render();
      const sample = { atMs: elapsed(), cpuMs: null, gpuMs: null, gpuStatus: ext ? 'pending' : 'unsupported' };
      const query = ext ? gl.createQuery() : null;
      if (query) gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
      const before = performance.now();
      try { return render(); }
      finally {
        sample.cpuMs = performance.now() - before;
        if (query) { gl.endQuery(ext.TIME_ELAPSED_EXT); pending.push({ query, sample }); }
        else if (ext) sample.gpuStatus = 'allocation-failed';
        samples.push(sample);
      }
    },
    begin(ms) {
      if (raf !== null) cancelAnimationFrame(raf);
      discard('reset'); samples = []; cadenceMs = []; events = []; interruptions = []; previous = null;
      if (ext) gl.getParameter(ext.GPU_DISJOINT_EXT);
      duration = ms; start = performance.now(); active = true;
      if (document.hidden) interruptions.push({ atMs: 0, type: 'hidden-at-start' });
      raf = requestAnimationFrame(tick);
    },
    async finish() {
      active = false;
      if (raf !== null) cancelAnimationFrame(raf);
      const stoppedAtMs = elapsed(), deadline = performance.now() + 2000;
      while (pending.length && performance.now() < deadline) {
        await new Promise(resolve => setTimeout(resolve, 16)); poll();
      }
      discard('timeout');
      return { environment, durationMs: duration, stoppedAtMs, samples, cadenceMs, events, interruptions };
    },
  };
}
