const formatVersion = 1;
export const sceneStorageKey = 'anatomy-3d.explanation-scene';

export async function modelFingerprint(file, bytes) {
  if (!globalThis.crypto?.subtle) return null;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return `${file}:${Array.from(new Uint8Array(digest), part => part.toString(16).padStart(2, '0')).join('')}`;
}

function visibilityBits(entries) {
  const bytes = new Uint8Array(Math.ceil(entries.length / 8));
  entries.forEach(({ mesh }, index) => {
    if (mesh.visible) bytes[index >> 3] |= 1 << (index & 7);
  });
  return btoa(String.fromCharCode(...bytes));
}

export function saveSceneState(region, asset, model, camera, target) {
  return JSON.stringify({
    version: formatVersion, region, asset,
    spacing: model.spacing, visible: visibilityBits(model.entries), selected: model.selected,
    member: model.selectedMember,
    surroundingsTranslucent: model.surroundingsTranslucent,
    camera: camera.toArray(), target: target.toArray(),
  });
}

export function readSceneState(raw, regions) {
  if (typeof raw !== 'string' || raw.length > 1200) return null;
  let state;
  try { state = JSON.parse(raw); } catch { return null; }
  const validPoint = point => Array.isArray(point) && point.length === 3 && point.every(Number.isFinite);
  const optionalName = value => value === null || (typeof value === 'string' && value.length <= 180);
  if (state?.version !== formatVersion || typeof state.region !== 'string' || !Object.hasOwn(regions, state.region)
    || typeof state.asset !== 'string' || !/^[a-z0-9-]+\.glb:[a-f0-9]{64}$/.test(state.asset)
    || typeof state.visible !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(state.visible)
    || !Number.isInteger(state.spacing) || state.spacing < 0 || state.spacing > 100
    || !validPoint(state.camera) || !validPoint(state.target)
    || (state.surroundingsTranslucent !== undefined && typeof state.surroundingsTranslucent !== 'boolean')
    || !optionalName(state.selected) || !optionalName(state.member) || (state.member && !state.selected)) return null;
  return state;
}

export function visibleMeshesForScene(state, model) {
  let bytes;
  try { bytes = atob(state.visible); } catch { return null; }
  if (bytes.length !== Math.ceil(model.entries.length / 8)) return null;
  const visible = model.entries.map((_, index) => Boolean(bytes.charCodeAt(index >> 3) & (1 << (index & 7))));
  if (state.selected && !model.entries.some(({ id, name }, index) => visible[index]
    && id === state.selected && (!state.member || name === state.member))) return null;
  return visible;
}
