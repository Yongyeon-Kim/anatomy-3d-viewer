"""Inspect downloaded OBJ data without repairing or executing source content."""
from pathlib import Path
import csv
import hashlib
import io
import json
import zipfile

import numpy as np
import trimesh
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'raw/bodyparts3d'
OUT = ROOT / 'results'
OUT.mkdir(exist_ok=True)
TARGETS = {
    'T01': ('FMA7088', 'heart'),
    'T02': ('FMA7310', 'left lung'),
    'T03': ('FMA7309', 'right lung'),
    'T04': ('FMA7394', 'trachea'),
    'T05': ('FMA7396', 'left main bronchus'),
    'T06': ('FMA7395', 'right main bronchus'),
    'T07': ('FMA7131', 'esophagus'),
    'C02': ('FMA7480', 'rib cage'),
    'C03': ('FMA9140', 'thoracic vertebral column'),
    'C04': ('FMA13295', 'diaphragm'),
}
rows = list(csv.DictReader((RAW/'partof_element_parts.txt').open(), delimiter='\t'))
archive = zipfile.ZipFile(RAW/'partof_BP3D_4.0_obj_99.zip')
members = {Path(n).stem: n for n in archive.namelist() if n.endswith('.obj')}
mapping = {key: sorted({r['element file id'] for r in rows if r['concept id'] == fma})
           for key, (fma, _) in TARGETS.items()}
assert all(mapping.values()), 'Missing concept mapping'
selected = sorted(set().union(*map(set, mapping.values())))
meshes, stats = {}, []
sample_dir = ROOT/'samples/bodyparts3d'
sample_dir.mkdir(parents=True, exist_ok=True)
for ident in selected:
    data = archive.read(members[ident])
    (sample_dir/(ident+'.obj')).write_bytes(data)
    mesh = trimesh.load(io.BytesIO(data), file_type='obj', process=False, force='mesh')
    assert len(mesh.vertices) and len(mesh.faces), ident
    assert np.isfinite(mesh.vertices).all(), ident
    assert mesh.faces.min() >= 0 and mesh.faces.max() < len(mesh.vertices), ident
    edge_counts = np.bincount(mesh.edges_unique_inverse)
    components = trimesh.graph.connected_components(mesh.face_adjacency,
                                                    nodes=np.arange(len(mesh.faces)))
    vertices, inverse = np.unique(mesh.vertices, axis=0, return_inverse=True)
    welded = trimesh.Trimesh(vertices, inverse[mesh.faces], process=False)
    welded_counts = np.bincount(welded.edges_unique_inverse)
    stats.append(dict(
        id=ident, bytes=len(data), sha256=hashlib.sha256(data).hexdigest(),
        vertices=len(mesh.vertices), triangles=len(mesh.faces),
        boundary_edges=int((edge_counts == 1).sum()),
        nonmanifold_edges=int((edge_counts > 2).sum()),
        degenerate_triangles=int((mesh.area_faces <= 1e-12).sum()),
        duplicate_triangles=len(mesh.faces)-len(np.unique(np.sort(mesh.faces, axis=1), axis=0)),
        face_components=len(components), watertight=bool(mesh.is_watertight),
        winding_consistent=bool(mesh.is_winding_consistent),
        signed_volume=float(mesh.volume), bounds=mesh.bounds.tolist(),
        texture_vertices=sum(line.startswith(b'vt ') for line in data.splitlines()),
        material_refs=sum(line.startswith(b'mtllib ') for line in data.splitlines()),
        exact_weld_vertices=len(vertices),
        exact_weld_boundary_edges=int((welded_counts == 1).sum()),
        exact_weld_nonmanifold_edges=int((welded_counts > 2).sum()),
        exact_weld_watertight=bool(welded.is_watertight),
    ))
    meshes[ident] = mesh

groups = {}
for key, ids in mapping.items():
    mesh = trimesh.util.concatenate([meshes[i] for i in ids])
    groups[key] = mesh

# Mathematical restoration check only; offsets are arbitrary, not anatomy-approved paths.
transforms = {}
for key, mesh in groups.items():
    offset = np.array([70.0, 0.0, 0.0])
    if key == 'T03': offset[0] *= -1
    maximum = 0.0
    for factor in [0.0, 0.25, 0.5, 1.0]:
        moved = mesh.vertices + factor * offset
        restored = moved - factor * offset
        maximum = max(maximum, float(np.max(np.abs(restored - mesh.vertices))))
    transforms[key] = dict(offset=offset.tolist(), max_restore_error=maximum)

overlaps = []
keys = list(mapping)
for i, a in enumerate(keys):
    for b in keys[i+1:]:
        shared = sorted(set(mapping[a]) & set(mapping[b]))
        if shared: overlaps.append(dict(a=a, b=b, shared_elements=shared))

