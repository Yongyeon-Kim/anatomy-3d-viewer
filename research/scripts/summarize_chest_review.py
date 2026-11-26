"""Build contact sheets and verify local GLBs against the measured Blender meshes."""
from pathlib import Path
import json
import hashlib
import numpy as np
import trimesh
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'results'
report = json.loads((OUT/'chest-preparation.json').read_text())
assert [x['geometry_sha256'] for x in report['variants']['flat']] == [
    x['geometry_sha256'] for x in report['variants']['smooth']], 'Shading changed geometry'
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 22)
small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 17)
sheet = Image.new('RGB', (1920, 1410), '#111923')
draw = ImageDraw.Draw(sheet)
titles = ['A | Base geometry / flat shading', 'B | Same geometry / smooth shading',
          'C | Subdivision 1 / smooth shading']
for col, variant in enumerate(['flat', 'smooth', 'subdivision1']):
    draw.text((col*640+18, 14), titles[col], fill='white', font=font)
    for row, view in enumerate(['front', 'oblique']):
        with Image.open(OUT/f'lungs-{variant}-{view}.png') as img:
            assert img.size == (640,640)
            sheet.paste(img.convert('RGB'), (col*640, 52+row*640))
draw.text((18, 1343), 'Identical cameras, lights and materials across A/B/C. Native source polygons. Local research render.',
          fill='#becbd9', font=small)
draw.text((18, 1374), 'Shading and subdivision do not repair mesh openings. This comparison does not validate medical accuracy.',
          fill='#becbd9', font=small)
sheet.save(OUT/'lungs-quality-comparison.png')

context = Image.new('RGB', (1280, 720), '#111923')
d = ImageDraw.Draw(context)
for col, (suffix, title) in enumerate([('ribs', 'Source coordinates / rib cage visible'),
                                      ('organs', 'Same coordinates / rib cage hidden')]):
    d.text((col*640+18, 12), title, fill='white', font=font)
    with Image.open(OUT/f'chest-context-{suffix}.png') as img:
        context.paste(img.convert('RGB'), (col*640, 46))
d.text((18, 692), 'Review subset: heart chambers only; no full vessels, bronchi or heart anatomy. Base meshes / smooth shading.',
       fill='#becbd9', font=small)
context.save(OUT/'chest-context-comparison.png')

validation = []
for item in report['exports']:
    path = ROOT/item['path']
    variant = item['variant']
    expected_items = (report['variants'][variant] if item['scope'] == 'lungs'
                      else [x['base'] for x in report['inventory']])
    expected_by_name = ({x['name']: x for x in report['variants'][variant]}
                        if item['scope'] == 'lungs'
                        else {x['name']: x['base'] for x in report['inventory']})
    loaded = trimesh.load(path, force='scene', process=False)
    assert set(loaded.graph.nodes_geometry) == set(expected_by_name), 'Object names changed'
    verts = []
    triangles = 0
    node_errors = []
    for node in loaded.graph.nodes_geometry:
        matrix, name = loaded.graph[node]
        mesh = loaded.geometry[name]
        vertices = trimesh.transform_points(mesh.vertices, matrix)
        # Blender's glTF export maps Z-up (x,y,z) to Y-up (x,z,-y).
        vertices = np.column_stack((vertices[:,0], -vertices[:,2], vertices[:,1]))
        assert np.isfinite(vertices).all(), 'Non-finite GLB positions'
        assert np.isfinite(mesh.vertex_normals).all(), 'Non-finite GLB normals'
        expected_node = expected_by_name[node]
        node_bounds = np.array([vertices.min(axis=0), vertices.max(axis=0)])
        node_error = float(np.abs(node_bounds-np.array(expected_node['surface_bounds'])).max())
        assert node_error < 1e-6, ('Object placement changed', node, node_error)
        assert len(mesh.faces) == expected_node['triangles'], ('Object triangles changed', node)
        node_errors.append(node_error)
        verts.append(vertices)
        triangles += len(mesh.faces)
    vertices = np.concatenate(verts)
    actual = np.array([vertices.min(axis=0), vertices.max(axis=0)])
    # glTF surface primitives omit unused source vertices. Compare surface bounds,
    # retaining the original all-vertex bounds and unused counts in the audit.
    bounds = np.array([x['surface_bounds'] for x in expected_items])
    expected = np.array([bounds[:,0].min(axis=0), bounds[:,1].max(axis=0)])
    error = float(np.abs(actual-expected).max())
    expected_nodes = len(expected_items)
    assert len(loaded.graph.nodes_geometry) == expected_nodes, 'Missing model nodes'
    assert triangles == sum(x['triangles'] for x in expected_items), 'Triangle mismatch'
    assert error < 1e-6, ('Bounds mismatch', error)
    validation.append({'path': item['path'], 'nodes': expected_nodes, 'triangles': triangles,
                       'bytes': path.stat().st_size, 'bounds_max_error_source_units': error,
                       'per_node_bounds_max_error_source_units': max(node_errors),
                       'node_names_and_per_node_triangle_counts_match': True,
                       'sha256_matches': hashlib.sha256(path.read_bytes()).hexdigest() == item['sha256'],
                       'finite_positions_and_normals': True})
assert all(x['sha256_matches'] for x in validation)
(OUT/'chest-export-validation.json').write_text(json.dumps(validation, indent=2)+'\n')
groups = {
    'left_lung': {'label_ko': '왼쪽 폐', 'members': []},
    'right_lung': {'label_ko': '오른쪽 폐', 'members': []},
    'heart_chambers': {'label_ko': '심장 외형 검토 묶음', 'members': []},
    'rib_cage': {'label_ko': '갈비뼈·늑연골·흉골', 'members': []},
    'diaphragm': {'label_ko': '횡격막', 'members': []},
    'trachea': {'label_ko': '기관', 'members': []},
}
for obj in report['inventory']:
    g = obj['group']
    if g == 'lung':
        key = 'left_lung' if 'left lung' in obj['name'] else 'right_lung'
    elif g == 'heart_chamber':
        key = 'heart_chambers'
    elif g in ['rib', 'sternum', 'costal_cartilage']:
        key = 'rib_cage'
    else:
        key = g
    groups[key]['members'].append(obj['name'])
members = [n for g in groups.values() for n in g['members']]
assert len(members) == len(set(members)) == len(report['inventory'])
assert all(g['members'] for g in groups.values())
manifest = {'status': 'internal_prototype_candidate',
            'medical_validation': 'pending',
            'primary_asset': 'samples/chest-review/chest-smooth.glb',
            'fallback_asset': 'samples/chest-review/lungs-smooth.glb',
            'groups': groups,
            'limitations': ['Heart chambers are a subset, not a complete heart.',
                            'Trachea excludes bronchial tree.',
                            'Known mesh openings; cutting and deformation not approved.']}
(OUT/'chest-prototype-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(validation, indent=2))
