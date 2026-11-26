import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AnatomyModel } from '../src/model.js';
import { getMemberDetails, groupDetails } from '../src/anatomy-content.js';

const abdomen = JSON.parse(await readFile(new URL('../research/results/abdomen-prototype-manifest.json', import.meta.url)));
const { fallback, regions } = JSON.parse(await readFile(new URL('../research/results/region-manifest.json', import.meta.url)));
const preparation = JSON.parse(await readFile(new URL('../research/results/chest-preparation.json', import.meta.url)));
const lungs = { groups: regions.chest.groups, ...fallback };
async function fixture(variant = 'chest') {
  const view = variant === 'lungs' ? lungs : regions[variant];
  const bytes = await readFile(new URL(`../research/samples/regions/${view.file}`, import.meta.url));
  const data = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const gltf = await new GLTFLoader().parseAsync(data, '');
  return { gltf, model: new AnatomyModel(gltf, view) };
}

test('actual GLB: all 58 source names, triangles, glTF Y-up and source node transforms survive loading', async () => {
  const { gltf, model } = await fixture();
  assert.equal(model.entries.length, 103);
  const known = new Map(preparation.inventory.map(object => [object.name, object]));
  const preserved = model.entries.filter(entry => known.has(entry.name));
  assert.equal(preserved.length, 58);
  assert.deepEqual([...model.groups.values()].slice(0, 6).map(g => g.meshes.length), [2, 3, 4, 47, 1, 1]);
  assert.equal(preserved.reduce((n, { mesh }) => n + (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3, 0), 240979);
  for (const { name, mesh, base } of preserved) {
    const original = gltf.parser.json.nodes[gltf.parser.associations.get(mesh).nodes];
    const expected = new THREE.Matrix4();
    if (original.matrix) expected.fromArray(original.matrix);
    else expected.compose(new THREE.Vector3(...(original.translation ?? [0, 0, 0])), new THREE.Quaternion(...(original.rotation ?? [0, 0, 0, 1])), new THREE.Vector3(...(original.scale ?? [1, 1, 1])));
    assert.deepEqual(base.toArray(), expected.toArray());
    const source = known.get(name);
    const conversion = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
    const toSource = conversion.clone().invert().multiply(mesh.matrixWorld);
    const surfaceBox = new THREE.Box3();
    const positions = mesh.geometry.attributes.position;
    const indices = mesh.geometry.index;
    const vertex = new THREE.Vector3();
    for (let i = 0; i < (indices?.count ?? positions.count); i++) {
      vertex.fromBufferAttribute(positions, indices ? indices.getX(i) : i).applyMatrix4(toSource);
      surfaceBox.expandByPoint(vertex);
    }
    const actualBounds = [...surfaceBox.min.toArray(), ...surfaceBox.max.toArray()];
    assert.ok(Math.max(...actualBounds.map((n, i) => Math.abs(n - source.base.surface_bounds.flat()[i]))) < 1e-6, original.name);
    assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite));
  }
  assert.equal(model.root.up.y, 1);
  model.dispose();
});

test('actual GLB: 1000 spread/restore cycles return every local and world matrix exactly; visibility and selection remain independent', async () => {
  const { model } = await fixture();
  const original = model.snapshot().matrices;
  model.setVisible('rib_cage', false);
  model.select('left_lung');
  const initialCenter = model.selectedBox().getCenter(new THREE.Vector3());
  model.setSpacing(100);
  assert.ok(model.selectedBox().getCenter(new THREE.Vector3()).distanceTo(initialCenter) > 0.1);
  for (let i = 0; i < 1000; i++) { model.setSpacing((i * 37) % 101); model.setSpacing(0); }
  assert.deepEqual(model.snapshot().matrices, original);
  assert.equal(model.snapshot().maxRestorationError, 0);
  assert.equal(model.groups.get('rib_cage').visible, false);
  assert.equal(model.selected, 'left_lung');
  model.isolate();
  assert.deepEqual([...model.groups].filter(([, g]) => g.visible).map(([id]) => id), ['left_lung']);
  model.setVisible('left_lung', false);
  assert.equal(model.selected, null);
  model.select('left_lung');
  assert.equal(model.selected, null);
  model.showAll();
  assert.ok([...model.groups.values()].every(g => g.visible));
  model.dispose();
});

