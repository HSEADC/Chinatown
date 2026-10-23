// Editorial previews for the prototype. Unpublished stories open the existing whitelist page.
// tags come from the rubric dictionary; status: 'new' is set by hand and shows the burst.
export const articleSearchItems = [
  { id: 'madk1d', status: 'new', tags: ['Сниппеты', 'Клипы'], artist: 'madk1d', title: 'За пределами припева', image: './assets/figma/article/madk1d-concert.png', position: '50% 58%' },
  { id: 'kitay-night', tags: ['Удалённое'], artist: 'Китай-город', title: 'Там уже началось', image: './assets/video/editorial/kitay-night-86bc7af48de9/poster.jpg', position: '50% 62%' },
  { id: 'new-scene', tags: ['Фиты'], artist: 'Новая сцена', title: 'Свои люди. Свой звук', image: './assets/video/editorial/kitay-people-0dd1e134849b/poster.jpg', position: '50% 24%' },
  { id: 'club-night', tags: ['Биты'], artist: 'Клубная ночь', title: 'Диджей, который не смотрит в телефон', image: './assets/video/dj.jpg', position: '50% 44%' },
  { id: 'smoke', tags: ['Сохранёнки'], artist: 'Живой звук', title: 'Сквозь дым до первого ряда', image: './assets/video/editorial/concert-crowd-7026abb1ab1c/poster.jpg', position: '50% 78%' },
  { id: 'red-square', tags: ['Пропавшие'], artist: 'Город', title: 'Флешмоб, который никто не планировал', image: './assets/video/moscow.jpg', position: '50% 50%' },
  { id: 'stadium', tags: ['Клипы'], artist: 'Большой концерт', title: 'Что слышно с последнего ряда', image: './assets/video/concert.jpg', position: '50% 55%' },
  { id: 'after-party', tags: ['Бифы'], artist: 'После концерта', title: 'Куда идти, когда закрылся зал', image: './assets/video/editorial/kitay-street-c41b36032219/poster.jpg', position: '50% 50%' },
  { id: 'first-track', tags: ['Дропы'], artist: 'Первый трек', title: 'С чего всё начинается', image: './assets/video/editorial/madk1d-chorus-6e39d25cf629/poster.jpg', position: '50% 16%' },
];

export function searchArticles(query = '') {
  const words = query.trim().toLocaleLowerCase('ru').replace(/ё/g, 'е').split(/\s+/).filter(Boolean);
  return articleSearchItems.filter(item => words.every(word => `${item.artist} ${item.title}`.toLocaleLowerCase('ru').replace(/ё/g, 'е').includes(word)));
}

// The empty search is a feed preview: repeat the materials so reviewers can scroll a longer list.
export function searchFeed(query = '', length = 28) {
  const matches = searchArticles(query);
  if (query.trim() || !matches.length) return matches;
  return Array.from({ length: Math.max(length, matches.length) }, (_, index) => {
    const item = matches[index % matches.length];
    return index < matches.length ? item : { ...item, status: undefined };
  });
}
