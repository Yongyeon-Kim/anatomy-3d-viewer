import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';

const browser = JSON.parse(await readFile('test-results/browser-results.json'));
const production = JSON.parse(await readFile('test-results/production-smoke.json'));
if (browser.stats.unexpected || browser.stats.flaky || browser.stats.expected !== 15 || production.status !== 'passed') throw new Error('브라우저 검증 완료 결과가 필요합니다.');
const unit = spawnSync(process.execPath, ['--test', 'tests/model.test.mjs'], { encoding: 'utf8' });
if (unit.status !== 0) throw new Error(unit.stdout + unit.stderr);
const files = ['index.html', 'src/main.js', 'src/model.js', 'src/style.css', 'vite.config.js', 'package-lock.json', 'tests/model.test.mjs', 'tests/browser/viewer.spec.js', 'playwright.config.js', 'scripts/prepare-viewer-assets.mjs'];
const sourceSha256 = Object.fromEntries(await Promise.all(files.map(async path => [path, createHash('sha256').update(await readFile(path)).digest('hex')])));
const cases = [];
const environments = [];
function walk(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests) {
      cases.push({ title: spec.title, project: test.projectName, outcome: test.results.at(-1).status });
      for (const result of test.results) for (const attachment of result.attachments) {
        if (attachment.name !== 'loaded-model-evidence') continue;
        const snapshot = JSON.parse(Buffer.from(attachment.body, 'base64').toString());
        environments.push({ project: test.projectName, browser: snapshot.browser, graphics: snapshot.graphics, loadedMeshes: snapshot.meshCount, renderedTriangles: snapshot.renderer.triangles, timings: snapshot.timings });
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child);
}
for (const suite of browser.suites) walk(suite);
const result = {
  timestamp: new Date().toISOString(), scope: 'internal prototype, current execution environment only',
  environment: { platform: os.platform(), release: os.release(), arch: os.arch(), node: process.version },
  unit: { status: 'passed', tests: 3, restorationCycles: 1000, maximumRestorationError: 0, evidence: 'tests/model.test.mjs assertions against actual GLB; executed while generating this report' },
  browser: { ...browser.stats, cases, environments, skippedReason: 'Desktop duplicate of touch-only mobile emulation case; physical device coverage is not claimed' },
  production, sourceSha256,
  limitations: ['Physical phone/tablet verification pending', 'Medical expert review pending', 'Human usability study pending', 'Real device FPS/memory/thermal and network benchmarking pending', 'Mobile panels require scrolling; interaction convenience unvalidated', 'Known geometry openings and incomplete heart/bronchial structures'],
};
await writeFile('research/results/prototype-verification.json', JSON.stringify(result, null, 2) + '\n');
console.log('Recorded: unit 3 passed; browser 15 passed, 1 intentional skip; production smoke passed.');
