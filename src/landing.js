import { mountActionButtons } from './components/action-button.js';
import { mountArticleHeader } from './article-header.js';
import { mountEmailSubscribe } from './email-subscribe.js';

/** Controllers for the landing; the header may already live outside the content. */
export function mountLanding(root, header) {
  if (!root) return () => {};
  const controller = new AbortController();
  mountActionButtons(root);
  const headerControls = header ? mountArticleHeader(header, () => {}) : null;
  const form = root.querySelector('.landing-form');
  if (form) mountEmailSubscribe(form, { signal: controller.signal });
  return () => {
    controller.abort();
    headerControls?.dispose();
  };
}
