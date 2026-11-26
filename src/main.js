import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fallback, regions } from '../research/results/region-manifest.json';
import { AnatomyModel, groupStyle } from './model.js';
import { getMemberDetails, groupDetails } from './anatomy-content.js';
import { AnatomyPlate } from './anatomy-plate.js';
import { modelFingerprint, readSceneState, saveSceneState, sceneStorageKey, visibleMeshesForScene } from './scene-state.js';
import { initOffline } from './offline.js';
import '@fontsource-variable/noto-sans-kr';
import './style.css';

const $ = id => document.getElementById(id);
const defaultSpacing = Number($('spacing').defaultValue);
if (import.meta.env.PROD) void initOffline();

function regionFromUrl() {
  const region = new URLSearchParams(location.search).get('region');
  return Object.hasOwn(regions, region) ? region : 'body';
}
const initialRegion = regionFromUrl();
let model, renderer, camera, controls, assetFingerprint;
let generation = 0, activeRequest;
let loadState = 'loading', variant = initialRegion, timings = {}, graphics = {};
let blinkingSelection = null, selectionBlinkTimer, inspectedGroup;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const scene = new THREE.Scene();
const frontView = new THREE.Vector3(0, 0, 1);
const canvas = $('scene');
const plate = new AnatomyPlate($('anatomy-plate'), $('anatomy-plate-image'), $('anatomy-plate-name'), $('anatomy-plate-view'), $('anatomy-plate-license'));
const groupButtons = new Map();
const visibilityControls = [];
const controlIds = ['reset-all', 'show-all', 'view-front', 'view-back', 'view-side', 'zoom-in', 'zoom-out', 'reset-camera', 'spacing', 'restore-layout'];
const overview = '목록이나 모델에서 구조를 선택해 자세히 살펴보세요.';
const bodyOverview = '모델을 눌러 부위를 선택하거나 목록에서 상세 모델을 열 수 있습니다.';
const views = {
  ...regions,
  lungs: {
    groups: regions.chest.groups, ...fallback,
    title: '양쪽 폐', heading: regions.chest.heading, en: 'Lungs',
    status: '폐 단독 대체 모델', scope: '양쪽 폐의 5개 엽을 관찰할 수 있습니다.',
  },
};
const picker = $('model-view');
for (const [id, region] of Object.entries(regions)) picker.add(new Option(region.title, id));

function filterGroups() {
  const query = $('group-search').value.trim().toLocaleLowerCase('ko');
  let hasMatch = false;
  for (const { row, searchText } of groupButtons.values()) {
    row.hidden = !searchText.includes(query);
    hasMatch ||= !row.hidden;
  }
  $('group-empty').hidden = hasMatch || !query;
}

function buildGroupList(view) {
  const list = $('group-list');
  const groups = Object.entries(view.groups);
  list.replaceChildren();
  list.classList.toggle('group-list-scroll', groups.length > 6);
  groupButtons.clear();
  $('group-heading').textContent = variant === 'body' ? '부위·구조 목록' : '구조 목록';
  $('group-search').value = '';
  for (const [id, group] of groups) {
    const row = document.createElement('div');
    row.className = group.target ? 'structure-row region-row' : 'structure-row';
    row.dataset.group = id;
    const select = document.createElement('button');
    select.className = 'structure-select';
    const swatch = document.createElement('span');
    swatch.className = 'structure-dot';
    swatch.style.setProperty('--swatch', group.color ?? groupStyle[id].color);
    const label = document.createElement('span');
    const count = document.createElement('small');
    label.append(group.label_ko, count);
    select.append(swatch, label);
    select.setAttribute('aria-pressed', 'false');
    select.disabled = true;
    select.addEventListener('click', () => {
      if (group.target) chooseView(group.target);
      else selectStructure(model.selected === id && !model.selectedMember ? null : id);
    });
    const visibility = document.createElement('button');
    visibility.className = 'visibility-button';
    visibility.textContent = '숨김';
    visibility.disabled = true;
    visibility.addEventListener('click', () => { model.setVisible(id, !model.groups.get(id).visible); update(); });
    row.append(select, visibility);
    list.append(row);
    const searchText = [
      group.label_ko, group.en ?? groupStyle[id]?.en, ...(group.synonyms ?? []),
      ...group.members.flatMap(name => [name, getMemberDetails(name).label]),
    ]
      .join(' ').toLocaleLowerCase('ko');
    groupButtons.set(id, { row, select, visibility, count, searchText });
  }
  filterGroups();
}