report = dict(
    source='BodyParts3D 4.0 PART-OF OBJ 99',
    scope='File topology and numeric transforms only; no anatomical certification or device benchmark',
    units='source coordinates; physical units not independently verified',
    selected_unique_files=len(selected), files=stats,
    groups={k: dict(fma=TARGETS[k][0], name=TARGETS[k][1], elements=mapping[k],
                    triangles=len(v.faces), vertices=len(v.vertices), bounds=v.bounds.tolist())
            for k, v in groups.items()},
    overlapping_groups=overlaps, transform_checks=transforms,
    summary=dict(bytes=sum(s['bytes'] for s in stats),
                 triangles=sum(s['triangles'] for s in stats),
                 vertices=sum(s['vertices'] for s in stats),
                 open_meshes=sum(not s['watertight'] for s in stats),
                 inconsistent_winding=sum(not s['winding_consistent'] for s in stats),
                 boundary_edges=sum(s['boundary_edges'] for s in stats),
                 nonmanifold_edges=sum(s['nonmanifold_edges'] for s in stats),
                 degenerate_triangles=sum(s['degenerate_triangles'] for s in stats),
                 duplicate_triangles=sum(s['duplicate_triangles'] for s in stats)),
)
report['summary'].update(
    exact_weld_open_meshes=sum(not s['exact_weld_watertight'] for s in stats),
    exact_weld_boundary_edges=sum(s['exact_weld_boundary_edges'] for s in stats),
    exact_weld_nonmanifold_edges=sum(s['exact_weld_nonmanifold_edges'] for s in stats),
)
(OUT/'bodyparts-audit.json').write_text(json.dumps(report, indent=2)+'\n')
summary = {k:v for k,v in report.items() if k != 'files'}
(OUT/'bodyparts-summary.json').write_text(json.dumps(summary, indent=2)+'\n')
isa_archive = zipfile.ZipFile(RAW/'isa_BP3D_4.0_obj_99.zip')
isa_members = {Path(n).stem:n for n in isa_archive.namelist()}
spot=[]
for ident in ['FJ2417','FJ3131','FJ2041']:
    a=meshes[ident]
    b=trimesh.load(io.BytesIO(isa_archive.read(isa_members[ident])),file_type='obj',process=False,force='mesh')
    same=np.array_equal(a.vertices,b.vertices) and np.array_equal(a.faces,b.faces)
    spot.append(dict(id=ident,partof_vertices=len(a.vertices),isa_vertices=len(b.vertices),
                     partof_faces=len(a.faces),isa_faces=len(b.faces),same_indexed_geometry=bool(same)))
(OUT/'isa-spot-check.json').write_text(json.dumps(spot,indent=2)+'\n')
fields = [k for k in stats[0] if k != 'bounds']
with (OUT/'bodyparts-files.csv').open('w') as f:
    writer=csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
    writer.writeheader(); writer.writerows(stats)

colors = {'T01':'#e65b5b', 'T02':'#44a6c6', 'T03':'#87c6d6', 'T04':'#f0b34c',
          'T05':'#f0b34c','T06':'#f0b34c','T07':'#b581cf',
          'C02':'#bdc6ce','C03':'#bdc6ce','C04':'#85b88d'}
fig = plt.figure(figsize=(15, 5))
for i,(title,azim) in enumerate([('Source XZ projection',-90),('Oblique view',-45),('Source YZ projection',0)]):
    ax = fig.add_subplot(1,3,i+1,projection='3d')
    for key, mesh in groups.items():
        # All faces retained in the static preview; no quality improvement or smoothing.
        poly = Poly3DCollection(mesh.triangles, facecolor=colors[key],
                                alpha=0.12 if key.startswith('C') else 0.85,
                                edgecolor='none')
        ax.add_collection3d(poly)
    bounds=np.array([g.bounds for g in groups.values()])
    low,high=bounds[:,0].min(axis=0),bounds[:,1].max(axis=0)
    center=(low+high)/2; radius=(high-low).max()/2
    ax.set(xlim=(center[0]-radius,center[0]+radius),
           ylim=(center[1]-radius,center[1]+radius),zlim=(center[2]-radius,center[2]+radius))
    ax.set_box_aspect((1,1,1)); ax.view_init(elev=0,azim=azim)
    ax.set_title(title); ax.set_xlabel('X'); ax.set_ylabel('Y'); ax.set_zlabel('Z')
    ax.set_xticks([]); ax.set_yticks([]); ax.set_zticks([])
fig.suptitle('BodyParts3D 4.0 OBJ 99 — chest sample, audit colors (not source materials)')
fig.text(.02,.02,'BodyParts3D © The Database Center for Life Science | CC BY 4.0 per current archive notice | Not anatomically validated',fontsize=8)
fig.savefig(OUT/'chest-preview.png',dpi=150)
plt.close(fig)
fig=plt.figure(figsize=(12,4))
for index,key in enumerate(['T01','T02','T03']):
    ax=fig.add_subplot(1,3,index+1,projection='3d')
    mesh=groups[key]
    ax.add_collection3d(Poly3DCollection(mesh.triangles,facecolor=colors[key],edgecolor='none',alpha=1))
    center=mesh.bounds.mean(axis=0); radius=mesh.extents.max()/2
    ax.set(xlim=(center[0]-radius,center[0]+radius),ylim=(center[1]-radius,center[1]+radius),
           zlim=(center[2]-radius,center[2]+radius),title=TARGETS[key][1])
    ax.set_box_aspect((1,1,1)); ax.view_init(elev=10,azim=-60); ax.set_axis_off()
fig.suptitle('Isolated groups — opaque audit colors, original geometry')
fig.text(.02,.02,'BodyParts3D © DBCLS | Current archive notice: CC BY 4.0 | Visual screening, not clinical validation',fontsize=8)
fig.savefig(OUT/'isolated-organs.png',dpi=150); plt.close(fig)
print(json.dumps(report['summary'],indent=2))
print('group overlap pairs:',len(overlaps))
print('group triangles:',{k:len(v.faces) for k,v in groups.items()})
