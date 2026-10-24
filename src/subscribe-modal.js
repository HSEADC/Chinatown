import { mountActionButtons } from './components/action-button.js';
import { siteFooterMarkup, mountSiteFooter } from './components/site-footer.js';
import { mountSubscribeDialog } from './components/subscribe-dialog.js';

const intro = document.querySelector('#intro');
// The stub ends with the same footer as every other page; the intro is the scroller, so the footer goes inside it.
intro.insertAdjacentHTML('beforeend', siteFooterMarkup());
mountSiteFooter(intro);
mountActionButtons();

// The intro: the whitelist button opens the dialog, and it prompts on its own after 45 seconds on the page.
mountSubscribeDialog(document.querySelector('#subscribe-modal'), {
  openButtons: [document.querySelector('#intro-whitelist')],
  background: intro,
});
