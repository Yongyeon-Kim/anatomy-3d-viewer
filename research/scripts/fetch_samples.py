"""Fetch exact recorded samples; fail if upstream content differs. No source execution."""
from pathlib import Path
import hashlib
import json
import urllib.request
import zipfile

ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/'source-manifest.json').read_text())
for entry in manifest['files']:
    target=ROOT/entry['path']
    target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():
        temporary=target.with_suffix(target.suffix+'.download')
        with urllib.request.urlopen(entry['url'],timeout=60) as response, temporary.open('wb') as out:
            while chunk:=response.read(1024*1024):
                out.write(chunk)
        assert hashlib.sha256(temporary.read_bytes()).hexdigest()==entry['sha256'], entry['path']
        temporary.replace(target)
    assert target.stat().st_size==entry['bytes'], entry['path']
    assert hashlib.sha256(target.read_bytes()).hexdigest()==entry['sha256'], entry['path']
    print('verified',entry['path'])
z=zipfile.ZipFile(ROOT/'raw/z-anatomy/Z-Anatomy.zip')
(ROOT/'raw/z-anatomy/Startup.blend').write_bytes(z.read('Z-Anatomy/Startup.blend'))

# Compare archive members by basename without extracting untrusted paths.
a=zipfile.ZipFile(ROOT/'raw/bodyparts3d/partof_BP3D_4.0_obj_99.zip')
b=zipfile.ZipFile(ROOT/'raw/bodyparts3d/isa_BP3D_4.0_obj_99.zip')
am={Path(n).name:n for n in a.namelist()}; bm={Path(n).name:n for n in b.namelist()}
shared=set(am)&set(bm)
result=dict(partof_members=len(am),isa_members=len(bm),shared_names=len(shared),
            byte_identical_shared_files=sum(a.read(am[n])==b.read(bm[n]) for n in shared),
            z_anatomy_blend_bytes=(ROOT/'raw/z-anatomy/Startup.blend').stat().st_size,
            z_anatomy_header=(ROOT/'raw/z-anatomy/Startup.blend').open('rb').read(12).decode())
(ROOT/'results').mkdir(exist_ok=True)
(ROOT/'results/archive-comparison.json').write_text(json.dumps(result,indent=2)+'\n')