test('actual lung fallback has exactly five meshes/two available groups; unknown source names fail closed', async () => {
  const { gltf, model } = await fixture('lungs');
  assert.equal(model.entries.length, 5);
  assert.equal([...model.groups.values()].filter(g => g.meshes.length).length, 2);
  model.select('heart_chambers');
  assert.equal(model.selected, null);
  gltf.parser.json.nodes[0].name = 'unknown';
  assert.throws(() => new AnatomyModel(gltf, lungs), /명세에 없는/);
  model.dispose();
});

test('abdominal GLB preserves baseline geometry, positions and optional structures', async () => {
  const { model } = await fixture('abdomen');
  const { model: chest } = await fixture();
  try {
    const addedGroups = regions.abdomen.visibilityControls.flatMap(control => control.groups);
    const baseline = model.entries.filter(entry => !addedGroups.includes(entry.id));
    assert.equal(model.entries.length, 30);
    assert.equal(model.groups.size, 18);
    assert.equal(baseline.length, 19);
    assert.equal(baseline.reduce((total, { mesh }) => {
      return total + (mesh.geometry.index?.count ?? mesh.geometry.attributes.position.count) / 3;
    }, 0), abdomen.triangles);
    assert.ok(model.entries.every(({ mesh }) => mesh.geometry.attributes.position.array.every(Number.isFinite)));

    const abdomenDiaphragm = model.groups.get('diaphragm').meshes[0];
    const chestDiaphragm = chest.groups.get('diaphragm').meshes[0];
    assert.deepEqual(abdomenDiaphragm.matrixWorld.toArray(), chestDiaphragm.matrixWorld.toArray());
    const bounds = mesh => new THREE.Box3().setFromObject(mesh, true);
    const abdomenBounds = bounds(abdomenDiaphragm);
    const chestBounds = bounds(chestDiaphragm);
    assert.ok(abdomenBounds.min.distanceTo(chestBounds.min) < 1e-6);
    assert.ok(abdomenBounds.max.distanceTo(chestBounds.max) < 1e-6);

    const groupCenter = id => bounds(model.groups.get(id).meshes[0]).getCenter(new THREE.Vector3());
    assert.ok(groupCenter('abdominal_aorta').x > groupCenter('inferior_vena_cava').x);
    assert.ok(groupCenter('rectus_abdominis').z > groupCenter('abdominal_aorta').z);
    for (const id of addedGroups) {
      const { visible, meshes } = model.groups.get(id);
      assert.equal(visible, true, id);
      assert.ok(meshes.every(mesh => mesh.visible), id);
      if (meshes.length === 2) {
        const [left, right] = meshes.map(mesh => bounds(mesh).getCenter(new THREE.Vector3()).x);
        assert.ok(left > 0 && right < 0, id);
      }
    }
    const rectus = model.groups.get('rectus_abdominis').meshes[0];
    const restColor = rectus.material.color.getHex();
    const restOpacity = rectus.material.opacity;
    assert.ok(restOpacity > 0 && restOpacity < 1);
    model.select('rectus_abdominis');
    assert.equal(rectus.material.opacity, 1);
    assert.equal(rectus.material.transparent, false);
    assert.equal(rectus.material.emissive.getHex(), 0xd7f58a);
    model.setSelectionHighlight(false);
    assert.equal(model.selected, 'rectus_abdominis');
    assert.equal(rectus.material.opacity, restOpacity);
    assert.equal(rectus.material.color.getHex(), restColor);
    model.setSelectionHighlight(true);
    assert.equal(rectus.material.emissive.getHex(), 0xd7f58a);
    model.select(null);
    assert.equal(rectus.material.opacity, restOpacity);
    assert.equal(rectus.material.transparent, true);
    assert.equal(rectus.material.color.getHex(), restColor);

    const original = model.snapshot().matrices;
    model.select('pancreas');
    model.setVisible('stomach', false);
    model.setSpacing(75);
    assert.notDeepEqual(model.snapshot().matrices, original);
    model.setSpacing(0);
    assert.deepEqual(model.snapshot().matrices, original);
    assert.equal(model.selected, 'pancreas');
    assert.equal(model.groups.get('stomach').visible, false);
    assert.ok(addedGroups.every(id => model.groups.get(id).visible));
    for (const id of addedGroups) model.setVisible(id, false);
    model.resetVisibility();
    assert.ok([...model.groups.values()].every(group => group.visible));
  } finally {
    model.dispose();
    chest.dispose();
  }
});

