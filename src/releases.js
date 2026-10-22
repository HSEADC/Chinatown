// Store ordinary release links. The iframe URL is derived at runtime.
export const releases = [
  {
    id: 'gruppa-krovi-track',
    kind: 'Трек',
    title: 'Группа крови',
    subtitle: 'КИНО',
    musicUrl: 'https://music.yandex.ru/album/10100/track/38634621',
  },
  {
    id: 'v-nashih-glazah-track',
    kind: 'Трек',
    title: 'В наших глазах',
    subtitle: 'КИНО',
    musicUrl: 'https://music.yandex.ru/album/10100/track/106263',
  },
  {
    id: 'gruppa-krovi-album',
    kind: 'Альбом',
    title: 'Группа крови',
    subtitle: 'КИНО · альбом',
    musicUrl: 'https://music.yandex.ru/album/10100',
  },
];

const articleReleases = [{
  id: 'tak-pohuy-track',
  kind: 'Трек',
  title: 'Так похуй',
  subtitle: 'madk1d',
  musicUrl: 'https://music.yandex.ru/album/35861245/track/137300017',
}];

export function getRelease(id) {
  return releases.find((release) => release.id === id) ?? articleReleases.find((release) => release.id === id) ?? null;
}
