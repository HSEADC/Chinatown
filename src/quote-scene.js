import { quoteTiming, quoteReadingLayout, quoteScrollState } from './quote-scroll-state.js';
import { mountQuoteBackgroundVideo } from './quote-background-video.js';

/** Fade in the concert, scroll its lyrics, and reveal the following article. */
export function mountQuoteScenes(page, onActiveChange) {
  const scenes = [...page.querySelectorAll('[data-quote-scene]')].map(element => ({
    element,
    scroll: element.querySelector('.story-quote-scene__scroll'),
    stage: element.querySelector('.story-quote-scene__stage'),
    lyrics: element.querySelector('.story-quote-scene__lyrics'),
    media: element.querySelector('.story-quote-scene__media'),
    continuation: element.nextElementSibling,
    video: mountQuoteBackgroundVideo(element.querySelector('.story-quote-scene__media')),
    lines: [...element.querySelectorAll('[data-quote-line]')],
    offsets: [], stops: [], current: -1, height: 0, top: 0, travel: 0, runway: 0, exit: 0,
  }));
  if (!scenes.length) return () => {};
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  let active = false;
  let frame = 0;
  let headerHeight = 0;
  let needsMeasure = true;

  function setActive(next) {
    if (active === next) return;
    active = next;
    onActiveChange(active);
  }

  function measure() {
    const enhanced = !reducedMotion.matches;
    headerHeight = parseFloat(getComputedStyle(page).getPropertyValue('--story-header-height'));
    for (const scene of scenes) {
      scene.element.classList.toggle('is-enhanced', enhanced);
      if (!enhanced) {
        scene.element.dataset.quotePhase = 'static';
        scene.scroll.style.removeProperty('--quote-scroll-height');
        scene.lyrics.style.removeProperty('transform');
        scene.element.style.removeProperty('--quote-overlap');
        scene.element.style.removeProperty('--quote-media-opacity');
        scene.element.style.removeProperty('--quote-lyrics-opacity');
        scene.media.classList.remove('is-visible');
        scene.video.setActive(false);
        scene.lines.forEach(line => line.classList.remove('is-current', 'is-past'));
        scene.current = -1;
        continue;
      }
      scene.height = scene.stage.offsetHeight;
      scene.offsets = scene.lines.map(line => line.offsetTop - scene.lines[0].offsetTop);
      Object.assign(scene, quoteReadingLayout(scene.height, scene.offsets));
      const height = `${Math.ceil(scene.height + scene.runway)}px`;
      if (scene.scroll.style.getPropertyValue('--quote-scroll-height') !== height) {
        scene.scroll.style.setProperty('--quote-scroll-height', height);
      }
      scene.top = scene.scroll.getBoundingClientRect().top + window.scrollY;
      scene.element.style.setProperty('--quote-overlap', `${scene.height * quoteTiming.overlap}px`);
      const continuationTop = scene.continuation?.getBoundingClientRect().top + window.scrollY;
      // Finish the fade when the next heading reaches its normal reading position.
      scene.exit = Number.isFinite(continuationTop)
        ? Math.max(scene.height * .4, continuationTop - scene.top - scene.runway - headerHeight - 24)
        : scene.height * (1 - quoteTiming.overlap);
    }
    needsMeasure = false;
  }

  function render() {
    frame = 0;
    if (needsMeasure) measure();
    if (reducedMotion.matches) { setActive(false); return; }
    const y = window.scrollY;
    let nextActive = false;
    for (const scene of scenes) {
      const distance = y - scene.top;
      const state = quoteScrollState(distance, scene);
      scene.element.dataset.quotePhase = distance < -scene.height * quoteTiming.enter ? 'before'
        : distance < 0 ? 'entering'
          : distance <= scene.runway ? 'reading'
            : state.mediaOpacity > 0 ? 'leaving' : 'after';
      scene.lyrics.style.transform = `translate3d(0, ${-state.travel}px, 0)`;
      scene.element.style.setProperty('--quote-media-opacity', state.mediaOpacity);
      scene.element.style.setProperty('--quote-lyrics-opacity', state.lyricsOpacity);
      scene.media.classList.toggle('is-visible', state.mediaOpacity > 0);
      if (distance > -scene.height * .7 && distance < scene.runway + scene.exit) scene.video.preload();
      scene.video.setActive(state.mediaOpacity > 0 && !document.hidden);
      // Select the phrase nearest the reading position, including reverse scroll.
      let current = 0;
      for (let index = 1; index < scene.offsets.length; index++) {
        if (state.travel >= (scene.offsets[index - 1] + scene.offsets[index]) / 2) current = index;
      }
      if (current !== scene.current) {
        scene.lines.forEach((line, index) => {
          line.classList.toggle('is-current', index === current);
          line.classList.toggle('is-past', index < current);
        });
        scene.current = current;
      }
      nextActive ||= distance >= -headerHeight && state.mediaOpacity > 0;
    }
    setActive(nextActive);
  }

  function schedule({ measure: shouldMeasure = false } = {}) {
    needsMeasure ||= shouldMeasure;
    if (!frame) frame = requestAnimationFrame(render);
  }
  const resizeObserver = new ResizeObserver(() => schedule({ measure: true }));
  resizeObserver.observe(page);
  for (const scene of scenes) {
    resizeObserver.observe(scene.stage);
    resizeObserver.observe(scene.lyrics);
  }
  window.addEventListener('scroll', () => schedule(), { ...options, passive: true });
  window.addEventListener('resize', () => schedule({ measure: true }), options);
  window.addEventListener('pageshow', () => schedule({ measure: true }), options);
  document.addEventListener('visibilitychange', () => schedule(), options);
  reducedMotion.addEventListener('change', () => schedule({ measure: true }), options);
  document.fonts.ready.then(() => {
    if (!controller.signal.aborted) schedule({ measure: true });
  });
  render();

  return () => {
    controller.abort();
    resizeObserver.disconnect();
    cancelAnimationFrame(frame);
    setActive(false);
    for (const scene of scenes) {
      scene.video.dispose();
      scene.element.classList.remove('is-enhanced');
      delete scene.element.dataset.quotePhase;
      scene.scroll.style.removeProperty('--quote-scroll-height');
      scene.lyrics.style.removeProperty('transform');
      for (const property of ['--quote-overlap', '--quote-media-opacity', '--quote-lyrics-opacity']) scene.element.style.removeProperty(property);
      scene.lines.forEach((line, index) => {
        line.classList.toggle('is-current', index === 0);
        line.classList.remove('is-past');
      });
    }
  };
}
