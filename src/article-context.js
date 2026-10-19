import { articleContexts } from './article-context-data.js';
import { contextAtPosition, selectContextState } from './article-context-state.js';

/** Enhance the existing static nodes: each material has one DOM copy in every layout. */
export function mountArticleContext(page, sceneRail) {
  const data = articleContexts[page.dataset.articleId];
  if (!data || !sceneRail) return { setSuspended() {}, dispose() {} };
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const wide = matchMedia('(min-width: 1200px)');
  const refs = [...page.querySelectorAll('[data-context-ref]')];
  const materials = new Map(data.materials.map(item => [item.id, { ...item, node: page.querySelector(`[data-context-material="${item.id}"]`) }]).filter(([, item]) => item.node));
  const next = page.querySelector('[data-context-next]');
  const nodes = [...materials.values()].map(item => item.node).filter(Boolean).concat(next ? [next] : []);
  const homes = new Map(nodes.map(node => {
    const marker = document.createComment(`context: ${node.id || 'next'}`);
    node.before(marker);
    return [node, marker];
  }));
  const end = page.querySelector('[data-article-end]');
  const chapters = data.chapters.map(chapter => ({ ...chapter, node: page.querySelector(`#${chapter.id}`) })).filter(chapter => chapter.node);
  const dialog = document.createElement('dialog');
  dialog.className = 'article-context-screen';
  dialog.innerHTML = '<button class="article-context-screen__back" type="button">← К статье</button><div class="article-context-screen__content"></div>';
  document.body.append(dialog);
  const screenHost = dialog.querySelector('.article-context-screen__content');
  const token = crypto.randomUUID();
  let manual = null;
  let chapterId = null;
  let displayedState = { type: 'video' };
  let placement = '';
  let frame = 0;
  let hashFrame = 0;
  let suspended = false;
  let pointerDown = false;
  let scrollLock = null;

  function ownHistory() { return history.state?.articleContext?.token === token; }
  function restoreFocus(trigger) {
    const target = trigger?.isConnected ? trigger : page.querySelector('#article-content');
    target?.focus({ preventScroll: true });
  }
  function restoreNodes() {
    for (const [node, marker] of homes) {
      if (marker.nextSibling !== node) marker.after(node);
      node.hidden = true;
    }
  }
  function closeScreen() {
    if (!dialog.open) return;
    const y = scrollLock?.y ?? window.scrollY;
    dialog.close();
    document.documentElement.style.overflow = scrollLock?.overflow || '';
    document.body.classList.remove('has-article-context-screen');
    scrollLock = null;
    // Native dialog restoration must not bring an offscreen opener into view.
    if (window.scrollY !== y) window.scrollTo({ top: y, behavior: 'instant' });
  }
  function updateRefs() {
    for (const ref of refs) {
      const item = materials.get(ref.dataset.contextRef);
      if (!item) continue;
      const expanded = manual?.id === item?.id;
      ref.setAttribute('aria-expanded', String(expanded));
      ref.setAttribute('aria-controls', item.id);
      if (!wide.matches && item.mobile === 'screen') ref.setAttribute('aria-haspopup', 'dialog');
      else ref.removeAttribute('aria-haspopup');
    }
  }
  function isInteracting() {
    const selection = window.getSelection();
    return pointerDown || sceneRail.contextHost.contains(document.activeElement)
      || !selection?.isCollapsed && sceneRail.contextHost.contains(selection?.anchorNode);
  }

  function render() {
    frame = 0;
    if (controller.signal.aborted) return;
    // Hiding the header must not move the reading line across a chapter boundary.
    const top = parseFloat(getComputedStyle(document.body).getPropertyValue('--media-header-height')) || 0;
    const readingY = window.scrollY + top + (innerHeight - top) / 3;
    chapterId = contextAtPosition(chapters.map((chapter, index) => {
      const endNode = chapters[index + 1]?.node || end;
      return {
        id: chapter.id,
        start: chapter.node.getBoundingClientRect().top + window.scrollY,
        end: endNode ? endNode.getBoundingClientRect().top + window.scrollY : Infinity,
      };
    }), readingY, chapterId);
    const automaticId = chapters.find(chapter => chapter.id === chapterId)?.materialId || null;
    const endTop = end?.getBoundingClientRect().top;
    const remainingScroll = document.documentElement.scrollHeight - innerHeight - window.scrollY;
    const endVisible = !!end && (endTop + window.scrollY <= readingY
      || endTop < innerHeight && remainingScroll <= (displayedState.type === 'next' ? 48 : 24));
    const interactionId = wide.matches && !manual && isInteracting()
      ? displayedState.id || (displayedState.type === 'next' ? 'next' : null) : null;
    const state = selectContextState({ manualId: manual?.id, interactionId, automaticId, endVisible, hasNext: !!next });
    updateRefs();
    sceneRail.closeButton.hidden = !manual;
    const screen = !wide.matches && !suspended && manual && materials.get(manual.id)?.mobile === 'screen';
    const id = state.type === 'next' ? 'next' : state.id || 'video';
    const key = wide.matches ? `rail:${id}` : screen ? `screen:${manual.id}` : `flow:${manual?.id || ''}:${refs.indexOf(manual?.trigger)}`;
    displayedState = state;
    if (key === placement) return;
    placement = key;
    const focused = document.activeElement;
    closeScreen();
    restoreNodes();
    if (wide.matches) {
      const node = state.type === 'next' ? next : materials.get(state.id)?.node;
      if (node) {
        node.hidden = false;
        sceneRail.setContext(node, { manual: !!manual });
        if (node.contains(focused)) focused.focus({ preventScroll: true });
      } else sceneRail.setContext(null);
      return;
    }
    sceneRail.setContext(null);
    for (const item of materials.values()) {
      item.node.hidden = !(item.mobile === 'inline' || item.kind === 'footnote' && manual?.id === item.id);
      if (item.kind === 'footnote' && manual?.id === item.id) manual.trigger?.closest('p')?.after(item.node);
    }
    if (next) next.hidden = false;
    if (!screen && !focused.hidden && nodes.some(node => !node.hidden && node.contains(focused))) focused.focus({ preventScroll: true });
    if (screen) {
      const item = materials.get(manual.id);
      item.node.hidden = false;
      screenHost.replaceChildren(item.node);
      dialog.setAttribute('aria-labelledby', `${item.id}-title`);
      scrollLock = { y: window.scrollY, overflow: document.documentElement.style.overflow };
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('has-article-context-screen');
      dialog.showModal();
      dialog.scrollTop = 0;
      dialog.querySelector('button').focus({ preventScroll: true });
      if (!ownHistory()) history.pushState({ ...history.state, articleContext: { token, articleId: data.articleId, materialId: item.id } }, '');
    }
  }
  function schedule() { if (!frame && !controller.signal.aborted) frame = requestAnimationFrame(render); }
  function closeImmediate({ focus = true } = {}) {
    const trigger = manual?.trigger;
    manual = null;
    if (focus) restoreFocus(trigger);
    render();
  }
  function requestClose() {
    if (!manual) return;
    if (ownHistory()) history.back();
    else closeImmediate();
  }
  function open(id, trigger) {
    const item = materials.get(id);
    if (!item) return;
    if (!wide.matches && item.kind === 'footnote' && manual?.id === id && manual.trigger === trigger) { requestClose(); return; }
    manual = { id, trigger };
    if (ownHistory()) history.replaceState({ ...history.state, articleContext: { token, articleId: data.articleId, materialId: id } }, '');
    render();
    if (wide.matches) item.node.focus({ preventScroll: true });
  }
  function followHash() {
    const hash = location.hash;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { schedule(); return; }
    if (!materials.has(id)) { schedule(); return; }
    const trigger = refs.find(ref => ref.dataset.contextRef === id);
    // The quote scene measures after fonts settle. Resolve the article anchor
    // after that layout, before moving the target into the fixed rail/dialog.
    document.fonts.ready.then(() => {
      if (controller.signal.aborted) return;
      cancelAnimationFrame(hashFrame);
      hashFrame = requestAnimationFrame(() => {
        hashFrame = requestAnimationFrame(() => {
          if (controller.signal.aborted || location.hash !== hash) return;
          trigger?.scrollIntoView({ block: 'center', behavior: 'instant' });
          if (manual?.id !== id) open(id, trigger);
          else render();
        });
      });
    });
  }

  page.classList.add('has-article-context');
  page.addEventListener('click', event => {
    const ref = event.target.closest('[data-context-ref]');
    if (!ref || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    open(ref.dataset.contextRef, ref);
  }, options);
  sceneRail.closeButton.addEventListener('click', requestClose, options);
  dialog.querySelector('button').addEventListener('click', requestClose, options);
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(); }, options);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && manual && !suspended && !dialog.open && !event.defaultPrevented) {
      event.preventDefault();
      requestClose();
    }
  }, options);
  window.addEventListener('popstate', () => {
    if (ownHistory()) {
      const id = history.state.articleContext.materialId;
      if (materials.has(id)) { manual = { id, trigger: refs.find(ref => ref.dataset.contextRef === id) }; render(); }
    } else if (manual) closeImmediate();
  }, options);
  window.addEventListener('scroll', schedule, { ...options, passive: true });
  window.addEventListener('resize', schedule, options);
  window.addEventListener('hashchange', followHash, options);
  window.addEventListener('pageshow', schedule, options);
  wide.addEventListener('change', schedule, options);
  page.addEventListener('load', schedule, { ...options, capture: true });
  sceneRail.rail.addEventListener('focusin', schedule, options);
  sceneRail.rail.addEventListener('focusout', schedule, options);
  sceneRail.contextHost.addEventListener('pointerdown', () => { pointerDown = true; }, options);
  window.addEventListener('pointerup', () => { pointerDown = false; schedule(); }, options);
  window.addEventListener('pointercancel', () => { pointerDown = false; schedule(); }, options);
  window.addEventListener('blur', () => { pointerDown = false; schedule(); }, options);
  document.addEventListener('selectionchange', schedule, options);
  const observer = new ResizeObserver(schedule);
  observer.observe(page);
  document.fonts.ready.then(schedule);
  render();
  // A direct fallback anchor should also open the enhanced explanation.
  followHash();

  return {
    setSuspended(value) {
      suspended = value;
      sceneRail.setSuspended(value);
      render();
    },
    dispose() {
      controller.abort();
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelAnimationFrame(hashFrame);
      closeScreen();
      restoreNodes();
      for (const node of nodes) node.hidden = false;
      for (const marker of homes.values()) marker.remove();
      sceneRail.setContext(null);
      sceneRail.setSuspended(false);
      dialog.remove();
      page.classList.remove('has-article-context');
      for (const ref of refs) for (const attr of ['aria-expanded', 'aria-controls', 'aria-haspopup']) ref.removeAttribute(attr);
    },
  };
}
