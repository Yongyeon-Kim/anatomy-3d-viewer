import assert from 'node:assert/strict';
import { cpus, platform, release } from 'node:os';
import { chromium } from '@playwright/test';

const base = process.env.ANATOMY_BENCHMARK_URL ?? 'http://127.0.0.1:4174';
const duration = 30000;
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const rounds = [];

function summarize(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const percentile = value => sorted[Math.floor((sorted.length - 1) * value)];
  return { count: sorted.length, medianMs: percentile(.5), p95Ms: percentile(.95) };
}

try {
  for (const region of ['chest', 'lungs']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      if (region === 'lungs') {
        await page.route('**/models/chest-region.glb', route => route.fulfill({ status: 503, body: '' }));
      }
      await page.goto(new URL('/?region=chest&qa=1', base).href);
      if (region === 'lungs') await page.locator('#fallback').click();
      await page.waitForFunction(id => {
        const state = window.__anatomySnapshot?.();
        return state?.loadState === 'ready' && state.variant === id;
      }, region);
      const initial = await page.evaluate(() => {
        const state = window.__anatomySnapshot();
        const entry = performance.getEntriesByType('resource').filter(item => item.name.includes('/models/')).at(-1);
        return {
          bytes: state.timings.bytes, meshes: state.meshCount, triangles: state.renderer.triangles,
          timings: state.timings, http: { untilFirstByteMs: entry.responseStart - entry.startTime,
            downloadMs: entry.responseEnd - entry.responseStart, transferSize: entry.transferSize },
          userAgent: navigator.userAgent, graphics: state.graphics, viewport: [innerWidth, innerHeight],
          heapBefore: performance.memory?.usedJSHeapSize ?? null, resourcesBefore: state.rendererResources,
        };
      });
      const canvas = page.locator('#scene');
      const bounds = await canvas.boundingBox();
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + bounds.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.evaluate(() => {
        const samples = { frames: [], input: [], previous: null };
        const canvas = document.getElementById('scene');
        const measureFrame = time => {
          if (samples.previous !== null) samples.frames.push(time - samples.previous);
          samples.previous = time;
          samples.frameId = requestAnimationFrame(measureFrame);
        };
        samples.onDrag = event => requestAnimationFrame(() => samples.input.push(performance.now() - event.timeStamp));
        canvas.addEventListener('pointermove', samples.onDrag);
        samples.frameId = requestAnimationFrame(measureFrame);
        window.benchmarkSamples = samples;
      });
      const start = performance.now();
      let step = 0;
      while (performance.now() - start < duration) {
        await page.mouse.move(x + 85 * Math.sin(step / 14), y + 40 * Math.sin(step / 23));
        step++;
      }
      await page.mouse.up();
      const elapsedMs = performance.now() - start;
      const result = await page.evaluate(() => {
        const { frames, input, frameId, onDrag } = window.benchmarkSamples;
        cancelAnimationFrame(frameId);
        document.getElementById('scene').removeEventListener('pointermove', onDrag);
        return { frames, input, heapAfter: performance.memory?.usedJSHeapSize ?? null,
          resourcesAfter: window.__anatomySnapshot().rendererResources };
      });
      assert.ok(result.frames.length > 10 && result.input.length > 10);
      const { frames, input, ...resources } = result;
      rounds.push({ region, ...initial, elapsedMs, ...resources, frames: summarize(frames), inputToNextFrame: summarize(input) });
    } finally { await page.close(); }
  }
  console.log(JSON.stringify({ date: new Date().toISOString(), os: `${platform()} ${release()}`, cpu: cpus()[0]?.model,
    browser: browser.version(), network: new URL(base).hostname, rounds }, null, 2));
} finally { await browser.close(); }
