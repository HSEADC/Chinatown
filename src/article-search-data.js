// Editorial previews for the prototype. Unpublished stories open the existing whitelist page.
export const articleSearchItems = [
  { id: 'madk1d', artist: 'madk1d', title: 'За пределами припева', image: './assets/figma/article/madk1d-concert.png', position: '50% 58%' },
  { id: 'kitay-night', artist: 'Китай-город', title: 'Там уже началось', image: './assets/figma/mobile-shell/search-scene.png', position: '50% 100%' },
  { id: 'new-scene', artist: 'Новая сцена', title: 'Свои люди. Свой звук', image: './assets/figma/mobile-shell/search-scene.png', position: '50% 100%' },
  { id: 'live', artist: 'Живой звук', title: 'По другую сторону сцены', image: './assets/figma/article/madk1d-concert.png', position: '50% 58%' },
  { id: 'first-track', artist: 'Первый трек', title: 'С чего всё начинается', image: './assets/figma/article/madk1d-concert.png', position: '50% 58%' },
];

export function searchArticles(query = '') {
  const words = query.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е').split(/\s+/).filter(Boolean);
  return articleSearchItems.filter(item => words.every(word => `${item.artist} ${item.title}`.toLocaleLowerCase('ru').replace(/ё/g, 'е').includes(word)));
}
