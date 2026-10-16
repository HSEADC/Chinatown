import { getMusicTrack, getMusicMood, musicTracks } from './music-library.js';

const STORAGE_KEY = 'chinatown:music:v1';

// One audio element lives outside the views. Changing the article never replaces it.
export function createMusicController({ audio, storage } = {}) {
  const listeners = new Set();
  let generation = 0;
  let restoreTime = null;
  let lastSavedSecond = -1;
  const state = { track: null, mood: null, queue: [], time: 0, duration: 0, volume: 0.7, muted: false, continueQueue: true, playing: false, loading: false, error: '' };
  audio.preload = 'none';

  function save() {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify({ id: state.track?.id, mood: state.mood?.id, time: state.time, volume: state.volume, continueQueue: state.continueQueue }));
    } catch { /* Playback also works when storage is disabled or full. */ }
  }

  function notify() {
    for (const listener of listeners) listener({ ...state });
  }

  function setTrack(track, mood = null) {
    generation += 1;
    audio.pause();
    restoreTime = null;
    state.track = track;
    state.mood = mood;
    state.queue = mood ? [...mood.tracks] : musicTracks.map((item) => item.id);
    state.time = 0;
    state.duration = track.duration;
    state.playing = false;
    state.loading = false;
    state.error = '';
    audio.src = track.src;
    notify();
    save();
  }

  async function play() {
    if (!state.track) return;
    const token = generation;
    if (audio.error) {
      restoreTime = state.time;
      audio.load(); // Retry a failed network/decode request rather than the error state.
    }
    state.error = '';
    state.loading = true;
    notify();
    try {
      await audio.play();
      if (token !== generation) return;
      state.playing = !audio.paused;
      state.loading = false;
      notify();
    } catch (error) {
      if (token !== generation || error.name === 'AbortError') return;
      state.playing = false;
      state.loading = false;
      state.error = error.name === 'NotAllowedError'
        ? 'Нажмите Play, чтобы включить музыку.'
        : 'Не удалось включить трек. Попробуйте ещё раз или откройте источник.';
      notify();
    }
  }

  function pause() {
    generation += 1;
    audio.pause();
    state.playing = false;
    state.loading = false;
    save();
    notify();
  }

  function selectTrack(id) {
    const track = getMusicTrack(id);
    if (!track) return;
    if (state.track?.id === id) {
      if (state.playing || state.loading) pause(); else play();
      return;
    }
    // A clicked track keeps the current mood only when it belongs to that queue.
    setTrack(track, state.mood?.tracks.includes(id) ? state.mood : null);
    play();
  }

  function selectMood(id) {
    const mood = getMusicMood(id);
    if (!mood) return;
    if (state.mood?.id === id && state.track) {
      if (state.playing || state.loading) pause(); else play();
      return;
    }
    setTrack(getMusicTrack(mood.tracks[0]), mood);
    play();
  }

  function step(delta) {
    const index = state.queue.indexOf(state.track?.id);
    const track = getMusicTrack(state.queue[index + delta]);
    if (!track) return;
    setTrack(track, state.mood);
    play();
  }

  function seek(seconds) {
    if (!state.track || !Number.isFinite(seconds) || !Number.isFinite(audio.duration)) return;
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration));
    state.time = audio.currentTime;
    save();
    notify();
  }

  audio.addEventListener('loadedmetadata', () => {
    if (!state.track) return;
    if (Number.isFinite(audio.duration)) state.duration = audio.duration;
    if (restoreTime !== null) {
      audio.currentTime = Math.max(0, Math.min(restoreTime, Math.max(0, state.duration - 0.1)));
      state.time = audio.currentTime;
      restoreTime = null;
    }
    notify();
  });
  audio.addEventListener('timeupdate', () => {
    if (!state.track) return;
    state.time = audio.currentTime;
    const second = Math.floor(state.time);
    if (second !== lastSavedSecond && second % 5 === 0) { save(); lastSavedSecond = second; }
    notify();
  });
  audio.addEventListener('playing', () => {
    if (!state.track) return;
    state.playing = true;
    state.loading = false;
    notify();
  });
  audio.addEventListener('pause', () => {
    state.playing = false;
    state.loading = false;
    notify();
  });
  audio.addEventListener('waiting', () => { state.loading = true; notify(); });
  audio.addEventListener('error', () => {
    if (!state.track) return;
    state.playing = false;
    state.loading = false;
    state.error = 'Трек не загрузился. Проверьте подключение или откройте источник.';
    notify();
  });
  audio.addEventListener('ended', () => {
    state.playing = false;
    state.loading = false;
    const index = state.queue.indexOf(state.track?.id);
    if (state.continueQueue && index < state.queue.length - 1) step(1);
    else { save(); notify(); }
  });

  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || 'null');
    const track = getMusicTrack(saved?.id);
    if (track) {
      const mood = getMusicMood(saved.mood);
      // Do not save the reset position before the saved timestamp is restored.
      const savedTime = Number.isFinite(saved.time) ? saved.time : 0;
      setTrack(track, mood?.tracks.includes(track.id) ? mood : null);
      restoreTime = savedTime;
      state.time = Math.max(0, Math.min(savedTime, track.duration));
    }
    if (Number.isFinite(saved?.volume)) state.volume = Math.max(0, Math.min(1, saved.volume));
    if (typeof saved?.continueQueue === 'boolean') state.continueQueue = saved.continueQueue;
  } catch { /* Ignore damaged storage; never auto-play a restored session. */ }
  audio.volume = state.volume;

  return {
    get state() { return { ...state }; },
    subscribe(listener) { listeners.add(listener); listener({ ...state }); return () => listeners.delete(listener); },
    selectTrack, selectMood, play, pause, step, seek,
    toggle() { if (state.playing || state.loading) pause(); else play(); },
    skip(seconds) { seek(audio.currentTime + seconds); },
    setVolume(value) { state.volume = Math.max(0, Math.min(1, value)); audio.volume = state.volume; if (state.volume > 0) { state.muted = false; audio.muted = false; } save(); notify(); },
    toggleMute() { state.muted = !state.muted; audio.muted = state.muted; notify(); },
    setContinue(value) { state.continueQueue = Boolean(value); save(); notify(); },
    close() {
      pause();
      restoreTime = null;
      state.track = null;
      state.mood = null;
      state.queue = [];
      state.error = '';
      audio.removeAttribute('src');
      audio.load();
      save();
      notify();
    },
    save,
  };
}
