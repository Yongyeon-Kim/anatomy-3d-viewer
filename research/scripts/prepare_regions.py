"""Export and verify the viewer's regional models from the pinned Z-Anatomy scene."""
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory
import json
import math
import struct

import bpy
from mathutils import Vector


def digest(path):
    value = sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()


def read_glb(path):
    with path.open('rb') as glb:
        magic, version, size, json_size, chunk = struct.unpack('<4sIIII', glb.read(20))
        if (magic, version, size, chunk) != (b'glTF', 2, path.stat().st_size, 0x4E4F534A):
            raise ValueError(f'Invalid GLB header: {path}')
        return json.loads(glb.read(json_size))


def source_mesh(obj, depsgraph, evaluated_meshes):
    if obj.type == 'CURVE' or obj.name in evaluated_meshes:
        evaluated = obj.evaluated_get(depsgraph)
        mesh = bpy.data.meshes.new_from_object(evaluated)
        matrix = evaluated.matrix_world.copy()
    else:
        mesh = obj.data.copy()
        matrix = obj.matrix_world.copy()
    mesh.validate(clean_customdata=False)
    mesh.calc_loop_triangles()
    if not mesh.loop_triangles or not all(math.isfinite(n) for vertex in mesh.vertices for n in vertex.co):
        raise ValueError(f'No finite surface for {obj.name}')
    mesh.materials.clear()
    for face in mesh.polygons:
        face.use_smooth = True
        face.material_index = 0
    return mesh, matrix, len(mesh.loop_triangles)


def overview_vessel_curves(region):
    curves = set()
    for group in region['groups'].values():
        if not group.get('sourceCollections'):
            continue
        surfaces = {obj.name for collection in group['sourceCollections']
                    for obj in bpy.data.collections[collection].all_objects
                    if obj.type in ('CURVE', 'MESH')}
        selected = set(group['members'])
        if selected != surfaces:
            raise ValueError(f'Vessel manifest differs from the source: '
                             f'missing={sorted(surfaces - selected)}, extra={sorted(selected - surfaces)}')
        curves.update(name for name in surfaces if bpy.data.objects[name].type == 'CURVE')
    return curves


def compact_vessel_surfaces(names):
    # Reduce tessellation along and around the original splines. Every branch remains in the model.
    for curve in {bpy.data.objects[name].data for name in names}:
        curve.resolution_u = min(curve.resolution_u, 6)
        curve.bevel_resolution = min(curve.bevel_resolution, 1)
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    return {name: source_mesh(bpy.data.objects[name], depsgraph, set()) for name in sorted(names)}


def export_region(scene, region, objects, surfaces, output, source_hash):
    members = [(name, group.get('exportRatio', region.get('overviewRatio')))
               for group in region['groups'].values() for name in group['members']]
    names = [name for name, _ in members]
    if len(names) != len(set(names)):
        raise ValueError(f'A source object appears in multiple groups: {region["file"]}')
    reduced = set()
    for name, ratio in members:
        obj = objects[name]
        mesh, matrix, triangles = surfaces[name]
        obj.data = mesh
        scene.collection.objects.link(obj)
        # Linking into the isolated scene can reset transforms.
        obj.matrix_world = matrix
        if ratio and triangles > 2400:
            modifier = obj.modifiers.new('Reduce geometry for the viewer', 'DECIMATE')
            modifier.ratio = ratio
            modifier.use_collapse_triangulate = True
            reduced.add(name)
    bpy.context.view_layer.update()
    expected = {name: surfaces[name][2] for name in names}
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for name in reduced:
        mesh = objects[name].evaluated_get(depsgraph).data
        mesh.calc_loop_triangles()
        expected[name] = len(mesh.loop_triangles)
    with TemporaryDirectory(dir=output) as directory:
        stage = Path(directory)
        glb = stage / region['file']
        result = bpy.ops.export_scene.gltf(
            filepath=str(glb), export_format='GLB', export_materials='NONE',
            export_texcoords=False, export_yup=True, use_active_scene=True, export_apply=bool(reduced),
        )
        if 'FINISHED' not in result:
            raise RuntimeError(f'Export failed: {glb.name}')
        document = read_glb(glb)
        actual = {node['name']: document['meshes'][node['mesh']]
                  for node in document['nodes'] if 'mesh' in node}
        if sorted(actual) != sorted(names) or len(document['meshes']) != len(names):
            raise ValueError(f'GLB nodes differ from manifest: {glb.name}')
        for name, mesh in actual.items():
            triangles = sum(document['accessors'][part['indices']]['count'] // 3
                            for part in mesh['primitives'])
            if triangles <= 0 or triangles != expected[name]:
                raise ValueError(f'GLB triangle count differs for {name}: {triangles} vs {expected[name]} ({glb.name})')
        result = {
            'file': glb.name, 'sha256': digest(glb), 'bytes': glb.stat().st_size,
            'meshes': len(names), 'triangles': sum(expected.values()),
        }
        receipt = stage / (glb.stem + '.json')
        receipt.write_text(json.dumps({'source_sha256': source_hash, **result}, indent=2) + '\n')
        glb.replace(output / glb.name)
        receipt.replace(output / receipt.name)
    for name in names:
        obj = objects[name]
        if name in reduced:
            obj.modifiers.clear()
        scene.collection.objects.unlink(obj)
    return result


