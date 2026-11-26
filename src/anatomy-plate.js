import * as THREE from 'three';

const heartGroups = new Set(['heart_chambers', 'heart_internal', 'great_vessels']);
const spineGroups = new Set(['cervical_spine', 'thoracic_spine', 'lumbar_spine', 'sacrum']);
const mixedSourceRegions = new Set(['body', 'head-neck', 'abdomen']);
const originalLicense = 'https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/d909eb1e89bf47180b575e4dfacce639c90044b8/License.txt';
const atlasLicense = 'https://creativecommons.org/licenses/by-sa/4.0/';
const paper = [249, 242, 224];

function plateView(variant, group) {
  if (variant === 'back-spine') return {
    direction: [0, 0, -1], label: '뒤에서 본 모습',
    context: group === 'superficial_back' || group === 'deep_back'
      ? new Set([...spineGroups, group]) : new Set([...spineGroups, 'spinal_dura']),
  };
  if (variant === 'chest' && heartGroups.has(group)) return {
    direction: [.18, .12, 1], label: '앞에서 비스듬히 본 모습',
    context: group === 'heart_internal' ? new Set() : new Set(['heart_chambers', 'great_vessels']),
  };
  if (variant === 'chest' && group === 'esophagus') return {
    direction: [-.35, .04, -1], label: '뒤에서 비스듬히 본 모습',
    context: new Set(['trachea', 'bronchus_left', 'bronchus_right']),
  };
  return { direction: [.18, .12, 1], label: '앞에서 비스듬히 본 모습', context: new Set() };
}

function cameraFor(bounds, direction, aspect) {
  const center = bounds.getCenter(new THREE.Vector3());
  const depth = bounds.getSize(new THREE.Vector3()).length() * 3;
  const lens = new THREE.OrthographicCamera(-1, 1, 1, -1, depth / 1000, depth * 3);
  lens.position.copy(center).addScaledVector(new THREE.Vector3(...direction).normalize(), depth);
  lens.lookAt(center);
  lens.updateMatrixWorld();
  const projected = bounds.clone().applyMatrix4(lens.matrixWorldInverse).getSize(new THREE.Vector3());
  const halfHeight = Math.max(projected.y, projected.x / aspect) * .62;
  lens.left = -halfHeight * aspect;
  lens.right = halfHeight * aspect;
  lens.top = halfHeight;
  lens.bottom = -halfHeight;
  lens.updateProjectionMatrix();
  return lens;
}

function drawPencil(context, pixels, width, height) {
  const drawing = context.createImageData(width, height);
  let anchor = null;
  let closest = Infinity;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const target = (y * width + x) * 4;
      const source = ((height - 1 - y) * width + x) * 4;
      const alpha = pixels[source + 3] / 255;
      const red = pixels[source];
      const green = pixels[source + 1];
      const isSelected = red - green > 8;
      if (isSelected && alpha > .5) {
        const distance = (x - width / 2) ** 2 + (y - height / 2) ** 2;
        if (distance < closest) {
          closest = distance;
          anchor = { x, y };
        }
      }
      const brightness = isSelected ? red : green;
      const outline = alpha && x > 0 && x < width - 1 && y > 0 && y < height - 1
        && [source - 4, source + 4, source - width * 4, source + width * 4].some(index => pixels[index + 3] < 90);
      const hatch = (x + y * 2) % 11 < 2 ? Math.max(0, 124 - brightness) * .18 : 0;
      const shade = Math.min(115, 35 + (255 - brightness) * .31 + (outline ? 33 : 0) + hatch);
      const graphite = isSelected ? [251 - shade * .65, 213 - shade, 187 - shade] : paper.map(channel => channel - shade * .68);
      const grain = ((x * 13 + y * 19 + x * y) % 11 - 5) * .45;
      for (let channel = 0; channel < 3; channel++) {
        drawing.data[target + channel] = paper[channel] * (1 - alpha) + graphite[channel] * alpha + grain;
      }
      drawing.data[target + 3] = 255;
    }
  }
  context.putImageData(drawing, 0, 0);
  return anchor;
}