function buildVisibilityControls(view) {
  const container = $('visibility-controls');
  container.replaceChildren();
  visibilityControls.length = 0;
  for (const { label, groups } of view.visibilityControls ?? []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.disabled = true;
    button.addEventListener('click', () => {
      const show = visibilityState(groups) !== 'true';
      for (const id of groups) model.setVisible(id, show);
      update();
    });
    container.append(button);
    visibilityControls.push({ button, groups });
  }
  container.hidden = visibilityControls.length === 0;
}

function visibilityState(groups) {
  const meshes = groups.flatMap(id => model.groups.get(id).meshes);
  if (meshes.every(mesh => mesh.visible)) return 'true';
  return meshes.some(mesh => mesh.visible) ? 'mixed' : 'false';
}

function updateInspector(view, group) {
  const picker = $('selection-member');
  if (inspectedGroup !== group) {
    inspectedGroup = group;
    picker.replaceChildren(new Option('묶음 전체', ''));
    for (const mesh of group?.meshes ?? []) {
      const name = mesh.userData.originalName;
      picker.add(new Option(getMemberDetails(name).label, name));
    }
  }
  $('selection-members').hidden = !group || group.meshes.length <= 1;
  for (let i = 0; i < (group?.meshes.length ?? 0); i++) {
    picker.options[i + 1].disabled = !group.meshes[i].visible;
  }

  const selectedMember = group ? model.selectedMember : null;
  picker.value = selectedMember ?? '';
  const member = selectedMember ? getMemberDetails(selectedMember) : null;
  const details = member?.location ? member : group ? groupDetails[model.selected] : undefined;
  const groupFacts = member && !member.location;
  $('selection-context').hidden = !member;
  $('selection-context').textContent = member ? group.label_ko : '';
  $('selection-title').textContent = member?.label ?? group?.label_ko ?? view.title;
  $('selection-en').textContent = member?.en ?? group?.en ?? view.en;
  const description = member ? '' : group?.description
    ?? (group?.target ? '뷰어 상단의 열기 버튼으로 상세 모델을 살펴보세요.' : group ? '' : variant === 'body' ? bodyOverview : overview);
  $('selection-description').textContent = description;
  $('selection-description').hidden = !description;
  $('selection-facts').hidden = !details;
  $('selection-location-heading').textContent = groupFacts ? '묶음의 위치' : '위치';
  $('selection-function-heading').textContent = groupFacts ? '묶음의 역할' : '역할';
  $('selection-location').textContent = details?.location ?? '';
  $('selection-function').textContent = details?.role ?? '';
  $('selection-reference').hidden = !details?.source;
  if (details?.source) $('selection-source').href = details.source;
  plate.update(renderer, group ? model : null, variant, member?.label ?? group?.label_ko);
}

function buildCloseups(view) {
  const container = $('closeup-views');
  container.replaceChildren();
  for (const preset of view.closeups ?? []) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary';
    button.textContent = preset.label;
    button.addEventListener('click', () => {
      const box = new THREE.Box3();
      for (const id of preset.groups) {
        for (const mesh of model.groups.get(id).meshes) box.expandByObject(mesh);
      }
      fit(box, new THREE.Vector3(...preset.direction).normalize());
    });
    container.append(button);
  }
  container.hidden = container.childElementCount === 0;
}

function announce(text) { $('announcement').textContent = text; }

function sceneFeedback(text) {
  $('scene-feedback').textContent = text;
  if (text) $('scene-feedback').closest('details').open = true;
}

function storedScene() {
  try { return readSceneState(localStorage.getItem(sceneStorageKey), regions); }
  catch { return null; }
}

function clearShareLink() {
  $('scene-link').value = '';
  $('scene-link').hidden = true;
}

