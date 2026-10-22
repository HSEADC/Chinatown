export { articleView } from './article-view.js';

export function homeView() {
  return `<div class="media-home" data-video-clip="kitay-night">
    <header class="media-header"><a class="media-brand" href="./index.html">CHINATOWN.RU</a><span class="media-header__note">МЕДИА О НЕФОРАХ</span></header>
    <section class="media-home__intro" data-scene-emphasis="featured" aria-labelledby="landing-title"><p class="media-eyebrow">Пока готовим большое</p><h1 id="landing-title">ТУТ БУДЕТ<br>ЛЕНДИНГ<span class="media-accent">*</span></h1><p class="media-home__lead">Медиа о людях, местах<br>и независимой культуре.</p><p class="editorial-prose"><a href="./article.html" data-media-route>Статья о madk1d</a></p></section>
    <footer class="media-footer"><span>CHINATOWN.RU</span><a href="./glitch-test.html">Тест анимации заголовка ↗</a></footer>
  </div>`;
}
