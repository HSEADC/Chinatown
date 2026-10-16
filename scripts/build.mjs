import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const dist = new URL('../dist/', import.meta.url);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
for (const file of ['index.html', 'about.html', 'article.html', 'new-sketch.html', 'glitch-test.html', 'styles.css', 'media.css', 'article.css', 'scene-rail.css', 'light-editor.css']) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(`../dist/${file}`, import.meta.url));
}
await cp(new URL('../src/', import.meta.url), new URL('../dist/src/', import.meta.url), { recursive: true });
const retiredAudio = fileURLToPath(new URL('../assets/audio', import.meta.url));
await cp(new URL('../assets/', import.meta.url), new URL('../dist/assets/', import.meta.url), {
  recursive: true,
  filter: (source) => source !== retiredAudio && !source.startsWith(`${retiredAudio}/`),
});
console.log(`Built static site in ${fileURLToPath(dist)}`);
