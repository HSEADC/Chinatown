export { articleView } from './article-view.js';
import { releases } from './releases.js';
import { parseYandexMusicUrl } from './yandex-music.js';

export function trackRows(tracks = releases) {
  return `<ol class="music-track-list">${tracks.filter((track) => parseYandexMusicUrl(track.musicUrl)).map((track, index) => `
    <li class="music-track" data-track-row="${track.id}">
      <button class="music-track__play" type="button" data-yandex-release="${track.id}" aria-label="Открыть плеер: ${track.title}, ${track.subtitle}" aria-pressed="false"><span class="music-track__number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span class="music-track__symbol" aria-hidden="true">▶</span></button>
      <div class="music-track__name"><strong>${track.title}</strong><span>${track.subtitle}</span></div>
      <span class="music-track__description">${track.kind}</span>
      <a class="music-track__source" href="${track.musicUrl}" target="_blank" rel="noopener noreferrer" aria-label="${track.title} — открыть в Яндекс Музыке">Яндекс Музыка ↗</a>
    </li>`).join('')}</ol>`;
}

export function homeView() {
  return `<div class="media-home" data-video-clip="kitay-night">
    <header class="media-header"><a class="media-brand" href="./index.html">CHINATOWN.RU</a><span class="media-header__note">МЕДИА О НЕФОРАХ</span></header>
    <section class="media-home__intro" data-scene-emphasis="featured" aria-labelledby="landing-title"><p class="media-eyebrow">Пока готовим большое</p><h1 id="landing-title">ТУТ БУДЕТ<br>ЛЕНДИНГ<span class="media-accent">*</span></h1><p class="media-home__lead">А пока — немного музыки.<br>Выбирай релиз и оставайся.</p><a class="media-inline-link" href="./article.html" data-media-route>Посмотреть статью <span aria-hidden="true">↗</span></a></section>
    <section class="mood-section" data-scene-emphasis="ambient" aria-labelledby="moods-title"><div class="media-section-heading"><h2 id="moods-title">Слушать в Яндекс Музыке</h2><span>КИНО / ТРЕКИ И АЛЬБОМ</span></div><div class="mood-grid">${releases.map((release, index) => `<button class="mood-card mood-card--${['pink', 'lime', 'blue'][index]}" type="button" data-yandex-release="${release.id}" aria-label="Открыть плеер: ${release.title}, ${release.subtitle}" aria-pressed="false"><span class="mood-card__top"><span>0${index + 1} / ${release.kind.toUpperCase()}</span><span class="mood-card__play" aria-hidden="true">▶</span></span><span class="mood-card__art" aria-hidden="true">${['✳', '↗', '≈'][index]}</span><span class="mood-card__title">${release.title}</span><span class="mood-card__subtitle">${release.subtitle}</span></button>`).join('')}</div></section>
    <section class="music-selection" aria-labelledby="selection-title"><div class="media-section-heading"><h2 id="selection-title">Что звучит</h2><span>ЯНДЕКС МУЗЫКА</span></div>${trackRows()}</section>
    <a class="article-teaser" data-scene-emphasis="balanced" href="./article.html" data-media-route><img src="./assets/figma/article/madk1d-concert.png" alt="madk1d на сцене" width="3516" height="1984" loading="lazy"><div><span class="media-eyebrow">Новая сцена / Портрет</span><h2><span class="media-accent">MADK1D:</span><br>слишком громко, чтобы было всё равно</h2><span class="media-inline-link">Читать <span aria-hidden="true">↗</span></span></div></a>
    <footer class="media-footer"><span>CHINATOWN.RU</span><a href="./glitch-test.html">Тест анимации заголовка ↗</a></footer>
  </div>`;
}
