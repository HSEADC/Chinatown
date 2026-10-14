import { homeView, articleView } from './media-views.js';
import { mountYandexPlayer } from './media-yandex-player.js';
import { mountArticle } from './article.js';
import { articleTitle } from './article-view.js';

const content = document.querySelector('#media-content');
const root = new URL('../', import.meta.url);
const routeUrls = new Set([new URL('about.html', root).pathname, new URL('article.html', root).pathname]);
const player = mountYandexPlayer(document.querySelector('#music-player'));
let disposeArticle = () => {};

function renderPage({ focus = false } = {}) {
  disposeArticle();
  const isArticle = window.location.pathname === new URL('article.html', root).pathname;
  content.innerHTML = isArticle ? articleView() : homeView();
  document.body.dataset.mediaPage = isArticle ? 'article' : 'home';
  document.title = isArticle ? `${articleTitle} — CHINATOWN.RU` : 'Музыка — CHINATOWN.RU';
  disposeArticle = mountArticle(content.querySelector('.story-page'));
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
  history.pushState({}, '', url);
  renderPage({ focus: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
});
window.addEventListener('popstate', () => { renderPage({ focus: true }); });
renderPage();
