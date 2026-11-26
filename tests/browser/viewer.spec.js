import { test, expect } from '@playwright/test';

const snapshot = page => page.evaluate(() => window.__anatomySnapshot());
async function ready(page, region = 'chest') {
  await page.goto(region === 'body' ? '/?qa=1' : `/?qa=1&region=${region}`);
  await readyRegion(page, region);
}
async function readyRegion(page, region) {
  await expect.poll(async () => {
    const data = await snapshot(page);
    return [data.loadState, data.variant];
  }).toEqual(['ready', region]);
}
const group = (page, id) => page.locator(`[data-group="${id}"] .structure-select`);
async function space(page, value) {
  await page.locator('#spacing').fill(String(value));
  await page.locator('#spacing').dispatchEvent('input');
}

test('full interaction: load → orbit → select/focus → hide/isolate → spread → independent restores', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  const original = await snapshot(page);
  expect(original.spacing).toBe(20);
  expect(original.meshCount).toBe(103);
  expect(Object.values(original.groups).slice(0, 6).map(g => g.count)).toEqual([2, 3, 4, 47, 1, 1]);
  expect(original.groups.bronchus_left.count).toBe(1);
  expect(original.groups.esophagus.count).toBe(1);
  expect(original.renderer.triangles).toBeGreaterThan(240979);
  const bounds = await page.locator('#scene').boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width / 2 + 70, bounds.y + bounds.height / 2 + 25, { steps: 10 }); await page.mouse.up();
  expect((await snapshot(page)).camera.position).not.toEqual(original.camera.position);
  expect((await snapshot(page)).selected).toBeNull();
  await group(page, 'left_lung').click();
  await expect(group(page, 'left_lung')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#focus').click();
  let state = await snapshot(page);
  state.camera.target.forEach((n, i) => expect(n).toBeCloseTo(state.selectionCenter[i], 8));
  await page.getByRole('button', { name: '갈비뼈·늑연골·흉골 숨김', exact: true }).click();
  expect((await snapshot(page)).groups.rib_cage.visible).toBe(false);
  await page.locator('#isolate').click();
  expect(Object.entries((await snapshot(page)).groups).filter(([, g]) => g.visible).map(([id]) => id)).toEqual(['left_lung']);
  await space(page, 70);
  state = await snapshot(page);
  expect(state.matrices).not.toEqual(original.matrices);
  expect(state.spacing).toBe(70);
  const camera = state.camera;
  await page.locator('#restore-layout').click();
  state = await snapshot(page);
  expect(state.spacing).toBe(0);
  expect(state.maxRestorationError).toBeLessThan(1e-6);
  expect(state.selected).toBe('left_lung');
  expect(state.camera).toEqual(camera);
  expect(state.groups.rib_cage.visible).toBe(false);
  await page.locator('#show-all').click();
  expect(Object.values((await snapshot(page)).groups).every(g => g.visible)).toBe(true);
  for (let i = 0; i < 5; i++) {
    await page.locator('#isolate').click();
    await page.locator('#show-all').click();
  }
  expect(Object.values((await snapshot(page)).groups).every(g => g.visible)).toBe(true);
  await space(page, 40);
  await page.locator('#reset-camera').click();
  expect((await snapshot(page)).spacing).toBe(40);
  expect((await snapshot(page)).selected).toBe('left_lung');
  await page.locator('#hide-selected').click();
  expect((await snapshot(page)).selected).toBeNull();
  await expect(page.locator('#focus')).toBeDisabled();
  await expect(group(page, 'left_lung')).toBeDisabled();
  await page.getByRole('button', { name: '왼쪽 폐 표시', exact: true }).click();
  await page.locator('#reset-all').click();
  state = await snapshot(page);
  expect(state.matrices).toEqual(original.matrices);
  expect(state.camera).toEqual(original.camera);
  expect(state.selected).toBeNull();
  expect(state.spacing).toBe(20);
  expect(state.groups).toEqual(original.groups);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `test-results/${testInfo.project.name}-overview.png`, fullPage: true });
  await page.getByRole('button', { name: '갈비뼈·늑연골·흉골 숨김', exact: true }).click();
  await group(page, 'heart_chambers').click();
  await space(page, 65);
  await page.locator('#scene').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/${testInfo.project.name}-spread.png`, fullPage: true });
  await testInfo.attach('loaded-model-evidence', { body: JSON.stringify({ browser: await page.context().browser().version(), ...original }), contentType: 'application/json' });
});

test('canvas raycast selection, keyboard orbit, wheel/button zoom clamps and layout width', async ({ page }) => {
  await ready(page);
  const spacingPanel = page.getByRole('region', { name: '구조 사이 간격' });
  await expect(spacingPanel.getByRole('slider', { name: '구조 사이 간격' })).toBeVisible();
  await expect(spacingPanel.getByRole('button', { name: '배치만 복원' })).toBeVisible();
  const viewerEnd = await page.locator('#viewport').evaluate(el => el.getBoundingClientRect().bottom);
  const spacingStart = await spacingPanel.evaluate(el => el.getBoundingClientRect().top);
  expect(spacingStart).toBeCloseTo(viewerEnd, 1);

  await group(page, 'left_lung').click();
  await page.locator('#isolate').click();
  await page.locator('#focus').click();
  await page.locator('#clear-selection').click();
  await page.locator('#scene').scrollIntoViewIfNeeded();
  const rect = await page.locator('#scene').boundingBox();
  // Find the rendered surface through real raycast clicks, without a test-only mutation API.
  for (const [x, y] of [[.5, .5], [.4, .5], [.6, .5], [.5, .4], [.5, .6]]) {
    await page.mouse.click(rect.x + rect.width * x, rect.y + rect.height * y);
    if ((await snapshot(page)).selected) break;
  }
  expect((await snapshot(page)).selected).toBe('left_lung');
  await page.locator('#scene').focus();
  let before = await snapshot(page);
  await page.keyboard.press('ArrowRight');
  expect((await snapshot(page)).camera.position).not.toEqual(before.camera.position);
  await page.keyboard.press('Escape');
  expect((await snapshot(page)).selected).toBeNull();
  before = await snapshot(page);
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, -250);
  await expect.poll(async () => (await snapshot(page)).camera.distance).toBeLessThan(before.camera.distance);
  await page.evaluate(() => { for (let i = 0; i < 60; i++) document.getElementById('zoom-in').click(); });
  let state = await snapshot(page);
  expect(state.camera.distance).toBeCloseTo(state.camera.min, 8);
  await page.evaluate(() => { for (let i = 0; i < 60; i++) document.getElementById('zoom-out').click(); });
  state = await snapshot(page);
  expect(state.camera.distance).toBeCloseTo(state.camera.max, 8);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('abdomen opens from the model picker and its direct link with independent controls', async ({ page }) => {
  await ready(page);
  const picker = page.getByLabel('부위 선택');
  await picker.selectOption('abdomen');
  await expect(page.locator('#asset-status')).toHaveText('복부 전체 모델');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('복부 탐색');
  await expect(page).toHaveURL(/region=abdomen/);
  const original = await snapshot(page);
  expect(original.variant).toBe('abdomen');
  expect(original.meshCount).toBe(30);
  expect(original.groups.lumbar_spine.count).toBe(5);
  expect(original.groups.colon.count).toBe(4);
  expect(Object.values(original.groups).every(item => item.visible)).toBe(true);
  const viewportEnd = await page.locator('#viewport').evaluate(el => el.getBoundingClientRect().bottom);
  const spacingStart = await page.locator('.spacing-panel').evaluate(el => el.getBoundingClientRect().top);
  expect(spacingStart).toBeCloseTo(viewportEnd, 1);

  await group(page, 'pancreas').click();
  await page.locator('#focus').click();
  await page.locator('#isolate').click();
  expect((await snapshot(page)).groups.stomach.visible).toBe(false);
  const camera = (await snapshot(page)).camera;
  await space(page, 65);
  expect((await snapshot(page)).matrices).not.toEqual(original.matrices);
  await page.locator('#restore-layout').click();
  const restored = await snapshot(page);
  expect(restored.spacing).toBe(0);
  expect(restored.maxRestorationError).toBeLessThan(1e-6);
  expect(restored.camera).toEqual(camera);
  expect(restored.selected).toBe('pancreas');
  expect(restored.groups.stomach.visible).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#show-all').click();
  expect((await snapshot(page)).groups.diaphragm.visible).toBe(true);
  await page.locator('#reset-all').click();
  expect(Object.values((await snapshot(page)).groups).every(item => item.visible)).toBe(true);

  await page.reload();
  await expect(page.locator('#asset-status')).toHaveText('복부 전체 모델');
  await picker.selectOption('chest');
  await expect(page.locator('#asset-status')).toHaveText('흉부 전체 모델');
  expect((await snapshot(page)).meshCount).toBe(103);
  await expect(page).toHaveURL(/region=chest/);
});

test('quick visibility buttons follow individual, isolate, show-all and region changes', async ({ page }) => {
  await ready(page, 'body');
  const controls = page.getByRole('group', { name: '빠른 구조 표시' });
  const body = controls.getByRole('button', { name: '전신 구조', exact: true });
  const allVessels = controls.getByRole('button', { name: '전체 혈관', exact: true });
  const vessels = controls.getByRole('button', { name: '주요 혈관', exact: true });
  const wall = controls.getByRole('button', { name: '복벽 근육', exact: true });
  const fascia = controls.getByRole('button', { name: '배가로근막', exact: true });
  const picker = page.getByLabel('부위 선택');
  const overview = await snapshot(page);
  expect(overview.groups.body_arteries.count).toBe(427);
  expect(overview.groups.body_veins.count).toBe(232);
  expect(Object.values(overview.groups).every(item => item.visible)).toBe(true);
  await expect(body).toHaveAttribute('aria-pressed', 'true');
  await expect(allVessels).toHaveAttribute('aria-pressed', 'true');
  await expect(controls.getByRole('button')).toHaveCount(4);
  await body.click();
  await expect(body).toHaveAttribute('aria-pressed', 'false');
  await expect(allVessels).toHaveAttribute('aria-pressed', 'true');
  const visible = Object.entries((await snapshot(page)).groups)
    .filter(([, item]) => item.visible).map(([id]) => id);
  expect(visible).toEqual(['body_arteries', 'body_veins']);
  await body.click();
  await expect(body).toHaveAttribute('aria-pressed', 'true');

  for (const [button, ids] of [
    [allVessels, ['body_arteries', 'body_veins']],
    [wall, ['abdominal_wall']],
    [fascia, ['transversalis_fascia']],
  ]) {
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    for (const id of ids) expect(overview.groups[id].count).toBeGreaterThan(0);
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    const hidden = (await snapshot(page)).groups;
    for (const id of ids) expect(hidden[id].visible).toBe(false);
    expect(hidden.abdomen.visible).toBe(true);
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
  await allVessels.click();
  await expect(body).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#reset-all').click();
  await expect(allVessels).toHaveAttribute('aria-pressed', 'true');
  await expect(body).toHaveAttribute('aria-pressed', 'true');

  await picker.selectOption('abdomen');
  await readyRegion(page, 'abdomen');
  for (const button of [vessels, wall, fascia]) await expect(button).toHaveAttribute('aria-pressed', 'true');
  await vessels.click();
  await expect(vessels).toHaveAttribute('aria-pressed', 'false');
  await expect(wall).toHaveAttribute('aria-pressed', 'true');
  await vessels.click();
  await expect(vessels).toHaveAttribute('aria-pressed', 'true');
  const search = page.getByRole('searchbox', { name: '부위 또는 구조 검색' });
  await search.fill('하대정맥');
  await expect(group(page, 'abdominal_aorta')).toBeHidden();
  await group(page, 'inferior_vena_cava').click();
  await page.getByRole('button', { name: '아래대정맥(복부) 숨김', exact: true }).click();
  await expect(vessels).toHaveAttribute('aria-pressed', 'mixed');
  expect((await snapshot(page)).selected).toBeNull();
  await vessels.click();
  await expect(vessels).toHaveAttribute('aria-pressed', 'true');
  await search.fill('복직근');
  await group(page, 'rectus_abdominis').click();
  await page.locator('#isolate').click();
  await expect(wall).toHaveAttribute('aria-pressed', 'mixed');
  await expect(vessels).toHaveAttribute('aria-pressed', 'false');
  await expect(fascia).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#show-all').click();
  for (const button of [vessels, wall, fascia]) await expect(button).toHaveAttribute('aria-pressed', 'true');
  await fascia.click();
  await page.locator('#reset-all').click();
  for (const button of [vessels, wall, fascia]) await expect(button).toHaveAttribute('aria-pressed', 'true');

  for (const [region, label, id] of [
    ['chest', '주요 혈관', 'great_vessels'],
    ['left-arm', '주요 동맥', 'arm_arteries'],
    ['right-arm', '주요 동맥', 'arm_arteries'],
    ['left-leg', '주요 동맥', 'leg_arteries'],
    ['right-leg', '주요 동맥', 'leg_arteries'],
  ]) {
    await picker.selectOption(region);
    await readyRegion(page, region);
    const button = controls.getByRole('button', { name: label, exact: true });
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await button.click();
    expect((await snapshot(page)).groups[id].visible).toBe(false);
    await button.click();
    expect((await snapshot(page)).groups[id].visible).toBe(true);
  }
  await picker.selectOption('body');
  await readyRegion(page, 'body');
  await expect(allVessels).toHaveAttribute('aria-pressed', 'true');
});

test('selecting the thoracic spine turns the visible model to the front view', async ({ page }) => {
  await ready(page, 'back-spine');
  await space(page, 20);
  await page.locator('#view-front').click();
  const front = await snapshot(page);
  await page.locator('#view-back').click();
  expect((await snapshot(page)).camera.position[2]).toBeLessThan(front.camera.target[2]);

  await group(page, 'thoracic_spine').click();
  const selected = await snapshot(page);
  expect(selected.selected).toBe('thoracic_spine');
  expect(selected.camera).toEqual(front.camera);
  expect(selected.groups).toEqual(front.groups);
  expect(selected.spacing).toBe(20);

  await page.locator('#view-side').click();
  const side = (await snapshot(page)).camera;
  await page.getByLabel('구성 구조').selectOption('Vertebra T6');
  expect((await snapshot(page)).camera).toEqual(side);
});

test('the back inspector explains and selects the individual fibers and muscles', async ({ page }) => {
  await ready(page, 'back-spine');
  const list = page.locator('.structure-panel');
  const inspector = page.locator('.inspector-panel');
  for (const id of ['focus', 'isolate', 'hide-selected', 'show-all']) {
    await expect(list.locator('#' + id)).toBeVisible();
    await expect(inspector.locator('#' + id)).toHaveCount(0);
  }
  await group(page, 'superficial_back').click();
  await expect(inspector.getByRole('heading', { name: '얕은 등 근육' })).toBeVisible();
  const components = inspector.getByLabel('구성 구조');
  await expect(components.locator('option')).toHaveCount(9);
  await components.selectOption('Ascending part of trapezius muscle.l');
  await expect(inspector.getByRole('heading', { name: '왼쪽 등세모근 내림부분 (승모근 위쪽)' })).toBeVisible();
  await expect(inspector.locator('#selection-location')).toContainText('빗장뼈');
  await expect(inspector.getByRole('link', { name: '해부학 출처' })).toHaveAttribute('href', /23916077/);
  await list.locator('#isolate').click();
  await expect(components.locator('option:disabled')).toHaveCount(7);
  expect((await snapshot(page)).selectedMember).toBe('Ascending part of trapezius muscle.l');
  await list.locator('#show-all').click();
  await components.selectOption('Latissimus dorsi muscle.r');
  await expect(inspector.getByRole('heading', { name: '오른쪽 넓은등근 (광배근)' })).toBeVisible();
  await expect(inspector.locator('#selection-function')).toContainText('위팔');
  await list.locator('#hide-selected').click();
  await expect(inspector.getByRole('heading', { name: '오른쪽 넓은등근 (광배근)' })).toHaveCount(0);
  await group(page, 'superficial_back').click();
  await expect(components.locator('option[value="Latissimus dorsi muscle.r"]')).toBeDisabled();
  await expect(group(page, 'superficial_back')).toContainText('7개 표시');
});

test('the anatomy plate highlights separate back muscles, vertebrae, and heart structures', async ({ page }) => {
  test.setTimeout(60_000);
  await ready(page, 'back-spine');
  const plate = page.locator('#anatomy-plate');
  const image = plate.locator('canvas');
  const pixelSummary = () => image.evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    let xSum = 0;
    let hasLeader = false;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] === 141 && pixels[i + 1] === 75 && pixels[i + 2] === 45) hasLeader = true;
      if (pixels[i + 1] - pixels[i + 2] > 24 && pixels[i] - pixels[i + 1] > 46) {
        count++;
        xSum += (i / 4) % canvas.width;
      }
    }
    return { count, x: xSum / count, hasLeader };
  });
  await expect(plate).toBeHidden();
  await group(page, 'superficial_back').click();
  const members = page.getByLabel('구성 구조');
  const drawings = new Set();
  for (const part of ['Ascending part of trapezius muscle', 'Descending part of trapezius muscle', 'Transverse part of trapezius muscle', 'Latissimus dorsi muscle']) {
    await members.selectOption(`${part}.l`);
    await expect(plate.locator('strong')).toContainText('왼쪽');
    const left = await pixelSummary();
    drawings.add(await image.evaluate(canvas => canvas.toDataURL()));
    await members.selectOption(`${part}.r`);
    await expect(plate.locator('strong')).toContainText('오른쪽');
    const right = await pixelSummary();
    drawings.add(await image.evaluate(canvas => canvas.toDataURL()));
    expect(left.count).toBeGreaterThan(100);
    expect(right.count).toBeGreaterThan(100);
    expect(left.hasLeader && right.hasLeader).toBe(true);
    expect(left.x).toBeLessThan(right.x);
  }
  expect(drawings.size).toBe(8);
  await expect(plate.getByRole('link', { name: 'CC BY-SA 4.0' })).toBeVisible();
  await group(page, 'cervical_spine').click();
  await members.selectOption('Vertebra C3');
  await expect(image).toHaveAccessibleName(/목뼈.*뒤에서/);
  await ready(page, 'chest');
  await group(page, 'heart_chambers').click();
  await members.selectOption('Right ventricle');
  await expect(image).toHaveAccessibleName(/오른심실.*앞에서/);
  expect((await pixelSummary()).count).toBeGreaterThan(100);
  expect(await plate.evaluate(card => card.scrollWidth <= card.clientWidth)).toBe(true);
});

test('an anatomy plate is drawn for the esophagus and other selectable body regions', async ({ page }) => {
  test.setTimeout(90_000);
  const figure = page.locator('#anatomy-plate');
  const image = figure.getByRole('img');
  const samples = [
    ['chest', 'esophagus'], ['head-neck', 'ears'], ['abdomen', 'stomach'], ['pelvis', 'pelvic_floor'],
    ['left-arm', 'wrist'], ['right-arm', 'hand_digit_1'], ['left-leg', 'knee'], ['right-leg', 'ankle'],
    ['body', 'body_arteries'],
  ];
  for (const [region, id] of samples) {
    await ready(page, region);
    await expect(figure).toBeHidden();
    await group(page, id).click();
    await expect(figure).toBeVisible();
    const selection = await page.locator('#selection-title').textContent();
    expect(await image.getAttribute('aria-label')).toContain(`${selection} 해부학 도판`);
    expect(await image.evaluate(canvas => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      return pixels.some((value, index) => index % 4 === 0 && value === 141
        && pixels[index + 1] === 75 && pixels[index + 2] === 45);
    }), `${region}/${id}`).toBe(true);
    if (region === 'chest') await expect(figure.locator('strong')).toHaveText('식도');
    if (region === 'head-neck') await expect(figure.getByRole('link', { name: '원본 이용 조건' })).toBeVisible();
  }
});

test('translucent surroundings follow the selection and can be restored from a scene link', async ({ page }) => {
  await ready(page, 'chest');
  const toggle = page.getByRole('button', { name: '주변 반투명' });
  await expect(toggle).toBeDisabled();
  await group(page, 'heart_chambers').click();
  const before = await snapshot(page);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  const translucent = await snapshot(page);
  expect(translucent.groups).toEqual(before.groups);
  expect(translucent.camera).toEqual(before.camera);
  await page.getByLabel('구성 구조').selectOption('Right ventricle');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');

  await page.getByText('설명 장면', { exact: true }).click();
  await page.locator('#share-scene').click();
  const link = new URL(await page.locator('#scene-link').inputValue());
  link.searchParams.set('qa', '1');
  await page.goto(link.href);
  await readyRegion(page, 'chest');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect((await snapshot(page)).selectedMember).toBe('Right ventricle');

  const saved = JSON.parse(link.searchParams.get('scene'));
  delete saved.surroundingsTranslucent;
  link.searchParams.set('scene', JSON.stringify(saved));
  await page.goto(link.href);
  await readyRegion(page, 'chest');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect((await snapshot(page)).selectedMember).toBe('Right ventricle');

  await toggle.click();
  await page.locator('#isolate').click();
  await expect(toggle).toBeDisabled();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#show-all').click();
  await toggle.click();
  await page.locator('#clear-selection').click();
  await expect(toggle).toBeDisabled();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});

test('an explanation scene restores selection, spacing, visibility, and camera from storage and a link', async ({ page }) => {
  test.setTimeout(60_000);
  await ready(page, 'back-spine');
  await group(page, 'superficial_back').click();
  await page.getByLabel('구성 구조').selectOption('Latissimus dorsi muscle.l');
  await page.locator('#isolate').click();
  await page.locator('#view-side').click();
  await page.locator('#zoom-in').click();
  await space(page, 42);
  const original = await snapshot(page);
  await page.getByText('설명 장면', { exact: true }).click();
  await page.locator('#save-scene').click();
  await expect(page.locator('#scene-feedback')).toContainText('장면을 저장');
  await page.locator('#share-scene').click();
  const link = new URL(await page.locator('#scene-link').inputValue());
  expect(link.searchParams.get('region')).toBe('back-spine');
  expect(link.searchParams.has('scene')).toBe(true);
  await page.getByLabel('부위 선택').selectOption('chest');
  await readyRegion(page, 'chest');
  await page.locator('#load-scene').click();
  await readyRegion(page, 'back-spine');
  const restored = await snapshot(page);
  for (const field of ['selected', 'selectedMember', 'spacing', 'groups', 'matrices']) expect(restored[field]).toEqual(original[field]);
  expect(restored.camera.target).toEqual(original.camera.target);
  for (const [index, coord] of restored.camera.position.entries()) expect(coord).toBeCloseTo(original.camera.position[index], 10);
  await expect(page.getByLabel('구성 구조').locator('option:disabled')).toHaveCount(7);
  const download = page.waitForEvent('download');
  await page.locator('#export-scene').click();
  expect((await download).suggestedFilename()).toBe('anatomy-3d-back-spine.png');
  link.searchParams.set('qa', '1');
  await page.goto(link.href);
  await readyRegion(page, 'back-spine');
  expect((await snapshot(page)).selectedMember).toBe(original.selectedMember);
  const state = JSON.parse(link.searchParams.get('scene'));
  state.asset = state.asset.replace(/:[a-f0-9]{64}$/, ':' + '0'.repeat(64));
  link.searchParams.set('scene', JSON.stringify(state));
  await page.goto(link.href);
  await readyRegion(page, 'back-spine');
  await expect(page.locator('#scene-feedback')).toContainText('모델 버전');
  expect((await snapshot(page)).selected).toBeNull();
});

test('whole-body navigation loads one region at a time and preserves the shared interactions', async ({ page }) => {
  test.setTimeout(90_000);
  const modelRequests = [];
  const errors = [];
  page.on('request', request => {
    if (new URL(request.url()).pathname.startsWith('/models/')) modelRequests.push(new URL(request.url()).pathname);
  });
  page.on('pageerror', error => errors.push(error.message));
  await ready(page, 'body');
  expect(modelRequests).toEqual(['/models/body-region.glb']);
  const picker = page.getByLabel('부위 선택');
  const regions = ['body', 'head-neck', 'chest', 'abdomen', 'back-spine', 'pelvis', 'left-arm', 'right-arm', 'left-leg', 'right-leg'];
  expect(await picker.locator('option').evaluateAll(options => options.map(option => option.value))).toEqual(regions);

  const body = await snapshot(page);
  expect(body.spacing).toBe(20);
  await expect(page.locator('#viewport').locator('#layout-badge, .axis-key, #mesh-count')).toHaveCount(0);
  const [x, y, z] = body.camera.position.map((value, index) => value - body.camera.target[index]);
  expect(x / z).toBeCloseTo(0.58);
  expect(y / z).toBeCloseTo(0.61);
  expect(z).toBeGreaterThan(0);
  await space(page, 40);
  expect((await snapshot(page)).camera).toEqual(body.camera);
  await space(page, 100);
  const spread = await snapshot(page);
  expect(spread.matrices).not.toEqual(body.matrices);
  expect(spread.camera.distance).toBeGreaterThan(body.camera.distance);
  await page.locator('#restore-layout').click();
  const restoredBody = await snapshot(page);
  expect(restoredBody.spacing).toBe(0);
  expect(restoredBody.maxRestorationError).toBeLessThan(1e-6);
  expect(restoredBody.camera).toEqual(spread.camera);
  await page.locator('#reset-camera').click();
  expect((await snapshot(page)).camera).toEqual(body.camera);

  const canvas = page.locator('#scene');
  await canvas.scrollIntoViewIfNeeded();
  const bounds = await canvas.boundingBox();
  for (const y of [.13, .17, .22, .28, .34, .4]) {
    await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height * y);
    if (await page.locator('#open-region').isVisible()) break;
  }
  const picked = (await snapshot(page)).selected;
  expect(regions.slice(1)).toContain(picked);
  await page.locator('#open-region').click();
  await readyRegion(page, picked);
  await page.getByRole('button', { name: '전신 개요', exact: true }).click();
  await readyRegion(page, 'body');
  await group(page, 'head-neck').click();
  await readyRegion(page, 'head-neck');

  for (const id of regions.slice(1)) {
    if (id !== 'head-neck') await picker.selectOption(id);
    await readyRegion(page, id);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('탐색');
    const initial = await snapshot(page);
    expect(initial.spacing).toBe(20);
    const visible = Object.keys(initial.groups).filter(key => initial.groups[key].visible);
    await group(page, visible[0]).click();
    await page.locator('#isolate').click();
    const isolated = Object.entries((await snapshot(page)).groups)
      .filter(([, item]) => item.visible).map(([key]) => key);
    expect(isolated).toEqual([visible[0]]);
    await space(page, 61);
    expect((await snapshot(page)).matrices).not.toEqual(initial.matrices);
    await page.locator('#restore-layout').click();
    const restored = await snapshot(page);
    expect(restored.spacing).toBe(0);
    expect(restored.maxRestorationError).toBeLessThan(1e-6);
    expect(restored.selected).toBe(visible[0]);
    await expect(page).toHaveURL(new RegExp(`region=${id}(?:&|$)`));
  }

  const search = page.getByRole('searchbox', { name: '부위 또는 구조 검색' });
  await search.fill('아킬레스건');
  await expect(group(page, 'shank_muscles')).toBeVisible();
  await expect(group(page, 'knee')).toBeHidden();
  await search.clear();
  await page.getByRole('button', { name: '발바닥 쪽' }).click();
  const foot = (await snapshot(page)).camera;
  expect(foot.position[1]).toBeLessThan(foot.target[1]);
  await picker.selectOption('left-arm');
  await readyRegion(page, 'left-arm');
  await page.getByRole('button', { name: '손바닥 쪽' }).click();
  const palm = (await snapshot(page)).camera;
  expect(palm.position[2]).toBeGreaterThan(palm.target[2]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('head and chest expose the new brain, sensory, and intrapulmonary structures', async ({ page }) => {
  await ready(page, 'head-neck');
  const components = page.getByLabel('구성 구조');
  expect((await snapshot(page)).meshCount).toBe(137);
  await group(page, 'frontal_cortex').click();
  await components.selectOption('Precentral gyrus.l');
  await expect(page.locator('#selection-title')).toHaveText('왼쪽 중심앞이랑');
  await group(page, 'eyes').click();
  await components.selectOption('Retina.r');
  await expect(page.locator('#selection-title')).toHaveText('오른쪽 망막');
  await group(page, 'cranial_nerves').click();
  await components.selectOption('Optic nerve (II).r');
  await expect(page.locator('#selection-title')).toHaveText('오른쪽 시각신경 (제2뇌신경)');
  await ready(page, 'chest');
  const chest = await snapshot(page);
  expect(chest.groups.bronchial_tree_left.count).toBe(12);
  expect(chest.groups.bronchial_tree_right.count).toBe(14);
  await group(page, 'bronchial_tree_left').click();
  await components.selectOption('Apicoposterior segmental bronchus of left lung (BI+BII)');
  await expect(page.locator('#selection-title')).toHaveText('왼쪽 꼭대기뒤구역기관지 (BI+BII)');
});

test('aborted region requests cannot replace the active view and browser back restores the route', async ({ page }) => {
  await ready(page, 'body');
  let slowRequested = false;
  const slow = '**/models/head-neck-region.glb';
  await page.route(slow, () => { slowRequested = true; });
  const picker = page.getByLabel('부위 선택');
  await picker.selectOption('head-neck');
  await expect.poll(() => slowRequested).toBe(true);
  await picker.selectOption('right-arm');
  await readyRegion(page, 'right-arm');
  await page.unroute(slow);
  await page.goBack();
  await readyRegion(page, 'head-neck');
  await page.goBack();
  await readyRegion(page, 'body');
});

test('failure, lung fallback with unavailable groups, and full retry recovery', async ({ page }) => {
  await page.route('**/models/chest-region.glb', route => route.fulfill({ status: 404, body: 'missing' }));
  await page.goto('/?qa=1&region=chest');
  await expect(page.locator('#load-title')).toHaveText('모델을 불러오지 못했습니다');
  await expect(page.locator('#spacing')).toBeDisabled();
  await page.locator('#fallback').click();
  await expect.poll(async () => (await snapshot(page)).loadState).toBe('ready');
  expect((await snapshot(page)).meshCount).toBe(5);
  expect((await snapshot(page)).variant).toBe('lungs');
  await expect(group(page, 'heart_chambers')).toBeDisabled();
  await expect(group(page, 'left_lung')).toBeEnabled();
  await expect(page.getByRole('group', { name: '빠른 구조 표시' })).toBeHidden();
  await page.unroute('**/models/chest-region.glb');
  // A fresh page loads the primary model again; fallback is not persisted implicitly.
  await ready(page);
  expect((await snapshot(page)).meshCount).toBe(103);
});

test('invalid GLB retry and failed fallback never leave stale active controls', async ({ page }) => {
  await page.route('**/models/*.glb', route => route.fulfill({ status: 200, body: 'invalid glb' }));
  await page.goto('/?qa=1&region=chest');
  await expect(page.locator('#load-title')).toHaveText('모델을 불러오지 못했습니다');
  await page.locator('#fallback').click();
  await expect(page.locator('#load-title')).toHaveText('모델을 불러오지 못했습니다');
  await expect(page.locator('#spacing')).toBeDisabled();
  await page.unroute('**/models/*.glb');
  await page.locator('#retry').click();
  await expect.poll(async () => (await snapshot(page)).loadState).toBe('ready');
  expect((await snapshot(page)).meshCount).toBe(103);
});

test('WebGL unavailable provides a visible explanation', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.includes('webgl') ? null : original.call(this, type, ...args);
    };
  });
  await page.goto('/?qa=1&region=chest');
  await expect(page.locator('#load-title')).toHaveText('이 환경에서 3D를 표시할 수 없습니다');
  await expect(page.locator('#spacing')).toBeDisabled();
});

test('slow request times out and can retry successfully', async ({ page }) => {
  await page.clock.install();
  await page.route('**/models/chest-region.glb', () => {});
  await page.goto('/?qa=1&region=chest');
  await page.clock.runFor(20_100);
  await expect(page.locator('#load-title')).toHaveText('모델을 불러오지 못했습니다');
  await expect(page.locator('#load-detail')).toContainText('20초');
  await page.unroute('**/models/chest-region.glb');
  await page.locator('#retry').click();
  await expect.poll(async () => (await snapshot(page)).loadState).toBe('ready');
});

test('graphics context loss suspends controls and restores the model', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    const gl = document.querySelector('canvas').getContext('webgl2');
    window.__lossExtension = gl.getExtension('WEBGL_lose_context');
    window.__lossExtension.loseContext();
  });
  await expect.poll(async () => (await snapshot(page)).loadState).toBe('context-lost');
  await expect(page.locator('#spacing')).toBeDisabled();
  await page.waitForTimeout(100);
  await page.evaluate(() => window.__lossExtension.restoreContext());
  await expect.poll(async () => (await snapshot(page)).loadState).toBe('ready');
  expect((await snapshot(page)).meshCount).toBe(103);
});

test('touch orbit, pinch, cancel and next tap do not conflict with selection', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-emulation', 'touch emulation only');
  await ready(page);
  await group(page, 'right_lung').tap();
  await page.locator('#isolate').tap();
  await page.locator('#focus').tap();
  await page.locator('#scene').scrollIntoViewIfNeeded();
  const rect = await page.locator('#scene').boundingBox();
  const x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
  const client = await context.newCDPSession(page);
  const send = (type, points) => client.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([id, x, y]) => ({ id, x, y })) });
  let before = await snapshot(page);
  await send('touchStart', [[1, x, y]]);
  await send('touchMove', [[1, x + 55, y + 10]]);
  await send('touchEnd', []);
  expect((await snapshot(page)).camera.position).not.toEqual(before.camera.position);
  expect((await snapshot(page)).selected).toBe('right_lung');
  before = await snapshot(page);
  await send('touchStart', [[1, x - 25, y], [2, x + 25, y]]);
  await send('touchMove', [[1, x - 65, y], [2, x + 65, y]]);
  await send('touchEnd', []);
  expect((await snapshot(page)).camera.distance).toBeLessThan(before.camera.distance);
  expect((await snapshot(page)).selected).toBe('right_lung');
  before = await snapshot(page);
  await send('touchStart', [[1, x - 65, y], [2, x + 65, y]]);
  await send('touchMove', [[1, x - 25, y], [2, x + 25, y]]);
  await send('touchEnd', []);
  expect((await snapshot(page)).camera.distance).toBeGreaterThan(before.camera.distance);
  expect((await snapshot(page)).selected).toBe('right_lung');
  await send('touchStart', [[1, x, y]]);
  await send('touchCancel', []);
  await page.locator('#clear-selection').tap();
  await page.locator('#reset-camera').tap();
  await group(page, 'right_lung').tap();
  await page.locator('#focus').tap();
  await page.locator('#clear-selection').tap();
  await page.locator('#scene').scrollIntoViewIfNeeded();
  const box = await page.locator('#scene').boundingBox();
  for (const [dx, dy] of [[.5, .5], [.4, .5], [.6, .5], [.5, .4], [.5, .6]]) {
    await page.touchscreen.tap(box.x + box.width * dx, box.y + box.height * dy);
    if ((await snapshot(page)).selected) break;
  }
  expect((await snapshot(page)).selected).toBe('right_lung');
});
