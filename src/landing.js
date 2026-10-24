import { mountActionButtons } from './components/action-button.js';
import { mountArticleHeader } from './article-header.js';
import { mountEmailSubscribe } from './email-subscribe.js';
import { mountHeadlineGlitch } from './headline-glitch.js';

/** Controllers for the landing; the header may already live outside the content. */
export function mountLanding(root, header) {
  if (!root) return () => {};
  const controller = new AbortController();
  mountActionButtons(root);
  const headerControls = header ? mountArticleHeader(header, () => {}) : null;
  const form = root.querySelector('.landing-form');
  if (form) mountEmailSubscribe(form, { signal: controller.signal });
  // The hero title glitches like the stub's and the article's: on hover and on scroll.
  const title = root.querySelector('.landing-hero__title');
  const glitch = title ? mountHeadlineGlitch(title, { scroll: true, multiline: true }) : null;
  return () => {
    controller.abort();
    glitch?.destroy();
    headerControls?.dispose();
  };
}
