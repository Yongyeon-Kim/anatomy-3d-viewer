import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineConfig({
  // Research archives contain unrelated HTML, and must not enter dependency scanning.
  optimizeDeps: { entries: ['index.html'] },
  server: { fs: { deny: ['.env', '.env.*', '**/.git/**', '**/research/raw/**', '**/research/samples/**'] } },
  plugins: [{
    name: 'anatomy-offline-files',
    apply: 'build',
    async writeBundle({ dir }) {
      const files = ['index.html', 'manifest.json', 'app-icon-192.png', 'app-icon-512.png'];
      for (const directory of ['models', 'licenses', 'assets']) {
        const entries = await readdir(join(dir, directory));
        files.push(...entries.sort().map(name => `${directory}/${name}`));
      }
      const items = [];
      for (const path of files) {
        const data = await readFile(join(dir, path));
        items.push({ path, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
      }
      const bytes = items.reduce((sum, item) => sum + item.bytes, 0);
      await writeFile(join(dir, 'offline-files.json'), JSON.stringify({ bytes, files: items }));
    },
  }],
});
