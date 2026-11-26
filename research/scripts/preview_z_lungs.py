"""Local unwatermarked review image; original credits stay in asset records."""
from pathlib import Path
import json,hashlib
import numpy as np
import trimesh
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

ROOT=Path(__file__).resolve().parents[1]
exports=json.loads((ROOT/'results/z-anatomy-export.json').read_text())
meshes=[];report=[]
for item in exports:
    path=ROOT/item['path']
    mesh=trimesh.load(path,process=False)
    vertices,inverse=np.unique(mesh.vertices,axis=0,return_inverse=True)
    welded=trimesh.Trimesh(vertices,inverse[mesh.faces],process=False)
    counts=np.bincount(welded.edges_unique_inverse)
    report.append(dict(name=item['name'],vertices=len(mesh.vertices),triangles=len(mesh.faces),
        bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),
        exact_weld_watertight=bool(welded.is_watertight),boundary_edges=int((counts==1).sum()),
        nonmanifold_edges=int((counts>2).sum()),degenerate_triangles=int((mesh.area_faces<1e-12).sum()),
        bounds=mesh.bounds.tolist()))
    meshes.append(mesh)
(ROOT/'results/z-lungs-quality.json').write_text(json.dumps(report,indent=2)+'\n')
fig=plt.figure(figsize=(12,5),facecolor='#101a26')
colors=np.array([[.81,.48,.44],[.73,.36,.36],[.92,.57,.48],[.82,.42,.40],[.88,.50,.45]])
allbounds=np.array([m.bounds for m in meshes]);lo=allbounds[:,0].min(axis=0);hi=allbounds[:,1].max(axis=0)
center=(lo+hi)/2;radius=max(hi-lo)*.55
for pane,azim in enumerate([-90,-35]):
    ax=fig.add_subplot(1,2,pane+1,projection='3d',facecolor='#101a26')
    for index,mesh in enumerate(meshes):
        light=np.array([.5,-.7,.5]);light/=np.linalg.norm(light)
        shade=.55+.45*np.abs(mesh.face_normals@light)
        poly=Poly3DCollection(mesh.triangles,facecolors=colors[index]*shade[:,None],edgecolor='none')
        ax.add_collection3d(poly)
    ax.set(xlim=(center[0]-radius,center[0]+radius),ylim=(center[1]-radius,center[1]+radius),
           zlim=(center[2]-radius,center[2]+radius))
    ax.set_box_aspect((1,1,1));ax.view_init(elev=10,azim=azim);ax.set_axis_off()
fig.subplots_adjust(left=0,right=1,bottom=0,top=1,wspace=0)
fig.savefig(ROOT/'results/z-lungs-preview.png',dpi=160,facecolor=fig.get_facecolor())
plt.close(fig)
print('objects',len(report),'triangles',sum(x['triangles'] for x in report),'bytes',sum(x['bytes'] for x in report))
print('nonmanifold',sum(x['nonmanifold_edges'] for x in report),'boundaries',sum(x['boundary_edges'] for x in report))
