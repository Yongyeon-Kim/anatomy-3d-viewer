"""Export the abdominal prototype from the pinned Z-Anatomy Blender scene."""
from pathlib import Path
from tempfile import TemporaryDirectory
import hashlib
import json
import struct

import bpy


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'results/abdomen-prototype-manifest.json').read_text())
chest_record = json.loads((root / 'results/chest-preparation.json').read_text())
source = root / 'raw/z-anatomy/Startup.blend'
source_hash = sha256(source)
if source_hash != chest_record['source_sha256']:
    raise ValueError(f'Source file differs from the pinned Z-Anatomy scene: {source}')

bpy.ops.wm.open_mainfile(filepath=str(source), load_ui=False, use_scripts=False)
if bpy.context.preferences.filepaths.use_scripts_auto_execute:
    raise RuntimeError('Run Blender with --disable-autoexec.')

depsgraph = bpy.context.evaluated_depsgraph_get()
copies = []
triangle_count = 0
for group in manifest['groups'].values():
    for name in group['members']:
        obj = bpy.data.objects[name]
        # Use the same diaphragm surface as the existing chest asset.
        if name == 'Diaphragm':
            mesh = obj.data.copy()
            matrix = obj.matrix_world.copy()
        else:
            evaluated = obj.evaluated_get(depsgraph)
            mesh = bpy.data.meshes.new_from_object(evaluated)
            matrix = evaluated.matrix_world.copy()
        mesh.calc_loop_triangles()
        if not mesh.loop_triangles:
            raise ValueError(f'No surface available for {name}')
        triangle_count += len(mesh.loop_triangles)
        mesh.materials.clear()
        for face in mesh.polygons:
            face.use_smooth = True
        copies.append((name, mesh, matrix))

# Release the original objects in memory so names remain unchanged in the export.
scene = bpy.data.scenes.new('Abdomen prototype')
bpy.context.window.scene = scene
bpy.data.batch_remove(list(bpy.data.objects))
for name, mesh, matrix in copies:
    obj = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(obj)
    obj.matrix_world = matrix

output = root / 'samples/abdomen'
output.mkdir(parents=True, exist_ok=True)
with TemporaryDirectory(dir=output) as staging:
    path = Path(staging) / manifest['file']
    result = bpy.ops.export_scene.gltf(
        filepath=str(path), export_format='GLB', export_materials='NONE',
        export_texcoords=False, export_yup=True,
    )
    if 'FINISHED' not in result:
        raise RuntimeError('GLB export failed.')
    with path.open('rb') as glb:
        magic, version, size, json_length, chunk_type = struct.unpack('<4sIIII', glb.read(20))
        if (magic, version, size, chunk_type) != (b'glTF', 2, path.stat().st_size, 0x4E4F534A):
            raise ValueError('Invalid GLB header.')
        document = json.loads(glb.read(json_length))
    names = sorted(node['name'] for node in document['nodes'] if 'mesh' in node)
    if names != sorted(name for name, _, _ in copies):
        raise ValueError('The exported mesh names differ from the manifest.')
    glb_triangles = sum(
        document['accessors'][primitive['indices']]['count'] // 3
        for mesh in document['meshes'] for primitive in mesh['primitives']
    )
    if glb_triangles != triangle_count or glb_triangles != manifest['triangles']:
        raise ValueError(f'Unexpected triangle count: {glb_triangles}')
    digest = sha256(path)
    size = path.stat().st_size
    receipt = Path(staging) / 'export.json'
    receipt.write_text(json.dumps({
        'source_sha256': source_hash,
        'sha256': digest,
        'bytes': size,
        'triangles': glb_triangles,
    }, indent=2) + '\n')
    path.replace(output / manifest['file'])
    receipt.replace(output / receipt.name)
print(f'{manifest["file"]}: {len(copies)} meshes, {triangle_count} triangles, {size} bytes, SHA-256 {digest}')