test('all regional exports use the same original positions, correct sides, and restorable layouts', async () => {
  const transforms = new Map();
  const shared = [];
  for (const [id, region] of Object.entries(regions)) {
    const { model } = await fixture(id);
    try {
      assert.equal(model.groups.size, Object.keys(region.groups).length);
      assert.equal(model.entries.length, Object.values(region.groups).flatMap(group => group.members).length);
      assert.ok(model.entries.every(({ mesh }) => mesh.visible), id);
      const original = model.snapshot().matrices;
      for (const { name, mesh } of model.entries) {
        const next = mesh.matrixWorld.elements;
        const previous = transforms.get(name);
        if (previous) {
          assert.ok(next.every((n, index) => Math.abs(n - previous[index]) < 1e-7), `${id}/${name}`);
          shared.push(name);
        } else {
          transforms.set(name, next.slice());
        }
        assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite), `${id}/${name}`);
        if (region.side) {
          const center = new THREE.Box3().setFromObject(mesh).getCenter(new THREE.Vector3());
          assert.ok(region.side === '왼쪽' ? center.x > 0 : center.x < 0, `${id}/${name}`);
        }
      }
      model.setSpacing(65);
      assert.notDeepEqual(model.snapshot().matrices, original, id);
      model.setSpacing(0);
      assert.deepEqual(model.snapshot().matrices, original, id);
    } finally {
      model.dispose();
    }
  }
  for (const name of ['Diaphragm', 'Mandible', 'Vertebra L1', 'Hip bone.l', 'First metacarpal bone.l', 'First metatarsal bone.r']) {
    assert.ok(shared.includes(name), name);
  }
});

test('the thoracic esophagus reaches the abdominal stomach near the shared diaphragm', async () => {
  const { model: chest } = await fixture('chest');
  const { model: abdomen } = await fixture('abdomen');
  const worldVertices = ({ mesh }) => {
    const positions = mesh.geometry.getAttribute('position');
    return Array.from({ length: positions.count }, (_, index) => new THREE.Vector3()
      .fromBufferAttribute(positions, index).applyMatrix4(mesh.matrixWorld));
  };
  try {
    const esophagus = worldVertices(chest.entries.find(({ name }) => name === 'Oesophagus'));
    const stomach = worldVertices(abdomen.entries.find(({ name }) => name === 'Stomach'));
    const diaphragm = new THREE.Box3().setFromObject(chest.entries.find(({ name }) => name === 'Diaphragm').mesh);
    const lowerEnd = new THREE.Box3().setFromPoints(esophagus).min.y;
    const junction = esophagus.filter(point => point.y <= lowerEnd + .01 && diaphragm.containsPoint(point));
    let nearest = Infinity;
    for (const point of junction) {
      for (const surface of stomach) nearest = Math.min(nearest, point.distanceToSquared(surface));
    }
    assert.ok(nearest < .001 ** 2, `distance in model coordinates: ${Math.sqrt(nearest)}`);
  } finally {
    chest.dispose();
    abdomen.dispose();
  }
});

test('whole-body vessels retain their material when surrounding structures are hidden', async () => {
  const { model } = await fixture('body');
  try {
    const arteries = model.groups.get('body_arteries');
    const veins = model.groups.get('body_veins');
    const bone = model.groups.get('head-neck').meshes[0];
    assert.equal(arteries.meshes.length, 427);
    assert.equal(veins.meshes.length, 232);
    assert.equal(arteries.meshes[0].material.opacity, 1);
    assert.equal(bone.material.opacity, 1);
    assert.equal(arteries.visible, true);
    assert.equal(veins.visible, true);
    const arteryColor = arteries.meshes[0].material.emissive.getHex();
    model.setVisible('head-neck', false);
    assert.equal(bone.visible, false);
    assert.equal(arteries.meshes[0].material.emissive.getHex(), arteryColor);
    assert.equal(arteries.visible, true);
    assert.equal(veins.visible, true);
    model.setVisible('head-neck', true);
    assert.equal(bone.visible, true);
    assert.equal(bone.material.opacity, 1);
  } finally {
    model.dispose();
  }
});