function applySavedScene(state) {
  if (state.region !== variant || state.asset !== assetFingerprint) {
    sceneFeedback('모델 버전이 달라 장면을 열 수 없습니다.');
    return;
  }
  const visible = visibleMeshesForScene(state, model);
  const position = new THREE.Vector3().fromArray(state.camera);
  const target = new THREE.Vector3().fromArray(state.target);
  const distance = position.distanceTo(target);
  if (!visible || distance < controls.minDistance * .99 || distance > controls.maxDistance * 1.01
    || target.distanceTo(model.center) > model.scale * 100) {
    sceneFeedback('저장된 장면 정보가 올바르지 않습니다.');
    return;
  }
  model.restoreVisibility(visible);
  model.setSpacing(state.spacing);
  model.select(state.selected, state.member);
  model.setSurroundingsTranslucent(state.surroundingsTranslucent);
  controls.target.copy(target);
  camera.position.copy(position);
  controls.update();
  update();
  sceneFeedback('저장된 장면을 열었습니다.');
}

function currentScene() {
  return saveSceneState(variant, assetFingerprint, model, camera.position, controls.target);
}

function render() {
  if (!renderer) return;
  renderer.render(scene, camera);
}

function updateSelectionBlink() {
  const selection = loadState === 'ready' ? model.selectedMesh ?? model.selected : null;
  const animatedSelection = !reducedMotion.matches && !document.hidden ? selection : null;
  if (animatedSelection !== blinkingSelection) {
    clearInterval(selectionBlinkTimer);
    blinkingSelection = animatedSelection;
    if (selection) model.setSelectionHighlight(true);
    if (animatedSelection) {
      let highlighted = true;
      selectionBlinkTimer = setInterval(() => {
        highlighted = !highlighted;
        model.setSelectionHighlight(highlighted);
        render();
      }, 600);
    }
  }
  render();
}

function update() {
  const view = views[variant];
  const ready = loadState === 'ready';
  const canChangeModel = loadState !== 'unsupported' && loadState !== 'context-lost';
  const groupCount = ready ? [...model.groups.values()].filter(group => group.meshes.length > 0).length : 0;
  picker.value = variant === 'lungs' ? 'chest' : variant;
  picker.disabled = !canChangeModel;
  $('overview-home').hidden = variant === 'body';
  $('overview-home').disabled = !canChangeModel;
  for (const id of controlIds) $(id).disabled = !ready;
  const canSave = ready && assetFingerprint && Object.hasOwn(regions, variant);
  $('save-scene').disabled = !canSave;
  $('share-scene').disabled = !canSave;
  $('load-scene').disabled = !ready || !storedScene();
  $('export-scene').disabled = !ready;
  for (const button of $('closeup-views').children) button.disabled = !ready;
  for (const { button, groups } of visibilityControls) {
    button.disabled = !ready;
    button.setAttribute('aria-pressed', ready ? visibilityState(groups) : 'false');
  }
  for (const [id, { row, select, visibility, count }] of groupButtons) {
    const group = model?.groups.get(id);
    const available = ready && group.meshes.length > 0;
    const visibleCount = available ? group.meshes.filter(mesh => mesh.visible).length : 0;
    select.disabled = !available || !group.visible;
    visibility.disabled = !available;
    row.classList.toggle('is-selected', ready && model.selected === id);
    row.classList.toggle('is-hidden', available && !group.visible);
    select.setAttribute('aria-pressed', String(ready && model.selected === id));
    count.textContent = available
      ? `${group.meshes.length}개 메시${visibleCount === 0 ? ' · 숨겨짐' : visibleCount < group.meshes.length ? ` · ${visibleCount}개 표시` : ''}`
      : '사용 불가';
    count.hidden = Boolean(available && group.target);
    visibility.textContent = available && !group.visible ? '표시' : '숨김';
    visibility.setAttribute('aria-label', `${view.groups[id].label_ko} ${visibility.textContent}`);
  }
  const selected = ready && model.selected;
  const selectedGroup = selected ? model.groups.get(selected) : null;
  const openRegion = $('open-region');
  openRegion.hidden = !selectedGroup?.target;
  if (selectedGroup?.target) openRegion.textContent = `${selectedGroup.label_ko} 열기`;
  updateInspector(view, selectedGroup);
  $('model-scope').textContent = view.scope;
  for (const id of ['focus', 'isolate', 'hide-selected', 'clear-selection']) $(id).disabled = !selected;
  const translucentButton = $('surroundings-translucent');
  const translucent = Boolean(selected && model.surroundingsTranslucent);
  translucentButton.disabled = !selected || (!translucent && !model.hasVisibleSurroundings);
  translucentButton.setAttribute('aria-pressed', String(translucent));
  const spacing = model?.spacing ?? defaultSpacing;
  $('spacing').value = spacing;
  $('spacing-value').textContent = `${spacing}%`;
  $('spacing').style.setProperty('--progress', `${spacing}%`);
  $('spacing-note').textContent = view.individualSpacingFrom === undefined
    ? '구조를 구분하기 위한 설명용 배치입니다.'
    : `${view.individualSpacingFrom}%까지 부위별로, 그 이후에는 뼈와 장기까지 개별적으로 벌립니다. 혈관은 묶음으로 이동합니다.`;
  $('group-count').textContent = `${ready ? groupCount : groupButtons.size}개 묶음`;
  updateSelectionBlink();
}

