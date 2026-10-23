// Tags and accent bursts, see the "Система тегов-бейджей" concept.
// A tag describes what a story is about; a burst marks one story as new.
const textures = new URL('../../assets/textures/', import.meta.url);
const burstFrames = [
  '97.8,27.2 80.2,33.3 97.0,44.0 72.3,42.3 78.1,58.1 57.4,47.4 47.9,59.1 40.1,47.0 26.8,49.2 25.9,41.1 10.9,39.3 19.4,31.8 12.3,25.9 22.6,21.9 15.1,10.8 34.5,14.5 37.3,0.1 51.3,12.1 68.0,-0.7 67.7,15.4 89.1,11.9 78.5,23.3',
  '93.2,29.0 79.8,34.4 84.8,41.9 71.0,43.1 69.9,53.0 55.6,47.6 45.8,54.0 38.4,46.6 17.0,54.1 24.8,40.3 -0.9,40.0 19.3,30.7 1.6,22.9 23.5,20.9 20.4,11.6 36.1,14.0 42.7,6.9 53.2,12.2 66.7,6.2 69.2,16.0 83.8,16.2 79.1,24.3',
  '101.3,25.8 80.4,32.6 93.6,41.7 73.2,41.8 77.4,55.0 58.6,47.2 49.8,61.9 41.3,47.2 27.1,50.7 26.7,41.7 15.0,39.2 19.6,32.5 4.4,26.1 22.1,22.5 10.9,10.1 33.5,14.9 36.6,3.1 50.1,12.1 64.5,1.5 66.7,15.0 91.5,9.2 78.0,22.6',
];

// Each rubric has its own sticker; placeholders until the 3D rubric objects are rendered.
const rubricStickers = {
  'фиты': 'fity', 'дропы': 'dropy', 'биты': 'bity', 'бифы': 'bify', 'сниппеты': 'snippety',
  'удалённое': 'udalyonnoe', 'пропавшие': 'propavshie', 'клипы': 'klipy', 'сохранёнки': 'sohranyonki',
};

function stickerFor(label) {
  const name = rubricStickers[label.toLocaleLowerCase('ru')];
  return name ? new URL(`../../assets/stickers/${name}.svg`, import.meta.url).href : new URL('topic-sticker.svg', textures).href;
}

export function createTag({ label, sticker = stickerFor(label) }) {
  const tag = document.createElement('span');
  tag.className = 'ct-tag';
  const art = document.createElement('img');
  art.className = 'ct-tag__sticker';
  art.src = sticker;
  art.alt = '';
  art.decoding = 'async';
  art.loading = 'lazy';
  const text = document.createElement('span');
  text.className = 'ct-tag__label';
  text.textContent = label;
  tag.append(art, text);
  return tag;
}

// Stickers are slapped on by hand: each gets a stable tilt and nudge from its text,
// so the same story always looks the same but a column of tags never lines up.
function scatter(text) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return { tilt: (hash % 11) - 5, nudge: (hash >>> 4) % 17 };
}

export function createTagList(tags, seed = '') {
  const list = document.createElement('span');
  list.className = 'ct-tags';
  for (const tag of tags) {
    const node = createTag(tag);
    const { tilt, nudge } = scatter(`${seed}:${tag.label}`);
    node.style.setProperty('--tag-tilt', `${tilt}deg`);
    node.style.setProperty('--tag-nudge', `${nudge}px`);
    list.append(node);
  }
  return list;
}

export function createBurst(label) {
  const burst = document.createElement('span');
  burst.className = 'ct-burst';
  burst.innerHTML = `<svg viewBox="0 0 100 60" aria-hidden="true">${burstFrames.map(points => `<polygon points="${points}"/>`).join('')}</svg>`;
  const text = document.createElement('span');
  text.className = 'ct-burst__label';
  text.textContent = label;
  burst.append(text);
  return burst;
}