test('whole-body spacing progressively separates individual structures while vessels keep their groups', async () => {
  const { model } = await fixture('body');
  try {
    const original = model.snapshot().matrices;
    const structures = model.entries.filter(entry => !entry.isVessel);
    function shifts(entries) {
      return new Set(entries.map(({ mesh, baseWorld }) => [12, 13, 14]
        .map(i => (mesh.matrixWorld.elements[i] - baseWorld.elements[i]).toFixed(7)).join(',')));
    }

    model.setSpacing(40);
    assert.equal(model.individualSpacingActive, false);
    assert.equal(shifts(structures).size, 11);
    model.setSpacing(41);
    assert.equal(model.individualSpacingActive, true);
    assert.equal(shifts(structures).size, 212);
    model.setSpacing(100);
    assert.equal(shifts(structures).size, 212);
    for (const id of ['body_arteries', 'body_veins']) {
      assert.equal(shifts(model.entries.filter(entry => entry.id === id)).size, 1);
    }
    const boxes = structures.map(({ mesh }) => new THREE.Box3().setFromObject(mesh));
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i], boxes[j]];
        const overlapX = Math.min(a.max.x, b.max.x) - Math.max(a.min.x, b.min.x);
        const overlapY = Math.min(a.max.y, b.max.y) - Math.max(a.min.y, b.min.y);
        assert.ok(overlapX <= 1e-6 || overlapY <= 1e-6, `${structures[i].name} / ${structures[j].name}`);
      }
    }
    model.setSpacing(0);
    assert.equal(model.individualSpacingActive, false);
    assert.deepEqual(model.snapshot().matrices, original);
  } finally {
    model.dispose();
  }
});

test('all supported detailed structures have localized location and role explanations', () => {
  for (const [region, view] of Object.entries(regions)) {
    for (const [id, group] of Object.entries(view.groups)) {
      assert.ok(groupDetails[id]?.source, `${region} / ${id}`);
      if (group.kind === 'vessel') continue;
      for (const name of group.members) {
        const details = getMemberDetails(name);
        assert.ok(/[가-힣]/.test(details.label) && details.location && details.role && details.source, name);
      }
    }
  }
});

test('view actions target the chosen structure without changing its group membership', async () => {
  const { model } = await fixture('back-spine');
  try {
    const { meshes } = model.groups.get('superficial_back');
    const selected = meshes.find(mesh => mesh.userData.originalName === 'Descending part of trapezius muscle.l');
    model.select('superficial_back', selected.userData.originalName);
    assert.ok(model.selectedBox().equals(new THREE.Box3().setFromObject(selected)));
    assert.equal(selected.material.emissive.getHex(), 0xd7f58a);
    assert.ok(meshes.filter(mesh => mesh !== selected).every(mesh => mesh.material.emissiveIntensity === 0));
    model.isolate();
    assert.deepEqual(model.entries.filter(({ mesh }) => mesh.visible).map(({ mesh }) => mesh), [selected]);
    model.showAll();
    model.hideSelection();
    assert.equal(model.selected, null);
    assert.ok(meshes.every(mesh => mesh.visible === (mesh !== selected)));
    model.resetVisibility();
    assert.ok(model.entries.every(({ mesh }) => mesh.visible));
  } finally {
    model.dispose();
  }
});

test('translucent surroundings preserve the selected structures and restore the original materials', async () => {
  const { model } = await fixture('chest');
  try {
    const original = model.snapshot();
    model.select('heart_chambers');
    model.setSurroundingsTranslucent(true);
    for (const { id, mesh, baseOpacity } of model.entries) {
      if (id === 'heart_chambers') {
        assert.equal(mesh.material.opacity, baseOpacity);
        assert.equal(mesh.material.depthWrite, true);
      } else {
        assert.ok(mesh.material.opacity > 0 && mesh.material.opacity < baseOpacity);
        assert.equal(mesh.material.depthWrite, false);
      }
    }
    assert.deepEqual(model.snapshot().groups, original.groups);
    assert.deepEqual(model.snapshot().matrices, original.matrices);

    model.select('heart_chambers', 'Right ventricle');
    model.setSelectionHighlight(false);
    assert.equal(model.selectedMesh.material.opacity, 1);
    assert.ok(model.groups.get('heart_chambers').meshes.filter(mesh => mesh !== model.selectedMesh)
      .every(mesh => mesh.material.opacity < 1));

    model.select(null);
    assert.equal(model.surroundingsTranslucent, false);
    assert.ok(model.entries.every(({ mesh, baseOpacity }) => mesh.material.opacity === baseOpacity));
  } finally {
    model.dispose();
  }
});
