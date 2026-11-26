import { chromium, devices, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Start `npm run preview -- --port 4174 --strictPort` first.
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [], failures = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failures.push(request.url()));
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/models/')) requests.push(path);
  });
  const response = await page.goto('http://127.0.0.1:4174/?qa=1');
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => window.__anatomySnapshot?.().loadState === 'ready');
  await page.evaluate(() => document.fonts.ready);
  const { regions } = JSON.parse(await readFile(new URL('../research/results/region-manifest.json', import.meta.url)));
  assert.deepEqual(requests, ['/models/body-region.glb']);
  const picker = page.getByLabel('부위 선택');
  for (const [id, view] of Object.entries(regions)) {
    if (id !== 'body') await picker.selectOption(id);
    const handle = await page.waitForFunction(id => {
      const state = window.__anatomySnapshot?.();
      return state?.loadState === 'ready' && state.variant === id ? state.meshCount : false;
    }, id);
    assert.equal(await handle.jsonValue(), Object.values(view.groups).flatMap(group => group.members).length, id);
  }
  await picker.selectOption('chest');
  await page.waitForFunction(() => {
    const state = window.__anatomySnapshot();
    return state.loadState === 'ready' && state.variant === 'chest';
  });
  const initial = await page.evaluate(() => window.__anatomySnapshot());
  assert.equal(initial.spacing, 20);
  await page.locator('[data-group="left_lung"] .structure-select').click();
  await page.locator('#isolate').click();
  await page.locator('#spacing').fill('80');
  await page.locator('#spacing').dispatchEvent('input');
  await page.locator('#restore-layout').click();
  const restored = await page.evaluate(() => window.__anatomySnapshot());
  assert.equal(restored.spacing, 0);
  assert.ok(restored.maxRestorationError < 1e-6);
  assert.equal(restored.selected, 'left_lung');
  assert.equal(restored.groups.rib_cage.visible, false);
  assert.equal((await page.request.get('http://127.0.0.1:4174/licenses/OFL-noto-sans-kr.txt')).status(), 200);
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);

  const mobile = await browser.newPage(devices['Pixel 7']);
  await mobile.goto('http://127.0.0.1:4174/?qa=1');
  await mobile.getByRole('button', { name: '오프라인 저장', exact: true }).tap();
  await expect(mobile.locator('#offline-status')).toContainText('오프라인 저장 완료', { timeout: 60000 });
  await mobile.context().setOffline(true);
  await mobile.goto('http://127.0.0.1:4174/?offline=1&qa=1');
  const offlineRegions = [];
  for (const [id, view] of Object.entries(regions)) {
    if (id !== 'body') await mobile.getByLabel('부위 선택').selectOption(id);
    const handle = await mobile.waitForFunction(id => {
      const state = window.__anatomySnapshot?.();
      return state?.loadState === 'ready' && state.variant === id ? state.meshCount : false;
    }, id);
    assert.equal(await handle.jsonValue(), Object.values(view.groups).flatMap(group => group.members).length, id);
    assert.equal(await mobile.locator('#spacing').inputValue(), '20', id);
    offlineRegions.push(id);
  }
  await mobile.goto('http://127.0.0.1:4174/?qa=1');
  assert.equal(new URL(mobile.url()).searchParams.get('offline'), '1');
  await mobile.waitForFunction(() => {
    const state = window.__anatomySnapshot?.();
    return state?.loadState === 'ready' && state.variant === 'body';
  });

  await mkdir('test-results', { recursive: true });
  const result = { timestamp: new Date().toISOString(), status: 'passed', browser: browser.version(), userAgent: await page.evaluate(() => navigator.userAgent), graphics: initial.graphics, regions: Object.keys(regions), offlineRegions, requestedModels: requests, loadedMeshes: initial.meshCount, renderedTriangles: initial.renderer.triangles, timings: initial.timings, restoreMaxError: restored.maxRestorationError, pageErrors: errors, failedRequests: failures };
  await writeFile('test-results/production-smoke.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
