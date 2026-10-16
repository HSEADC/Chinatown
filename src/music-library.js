// Only recordings individually verified on the author's site belong in this catalog.
// Rights evidence and original-file checksums: assets/audio/manifest.json.
const licenseUrl = 'https://creativecommons.org/licenses/by/4.0/';
const artistUrl = 'https://incompetech.com/';

export const musicTracks = [
  { id: 'dream-culture', title: 'Dream Culture', isrc: 'USUAN1300046', duration: 214, description: 'Мягкое пиано, тихий бит и немного сна.', color: 'pink' },
  { id: 'cipher', title: 'Cipher', isrc: 'USUAN1100844', duration: 231, description: 'Электроника с цепким, светлым грувом.', color: 'lime' },
  { id: 'district-four', title: 'District Four', isrc: 'USUAN1600039', duration: 248, description: 'Большая перкуссия, бас и движение.', color: 'orange' },
  { id: 'cold-funk', title: 'Cold Funk', isrc: 'USUAN1100499', duration: 288, description: 'Гитарный луп и спокойный фанк.', color: 'blue' },
].map((track) => Object.freeze({
  ...track,
  artist: 'Kevin MacLeod',
  artistUrl,
  src: new URL(`../assets/audio/${track.id}.mp3`, import.meta.url).href,
  sourceUrl: `https://incompetech.com/music/royalty-free/index.html?isrc=${track.isrc}`,
  license: 'CC BY 4.0',
  licenseUrl,
}));

export const musicMoods = [
  { id: 'night', title: 'На ночь', subtitle: 'Когда город становится тише', symbol: '✳', tracks: ['dream-culture', 'cold-funk'], color: 'pink' },
  { id: 'move', title: 'В движении', subtitle: 'Грув, который ведёт за собой', symbol: '↗', tracks: ['cipher', 'district-four'], color: 'lime' },
  { id: 'slow', title: 'Без спешки', subtitle: 'Выдохнуть. Послушать. Остаться.', symbol: '≈', tracks: ['cold-funk', 'dream-culture'], color: 'blue' },
];

export function getMusicTrack(id) {
  return musicTracks.find((track) => track.id === id) || null;
}

export function getMusicMood(id) {
  return musicMoods.find((mood) => mood.id === id) || null;
}

export function formatTime(seconds) {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}
