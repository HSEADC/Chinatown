const apiUrl = 'https://www.youtube.com/iframe_api';
let apiPromise;

function loadYouTubePlayer() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = setTimeout(fail, 15000);
    function restoreCallback() {
      if (window.onYouTubeIframeAPIReady === ready) window.onYouTubeIframeAPIReady = previous;
    }
    function fail() {
      clearTimeout(timeout);
      restoreCallback();
      script.remove();
      apiPromise = undefined;
      reject(new Error('YouTube API unavailable'));
    }
    function ready() {
      clearTimeout(timeout);
      restoreCallback();
      try { previous?.(); } finally { resolve(window.YT); }
    }
    window.onYouTubeIframeAPIReady = ready;
    script.src = apiUrl;
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  });
  return apiPromise;
}

/** A muted background embed; the supplied photograph remains the fallback. */
export function mountQuoteBackgroundVideo(media) {
  const videoId = media.dataset.youtubeId;
  const start = Number(media.dataset.videoStart) || 0;
  const host = media.querySelector('.story-quote-scene__video');
  let player;
  let ready = false;
  let loading = false;
  let wanted = false;
  let disposed = false;
  let readyTimeout = 0;

  function fallback(state) {
    media.classList.remove('is-video-playing');
    media.dataset.videoState = state;
  }
  function syncPlayback() {
    if (!ready || disposed) return;
    player.mute();
    if (wanted) player.playVideo();
    else player.pauseVideo();
  }
  async function preload() {
    if (loading || disposed || !/^[\w-]{11}$/.test(videoId || '')) return;
    loading = true;
    media.dataset.videoState = 'loading';
    try {
      const YouTube = await loadYouTubePlayer();
      if (disposed) return;
      const frame = document.createElement('iframe');
      const url = new URL(`https://www.youtube.com/embed/${videoId}`);
      const parameters = { enablejsapi: 1, origin: location.origin, start, autoplay: 0, mute: 1, playsinline: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 };
      for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
      frame.src = url.href;
      frame.title = 'Выступление madk1d — фоновое видео без звука';
      frame.allow = 'autoplay; encrypted-media';
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.tabIndex = -1;
      host.append(frame);
      readyTimeout = setTimeout(() => { if (!disposed && !ready) fallback('unavailable'); }, 15000);
      player = new YouTube.Player(frame, { events: {
        onReady(event) {
          if (disposed) return;
          clearTimeout(readyTimeout);
          player = event.target;
          ready = true;
          media.dataset.videoState = 'ready';
          syncPlayback();
        },
        onStateChange(event) {
          if (disposed) return;
          if (event.data === YouTube.PlayerState.PLAYING) {
            if (!wanted) { player.pauseVideo(); return; }
            media.classList.add('is-video-playing');
            media.dataset.videoState = 'playing';
          } else if (event.data === YouTube.PlayerState.ENDED && wanted) {
            player.seekTo(start, true);
            player.playVideo();
          } else if (event.data === YouTube.PlayerState.PAUSED) media.dataset.videoState = 'paused';
          else if (event.data === YouTube.PlayerState.BUFFERING) media.dataset.videoState = 'buffering';
        },
        onError: event => { clearTimeout(readyTimeout); if (!disposed) fallback(`error-${event.data}`); },
        onAutoplayBlocked: () => { if (!disposed) fallback('autoplay-blocked'); },
      } });
    } catch {
      clearTimeout(readyTimeout);
      if (!disposed) fallback('unavailable');
    }
  }
  return {
    preload,
    setActive(active) {
      if (active) preload();
      if (wanted === active) return;
      wanted = active;
      syncPlayback();
    },
    dispose() {
      disposed = true;
      clearTimeout(readyTimeout);
      player?.destroy();
      host.replaceChildren();
      fallback('idle');
    },
  };
}
