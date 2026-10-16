import { createMusicController } from './music-controller.js';
import { getMusicTrack, getMusicMood, formatTime } from './music-library.js';

export function mountMusicPlayer(host) {
  host.innerHTML = `
    <audio id="music-audio" preload="none"></audio>
    <section class="music-player__expanded" id="music-player-panel" aria-label="Подборка и авторство" hidden>
      <div class="music-player__panel-heading"><strong id="music-queue-title">Подборка</strong><label class="music-player__continue"><input type="checkbox" id="music-continue" checked> Продолжать подборку</label></div>
      <ol class="music-player__queue" id="music-queue"></ol>
      <p class="music-player__credit" id="music-credit"></p>
    </section>
    <div class="music-player__bar">
      <div class="music-player__art" id="music-art" aria-hidden="true">✳</div>
      <button class="music-player__play" type="button" data-audio-action="toggle" aria-label="Воспроизвести"><span aria-hidden="true">▶</span></button>
      <div class="music-player__identity"><strong id="music-title"></strong><span id="music-artist">Kevin MacLeod</span></div>
      <div class="music-player__transport"><button type="button" data-audio-action="previous" aria-label="Предыдущий трек">❮</button><button type="button" data-audio-action="back" aria-label="Назад на 30 секунд">↶<span>30</span></button><button type="button" data-audio-action="forward" aria-label="Вперёд на 30 секунд">↷<span>30</span></button><button type="button" data-audio-action="next" aria-label="Следующий трек">❯</button></div>
      <div class="music-player__timeline"><span id="music-time">0:00</span><input id="music-seek" type="range" min="0" max="1" step="0.1" value="0" aria-label="Позиция воспроизведения"><span id="music-duration">0:00</span></div>
      <div class="music-player__volume"><button type="button" data-audio-action="mute" aria-label="Выключить звук">♪</button><input id="music-volume" type="range" min="0" max="1" step="0.05" value="0.7" aria-label="Громкость"></div>
      <button class="music-player__expand" type="button" data-audio-action="expand" aria-label="Подборка и авторство" aria-expanded="false" aria-controls="music-player-panel"><span>ПОДБОРКА</span> <span class="music-player__chevron" aria-hidden="true">⌃</span></button>
      <button class="music-player__close" type="button" data-audio-action="close" aria-label="Закрыть плеер и остановить музыку">×</button>
    </div>
    <p class="music-player__status" role="status" aria-live="polite" id="music-status" hidden></p>`;
  const audio = host.querySelector('audio');
  let storage;
  try { storage = window.localStorage; } catch { /* Private/restricted browser. */ }
  const controller = createMusicController({ audio, storage });
  const find = (id) => host.querySelector(`#${id}`);
  const panel = find('music-player-panel');
  const toggle = host.querySelector('[data-audio-action="toggle"]');
  const expand = host.querySelector('[data-audio-action="expand"]');
  const seek = find('music-seek');
  const volume = find('music-volume');
  let queueSignature = '';
  let trackId = '';

  function refresh(state = controller.state) {
    host.hidden = !state.track;
    document.body.classList.toggle('has-music-player', Boolean(state.track));
    if (!state.track) return;
    const track = state.track;
    const isActive = state.playing || state.loading;
    toggle.setAttribute('aria-label', isActive ? 'Пауза' : 'Воспроизвести');
    toggle.firstElementChild.textContent = isActive ? 'Ⅱ' : '▶';
    host.classList.toggle('is-loading', state.loading);
    host.classList.toggle('is-playing', state.playing);
    find('music-time').textContent = formatTime(state.time);
    find('music-duration').textContent = formatTime(state.duration);
    seek.max = state.duration;
    seek.value = state.time;
    seek.disabled = audio.readyState < 1;
    seek.setAttribute('aria-valuetext', `${formatTime(state.time)} из ${formatTime(state.duration)}`);
    seek.style.setProperty('--progress', `${state.duration ? state.time / state.duration * 100 : 0}%`);
    if (document.activeElement !== volume) volume.value = state.volume;
    find('music-continue').checked = state.continueQueue;
    const mute = host.querySelector('[data-audio-action="mute"]');
    mute.setAttribute('aria-label', state.muted || state.volume === 0 ? 'Включить звук' : 'Выключить звук');
    mute.textContent = state.muted || state.volume === 0 ? '⊘' : '♪';
    const index = state.queue.indexOf(track.id);
    host.querySelector('[data-audio-action="previous"]').disabled = index <= 0;
    host.querySelector('[data-audio-action="next"]').disabled = index >= state.queue.length - 1;
    find('music-status').hidden = !state.error;
    if (find('music-status').textContent !== state.error) find('music-status').textContent = state.error;
    if (trackId !== track.id) {
      trackId = track.id;
      find('music-title').textContent = track.title;
      find('music-art').dataset.color = track.color;
      find('music-credit').innerHTML = `<a href="${track.sourceUrl}" target="_blank" rel="noopener noreferrer">${track.title}</a> — <a href="${track.artistUrl}" target="_blank" rel="noopener noreferrer">Kevin MacLeod (incompetech.com)</a> · <a href="${track.licenseUrl}" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> · Оригинальная запись, без изменений.`;
      if ('mediaSession' in navigator && 'MediaMetadata' in window) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist, album: 'CHINATOWN / Музыка для чтения' });
      }
    }
    const signature = `${state.mood?.id}:${state.queue.join(',')}`;
    if (queueSignature !== signature) {
      queueSignature = signature;
      find('music-queue-title').textContent = state.mood ? state.mood.title : 'Все треки';
      find('music-queue').innerHTML = state.queue.map((id) => { const item = getMusicTrack(id); return `<li><button type="button" data-track="${item.id}"><span>${item.title}</span><span>${formatTime(item.duration)}</span></button></li>`; }).join('');
    }
    for (const button of document.querySelectorAll('[data-track]')) {
      const selected = button.dataset.track === track.id;
      button.classList.toggle('is-current', selected);
      button.setAttribute('aria-pressed', String(selected && isActive));
      const item = getMusicTrack(button.dataset.track);
      button.setAttribute('aria-label', `${selected && isActive ? 'Пауза' : 'Слушать'} ${item.title}`);
      const symbol = button.querySelector('.music-track__symbol');
      if (symbol) symbol.textContent = selected && isActive ? 'Ⅱ' : '▶';
    }
    for (const row of document.querySelectorAll('[data-track-row]')) row.classList.toggle('is-current', row.dataset.trackRow === track.id);
    for (const button of document.querySelectorAll('[data-mood]')) {
      const active = button.dataset.mood === state.mood?.id && isActive;
      const mood = getMusicMood(button.dataset.mood);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', active ? `Пауза: ${mood.title}` : `Слушать подборку «${mood.title}»`);
      const symbol = button.querySelector('.mood-card__play') || button.querySelector('[aria-hidden="true"]');
      if (symbol) symbol.textContent = active ? 'Ⅱ' : '▶';
    }
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused';
      if (navigator.mediaSession.setPositionState && Number.isFinite(audio.duration) && audio.duration > 0) {
        try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: Math.min(state.time, audio.duration) }); } catch { /* Browser-specific media support. */ }
      }
    }
  }

  controller.subscribe(refresh);
  host.addEventListener('click', (event) => {
    const button = event.target.closest('[data-audio-action]');
    if (!button || button.disabled) return;
    const action = button.dataset.audioAction;
    if (action === 'toggle') controller.toggle();
    if (action === 'previous') controller.step(-1);
    if (action === 'next') controller.step(1);
    if (action === 'back') controller.skip(-30);
    if (action === 'forward') controller.skip(30);
    if (action === 'mute') controller.toggleMute();
    if (action === 'expand') { panel.hidden = !panel.hidden; expand.setAttribute('aria-expanded', String(!panel.hidden)); }
    if (action === 'close') {
      // Return focus before hiding the focused control and its parent.
      document.querySelector('#media-content h1')?.focus({ preventScroll: true });
      panel.hidden = true;
      expand.setAttribute('aria-expanded', 'false');
      controller.close();
      trackId = '';
      queueSignature = '';
      if ('mediaSession' in navigator) { navigator.mediaSession.metadata = null; navigator.mediaSession.playbackState = 'none'; }
    }
  });
  seek.addEventListener('input', () => controller.seek(Number(seek.value)));
  volume.addEventListener('input', () => controller.setVolume(Number(volume.value)));
  find('music-continue').addEventListener('change', (event) => controller.setContinue(event.target.checked));
  window.addEventListener('pagehide', controller.save);
  if ('mediaSession' in navigator) {
    const actions = { play: controller.play, pause: controller.pause, previoustrack: () => controller.step(-1), nexttrack: () => controller.step(1), seekbackward: (details) => controller.skip(-(details.seekOffset || 30)), seekforward: (details) => controller.skip(details.seekOffset || 30), seekto: (details) => controller.seek(details.seekTime) };
    for (const [action, handler] of Object.entries(actions)) { try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* Not all browsers support each action. */ } }
  }
  return { controller, refresh };
}
