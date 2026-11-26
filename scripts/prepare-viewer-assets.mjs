import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const output = new URL('../public/models/', import.meta.url);
await mkdir(output, { recursive: true });

const preparation = await readJson('../research/results/chest-preparation.json');
const { fallback, regions } = await readJson('../research/results/region-manifest.json');
const fallbackGroups = Object.fromEntries(fallback.groupIds.map(id => [id, regions.chest.groups[id]]));

const assets = [];
for (const { file, groups } of [...Object.values(regions), { file: fallback.file, groups: fallbackGroups }]) {
  let receipt;
  try {
    receipt = await readJson(`../research/samples/regions/${file.replace(/\.glb$/, '.json')}`);
  } catch (error) {
    throw new Error(`전신 모델 내보내기 기록을 확인하세요: ${file}. research/README.md를 참고하세요.`, { cause: error });
  }
  const expectedMeshes = Object.values(groups).reduce((total, group) => total + group.members.length, 0);
  if (receipt.source_sha256 !== preparation.source_sha256 || receipt.file !== file
    || receipt.meshes !== expectedMeshes || receipt.triangles <= 0) {
    throw new Error(`전신 모델 기록이 명세와 다릅니다: ${file}`);
  }
  assets.push({ ...receipt, path: `samples/regions/${file}` });
}

for (const { file, path, sha256, bytes: expectedSize } of assets) {
  const temp = new URL(`.${file}.${process.pid}.tmp`, output);
  try {
    const bytes = await readFile(new URL(`../research/${path}`, import.meta.url));
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (sha256 !== hash || expectedSize !== bytes.byteLength) {
      throw new Error('모델 해시 또는 크기가 검사 기록과 다릅니다.');
    }
    await writeFile(temp, bytes);
    await rename(temp, new URL(file, output));
    console.log(`${file}: copied, SHA-256 ${hash}`);
  } catch (error) {
    throw new Error(`로컬 모델을 확인하세요: ${path}. research/README.md를 참고하세요.`, { cause: error });
  } finally {
    await rm(temp, { force: true });
  }
}
