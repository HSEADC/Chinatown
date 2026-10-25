// Masks mat in every served text file in place; --check only lists what it finds.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { findProfanity, maskProfanity, servedTextFiles } from './profanity.mjs';

const root = new URL('../', import.meta.url);

async function walk(dir) {
  const entries = await readdir(new URL(dir, root), { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => {
    const path = `${dir}/${entry.name}`;
    return entry.isDirectory() ? walk(path) : [path];
  }));
  return files.flat();
}

export async function servedFiles() {
  const nested = await Promise.all(servedTextFiles.dirs.map(walk));
  return [...servedTextFiles.root, ...nested.flat()].filter(file => servedTextFiles.extensions.test(file));
}

export async function scanServedFiles() {
  const hits = [];
  for (const file of await servedFiles()) {
    for (const hit of findProfanity(await readFile(new URL(file, root), 'utf8'))) hits.push({ file, ...hit });
  }
  return hits;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  if (!check) {
    for (const file of await servedFiles()) {
      const url = new URL(file, root);
      const text = await readFile(url, 'utf8');
      const masked = maskProfanity(text);
      if (masked !== text) {
        await writeFile(url, masked);
        console.log(`masked ${file}`);
      }
    }
  }
  const hits = await scanServedFiles();
  for (const hit of hits) console.log(`${hit.file}:${hit.line} ${hit.word}${hit.latin ? ' (латиница, переименовать вручную)' : ''}`);
  if (hits.length) process.exitCode = 1;
}
