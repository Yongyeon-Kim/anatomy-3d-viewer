"""Deterministic local geometry/render experiment. Run in Blender 3.6 with autoexec off.

Original source stays untouched. No anatomy repair, texture fabrication or medical validation.
"""
from pathlib import Path
from collections import Counter
import hashlib
import json
import re
import sys
import time
import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'results'
LOCAL = ROOT / 'samples/chest-review'
LOCAL.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'raw/z-anatomy/Startup.blend'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE), load_ui=False, use_scripts=False)
assert not bpy.context.preferences.filepaths.use_scripts_auto_execute

def group(obj):
    n = obj.name
    if 'lobe of' in n and 'lung' in n:
        return 'lung'
    if n in ['Left atrium', 'Right atrium', 'Left ventricle', 'Right ventricle']:
        return 'heart_chamber'
    if re.fullmatch(r'\w+ rib\.[lr]', n):
        return 'rib'
    if n.startswith('Costal cartilage of'):
        return 'costal_cartilage'
    if n in ['Body of sternum', 'Manubrium of sternum', 'Xiphoid process']:
        return 'sternum'
    if n == 'Diaphragm':
        return 'diaphragm'
    if n == 'Trachea':
        return 'trachea'

copies = []
for obj in list(bpy.data.objects):
    g = group(obj)
    if obj.type != 'MESH' or not len(obj.data.polygons) or not g:
        continue
    # Copy native polygon topology, not the earlier triangulated OBJ exports.
    copies.append((obj.name, g, obj.data.copy(), obj.matrix_world.copy(),
                   [{'type': m.type, 'levels': getattr(m, 'levels', None)} for m in obj.modifiers]))
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
# The source has compositor/line-render settings. Use a fresh scene so these
# cannot replace the controlled material render with its illustration output.
scene = bpy.data.scenes.new('Controlled chest review')
bpy.context.window.scene = scene
objects = []
inventory = []
for name, g, mesh, matrix, mods in copies:
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.matrix_world = matrix
    obj['review_group'] = g
    obj['source_project'] = 'Z-Anatomy - The libre 3D atlas of anatomy'
    obj['source_commit'] = 'd909eb1e89bf47180b575e4dfacce639c90044b8'
    obj['license_record'] = 'See accompanying PROVENANCE.txt and original License.txt'
    objects.append(obj)
    inventory.append({'name': name, 'group': g, 'source_modifiers': mods,
                      'source_matrix_world': [list(row) for row in matrix]})

