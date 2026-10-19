import { homeView, articleView } from './media-views.js';
import { mountYandexPlayer } from './media-yandex-player.js';
import { mountArticle } from './article.js';
import { articleTitle } from './article-view.js';
import { mountSceneRail } from './scene-rail.js';
import { mountEditorialVideos } from './editorial-video.js';

const content = document.querySelector('#media-content');
const headerRoot = document.createElement('div');
headerRoot.className = 'media-site-header';
content.before(headerRoot);
function syncHeaderHeight() {
  document.body.style.setProperty('--media-header-height', `${headerRoot.offsetHeight}px`);
}
const headerSize = new ResizeObserver(syncHeaderHeight);
headerSize.observe(headerRoot);
const root = new URL('../', import.meta.url);
const routeUrls = new Set([new URL('about.html', root).pathname, new URL('article.html', root).pathname]);
const player = mountYandexPlayer(document.querySelector('#music-player'));
const sceneRail = mountSceneRail(content);
let disposeArticle = () => {};
let disposeVideos = () => {};
let renderedRoute = '';

function renderPage({ focus = false } = {}) {
  disposeArticle();
  disposeVideos();
  const isArticle = window.location.pathname === new URL('article.html', root).pathname;
  content.innerHTML = isArticle ? articleView() : homeView();
  const header = content.querySelector('.story-header, .media-header');
  headerRoot.replaceChildren(header);
  syncHeaderHeight();
  document.body.dataset.mediaPage = isArticle ? 'article' : 'home';
  renderedRoute = location.pathname + location.search;
  document.title = isArticle ? `${articleTitle} — CHINATOWN.RU` : 'Музыка — CHINATOWN.RU';
  sceneRail.refresh();
  disposeArticle = mountArticle(content.querySelector('.story-page'), header, sceneRail);
  disposeVideos = mountEditorialVideos(content);
  const heading = content.querySelector('h1');
  heading.tabIndex = -1;
  if (focus) heading.focus({ preventScroll: true });
  player.refresh();
}

document.addEventListener('click', (event) => {
  const release = event.target.closest('[data-yandex-release]');
  if (release) { player.open(release.dataset.yandexRelease); return; }
  const link = event.target.closest('a[data-media-route]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.href);
  if (url.origin !== window.location.origin || !routeUrls.has(url.pathname) || link.target || link.hasAttribute('download')) return;
  event.preventDefault();
  if (history.state?.articleContext) history.replaceState({}, '', url);
  else history.pushState({}, '', url);
  renderPage({ focus: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
window.addEventListener('popstate', () => {
  // Local context and anchor entries belong to the article, not to the router.
  if (renderedRoute !== location.pathname + location.search) renderPage({ focus: true });
});
renderPage();
