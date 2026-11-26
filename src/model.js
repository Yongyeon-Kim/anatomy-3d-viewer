import * as THREE from 'three';

const selectionColor = 0xd7f58a;
const surroundingsOpacity = 0.14;
const groupSpreadScale = 0.45;

function prepareIndividualSpacing(entries, groups, scale) {
  const boundsByGroup = new Map();
  const parts = [];
  for (const entry of entries) {
    if (entry.isVessel) continue;
    const bounds = new THREE.Box3().setFromObject(entry.mesh);
    if (!boundsByGroup.has(entry.id)) boundsByGroup.set(entry.id, new THREE.Box3());
    boundsByGroup.get(entry.id).union(bounds);
    parts.push({ entry, bounds });
  }

  const centers = new Map([...boundsByGroup].map(([id, bounds]) => [id, bounds.getCenter(new THREE.Vector3())]));
  for (const part of parts) {
    const center = part.bounds.getCenter(new THREE.Vector3());
    const direction = groups.get(part.entry.id).direction;
    part.grouped = center.clone().addScaledVector(new THREE.Vector3(...direction), scale * groupSpreadScale);
    part.position = part.grouped.clone().addScaledVector(center.sub(centers.get(part.entry.id)), 0.55);
    part.halfSize = part.bounds.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  }

  // Separate the front-facing bounds, keeping each structure close to its initial position.
  const gap = scale * 0.009;
  const tolerance = gap / 20;
  for (let pass = 0; pass < 256; pass++) {
    let moved = false;
    for (let i = 0; i < parts.length; i++) {
      const { position, halfSize } = parts[i];
      for (let j = i + 1; j < parts.length; j++) {
        const other = parts[j];
        const x = other.position.x - position.x;
        const y = other.position.y - position.y;
        const overlapX = halfSize.x + other.halfSize.x + gap - Math.abs(x);
        const overlapY = halfSize.y + other.halfSize.y + gap - Math.abs(y);
        if (overlapX <= tolerance || overlapY <= tolerance) continue;
        const axis = overlapX < overlapY ? 'x' : 'y';
        const shift = axis === 'x' ? Math.sign(x || 1) * overlapX / 2 : Math.sign(y || 1) * overlapY / 2;
        position[axis] -= shift;
        other.position[axis] += shift;
        moved = true;
      }
    }
    if (!moved) break;
  }

  for (const { entry, position, grouped } of parts) {
    entry.individualOffset = position.sub(grouped);
  }
}

export const groupStyle = {
  left_lung: { color: '#de8f87', en: 'Left lung', description: '왼쪽 폐의 위엽과 아래엽을 함께 관찰합니다.', direction: [0.65, 0.08, 0] },
  right_lung: { color: '#c87c78', en: 'Right lung', description: '오른쪽 폐의 위엽·중간엽·아래엽을 함께 관찰합니다.', direction: [-0.65, 0.08, 0] },
  heart_chambers: { color: '#ae5259', en: 'Heart chambers · partial', description: '좌우 심방과 심실 4개로 이루어진 부분 묶음입니다. 완전한 심장이 아닙니다.', direction: [0, 0, 0.65] },
  rib_cage: { color: '#ded6bf', en: 'Ribs, cartilage & sternum', description: '갈비뼈 24개·늑연골 20개·흉골 3개입니다. 숨기면 안쪽 구조를 살펴보기 쉽습니다.', direction: [0, 0, -0.55] },
  diaphragm: { color: '#b88a79', en: 'Diaphragm', description: '흉부 아래쪽의 횡격막입니다. 표면 연결 상태와 해부학적 정확성은 추가 검토 대상입니다.', direction: [0, -0.55, 0] },
  trachea: { color: '#8eafa7', en: 'Trachea · without bronchi', description: '기관만 포함합니다. 폐까지 연결되는 기관지 나무는 포함되지 않습니다.', direction: [0, 0.5, 0] },
  liver: { color: '#8d554a', en: 'Liver', description: '복부 오른쪽 위에서 횡격막 아래에 놓인 간의 외형입니다.', direction: [-0.5, 0.24, 0.18] },
  gallbladder: { color: '#748e62', en: 'Gallbladder', description: '간의 아래쪽에 붙어 있는 담낭의 외형입니다.', direction: [-0.18, -0.05, 0.74] },
  stomach: { color: '#d88471', en: 'Stomach', description: '복부 왼쪽 위쪽의 위를 볼 수 있습니다.', direction: [0.5, 0.1, 0.37] },
  pancreas: { color: '#c6a067', en: 'Pancreas', description: '위 뒤쪽으로 가로 놓인 췌장을 볼 수 있습니다.', direction: [0.32, -0.08, -0.25] },
  spleen: { color: '#9d6d86', en: 'Spleen', description: '복부 왼쪽 위에서 위의 옆과 뒤쪽에 놓인 비장입니다.', direction: [0.72, 0.27, -0.08] },
  small_intestine: { color: '#cc947e', en: 'Duodenum and jejunum', description: '소장 중 십이지장과 공장을 한 묶음으로 관찰합니다.', direction: [0, -0.34, 0.55] },
  colon: { color: '#a96958', en: 'Colon', description: '상행결장·가로결장·하행결장·구불결장을 한 묶음으로 볼 수 있습니다.', direction: [0, -0.55, -0.12] },
  left_kidney: { color: '#995d66', en: 'Left kidney', description: '복부 뒤쪽, 척추 왼편에 놓인 콩팥입니다.', direction: [0.6, -0.12, -0.32] },
  right_kidney: { color: '#995d66', en: 'Right kidney', description: '복부 뒤쪽, 척추 오른편에 놓인 콩팥입니다.', direction: [-0.6, -0.12, -0.32] },
  lumbar_spine: { color: '#d9cdb0', en: 'Lumbar spine', description: '복부 뒤쪽의 첫째부터 다섯째 허리뼈입니다.', direction: [0, 0, -0.61] },
};

