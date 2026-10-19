const manifestUrl = new URL('../assets/video/editorial/manifest.json', import.meta.url);
const fallbackPosterUrl = new URL('../assets/video/editorial/kitay-night-86bc7af48de9/poster.jpg', import.meta.url);
const icons = {
  play: '<path d="m9 5 11 7-11 7z"/>',
  pause: '<path d="M8 5h2v14H8zm6 0h2v14h-2z"/>',
  expand: '<path d="m14 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  collapse: '<path d="m10 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  next: '<path d="m7 5 10 7-10 7zm11 0h2v14h-2z"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">${icons[name]}</svg>`;

/** One video element lives outside the router, so reading and navigation never restart it. */
export function mountSceneRail(content) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const wide = matchMedia('(min-width: 1200px)');
  const rail = document.createElement('aside');
  rail.className = 'scene-rail';
  // Measure the opening cover before the rail gets its first visible style.
  rail.hidden = true;
  rail.setAttribute('aria-label', 'Видео рядом со статьёй');
  rail.innerHTML = `
    <video class="scene-rail__video" id="scene-rail-video" muted loop playsinline preload="none" aria-label="Городское видео без звука"></video>
    <div class="scene-rail__shade" aria-hidden="true"></div>
    <div class="scene-rail__bottom">
      <p class="scene-rail__status" role="status"></p>
      <div class="scene-rail__controls">
        <button class="scene-rail__play" type="button" aria-controls="scene-rail-video"></button>
        <button class="scene-rail__size" type="button" aria-controls="scene-rail-video" aria-expanded="false"></button>
        <button class="scene-rail__next" type="button" aria-controls="scene-rail-video" aria-label="Следующее видео" title="Следующее видео" hidden>${icon('next')}</button>
        <button class="scene-rail__auto" type="button" hidden>Авто</button>
      </div>
      <a class="scene-rail__credit" target="_blank" rel="noopener noreferrer" hidden>Источник ↗</a>
    </div>
    <div class="scene-rail__context" hidden>
      <button class="scene-rail__close" type="button" aria-label="Закрыть пояснение">×</button>
      <div class="scene-rail__context-content"></div>
    </div>`;
  content.after(rail);
  const video = rail.querySelector('video');
  video.muted = true;
  const play = rail.querySelector('.scene-rail__play');
  const size = rail.querySelector('.scene-rail__size');
  const auto = rail.querySelector('.scene-rail__auto');
  const nextButton = rail.querySelector('.scene-rail__next');
  const status = rail.querySelector('.scene-rail__status');
  const credit = rail.querySelector('.scene-rail__credit');
  const contextPanel = rail.querySelector('.scene-rail__context');
  const contextHost = rail.querySelector('.scene-rail__context-content');
  const closeButton = rail.querySelector('.scene-rail__close');
  const videoLayers = [video, rail.querySelector('.scene-rail__shade'), rail.querySelector('.scene-rail__bottom')];
  let clips = [];
  let clip;
  let preferredId;
  let failed = false;
  let userPaused = reducedMotion.matches || !!navigator.connection?.saveData;
  let manualEmphasis = null;
  let markers = [];
  let activeMarker = -1;
  let frame = 0;
  let article = false;
  let cover = null;
  let coverVisible = false;
  let textVisible = false;
  let suspended = false;
  let savedTime = 0;
  let manifestFailed = false;

  function playbackAllowed() {
    return !document.hidden && !userPaused && !failed && !suspended && !coverVisible && !textVisible && !(article && !wide.matches);
  }

  function syncAvailability() {
    rail.inert = suspended || coverVisible || article && !wide.matches;
  }

  function updateControls() {
    const label = failed ? 'Повторить загрузку видео' : video.paused ? 'Включить видео' : 'Приостановить видео';
    play.innerHTML = icon(video.paused ? 'play' : 'pause');
    play.setAttribute('aria-label', label);
    play.title = label;
  }

  async function syncPlayback() {
    if (controller.signal.aborted) return;
    if (article && !wide.matches) {
      video.pause();
      video.removeAttribute('poster');
      if (video.getAttribute('src')) {
        savedTime = video.currentTime;
        video.removeAttribute('src');
        video.load();
      }
      return;
    }
    if (!video.getAttribute('poster')) video.poster = clip ? new URL(clip.poster, manifestUrl).href : fallbackPosterUrl.href;
    if (!clip) return;
    if (!playbackAllowed()) { video.pause(); return; }
    if (!video.getAttribute('src')) video.src = new URL(clip.rail[innerWidth <= 760 ? 'small' : 'large'], manifestUrl).href;
    try {
      await video.play();
      if (!playbackAllowed() || controller.signal.aborted) video.pause();
      else status.textContent = '';
    } catch {
      if (!controller.signal.aborted && playbackAllowed()) {
        status.textContent = 'Нажмите ▶';
        updateControls();
      }
    }
  }

  function setEmphasis(value) {
    if (!['ambient', 'balanced', 'featured'].includes(value)) value = 'ambient';
    auto.hidden = !manualEmphasis;
    if (document.body.dataset.sceneEmphasis === value && size.firstElementChild) return;
    document.body.dataset.sceneEmphasis = value;
    const expanded = value === 'featured';
    size.innerHTML = icon(expanded ? 'collapse' : 'expand');
    size.setAttribute('aria-expanded', String(expanded));
    size.setAttribute('aria-label', expanded ? 'Сузить видео' : 'Расширить видео');
    size.title = expanded ? 'Сузить видео' : 'Расширить видео';
  }

  function render() {
    frame = 0;
    const nextCoverVisible = !!cover && cover.getBoundingClientRect().bottom > 0;
    // Keep the article rail rendered so CSS can animate both entry and exit.
    rail.hidden = manifestFailed && !article;
    document.body.classList.toggle('is-story-cover-active', nextCoverVisible);
    if (coverVisible !== nextCoverVisible) {
      coverVisible = nextCoverVisible;
      syncPlayback();
    }
    syncAvailability();
    if (article) return;
    const threshold = innerHeight * .3;
    // A dead band prevents a section's own reflow from reversing its width change.
    if (activeMarker < 0) {
      for (const [index, marker] of markers.entries()) {
        if (marker.getBoundingClientRect().top <= threshold) activeMarker = index;
      }
    } else {
      while (activeMarker + 1 < markers.length && markers[activeMarker + 1].getBoundingClientRect().top <= threshold - 112) activeMarker++;
      while (activeMarker >= 0 && markers[activeMarker].getBoundingClientRect().top > threshold + 112) activeMarker--;
    }
    setEmphasis(manualEmphasis || markers[activeMarker]?.dataset.sceneEmphasis || 'balanced');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }

  function selectClip(next) {
    if (next && next.id !== clip?.id) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      clip = next;
      savedTime = 0;
      failed = false;
      status.textContent = '';
      if (!article || wide.matches) video.poster = new URL(clip.poster, manifestUrl).href;
      video.style.objectPosition = `${clip.focus[0] * 100}% ${clip.focus[1] * 100}%`;
      video.setAttribute('aria-label', `${clip.title}. Видео без звука`);
      credit.hidden = !clip.creditUrl;
      if (clip.creditUrl) credit.href = clip.creditUrl;
      syncPlayback();
    }
  }
  function nextClip() {
    selectClip(clips[(clips.indexOf(clip) + 1) % clips.length]);
  }
  function refresh() {
    article = !!content.querySelector('[data-article-id]');
    cover = article ? content.querySelector('.story-cover') : null;
    video.loop = article || clips.length === 1;
    rail.classList.toggle('scene-rail--article', article);
    rail.setAttribute('aria-label', article ? 'Рядом со статьёй' : 'Городское видео');
    size.hidden = article;
    auto.hidden = article || !manualEmphasis;
    document.body.classList.toggle('has-scene-rail', article || !manifestFailed);
    if (article) delete document.body.dataset.sceneEmphasis;
    markers = [...content.querySelectorAll('[data-scene-emphasis]')];
    activeMarker = -1;
    render();
    const id = content.querySelector('[data-video-clip]')?.dataset.videoClip;
    if (!clip || id !== preferredId) {
      preferredId = id;
      selectClip(clips.find(item => item.id === id) || clips[0]);
    }
    syncPlayback();
  }

  play.addEventListener('click', () => {
    if (failed) { failed = false; video.load(); }
    userPaused = !video.paused;
    syncPlayback();
    updateControls();
  }, options);
  size.addEventListener('click', () => {
    manualEmphasis = document.body.dataset.sceneEmphasis === 'featured' ? 'ambient' : 'featured';
    render();
  }, options);
  auto.addEventListener('click', () => {
    manualEmphasis = null;
    size.focus({ preventScroll: true });
    render();
  }, options);
  video.addEventListener('play', updateControls, options);
  video.addEventListener('pause', updateControls, options);
  video.addEventListener('loadedmetadata', () => {
    if (savedTime && Number.isFinite(video.duration)) video.currentTime = Math.min(savedTime, video.duration);
    savedTime = 0;
  }, options);
  nextButton.addEventListener('click', nextClip, options);
  video.addEventListener('ended', () => { if (!article) nextClip(); }, options);
  video.addEventListener('error', () => {
    failed = true;
    status.textContent = 'Видео недоступно';
    updateControls();
  }, options);
  document.addEventListener('visibilitychange', syncPlayback, options);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) userPaused = true;
    syncPlayback();
    updateControls();
  }, options);
  window.addEventListener('scroll', schedule, { ...options, passive: true });
  window.addEventListener('resize', schedule, options);
  window.addEventListener('pageshow', () => { render(); syncPlayback(); }, options);
  wide.addEventListener('change', syncPlayback, options);
  updateControls();
  refresh();
  fetch(manifestUrl, { signal: controller.signal }).then(response => {
    if (!response.ok) throw new Error('Video manifest unavailable');
    return response.json();
  }).then(manifest => {
    clips = (manifest.clips || []).filter(item => item.railEnabled !== false);
    if (!clips.length) throw new Error('Video selection is empty');
    nextButton.hidden = clips.length < 2;
    refresh();
  }).catch(() => {
    if (!controller.signal.aborted) {
      manifestFailed = true;
      failed = true;
      play.hidden = true;
      status.textContent = 'Видео недоступно';
      updateControls();
      refresh();
    }
  });

  return {
    refresh,
    rail,
    contextHost,
    closeButton,
    setContext(node, { manual = false } = {}) {
      textVisible = !!node;
      contextPanel.hidden = !node;
      closeButton.hidden = !manual;
      if (node && contextHost.firstElementChild !== node) {
        contextHost.replaceChildren(node);
        contextPanel.scrollTop = 0;
      }
      if (!node) contextHost.replaceChildren();
      for (const layer of videoLayers) { layer.hidden = textVisible; layer.inert = textVisible || suspended; }
      rail.dataset.contextState = node ? node.dataset.contextMaterial ? 'material' : 'next' : 'video';
      syncPlayback();
    },
    setSuspended(value) {
      suspended = value;
      rail.classList.toggle('is-suspended', value);
      syncAvailability();
      syncPlayback();
    },
    dispose() {
      controller.abort();
      cancelAnimationFrame(frame);
      video.pause();
      video.removeAttribute('src');
      video.load();
      rail.remove();
      document.body.classList.remove('has-scene-rail', 'is-story-cover-active');
      delete document.body.dataset.sceneEmphasis;
    },
  };
}
