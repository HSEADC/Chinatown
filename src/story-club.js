import { applyClubSettings, loadClubSettings } from './story-club-settings.js';

/** Light spilling into the article from the next, still unopened story. */
export function mountStoryClub(page) {
  const light = page.querySelector('[data-story-club]');
  const cover = page.querySelector('.story-cover');
  const footer = page.querySelector('.story-footer');
  if (!light || !cover || !footer) return { setSuspended() {}, dispose() {} };

  const controller = new AbortController();
  const options = { signal: controller.signal };
  let frame = 0;
  let suspended = false;
  let preview = false;
  try { applyClubSettings(page, loadClubSettings(window.localStorage)); } catch { /* Storage may be unavailable. */ }

  function render() {
    frame = 0;
    const height = window.innerHeight;
    const coverBottom = cover.getBoundingClientRect().bottom;
    const footerTop = footer.getBoundingClientRect().top;
    // The cover gives way to grey paper before the neighbouring room appears.
    const entrance = Math.min(1, Math.max(0, (height * .64 - coverBottom) / (height * .34)));
    const exit = Math.min(1, Math.max(0, footerTop / (height * .28)));
    const amount = suspended || document.hidden ? 0 : preview ? 1 : entrance * exit;
    page.style.setProperty('--club-presence', amount.toFixed(3));
    page.classList.toggle('is-club-lit', amount > 0);
  }

  function schedule() {
    if (!controller.signal.aborted && !frame) frame = requestAnimationFrame(render);
  }

  page.classList.add('has-club-light');
  const observer = new ResizeObserver(schedule);
  observer.observe(page);
  window.addEventListener('scroll', schedule, { ...options, passive: true });
  window.addEventListener('resize', schedule, options);
  window.addEventListener('pageshow', schedule, options);
  document.addEventListener('visibilitychange', schedule, options);
  render();

  return {
    setPreview(value) {
      preview = value;
      schedule();
    },
    setSuspended(value) {
      suspended = value;
      schedule();
    },
    dispose() {
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      page.classList.remove('has-club-light', 'is-club-lit');
      page.style.removeProperty('--club-presence');
    },
  };
}