function drawLeader(context, point, width, height) {
  if (!point) return;
  const { x, y } = point;
  const endX = x < width / 2 ? 35 : width - 35;
  const direction = Math.sign(endX - x);
  const endY = THREE.MathUtils.clamp(y - 36, 28, height - 28);
  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(endX - direction * 26, endY);
  context.lineTo(endX, endY);
  context.lineWidth = 2;
  context.strokeStyle = '#754734';
  context.stroke();
  context.beginPath();
  context.arc(x, y, 4, 0, Math.PI * 2);
  context.fillStyle = '#8d4b2d';
  context.fill();
}

export class AnatomyPlate {
  constructor(figure, canvas, name, view, license) {
    this.figure = figure;
    this.canvas = canvas;
    this.name = name;
    this.view = view;
    this.license = license;
  }

  update(renderer, model, variant, label) {
    const key = model?.selected;
    if (!renderer || !key) {
      this.figure.hidden = true;
      this.previous = null;
      return;
    }
    if (this.previous?.model === model && this.previous.key === key && this.previous.member === model.selectedMember) return;
    const definition = plateView(variant, key);
    const { width, height } = this.canvas;
    const context = this.canvas.getContext('2d');
    if (!context) return;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9391, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(-2, 4, definition.direction[2] * 3);
    scene.add(keyLight);

    const selected = new THREE.MeshLambertMaterial({ color: 0x964523, side: THREE.DoubleSide });
    const surrounding = new THREE.MeshLambertMaterial({ color: 0x69605a, side: THREE.DoubleSide });
    const supportingMeshes = [];
    const bounds = new THREE.Box3();
    for (const entry of model.entries) {
      const highlighted = model.isSelectedMesh(entry.mesh);
      if (!highlighted && !definition.context.has(entry.id)) continue;
      const mesh = new THREE.Mesh(entry.mesh.geometry, highlighted ? selected : surrounding);
      mesh.matrix.copy(entry.baseWorld);
      mesh.matrixAutoUpdate = false;
      scene.add(mesh);
      mesh.updateMatrixWorld(true);
      if (entry.id === key) bounds.expandByObject(mesh);
      if (!highlighted) supportingMeshes.push(mesh);
    }
    if (bounds.isEmpty()) return;
    const camera = cameraFor(bounds, definition.direction, width / height);
    const previousTarget = renderer.getRenderTarget();
    const clear = renderer.getClearColor(new THREE.Color());
    const alpha = renderer.getClearAlpha();
    const target = new THREE.WebGLRenderTarget(width, height);
    const pixels = new Uint8Array(width * height * 4);
    const paint = () => {
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
      return drawPencil(context, pixels, width, height);
    };
    let anchor;
    try {
      renderer.setRenderTarget(target);
      renderer.setClearColor(0x000000, 0);
      anchor = paint();
      if (!anchor && supportingMeshes.length) {
        for (const mesh of supportingMeshes) mesh.visible = false;
        anchor = paint();
      }
    } finally {
      renderer.setRenderTarget(previousTarget);
      renderer.setClearColor(clear, alpha);
      target.dispose();
      selected.dispose();
      surrounding.dispose();
    }
    drawLeader(context, anchor, width, height);
    this.previous = { model, key, member: model.selectedMember };
    this.name.textContent = label;
    this.view.textContent = definition.label;
    const mixedSource = mixedSourceRegions.has(variant);
    this.license.textContent = mixedSource ? '원본 이용 조건' : 'CC BY-SA 4.0';
    this.license.href = mixedSource ? originalLicense : atlasLicense;
    this.canvas.setAttribute('aria-label', `${label} 해부학 도판, ${definition.label}`);
    this.figure.hidden = false;
  }
}