function updateRegion(view) {
  $('region-title').textContent = view.heading;
  $('region-en').textContent = view.en;
  document.title = `${view.heading} · Anatomy 3D`;
}

function fit(box, direction) {
  if (box.isEmpty()) return;
  const center = box.getCenter(new THREE.Vector3());
  const radius = box.getSize(new THREE.Vector3()).length() / 2;
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const limitingFov = Math.min(fov, 2 * Math.atan(Math.tan(fov / 2) * camera.aspect));
  const padding = views[variant].cameraPadding ?? 1.12;
  const distance = THREE.MathUtils.clamp(radius / Math.sin(limitingFov / 2) * padding, controls.minDistance, controls.maxDistance);
  const heading = direction ?? camera.position.clone().sub(controls.target).normalize();
  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(heading, distance);
  controls.update(); render();
}

function selectStructure(id, member) {
  const previous = model.selected;
  model.select(id, member);
  if (variant === 'back-spine' && model.selected === 'thoracic_spine' && model.selected !== previous) {
    fit(model.visibleBox(), frontView);
  }
  update();
}

function cameraReset() {
  const direction = views[variant].cameraDirection ?? [0, 0.06, 1];
  const bounds = model.individualSpacingActive ? model.visibleBox() : model.defaultBox;
  fit(bounds, new THREE.Vector3(...direction).normalize());
}

function zoom(factor) {
  const offset = camera.position.clone().sub(controls.target);
  offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(offset); controls.update(); render();
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  const gl = renderer.getContext();
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  graphics = { renderer: gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER), vendor: gl.getParameter(debug ? debug.UNMASKED_VENDOR_WEBGL : gl.VENDOR) };
  camera = new THREE.PerspectiveCamera(35, 1, 0.001, 100);
  controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.rotateSpeed = 0.65;
  controls.addEventListener('change', render);
  scene.add(new THREE.HemisphereLight(0xf1f8ff, 0x827d73, 2.5));
  for (const [position, intensity] of [[[2, 3, 4], 3], [[-3, 1, 1], 1.5], [[0, 2, -4], 2]]) {
    const light = new THREE.DirectionalLight(0xffffff, intensity);
    light.position.set(...position); scene.add(light);
  }
  const resize = () => {
    const { width, height } = $('viewport').getBoundingClientRect();
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); renderer.setSize(width, height, false); render();
  };
  let resizeFrame;
  new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  }).observe($('viewport'));
  resize();
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); activeRequest?.abort(); generation++;
    loadState = 'context-lost'; controls.enabled = false;
    $('load-overlay').hidden = false;
    $('load-title').textContent = '3D 표시가 중단되었습니다';
    $('load-detail').textContent = '그래픽 컨텍스트가 복구되면 모델을 다시 불러옵니다. 복구되지 않으면 페이지를 새로고침하세요.';
    $('retry').hidden = $('fallback').hidden = true;
    update();
  });
  canvas.addEventListener('webglcontextrestored', () => { controls.enabled = true; load(variant); });
}

