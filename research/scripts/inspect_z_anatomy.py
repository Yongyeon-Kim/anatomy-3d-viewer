"""Run with Blender --background --factory-startup --disable-autoexec --python."""
from pathlib import Path
import json
import bpy

ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'raw/z-anatomy/Startup.blend'),
                         load_ui=False,use_scripts=False)
matches=[]
for obj in bpy.data.objects:
    if obj.type=='MESH' and any(w in obj.name.lower() for w in ['lung','lobe','heart','diaphragm','trachea']):
        matches.append(dict(name=obj.name,vertices=len(obj.data.vertices),
                            polygons=len(obj.data.polygons),
                            materials=[s.material.name if s.material else None for s in obj.material_slots],
                            collections=[c.name for c in obj.users_collection]))
result=dict(blender_version=bpy.app.version_string,autoexec_enabled=bool(bpy.context.preferences.filepaths.use_scripts_auto_execute),
            total_objects=len(bpy.data.objects),matching_meshes=matches)
(ROOT/'results/z-anatomy-inventory.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('Matching meshes:',len(matches),'autoexec:',result['autoexec_enabled'])
samples=ROOT/'samples/z-anatomy'
samples.mkdir(parents=True,exist_ok=True)
exported=[]
for obj in bpy.data.objects:
    if obj.type!='MESH' or not len(obj.data.polygons):continue
    if not ('lobe of' in obj.name.lower() and 'lung' in obj.name.lower()):continue
    mesh=obj.data
    mesh.calc_loop_triangles()
    path=samples/(obj.name.replace(' ','_')+'.obj')
    with path.open('w') as f:
        f.write('# Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0\n')
        f.write('# Derived inspection export; source license and provenance retained in research/raw/z-anatomy/License.txt\n')
        f.write('# Base mesh in source world coordinates; modifiers not evaluated\n')
        for vertex in mesh.vertices:
            world=obj.matrix_world@vertex.co
            f.write('v %.9g %.9g %.9g\n'%tuple(world))
        for tri in mesh.loop_triangles:
            f.write('f %d %d %d\n'%tuple(i+1 for i in tri.vertices))
    exported.append(dict(name=obj.name,path=str(path.relative_to(ROOT)),vertices=len(mesh.vertices),
                         triangles=len(mesh.loop_triangles),modifiers=[m.type for m in obj.modifiers]))
(ROOT/'results/z-anatomy-export.json').write_text(json.dumps(exported,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(exported,ensure_ascii=False))