def geometry(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(dg)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    v = np.array([tuple(obj.matrix_world @ x.co) for x in mesh.vertices])
    f = np.array([tuple(t.vertices) for t in mesh.loop_triangles], dtype=np.int32)
    evaluated.to_mesh_clear()
    return v, f

def metrics(v, f):
    unique, inverse = np.unique(v, axis=0, return_inverse=True)
    welded = inverse[f]
    edges = Counter(tuple(sorted((int(a), int(b)))) for face in welded
                    for a, b in zip(face, np.roll(face, -1)))
    areas = np.linalg.norm(np.cross(v[f[:, 1]]-v[f[:, 0]], v[f[:, 2]]-v[f[:, 0]]), axis=1)/2
    surface_vertices = v[np.unique(f)]
    return {'vertices': len(v), 'triangles': len(f),
            'unreferenced_vertices': len(v)-len(surface_vertices),
            'surface_bounds': [surface_vertices.min(axis=0).tolist(), surface_vertices.max(axis=0).tolist()],
            'boundary_edges_exact_weld': sum(c == 1 for c in edges.values()),
            'nonmanifold_edges_exact_weld': sum(c > 2 for c in edges.values()),
            'degenerate_triangles_area_le_1e_12': int((areas <= 1e-12).sum()),
            'bounds': [v.min(axis=0).tolist(), v.max(axis=0).tolist()],
            'surface_area_source_units_squared': float(areas.sum()),
            'geometry_sha256': hashlib.sha256(v.tobytes()+f.tobytes()).hexdigest()}

def material(name, color, roughness=.55):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Specular'].default_value = .28
    return m

palette = {'lung': (.49, .19, .16), 'heart_chamber': (.35, .045, .055),
           'rib': (.68, .62, .47), 'sternum': (.68, .62, .47),
           'costal_cartilage': (.32, .53, .54), 'diaphragm': (.28, .09, .10),
           'trachea': (.64, .46, .36)}
mats = {g: material('Review '+g, c) for g, c in palette.items()}
for obj in objects:
    obj.data.materials.clear()
    obj.data.materials.append(mats[obj['review_group']])
    for p in obj.data.polygons:
        p.material_index = 0

lungs = [o for o in objects if o['review_group'] == 'lung']
base = {o.name: geometry(o) for o in objects}
for entry in inventory:
    entry['base'] = metrics(*base[entry['name']])

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.cycles.seed = 7
scene.cycles.use_denoising = True
scene.render.resolution_x = 640
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.film_transparent = False
scene.view_settings.view_transform = 'Filmic'
scene.view_settings.look = 'Medium High Contrast'
scene.view_settings.exposure = 0
scene.view_settings.gamma = 1
scene.world = bpy.data.worlds.new('Review world')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.025, .035, .05, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .35

all_v = np.concatenate([base[o.name][0] for o in lungs])
center = Vector(((all_v.min(axis=0)+all_v.max(axis=0))/2).tolist())
span = float(np.max(all_v.max(axis=0)-all_v.min(axis=0)))
camdata = bpy.data.cameras.new('Review camera')
cam = bpy.data.objects.new('Review camera', camdata)
scene.collection.objects.link(cam)
scene.camera = cam
camdata.type = 'ORTHO'
camdata.clip_start = .001
camdata.clip_end = 100

def camera(oblique=False, context=False):
    target = center
    framing = span * 1.22
    if context:
        positions = np.concatenate([base[o.name][0] for o in objects])
        target = Vector(((positions.min(axis=0)+positions.max(axis=0))/2).tolist())
        framing = float(np.linalg.norm(positions.max(axis=0)-positions.min(axis=0))) * 1.15
    offset = Vector((.65, -1, .18) if oblique else (0, -1, .08))
    cam.location = target + offset.normalized() * span * 4
    cam.rotation_euler = (target-cam.location).to_track_quat('-Z', 'Y').to_euler()
    camdata.ortho_scale = framing

for name, offset, power, size in [('Key', (-.5, -.7, .7), 30, .5),
                                  ('Fill', (.6, -.4, .1), 12, .6),
                                  ('Rim', (0, .5, .4), 25, .4)]:
    light = bpy.data.lights.new(name, 'AREA')
    light.energy = power
    light.size = size
    ob = bpy.data.objects.new(name, light)
    scene.collection.objects.link(ob)
    ob.location = center + Vector(offset)
    ob.rotation_euler = (center-ob.location).to_track_quat('-Z', 'Y').to_euler()

def configure(variant):
    for obj in objects:
        obj.modifiers.clear()
        for p in obj.data.polygons:
            p.use_smooth = variant != 'flat'
        if variant == 'subdivision1' and obj in lungs:
            mod = obj.modifiers.new('Review subdivision level 1', 'SUBSURF')
            mod.levels = mod.render_levels = 1
            mod.subdivision_type = 'CATMULL_CLARK'
    bpy.context.view_layer.update()

def render(name):
    if '--skip-renders' in sys.argv:
        assert (OUT/(name+'.png')).exists(), 'No existing render to reuse'
        return
    scene.render.filepath = str(OUT / (name+'.png'))
    started = time.monotonic()
    bpy.ops.render.render(write_still=True)
    print('REVIEW_RENDER', name, round(time.monotonic()-started, 2), flush=True)

report = {'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
          'blender': bpy.app.version_string, 'autoexec': False,
          'method': 'Native polygons; new isolated objects; source world transforms; exact-coordinate welding for metrics only.',
          'deviation_method': 'All evaluated vertices to nearest base triangle, one direction only; normalized by individual base bounding-box diagonal; not Hausdorff or medical tolerance.',
          'render': {'engine': 'Cycles CPU', 'samples': 24, 'seed': 7, 'resolution': [640,640],
                     'view_transform': 'Filmic', 'look': 'Medium High Contrast',
                     'materials': 'constant procedural-free review colors, identical across variants',
                     'units': 'source coordinates; physical calibration not verified'},
          'inventory': inventory, 'variants': {}}
for obj in objects:
    obj.hide_render = obj not in lungs
for variant in ['flat', 'smooth', 'subdivision1']:
    configure(variant)
    entries = []
    for obj in lungs:
        v, f = geometry(obj)
        entry = {'name': obj.name, **metrics(v, f)}
        bv, bf = base[obj.name]
        bvh = BVHTree.FromPolygons([Vector(x) for x in bv], bf.tolist(), all_triangles=True)
        distances = np.array([bvh.find_nearest(Vector(x))[3] for x in v])
        diagonal = float(np.linalg.norm(bv.max(axis=0)-bv.min(axis=0)))
        entry['vertex_to_base_distance'] = {'max_source_units': float(distances.max()),
            'p95_source_units': float(np.percentile(distances, 95)),
            'max_percent_base_diagonal': float(distances.max()/diagonal*100)}
        entries.append(entry)
    report['variants'][variant] = entries
    for oblique in [False, True]:
        camera(oblique)
        render('lungs-'+variant+('-oblique' if oblique else '-front'))

# Context is a separate configuration: all selected base meshes, smooth shading only.
configure('smooth')
for obj in objects:
    obj.hide_render = False
camera(True, True)
render('chest-context-ribs')
for obj in objects:
    obj.hide_render = obj['review_group'] in ['rib', 'sternum', 'costal_cartilage']
render('chest-context-organs')

# Export local GLBs. Re-import/geometry verification is a separate step.
for scope, variant in [('lungs', 'smooth'), ('lungs', 'subdivision1'), ('chest', 'smooth')]:
    configure(variant)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in (lungs if scope == 'lungs' else objects):
        obj.hide_render = False
        obj.select_set(True)
    path = LOCAL / (scope+'-'+variant+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True,
                             export_apply=True, export_extras=True)
    report.setdefault('exports', []).append({'path': str(path.relative_to(ROOT)), 'scope': scope, 'variant': variant,
        'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})

(LOCAL/'PROVENANCE.txt').write_text(
    'Source: Z-Anatomy - The libre 3D atlas of anatomy\n'
    'Repository: https://github.com/Z-Anatomy/Models-of-human-anatomy\n'
    'Commit: d909eb1e89bf47180b575e4dfacce639c90044b8\n'
    'Original license and contributors: ../../raw/z-anatomy/License.txt (preserved separately)\n'
    'Source package states CC BY-SA 4.0 and lists additional asset-specific conditions.\n'
    'Review derivatives: subset selection, smooth shading, review colors, optional subdivision level 1, glTF Y-up conversion.\n'
    'Internal prototype candidates only. Medical validation pending.\n'
    'Source SHA-256: '+report['source_sha256']+'\n')
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == report['source_sha256']
(OUT/'chest-preparation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print('REVIEW_DONE', len(objects), 'objects', flush=True)