async function load(nextVariant, sceneToRestore) {
  const previousView = views[variant];
  const view = views[nextVariant];
  const status = view.status ?? `${view.title} 모델`;
  const token = ++generation;
  activeRequest?.abort();
  const request = new AbortController();
  activeRequest = request;
  variant = nextVariant;
  updateRegion(view);
  if (view !== previousView || groupButtons.size === 0) {
    buildGroupList(view);
    buildVisibilityControls(view);
    buildCloseups(view);
  }
  loadState = 'loading';
  assetFingerprint = null;
  clearShareLink();
  sceneFeedback('');
  controls.enabled = false;
  if (model) { scene.remove(model.root); model.dispose(); model = null; }
  update();
  $('load-overlay').hidden = false;
  document.querySelector('.loader').hidden = false;
  $('retry').hidden = $('fallback').hidden = true;
  $('load-title').textContent = `${status} 불러오는 중`;
  $('load-detail').textContent = '모델 파일을 읽는 중 · 최대 20초';
  $('asset-status').textContent = '모델 준비 중';
  const timeout = setTimeout(() => request.abort(), 20_000);
  try {
    const start = performance.now();
    const response = await fetch(`${import.meta.env.BASE_URL}models/${view.file}`, { signal: request.signal });
    if (!response.ok) throw new Error(`파일 응답 ${response.status}`);
    const data = await response.arrayBuffer();
    const downloaded = performance.now();
    if (token !== generation) return;
    $('load-detail').textContent = '구조 이름과 원본 배치를 확인하는 중';
    const [gltf, fingerprint] = await Promise.all([
      new GLTFLoader().parseAsync(data, ''), modelFingerprint(view.file, data).catch(() => null),
    ]);
    if (token !== generation) return;
    assetFingerprint = fingerprint;
    model = new AnatomyModel(gltf, view, defaultSpacing);
    const parsed = performance.now();
    scene.add(model.root);
    camera.near = model.scale / 1000;
    camera.far = model.scale * 100;
    camera.updateProjectionMatrix();
    controls.minDistance = model.scale * 0.1;
    controls.maxDistance = model.scale * 8;
    controls.enabled = true;
    loadState = 'ready';
    cameraReset();
    update();
    if (sceneToRestore) applySavedScene(sceneToRestore);
    else if (sceneToRestore === null) sceneFeedback('공유 장면 링크가 올바르지 않습니다.');
    timings = { transferMs: downloaded - start, parseAndValidateMs: parsed - downloaded, firstRenderMs: performance.now() - start, bytes: data.byteLength };
    $('load-overlay').hidden = true;
    $('asset-status').textContent = status;
    announce(`${status}을 불러왔습니다.`);
  } catch (error) {
    if (token !== generation) return;
    loadState = 'error';
    document.querySelector('.loader').hidden = true;
    $('load-title').textContent = '모델을 불러오지 못했습니다';
    $('load-detail').textContent = `${error.name === 'AbortError' ? '20초 안에 파일을 읽지 못했습니다.' : error.message} 자산 준비 상태를 확인하거나 다시 시도하세요.`;
    $('asset-status').textContent = '모델 로딩 실패';
    const fallback = fallbackVariant();
    $('fallback').textContent = { body: '전신 개요로 돌아가기', chest: '전체 흉부 열기', lungs: '가벼운 폐 모델 열기' }[fallback];
    $('retry').hidden = $('fallback').hidden = false;
    announce('모델 로딩에 실패했습니다. 다시 시도할 수 있습니다.');
    update();
  } finally { clearTimeout(timeout); }
}

function fallbackVariant() {
  if (variant === 'chest') return 'lungs';
  return variant === 'body' || variant === 'lungs' ? 'chest' : 'body';
}

