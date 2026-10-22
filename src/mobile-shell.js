import { createContextPager } from './context-pager.js';
import { initialMobileShellState, reduceMobileShell, mobileSnapHeights, mobileSnapAfterDrag } from './mobile-shell-state.js';
import { mountMobileCityVideo } from './mobile-city-video.js';
import { searchArticles } from './article-search-data.js';

const asset = name => new URL(`../assets/figma/mobile-shell/${name}.svg`, import.meta.url).href;
const img = (name, size) => `<img src="${asset(name)}" alt="" width="${size}" height="${size}" aria-hidden="true">`;

/** Phone-only shell: one content sheet, site search, navigation and three Figma FABs. */
export function mountMobileShell(page, { onOverlayChange = () => {}, onVisibilityChange = () => {}, onDismissContext = () => {}, onRestoreContext = () => {} } = {}) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const phone = matchMedia('(max-width: 760px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = `chinatown:mobile-shell:${page.dataset.articleId}`;
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch { /* Private mode or an older draft. */ }
  let state = initialMobileShellState(saved);
  let context = { id: null, title: 'Китай-город' };
  let showVideo = false;
  let frozen = false;
  let lastOverlay = false;
  let drag = null;
  let dragMoved = false;
  let pointerDown = false;
  let shake = null;
  let ownedHistory = false;
  let historyMode = null;
  const token = crypto.randomUUID();
  let scrollLock = null;
  let announcedId = null;

  const root = document.createElement('div');
  root.className = 'mobile-shell';
  root.innerHTML = `<p class="story-visually-hidden" data-mobile-status role="status" aria-live="polite"></p>
    <div class="mobile-shell__fabs" role="group" aria-label="Управление сайтом" data-node-id="404:664">
      <button class="mobile-fab" type="button" data-mobile-mode="menu" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-site-menu" data-node-id="404:665"><span>${img('menu-24', 24)}</span></button>
      <button class="mobile-fab" type="button" data-mobile-mode="search" aria-label="Поиск статей" aria-expanded="false" aria-controls="mobile-site-search" data-node-id="404:667"><span>${img('search-24', 24)}</span></button>
      <button class="mobile-fab mobile-fab--context" type="button" data-mobile-mode="context" aria-label="Открыть дополнительный материал" aria-expanded="false" aria-controls="mobile-context-sheet" data-node-id="404:671"><span>${img('arrow-up', 32)}<i class="mobile-fab__unread" hidden></i></span></button>
    </div>
    <div class="mobile-shell__backdrop" hidden></div>
    <section class="mobile-shell__sheet" id="mobile-context-sheet" aria-label="Рядом со статьёй" inert>
      <div class="mobile-shell__handle" data-sheet-handle>
        <button class="mobile-shell__grab" type="button" aria-label="Развернуть плашку"><span></span></button>
        <div class="mobile-shell__heading"><button class="mobile-shell__title" type="button"></button>
          <button class="mobile-shell__collapse" type="button" aria-label="Свернуть плашку">${img('arrow-down', 32)}</button></div>
      </div>
      <div class="mobile-shell__pages"><div class="mobile-shell__content"></div></div>
      <div class="mobile-city-video" hidden></div>
      <div class="mobile-shell__format"><button type="button" data-city-toggle>Смотреть Китай-город ↗</button></div>
    </section>
    <section class="mobile-shell__menu-surface" role="dialog" aria-modal="true" aria-label="Меню сайта" hidden>
      <button class="mobile-fab mobile-shell__menu-close" type="button" aria-label="Закрыть меню"><span>${img('arrow-down', 32)}</span></button>
      <nav id="mobile-site-menu" aria-label="Навигация Чайнатаун">
        <a href="./index.html">Статьи</a><a href="./index.html">Мерч</a><a href="./index.html">Тесты</a><a href="./index.html">Карта артистов</a>
      </nav>
    </section>
    <section class="mobile-shell__search" id="mobile-site-search" role="dialog" aria-modal="true" aria-label="Поиск статей" hidden>
      <form class="mobile-search-field" role="search" aria-label="Поиск статей">
        <button type="submit" aria-label="Найти статьи">${img('search-field', 24)}</button>
        <label class="story-visually-hidden" for="mobile-article-query">О чем скучаешь? Поиск статей</label>
        <input id="mobile-article-query" type="search" name="q" placeholder="О чем скучаешь?" autocomplete="off" aria-controls="mobile-search-results">
        <button type="button" data-search-close aria-label="Закрыть поиск">${img('close', 24)}</button>
      </form>
      <p class="mobile-shell__search-status story-visually-hidden" role="status" aria-live="polite"></p>
      <ul id="mobile-search-results" class="mobile-search-results"></ul>
    </section>`;
  document.body.append(root);
  const fabs = root.querySelector('.mobile-shell__fabs');
  const liveStatus = root.querySelector('[data-mobile-status]');
  const contextButton = root.querySelector('[data-mobile-mode="context"]');
  const badge = root.querySelector('.mobile-fab__unread');
  const sheet = root.querySelector('.mobile-shell__sheet');
  const handle = root.querySelector('[data-sheet-handle]');
  const title = root.querySelector('.mobile-shell__title');
  const grab = root.querySelector('.mobile-shell__grab');
  const pages = root.querySelector('.mobile-shell__pages');
  const contextHost = root.querySelector('.mobile-shell__content');
  const format = root.querySelector('.mobile-shell__format');
  const cityToggle = root.querySelector('[data-city-toggle]');
  const cityHost = root.querySelector('.mobile-city-video');
  const city = mountMobileCityVideo(cityHost);
  const menu = root.querySelector('.mobile-shell__menu-surface');
  const search = root.querySelector('.mobile-shell__search');
  const input = search.querySelector('input');
  const searchStatus = root.querySelector('.mobile-shell__search-status');
  const results = root.querySelector('.mobile-search-results');
  const backdrop = root.querySelector('.mobile-shell__backdrop');
  const pager = createContextPager(contextHost, {
    outgoingClassName: 'mobile-shell__content mobile-shell__outgoing',
    canAnimate: () => phone.matches && state.mode === 'context' && !reducedMotion.matches && !frozen && !document.hidden,
    onUpdate() {},
  });

  const viewportHeight = () => window.visualViewport?.height || innerHeight;
  const isOverlay = () => phone.matches && (state.mode === 'menu' || state.mode === 'search');
  const contextVisible = () => phone.matches && state.mode === 'context' && state.snap !== 'hidden' && !showVideo && !frozen;
  const ownHistory = () => history.state?.mobileShell?.token === token;

  function persist() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ dismissed: state.dismissed, introduced: state.introduced })); } catch { /* Memory state remains usable. */ }
  }
  function apply(event) {
    const before = state;
    state = reduceMobileShell(state, event);
    persist();
    render();
    if (state.unread && !before.unread && phone.matches && !reducedMotion.matches) {
      shake?.cancel();
      shake = contextButton.querySelector('span').animate([
        { transform: 'rotate(0)' }, { transform: 'rotate(-9deg)' }, { transform: 'rotate(7deg)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(0)' },
      ], { duration: 440, easing: 'ease-out' });
    }
  }
  function lockArticle(lock) {
    if (lock && !scrollLock) {
      scrollLock = { overflow: document.documentElement.style.overflow, y: window.scrollY };
      document.documentElement.style.overflow = 'hidden';
      page.inert = true;
    } else if (!lock && scrollLock) {
      const previous = scrollLock;
      scrollLock = null;
      page.inert = false;
      document.documentElement.style.overflow = previous.overflow;
      if (window.scrollY !== previous.y) window.scrollTo({ top: previous.y, behavior: 'instant' });
    }
  }
  function syncViewport() {
    const height = viewportHeight();
    const keyboardInset = Math.max(0, innerHeight - height - (window.visualViewport?.offsetTop || 0));
    root.style.setProperty('--mobile-viewport-height', `${height}px`);
    root.style.setProperty('--mobile-keyboard-inset', `${keyboardInset}px`);
    if (!drag) root.style.setProperty('--mobile-sheet-height', `${mobileSnapHeights(height)[state.snap]}px`);
  }
  function render() {
    root.hidden = !phone.matches;
    root.inert = !phone.matches || frozen;
    root.dataset.mode = state.mode || 'closed';
    root.dataset.snap = state.snap;
    const contentOpen = phone.matches && state.mode === 'context' && state.snap !== 'hidden';
    const overlay = isOverlay();
    const videoVisible = contentOpen && (!context.id || showVideo);
    sheet.inert = !contentOpen || frozen;
    sheet.setAttribute('aria-hidden', String(!contentOpen));
    fabs.hidden = contentOpen || overlay;
    backdrop.hidden = !overlay;
    menu.hidden = !phone.matches || state.mode !== 'menu';
    search.hidden = !phone.matches || state.mode !== 'search';
    for (const button of fabs.querySelectorAll('[data-mobile-mode]')) button.setAttribute('aria-expanded', String(phone.matches && state.mode === button.dataset.mobileMode));
    badge.hidden = !state.unread;
    contextButton.setAttribute('aria-label', state.unread ? 'Новый дополнительный материал. Открыть плашку' : 'Открыть дополнительный материал');
    if (phone.matches && context.id && context.id !== announcedId) {
      liveStatus.textContent = `Дополнительный материал: ${context.title}`;
      announcedId = context.id;
    }
    title.textContent = videoVisible ? 'Китай-город' : context.title;
    title.setAttribute('aria-label', `${title.textContent}. Развернуть плашку`);
    grab.setAttribute('aria-label', state.snap === 'expanded' ? 'Уменьшить плашку' : 'Развернуть плашку');
    cityHost.hidden = !videoVisible;
    pages.hidden = videoVisible || !context.id;
    format.hidden = !contentOpen || !context.id;
    cityToggle.textContent = showVideo ? '← К материалу' : 'Смотреть Китай-город ↗';
    city.setActive(videoVisible && !frozen && phone.matches);
    document.body.classList.toggle('has-mobile-shell', phone.matches);
    document.body.classList.toggle('has-mobile-overlay', overlay);
    lockArticle(overlay);
    syncViewport();
    if (overlay !== lastOverlay) { lastOverlay = overlay; onOverlayChange(overlay); }
    onVisibilityChange(contextVisible());
  }
  function recordHistory(mode) {
    const value = { ...history.state, mobileShell: { token, mode, materialId: context.manual ? context.id : null } };
    if (ownHistory()) history.replaceState(value, '');
    else history.pushState(value, '');
    ownedHistory = true;
    historyMode = mode;
  }
  function restoreButton(mode) {
    if (phone.matches && !frozen) root.querySelector(`[data-mobile-mode="${mode}"]`)?.focus({ preventScroll: true });
  }
  function closeOverlay({ historyBack = true } = {}) {
    const mode = state.mode;
    input.blur();
    apply({ type: 'back' });
    if (historyBack && ownHistory()) history.back();
    if (state.mode === 'context') grab.focus({ preventScroll: true });
    else restoreButton(mode);
  }
  function hideContext() {
    apply({ type: 'hide' });
    onDismissContext();
    if (ownHistory()) history.back();
    restoreButton('context');
  }
  function collapse() {
    if (state.snap === 'preview') { hideContext(); return; }
    apply({ type: 'snap', snap: state.snap === 'expanded' ? 'peek' : 'preview' });
  }
  function expand() {
    if (dragMoved) return;
    apply({ type: 'snap', snap: state.snap === 'expanded' ? 'peek' : state.snap === 'preview' ? 'peek' : 'expanded' });
  }
  function renderSearch() {
    const matches = searchArticles(input.value);
    results.replaceChildren();
    for (const item of matches) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'mobile-search-result';
      link.href = './index.html';
      link.setAttribute('aria-label', `${item.artist} — ${item.title}. Материал готовится, открыть вайт-лист`);
      const cover = document.createElement('img');
      cover.src = item.image;
      cover.alt = '';
      cover.style.objectPosition = item.position;
      const label = document.createElement('p');
      const artist = document.createElement('span');
      artist.textContent = item.artist;
      label.append(artist, ` — ${item.title}`);
      const tag = document.createElement('span');
      tag.className = 'mobile-search-result__tag';
      tag.textContent = 'Скоро';
      link.append(cover, label, tag);
      li.append(link);
      results.append(li);
    }
    searchStatus.textContent = matches.length ? `Материалов: ${matches.length}` : 'Ничего не найдено. Попробуй другое слово.';
    searchStatus.classList.toggle('story-visually-hidden', matches.length > 0);
  }
  function openMode(mode) {
    if (mode === 'context') {
      showVideo = false;
      apply({ type: 'open' });
      recordHistory(mode);
      grab.focus({ preventScroll: true });
      return;
    }
    if (state.mode === mode) { closeOverlay(); return; }
    apply({ type: 'overlay', mode });
    recordHistory(mode);
    if (mode === 'search') {
      renderSearch();
      input.focus({ preventScroll: true });
    } else menu.querySelector('a').focus({ preventScroll: true });
  }
  fabs.addEventListener('click', event => {
    const button = event.target.closest('[data-mobile-mode]');
    if (button) openMode(button.dataset.mobileMode);
  }, options);
  backdrop.addEventListener('click', () => closeOverlay(), options);
  root.querySelector('.mobile-shell__menu-close').addEventListener('click', () => closeOverlay(), options);
  search.querySelector('[data-search-close]').addEventListener('click', () => closeOverlay(), options);
  root.querySelector('.mobile-shell__collapse').addEventListener('click', collapse, options);
  grab.addEventListener('click', expand, options);
  title.addEventListener('click', expand, options);
  input.addEventListener('input', renderSearch, options);
  search.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    renderSearch();
    input.blur();
    results.querySelector('a')?.focus({ preventScroll: true });
  }, options);
  cityToggle.addEventListener('click', () => { showVideo = !showVideo; render(); }, options);
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.target.closest('.mobile-shell__collapse')) return;
    dragMoved = false;
    drag = { id: event.pointerId, startY: event.clientY, lastY: event.clientY, time: performance.now(), lastTime: performance.now(), velocity: 0, snap: state.snap, height: sheet.getBoundingClientRect().height };
  }, options);
  handle.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const now = performance.now();
    const distance = event.clientY - drag.startY;
    dragMoved ||= Math.abs(distance) > 6;
    if (!dragMoved) return;
    if (!handle.hasPointerCapture(event.pointerId)) handle.setPointerCapture(event.pointerId);
    drag.velocity = (event.clientY - drag.lastY) / Math.max(1, now - drag.lastTime);
    drag.lastY = event.clientY;
    drag.lastTime = now;
    root.classList.add('is-dragging');
    root.style.setProperty('--mobile-sheet-height', `${Math.max(0, Math.min(viewportHeight() - 48, drag.height - distance))}px`);
  }, options);
  function finishDrag(event, cancelled = false) {
    if (!drag || drag.id !== event.pointerId) return;
    const previous = drag;
    const height = sheet.getBoundingClientRect().height;
    drag = null;
    root.classList.remove('is-dragging');
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    if (cancelled || !dragMoved) { syncViewport(); return; }
    const velocity = performance.now() - previous.lastTime > 100 ? 0 : previous.velocity;
    const snap = mobileSnapAfterDrag({ snap: previous.snap, height, viewportHeight: viewportHeight(), velocity });
    if (snap === 'hidden') hideContext();
    else apply({ type: 'snap', snap });
    // Suppress the click generated by a completed drag, without blocking the next tap.
    setTimeout(() => { dragMoved = false; }, 0);
  }
  handle.addEventListener('pointerup', finishDrag, options);
  handle.addEventListener('pointercancel', event => finishDrag(event, true), options);
  root.addEventListener('pointerdown', () => { pointerDown = true; }, options);
  for (const type of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(type, () => { pointerDown = false; }, options);
  document.addEventListener('keydown', event => {
    if (!phone.matches || frozen || event.defaultPrevented) return;
    if (event.key === 'Escape') {
      if (isOverlay()) closeOverlay();
      else if (state.mode === 'context') collapse();
      else return;
      event.preventDefault();
    }
    if (event.key !== 'Tab' || !isOverlay()) return;
    const surface = state.mode === 'menu' ? menu : search;
    const controls = [...surface.querySelectorAll('a, button, input')].filter(node => !node.hidden && !node.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }, options);
  window.addEventListener('popstate', () => {
    if (ownHistory()) {
      ownedHistory = true;
      historyMode = history.state.mobileShell.mode;
      if (history.state.mobileShell.materialId) onRestoreContext(history.state.mobileShell.materialId);
      if (historyMode === 'context') apply({ type: 'open' });
      else { apply({ type: 'overlay', mode: historyMode }); renderSearch(); }
    } else if (ownedHistory) {
      ownedHistory = false;
      if (historyMode === 'context') hideContext();
      else if (isOverlay()) closeOverlay({ historyBack: false });
      onDismissContext();
    }
  }, options);
  phone.addEventListener('change', () => {
    if (!phone.matches) {
      input.blur();
      if (isOverlay() || state.mode === 'menu' || state.mode === 'search') state = reduceMobileShell(state, { type: 'back' });
      if (ownHistory()) {
        const { mobileShell, ...rest } = history.state;
        history.replaceState(rest, '');
        ownedHistory = false;
      }
    }
    pager.finish();
    render();
  }, options);
  reducedMotion.addEventListener('change', () => { shake?.cancel(); pager.finish(); }, options);
  window.addEventListener('resize', syncViewport, options);
  window.visualViewport?.addEventListener('resize', syncViewport, options);
  window.visualViewport?.addEventListener('scroll', syncViewport, options);
  render();
  renderSearch();

  return {
    contextHost,
    get active() { return phone.matches; },
    get contextVisible() { return contextVisible(); },
    isInteracting() {
      const selection = window.getSelection();
      return pointerDown || !selection?.isCollapsed && contextHost.contains(selection?.anchorNode);
    },
    setContext(node, details = {}) {
      context = { ...details, id: details.id || null, title: details.title || 'Китай-город' };
      pager.set(node, details);
      if (phone.matches) apply({ type: 'context', id: context.id });
      else render();
    },
    openContext() { openMode('context'); },
    releaseContext() { pager.set(null, { animate: false }); },
    setFrozen(value) { frozen = value; pager.setPaused(value); render(); },
    dispose() {
      controller.abort();
      pager.dispose();
      shake?.cancel();
      city.dispose();
      lockArticle(false);
      document.body.classList.remove('has-mobile-shell', 'has-mobile-overlay');
      root.remove();
    },
  };
}
