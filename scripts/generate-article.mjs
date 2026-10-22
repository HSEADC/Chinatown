import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { articleView, articleTitle, articleDescription } from '../src/article-view.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export async function writeStaticArticle() {
  const file = new URL('../article.html', import.meta.url);
  const html = await readFile(file, 'utf8');
  const updated = html
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escape(articleTitle)} — CHINATOWN.RU</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${escape(articleDescription)}">`)
    .replace(/<main id="media-content">[\s\S]*?<\/main>/, () => `<main id="media-content">${articleView()}</main>`);
  await writeFile(file, updated);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await writeStaticArticle();