function chooseView(nextVariant, sceneToRestore) {
  const url = new URL(location.href);
  url.searchParams.delete('scene');
  const region = nextVariant === 'lungs' ? 'chest' : nextVariant;
  if (region === 'body') url.searchParams.delete('region');
  else url.searchParams.set('region', region);
  if (url.href !== location.href) history.pushState(null, '', url);
  load(nextVariant, sceneToRestore);
}

picker.addEventListener('change', event => chooseView(event.target.value));
function linkedScene() {
  const raw = new URLSearchParams(location.search).get('scene');
  return raw === null ? undefined : readSceneState(raw, regions);
}
window.addEventListener('popstate', () => load(regionFromUrl(), linkedScene()));
reducedMotion.addEventListener('change', updateSelectionBlink);
document.addEventListener('visibilitychange', updateSelectionBlink);
$('group-search').addEventListener('input', filterGroups);
$('selection-member').addEventListener('change', event => selectStructure(model.selected, event.target.value));
$('overview-home').addEventListener('click', () => chooseView('body'));
$('open-region').addEventListener('click', () => chooseView(model.groups.get(model.selected).target));
$('retry').addEventListener('click', () => load(variant === 'lungs' ? 'chest' : variant, linkedScene()));
$('fallback').addEventListener('click', () => chooseView(fallbackVariant()));
$('clear-selection').addEventListener('click', () => { model.select(null); update(); });
$('focus').addEventListener('click', () => { fit(model.selectedBox()); announce('선택한 구조를 회전 중심으로 설정했습니다.'); });
$('surroundings-translucent').addEventListener('click', () => {
  model.setSurroundingsTranslucent(!model.surroundingsTranslucent);
  update();
});
$('isolate').addEventListener('click', () => { model.isolate(); update(); });
$('hide-selected').addEventListener('click', () => { model.hideSelection(); update(); announce('선택한 구조를 숨기고 선택을 해제했습니다.'); });
$('show-all').addEventListener('click', () => { model.showAll(); update(); });
$('spacing').addEventListener('input', event => {
  const wasIndividual = model.individualSpacingActive;
  model.setSpacing(Number(event.target.value));
  if (wasIndividual || model.individualSpacingActive) fit(model.visibleBox());
  update();
});
$('restore-layout').addEventListener('click', () => { model.setSpacing(0); update(); announce('선택과 표시 상태를 유지하고 배치만 복원했습니다.'); });
$('reset-camera').addEventListener('click', cameraReset);
$('reset-all').addEventListener('click', () => {
  model.select(null);
  model.resetVisibility();
  model.setSpacing(defaultSpacing);
  cameraReset();
  update();
});
$('zoom-in').addEventListener('click', () => zoom(0.8));
$('zoom-out').addEventListener('click', () => zoom(1.25));
$('save-scene').addEventListener('click', () => {
  clearShareLink();
  try {
    localStorage.setItem(sceneStorageKey, currentScene());
    $('load-scene').disabled = false;
    sceneFeedback('이 브라우저에 장면을 저장했습니다.');
  } catch { sceneFeedback('브라우저 저장소에 장면을 저장할 수 없습니다.'); }
});
$('load-scene').addEventListener('click', () => {
  const state = storedScene();
  clearShareLink();
  if (!state) sceneFeedback('이 브라우저에 저장된 장면이 없습니다.');
  else if (state.region === variant) applySavedScene(state);
  else chooseView(state.region, state);
});
$('share-scene').addEventListener('click', async () => {
  const url = new URL(location.pathname, location.origin);
  if (variant !== 'body') url.searchParams.set('region', variant);
  url.searchParams.set('scene', currentScene());
  const link = $('scene-link');
  link.value = url.href;
  link.hidden = false;
  try { await navigator.clipboard.writeText(url.href); sceneFeedback('장면 링크를 복사했습니다.'); }
  catch { link.focus(); link.select(); sceneFeedback('표시된 장면 링크를 복사하세요.'); }
});
$('export-scene').addEventListener('click', () => {
  const clear = renderer.getClearColor(new THREE.Color());
  const alpha = renderer.getClearAlpha();
  renderer.setClearColor(0x000000, 1);
  render();
  const filename = `anatomy-3d-${variant}.png`;
  canvas.toBlob(blob => {
    if (!blob) { sceneFeedback('모델 이미지를 저장할 수 없습니다.'); return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    sceneFeedback('현재 모델 시점을 PNG로 저장했습니다.');
  }, 'image/png');
  renderer.setClearColor(clear, alpha);
  render();
});
for (const [id, direction] of [['view-front', frontView], ['view-back', new THREE.Vector3(0, 0, -1)], ['view-side', new THREE.Vector3(1, 0, 0)]]) {
  $(id).addEventListener('click', () => fit(model.visibleBox(), direction));
}

// A complete multi-pointer gesture can never become a selection tap on release.
const pointers = new Map();
let tapCandidate = null;
canvas.addEventListener('pointerdown', event => {
  if (loadState !== 'ready') return;
  pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (pointers.size === 1 && event.button === 0) tapCandidate = { id: event.pointerId, x: event.clientX, y: event.clientY };
  else tapCandidate = null;
});
canvas.addEventListener('pointermove', event => {
  if (tapCandidate && Math.hypot(event.clientX - tapCandidate.x, event.clientY - tapCandidate.y) > 6) tapCandidate = null;
});
canvas.addEventListener('pointerup', event => {
  if (tapCandidate?.id === event.pointerId && loadState === 'ready') {
    const rect = canvas.getBoundingClientRect();
    const pointer = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const raycaster = new THREE.Raycaster(); raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(model.entries.filter(e => e.mesh.visible).map(e => e.mesh), false);
    const selectedHit = model.surroundingsTranslucent ? hits.find(({ object }) => model.isSelectedMesh(object)) : null;
    const hit = (selectedHit ?? hits[0])?.object;
    const groupId = hit?.userData.groupId;
    const group = model.groups.get(groupId);
    const individual = group?.meshes.length > 1 && (!group.target || model.individualSpacingActive);
    selectStructure(groupId, individual ? hit.userData.originalName : undefined);
  }
  pointers.delete(event.pointerId); tapCandidate = null;
});
canvas.addEventListener('pointercancel', event => { pointers.delete(event.pointerId); tapCandidate = null; });
canvas.addEventListener('lostpointercapture', event => { pointers.delete(event.pointerId); tapCandidate = null; });
canvas.addEventListener('keydown', event => {
  if (loadState !== 'ready') return;
  if (event.key === 'Escape') { model.select(null); update(); }
  else if (['+', '=', '-'].includes(event.key)) { event.preventDefault(); zoom(event.key === '-' ? 1.25 : 0.8); }
  else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault();
    const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if (event.key === 'ArrowLeft') spherical.theta -= 0.12;
    if (event.key === 'ArrowRight') spherical.theta += 0.12;
    if (event.key === 'ArrowUp') spherical.phi -= 0.12;
    if (event.key === 'ArrowDown') spherical.phi += 0.12;
    spherical.makeSafe(); camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); render();
  }
});

// Read-only QA evidence, deliberately opt-in. No mutation bypass for tests.
if (new URLSearchParams(location.search).has('qa')) {
  window.__anatomySnapshot = () => ({
    loadState, variant, timings, graphics, ...model?.snapshot(),
    camera: camera ? { position: camera.position.toArray(), target: controls.target.toArray(), distance: camera.position.distanceTo(controls.target), min: controls.minDistance, max: controls.maxDistance } : null,
    selectionCenter: model?.selected ? model.selectedBox().getCenter(new THREE.Vector3()).toArray() : null,
    renderer: renderer?.info.render,
    rendererResources: renderer?.info.memory,
  });
}

try { initRenderer(); load(initialRegion, linkedScene()); }
catch {
  loadState = 'unsupported'; updateRegion(views[variant]); update();
  $('load-title').textContent = '이 환경에서 3D를 표시할 수 없습니다';
  $('load-detail').textContent = 'WebGL 2를 지원하는 브라우저와 그래픽 가속 상태를 확인한 뒤 페이지를 새로고침하세요.';
  $('asset-status').textContent = '3D 사용 불가';
  document.querySelector('.loader').hidden = true;
}
