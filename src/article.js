import { mountArticleHeader } from './article-header.js';
import { mountHeadlineGlitch } from './headline-glitch.js';
import { mountQuoteScenes } from './quote-scene.js';
import { mountStoryClub } from './story-club.js';

/** Attach article anchors and the shared headline effect. */
export function mountArticle(page) {
  if (!page) return () => {};
  const header = page.querySelector('.story-header');
  const title = page.querySelector('#article-title');
  const controller = new AbortController();
  const headlineGlitch = mountHeadlineGlitch(title, { scroll: true, multiline: true });
  const player = document.querySelector('.media-yandex-player');
  const originalPlayerInert = player?.inert;
  let quoteActive = false;
  const club = mountStoryClub(page);
  function syncHeadline() {
    const overlayOpen = header.classList.contains('is-search-open') || header.classList.contains('is-nav-open');
    headlineGlitch.setSuspended(overlayOpen || quoteActive);
    club.setSuspended(overlayOpen || quoteActive);
  }

  const headerControls = mountArticleHeader(header, syncHeadline);
  const disposeQuotes = mountQuoteScenes(page, active => {
    quoteActive = active;
    if (active) headerControls.close();
    if (player) player.inert = active || originalPlayerInert;
    page.classList.toggle('is-quote-active', active);
    document.body.classList.toggle('is-story-quote-active', active);
    syncHeadline();
  });
  let disposeLightEditor = () => {};
  if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || new URLSearchParams(location.search).has('light-editor')) {
    import('./story-club-editor.js').then(({ mountClubEditor }) => {
      if (!controller.signal.aborted) disposeLightEditor = mountClubEditor(page, club);
    });
  }
  page.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = page.querySelector(link.hash);
    if (!target) return;
    event.preventDefault();
    headerControls.close();
    history.pushState({}, '', link.hash);
    if (target === title) window.scrollTo({ top: 0, behavior: 'auto' });
    else target.scrollIntoView({ block: 'start', behavior: 'auto' });
    const focusTarget = target.querySelector('h2, h3') || target;
    if (!focusTarget.matches('a, button, input')) focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
  }, { signal: controller.signal });

  return () => {
    controller.abort();
    disposeLightEditor();
    club.dispose();
    disposeQuotes();
    headerControls.dispose();
    headlineGlitch.destroy();
  };
}