def main():
    research = Path(__file__).resolve().parents[1]
    manifest = json.loads((research / 'results/region-manifest.json').read_text())
    preparation = json.loads((research / 'results/chest-preparation.json').read_text())
    source = research / 'raw/z-anatomy/Startup.blend'
    source_hash = digest(source)
    if source_hash != preparation['source_sha256']:
        raise ValueError(f'Source file differs from the pinned Z-Anatomy scene: {source}')
    bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
    if bpy.context.preferences.filepaths.use_scripts_auto_execute:
        raise RuntimeError('Run Blender with --disable-autoexec.')

    regions = manifest['regions']
    compact_curves = overview_vessel_curves(regions['body'])
    names_by_side = {'왼쪽': set(), '오른쪽': set()}
    names = set()
    for key, region in regions.items():
        region_names = {name for group in region['groups'].values() for name in group['members']}
        if key == 'body':
            region_names -= compact_curves
        names.update(region_names)
        if 'side' in region:
            names_by_side[region['side']].update(region_names)

    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated_meshes = set(manifest['evaluatedMeshes'])
    surfaces = {}
    for name in sorted(names):
        obj = bpy.data.objects[name]
        if obj.type not in ('MESH', 'CURVE'):
            raise ValueError(f'Unsupported source type for {name}: {obj.type}')
        mesh, matrix, triangles = source_mesh(obj, depsgraph, evaluated_meshes)
        center_x = sum((matrix @ v.co).x for v in mesh.vertices) / len(mesh.vertices)
        if (name in names_by_side['왼쪽'] and center_x <= 0) or (name in names_by_side['오른쪽'] and center_x >= 0):
            raise ValueError(f'Source side differs for {name}')
        surfaces[name] = (mesh, matrix, triangles)

    overview_surfaces = {**surfaces, **compact_vessel_surfaces(compact_curves)}
    scene = bpy.data.scenes.new('Regional model export')
    bpy.context.window.scene = scene
    bpy.data.batch_remove(list(bpy.data.objects))
    objects = {name: bpy.data.objects.new(name, mesh)
               for name, (mesh, _, _) in overview_surfaces.items()}
    output = research / 'samples/regions'
    output.mkdir(parents=True, exist_ok=True)
    summary = {}
    for key, region in regions.items():
        region_surfaces = overview_surfaces if key == 'body' else surfaces
        summary[key] = export_region(scene, region, objects, region_surfaces, output, source_hash)
        print('REGION', key, json.dumps(summary[key]), flush=True)
    fallback = {
        'file': manifest['fallback']['file'],
        'groups': {key: manifest['regions']['chest']['groups'][key]
                   for key in manifest['fallback']['groupIds']},
    }
    summary['lungs'] = export_region(scene, fallback, objects, surfaces, output, source_hash)
    print('REGION lungs', json.dumps(summary['lungs']), flush=True)
    (output / 'export-summary.json').write_text(json.dumps(summary, indent=2) + '\n')


if __name__ == '__main__':
    main()