export class AnatomyModel {
  constructor(gltf, view, initialSpacing = 0) {
    this.root = gltf.scene;
    this.selected = null;
    this.selectedMesh = null;
    this.selectionHighlighted = false;
    this.surroundingsTranslucent = false;
    this.spacing = 0;
    this.individualSpacingFrom = view.individualSpacingFrom ?? 100;
    this.entries = [];
    this.groups = new Map(Object.entries(view.groups).map(([id, group]) => [
      id, { ...groupStyle[id], ...group, meshes: [], visible: true },
    ]));
    const byName = new Map();
    for (const [id, group] of this.groups) {
      for (const name of group.members) {
        if (byName.has(name)) throw new Error(`중복된 묶음: ${name}`);
        byName.set(name, id);
      }
    }
    const scope = view.groupIds ? new Set(view.groupIds) : null;
    const remainingNames = new Set([...byName].filter(([, id]) => !scope || scope.has(id)).map(([name]) => name));
    this.root.updateMatrixWorld(true);
    this.root.traverse((mesh) => {
      if (!mesh.isMesh) return;
      const association = gltf.parser.associations.get(mesh);
      const name = gltf.parser.json.nodes[association?.nodes]?.name;
      const id = byName.get(name);
      if (!id) throw new Error(`명세에 없는 메시: ${name ?? mesh.name}`);
      if (!remainingNames.delete(name)) throw new Error(`예상 구조와 일치하지 않는 메시: ${name}`);
      const group = this.groups.get(id);
      mesh.updateMatrix();
      const baseColor = group.memberColors?.[name] ?? group.color;
      const baseOpacity = group.opacity ?? 1;
      const entry = {
        mesh, name, id, baseColor, baseOpacity, isVessel: group.kind === 'vessel',
        base: mesh.matrix.clone(), baseWorld: mesh.matrixWorld.clone(),
      };
      mesh.userData.groupId = id;
      mesh.userData.originalName = name;
      mesh.material = new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0, side: THREE.DoubleSide });
      mesh.matrixAutoUpdate = false;
      this.entries.push(entry);
      group.meshes.push(mesh);
    });
    if (remainingNames.size > 0) throw new Error('모델의 구조 수 또는 이름이 명세와 다릅니다.');
    this.originalBox = new THREE.Box3().setFromObject(this.root);
    this.size = this.originalBox.getSize(new THREE.Vector3());
    this.center = this.originalBox.getCenter(new THREE.Vector3());
    this.scale = this.size.length();
    if (this.individualSpacingFrom < 100) prepareIndividualSpacing(this.entries, this.groups, this.scale);
    this.resetVisibility();
    if (initialSpacing !== 0) this.setSpacing(initialSpacing);
    this.defaultBox = this.visibleBox();
    this.updateAppearance();
  }

  select(id, member) {
    const group = this.groups.get(id);
    const mesh = member && group?.meshes.find(item => item.visible && item.userData.originalName === member);
    const selected = group?.meshes.length && group.visible && (!member || mesh) ? id : null;
    if (selected === this.selected && (mesh || null) === this.selectedMesh) return;
    this.selected = selected;
    this.selectedMesh = mesh || null;
    this.selectionHighlighted = Boolean(selected);
    if (!selected) this.surroundingsTranslucent = false;
    this.updateAppearance();
  }

  get selectedMember() {
    return this.selectedMesh?.userData.originalName ?? null;
  }

  isSelectedMesh(mesh) {
    return mesh.userData.groupId === this.selected && (!this.selectedMesh || mesh === this.selectedMesh);
  }

  get hasVisibleSurroundings() {
    return this.entries.some(({ mesh }) => mesh.visible && !this.isSelectedMesh(mesh));
  }

  setSurroundingsTranslucent(enabled) {
    const translucent = Boolean(enabled && this.selected);
    if (translucent === this.surroundingsTranslucent) return;
    this.surroundingsTranslucent = translucent;
    this.updateAppearance();
  }

  setSelectionHighlight(highlighted) {
    this.selectionHighlighted = highlighted;
    if (this.selected) this.updateAppearance(true);
  }

  updateAppearance(selectionOnly = false) {
    for (const { mesh, baseColor, baseOpacity, isVessel } of this.entries) {
      const selected = this.isSelectedMesh(mesh);
      if (selectionOnly && !selected) continue;
      const highlighted = selected && this.selectionHighlighted;
      const translucentSurrounding = this.surroundingsTranslucent && !selected;
      const material = mesh.material;
      material.emissive.set(highlighted ? selectionColor : baseColor);
      material.emissiveIntensity = highlighted ? 0.4 : isVessel ? 1 : 0;
      material.color.set(highlighted ? selectionColor : isVessel ? '#000000' : baseColor);
      if (highlighted) material.color.multiplyScalar(0.1);
      material.opacity = highlighted ? 1 : baseOpacity * (translucentSurrounding ? surroundingsOpacity : 1);
      material.forceSinglePass = translucentSurrounding;
      const translucent = material.opacity < 1;
      if (material.transparent !== translucent) {
        material.transparent = translucent;
        material.depthWrite = !translucent;
        material.needsUpdate = true;
      }
    }
  }

  setVisible(id, visible) {
    const group = this.groups.get(id);
    if (!group?.meshes.length) return;
    group.visible = visible;
    for (const mesh of group.meshes) mesh.visible = visible;
    if (!visible && this.selected === id) this.select(null);
  }

  isolate() {
    if (!this.selected) return;
    this.setSurroundingsTranslucent(false);
    for (const [id] of this.groups) this.setVisible(id, id === this.selected);
    if (this.selectedMesh) {
      for (const mesh of this.groups.get(this.selected).meshes) mesh.visible = mesh === this.selectedMesh;
    }
  }

  hideSelection() {
    if (!this.selectedMesh) {
      this.setVisible(this.selected, false);
      return;
    }
    this.selectedMesh.visible = false;
    const group = this.groups.get(this.selected);
    group.visible = group.meshes.some(mesh => mesh.visible);
    this.select(null);
  }

  showAll() {
    this.setSurroundingsTranslucent(false);
    for (const [id] of this.groups) this.setVisible(id, true);
  }

  resetVisibility() {
    for (const [id, group] of this.groups) this.setVisible(id, group.visibleByDefault !== false);
  }

  restoreVisibility(visible) {
    this.select(null);
    this.entries.forEach(({ mesh }, index) => { mesh.visible = visible[index]; });
    for (const group of this.groups.values()) group.visible = group.meshes.some(mesh => mesh.visible);
  }

  visibleBox() {
    const box = new THREE.Box3();
    for (const { mesh } of this.entries) {
      if (mesh.visible) box.expandByObject(mesh);
    }
    return box.isEmpty() ? this.originalBox.clone() : box;
  }

  get individualSpacingActive() {
    return this.spacing > this.individualSpacingFrom;
  }

  setSpacing(percent) {
    if (!Number.isFinite(percent)) return;
    this.spacing = THREE.MathUtils.clamp(percent, 0, 100);
    const individualProgress = this.individualSpacingActive
      ? (this.spacing - this.individualSpacingFrom) / (100 - this.individualSpacingFrom)
      : 0;
    this.root.updateMatrixWorld(true);
    for (const { mesh, id, base, individualOffset } of this.entries) {
      // Convert a world-space displacement to parent space. Never accumulate deltas.
      const direction = this.groups.get(id).direction;
      const delta = new THREE.Vector3(...direction).multiplyScalar(this.scale * groupSpreadScale * this.spacing / 100);
      if (individualProgress && individualOffset) delta.addScaledVector(individualOffset, individualProgress);
      const inverse = mesh.parent.matrixWorld.clone().invert();
      delta.applyMatrix3(new THREE.Matrix3().setFromMatrix4(inverse));
      mesh.matrix.copy(base);
      mesh.matrix.elements[12] += delta.x;
      mesh.matrix.elements[13] += delta.y;
      mesh.matrix.elements[14] += delta.z;
      mesh.matrixWorldNeedsUpdate = true;
    }
    this.root.updateMatrixWorld(true);
  }

  selectedBox() {
    const box = new THREE.Box3();
    if (this.selectedMesh) box.expandByObject(this.selectedMesh);
    else if (this.selected) {
      for (const mesh of this.groups.get(this.selected).meshes) if (mesh.visible) box.expandByObject(mesh);
    }
    return box;
  }

  snapshot() {
    this.root.updateMatrixWorld(true);
    return {
      meshCount: this.entries.length, selected: this.selected, selectedMember: this.selectedMember, spacing: this.spacing,
      groups: Object.fromEntries([...this.groups].map(([id, group]) => [id, { count: group.meshes.length, visible: group.visible }])),
      names: this.entries.map(e => e.name),
      matrices: this.entries.map(({ name, mesh }) => ({ name, local: mesh.matrix.toArray(), world: mesh.matrixWorld.toArray() })),
      maxRestorationError: Math.max(0, ...this.entries.flatMap(({ mesh, baseWorld }) => mesh.matrixWorld.elements.map((n, i) => Math.abs(n - baseWorld.elements[i])))),
    };
  }

  dispose() {
    for (const { mesh } of this.entries) { mesh.geometry.dispose(); mesh.material.dispose(); }
  }
}
