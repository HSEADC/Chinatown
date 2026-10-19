import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { articleView } from '../src/article-view.js';

export async function writeStaticArticle() {
  const file = new URL('../article.html', import.meta.url);
  const html = await readFile(file, 'utf8');
  await writeFile(file, html.replace(/<main id="media-content">[\s\S]*?<\/main>/, `<main id="media-content">${articleView()}</main>`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await writeStaticArticle();
