import { mountArticleHeader } from './article-header.js';
import { mountHeadlineGlitch } from './headline-glitch.js';
import { mountQuoteScenes } from './quote-scene.js';
import { mountStoryClub } from './story-club.js';
import { mountArticleContext } from './article-context.js';
import { mountSectionHeadings } from './section-headings.js';
import { mountDevTools } from './dev-tools.js';
import { mountArticleImages } from './article-images.js';
import { mountActionButtons } from './components/action-button.js';

/** Attach article anchors and the shared headline effect. */
export function mountArticle(page, header = page?.querySelector('.story-header'), sceneRail) {
  if (!page) return () => {};
  mountActionButtons(page);
  const title = page.querySelector('#article-title');
  const controller = new AbortController();
  const headlineGlitch = mountHeadlineGlitch(title, { scroll: true, multiline: true });
  let quoteActive = false;
  let sectionHeadings;
  const club = mountStoryClub(page);
  let context;
  const images = mountArticleImages(page, { onOpenChange: value => context?.setFrozen(value) });
  function syncHeadline() {
    const overlayOpen = header.classList.contains('is-search-open') || header.classList.contains('is-nav-open');
    headlineGlitch.setSuspended(overlayOpen || quoteActive);
    club.setSuspended(overlayOpen || quoteActive);
    context?.setSuspended(overlayOpen || quoteActive);
    // Section titles belong to the article flow, including the concert's fade-out.
    sectionHeadings?.setSuspended(overlayOpen);
  }

  const headerControls = mountArticleHeader(header, syncHeadline, page);
  sectionHeadings = mountSectionHeadings(page, header);
  const disposeQuotes = mountQuoteScenes(page, active => {
    quoteActive = active;
    if (active) headerControls.close();
    page.classList.toggle('is-quote-active', active);
    document.body.classList.toggle('is-story-quote-active', active);
    syncHeadline();
  });
  // Register lyric phase updates before the context scroll listener, so a scene
  // hides the rail before that same frame can select its video fallback.
  context = mountArticleContext(page, sceneRail, { suspended: quoteActive });
  syncHeadline();
  const disposeDevTools = mountDevTools({ page, club });
  function followAnchor(event) {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.hasAttribute('data-context-ref') || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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
  }
  page.addEventListener('click', followAnchor, { signal: controller.signal });
  header.addEventListener('click', followAnchor, { signal: controller.signal });

  return () => {
    controller.abort();
    disposeDevTools();
    club.dispose();
    disposeQuotes();
    sectionHeadings.dispose();
    headerControls.dispose();
    headlineGlitch.destroy();
    images.dispose();
    context.dispose();
    document.body.classList.remove('is-story-quote-active');
  };
}
