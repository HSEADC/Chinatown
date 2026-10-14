import { getRelease } from './releases.js';
import { parseYandexMusicUrl } from './yandex-music.js';

// The official widget owns Play/Pause and seeking. Keep it alive across our views.
export function mountYandexPlayer(host) {
  host.className = 'media-yandex-player';
  host.setAttribute('aria-label', 'Плеер Яндекс Музыки');
  host.innerHTML = `
    <div class="media-yandex-player__head">
      <div class="media-yandex-player__identity"><strong id="media-yandex-title"></strong><span id="media-yandex-artist"></span></div>
      <a class="media-yandex-player__source" id="media-yandex-source" target="_blank" rel="noopener noreferrer">Яндекс Музыка ↗</a>
      <button type="button" id="media-yandex-expand" aria-expanded="false" aria-controls="media-yandex-frame" aria-label="Развернуть плеер"><span>РАЗВЕРНУТЬ</span><span aria-hidden="true">⌃</span></button>
      <button type="button" id="media-yandex-close" aria-label="Закрыть плеер и остановить музыку">×</button>
    </div>
    <div class="media-yandex-player__body" id="media-yandex-body" hidden>
      <div class="media-yandex-player__frame" id="media-yandex-frame"></div>
      <p class="media-yandex-player__note">Нажмите Play в виджете. Если он недоступен, откройте релиз в Яндекс Музыке по ссылке выше.</p>
    </div>`;
  const title = host.querySelector('#media-yandex-title');
  const artist = host.querySelector('#media-yandex-artist');
  const source = host.querySelector('#media-yandex-source');
  const expand = host.querySelector('#media-yandex-expand');
  const body = host.querySelector('#media-yandex-body');
  const frameWrap = host.querySelector('#media-yandex-frame');
  let activeRelease = null;
  let expanded = false;

  function refresh() {
    host.hidden = !activeRelease;
    document.body.classList.toggle('has-yandex-player', Boolean(activeRelease));
    document.body.style.setProperty('--yandex-player-space', activeRelease ? expanded ? activeRelease.kind === 'Альбом' ? '490px' : '340px' : '108px' : '0px');
    for (const button of document.querySelectorAll('[data-yandex-release]')) {
      const selected = button.dataset.yandexRelease === activeRelease?.id;
      button.classList.toggle('is-current', selected);
      // Selected identifies the loaded release, not the cross-origin playback state.
      button.setAttribute('aria-pressed', String(selected));
    }
    for (const row of document.querySelectorAll('[data-track-row]')) row.classList.toggle('is-current', row.dataset.trackRow === activeRelease?.id);
  }

  function setExpanded(value) {
    expanded = Boolean(value);
    body.hidden = !expanded;
    expand.setAttribute('aria-expanded', String(expanded));
    expand.setAttribute('aria-label', expanded ? 'Свернуть плеер' : 'Развернуть плеер');
    expand.firstElementChild.textContent = expanded ? 'СВЕРНУТЬ' : 'РАЗВЕРНУТЬ';
    refresh();
  }

  function open(id) {
    const release = getRelease(id);
    const parsed = release && parseYandexMusicUrl(release.musicUrl);
    if (!parsed) return;
    if (activeRelease?.id !== release.id || !frameWrap.firstElementChild) {
      const frame = document.createElement('iframe');
      frame.src = parsed.iframeUrl;
      frame.title = `Яндекс Музыка: ${release.subtitle} — ${release.title}`;
      frame.allow = 'autoplay; encrypted-media';
      frame.loading = 'eager';
      frameWrap.replaceChildren(frame);
    }
    activeRelease = release;
    title.textContent = release.title;
    artist.textContent = release.subtitle;
    source.href = parsed.sourceUrl;
    host.dataset.releaseKind = parsed.type;
    setExpanded(true);
  }

  function close() {
    document.querySelector('#media-content h1')?.focus({ preventScroll: true });
    frameWrap.replaceChildren();
    activeRelease = null;
    setExpanded(false);
  }

  expand.addEventListener('click', () => setExpanded(!expanded));
  host.querySelector('#media-yandex-close').addEventListener('click', close);
  refresh();
  return { open, close, refresh };
}
