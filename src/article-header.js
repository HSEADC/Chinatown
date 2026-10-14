import { searchSuggestions } from './article-view.js';

const motion = {
  searchDuration: 420,
  trailDuration: 540,
  trailStagger: 44,
  easeOut: 'cubic-bezier(.16, 1, .3, 1)',
};

/** The Figma header, with interruptible search and star-trail transitions. */
export function mountArticleHeader(header, onChange) {
  const page = header.closest('.story-page');
  const brand = header.querySelector('.story-brand');
  const menu = header.querySelector('.story-menu');
  const items = [...menu.querySelectorAll('.story-menu__item')];
  const menuToggle = header.querySelector('.story-menu-toggle');
  const searchToggle = header.querySelector('.story-search-toggle');
  const form = header.querySelector('.story-search');
  const input = form.querySelector('input');
  const results = header.querySelector('.story-search__results');
  const status = results.querySelector('[role="status"]');
  const list = results.querySelector('ul');
  const trail = header.querySelector('.story-header__trail');
  const sections = [...page.querySelectorAll('[data-search-section]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const searchAnimations = new Set();
  const trailAnimations = new Set();
  let searchOpen = false;
  let navOpen = !mobile.matches;
  let wasMobile = mobile.matches;
  let searchRevision = 0;

  function cancelAnimations(group) {
    for (const animation of group) animation.cancel();
    group.clear();
  }

  function animate(node, keyframes, timing, group, finish) {
    const animation = node.animate(keyframes, { fill: 'both', ...timing });
    group.add(animation);
    animation.finished.then(() => {
      group.delete(animation);
      finish?.();
      animation.cancel();
    }, () => group.delete(animation));
    return animation;
  }

  function syncNavigation() {
    const expanded = !searchOpen && navOpen;
    header.classList.toggle('is-nav-open', mobile.matches && navOpen && !searchOpen);
    header.dataset.nodeId = searchOpen ? '269:409' : '269:423';
    menu.inert = !expanded;
    brand.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-expanded', String(expanded));
    menuToggle.setAttribute('aria-label', expanded ? 'Закрыть навигацию' : 'Открыть навигацию');
    menuToggle.querySelector('.story-menu-toggle__open').hidden = expanded;
    menuToggle.querySelector('.story-menu-toggle__close').hidden = !expanded;
    trail.style.height = `${header.querySelector('.story-header__bar').offsetHeight}px`;
    onChange();
  }

  function renderSearch() {
    const query = input.value.trim().toLocaleLowerCase('ru');
    list.replaceChildren();
    status.hidden = !query;
    results.classList.toggle('has-query', Boolean(query));
    if (!query) {
      for (const label of searchSuggestions) {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.searchSuggestion = '';
        button.textContent = label;
        item.append(button);
        list.append(item);
      }
      return;
    }
    const matches = sections.filter(section => section.textContent.toLocaleLowerCase('ru').includes(query));
    status.textContent = matches.length ? `Найдено разделов: ${matches.length}` : 'Ничего не найдено. Попробуй другое слово.';
    for (const section of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${section.id}`;
      link.textContent = section.querySelector('h2, h3').textContent;
      item.append(link);
      list.append(item);
    }
  }

  function setSearch(open, { focus = false, animated = true } = {}) {
    if (open === searchOpen && !header.classList.contains('is-search-animating')) {
      if (open && focus) input.focus({ preventScroll: true });
      return;
    }
    const wasVisible = searchOpen || header.classList.contains('is-search-animating');
    const currentStyle = getComputedStyle(form);
    const currentTransform = currentStyle.transform;
    const currentOpacity = currentStyle.opacity;
    const revision = ++searchRevision;
    cancelAnimations(searchAnimations);
    searchOpen = open;
    if (open) navOpen = false;
    else if (!mobile.matches) navOpen = true;
    header.classList.toggle('is-search-open', open);
    form.inert = !open;
    results.inert = !open;
    searchToggle.inert = open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      cancelAnimations(trailAnimations);
      trail.replaceChildren();
      results.hidden = false;
      renderSearch();
    }
    syncNavigation();
    const shouldAnimate = animated && !reducedMotion.matches;
    header.classList.toggle('is-search-animating', shouldAnimate);
    if (!shouldAnimate) {
      results.hidden = !open;
      if (focus) (open ? input : searchToggle).focus({ preventScroll: true });
      return;
    }
    // The icon and text travel together from the right edge. The background's
    // shorter opacity transition lives on the form's ::before surface in CSS.
    const distance = innerWidth - form.offsetLeft;
    const start = wasVisible
      ? { transform: currentTransform, opacity: currentOpacity }
      : { transform: `translateX(${distance}px)`, opacity: 0 };
    animate(form, [start, {
      transform: open ? 'translateX(0)' : `translateX(${distance}px)`,
      opacity: open ? 1 : 0,
    }], { duration: open ? motion.searchDuration : 280, easing: motion.easeOut }, searchAnimations, () => {
      if (revision !== searchRevision) return;
      header.classList.remove('is-search-animating');
    });
    animate(results, open ? [
      { opacity: 0, transform: 'translateY(-8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ] : [
      { opacity: getComputedStyle(results).opacity, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-8px)' },
    ], { duration: open ? 180 : 90, delay: open ? 100 : 0, easing: motion.easeOut }, searchAnimations, () => {
      if (revision === searchRevision && !searchOpen) results.hidden = true;
    });
    if (focus) (open ? input : searchToggle).focus({ preventScroll: true });
  }

  function replayTrail() {
    const visible = !searchOpen && navOpen;
    const outgoing = visible ? items.map(node => ({
      node,
      rect: node.getBoundingClientRect(),
      opacity: getComputedStyle(node).opacity,
    })) : [];
    cancelAnimations(trailAnimations);
    trail.replaceChildren();
    setSearch(false);
    navOpen = true;
    syncNavigation();
    if (reducedMotion.matches) return;
    const headerRect = header.getBoundingClientRect();
    const starRect = brand.getBoundingClientRect();
    const origin = { x: starRect.left + starRect.width / 2, y: starRect.top + starRect.height / 2 };
    // Clones carry the outgoing trail; the real, accessible navigation is the
    // new wave born at the star. Both waves can be replaced on the next click.
    for (const [index, snapshot] of outgoing.entries()) {
      const ghost = document.createElement('span');
      ghost.className = 'story-trail-ghost';
      ghost.textContent = snapshot.node.textContent;
      const style = getComputedStyle(snapshot.node);
      Object.assign(ghost.style, {
        left: `${snapshot.rect.left - headerRect.left}px`,
        top: `${snapshot.rect.top - headerRect.top}px`,
        width: `${snapshot.rect.width}px`,
        height: `${snapshot.rect.height}px`,
        font: style.font,
        letterSpacing: style.letterSpacing,
      });
      trail.append(ghost);
      animate(ghost, [
        { transform: 'translateX(0)', opacity: snapshot.opacity },
        { transform: `translateX(${innerWidth - snapshot.rect.left + 64}px)`, opacity: 0 },
      ], { duration: 300, delay: index * 22, easing: 'cubic-bezier(.4, 0, 1, 1)' }, trailAnimations, () => ghost.remove());
    }
    for (const [index, node] of items.entries()) {
      const rect = node.getBoundingClientRect();
      const x = origin.x - rect.left;
      const y = origin.y - rect.top - rect.height / 2;
      animate(node, [
        { transform: `translate(${x}px, ${y}px)`, opacity: 0, offset: 0 },
        { opacity: .5, offset: .12 },
        { transform: 'translate(0, 0)', opacity: 1, offset: 1 },
      ], { duration: motion.trailDuration, delay: index * motion.trailStagger, easing: motion.easeOut }, trailAnimations);
    }
    animate(brand, [
      { transform: 'rotate(0) scale(1)' },
      { transform: 'rotate(-12deg) scale(1.07)', offset: .3 },
      { transform: 'rotate(0) scale(1)' },
    ], { duration: 360, easing: motion.easeOut }, trailAnimations);
  }

  brand.addEventListener('click', replayTrail, options);
  menuToggle.addEventListener('click', () => {
    if (navOpen && !searchOpen) {
      cancelAnimations(trailAnimations);
      trail.replaceChildren();
      if (mobile.matches) {
        navOpen = false;
        syncNavigation();
      } else setSearch(true, { focus: true });
    } else replayTrail();
  }, options);
  searchToggle.addEventListener('click', () => setSearch(!searchOpen, { focus: true }), options);
  input.addEventListener('input', renderSearch, options);
  form.addEventListener('submit', event => {
    event.preventDefault();
    renderSearch();
    list.querySelector('a')?.focus();
  }, options);
  results.addEventListener('click', event => {
    const suggestion = event.target.closest('[data-search-suggestion]');
    if (!suggestion) return;
    input.value = suggestion.textContent;
    renderSearch();
    input.focus({ preventScroll: true });
  }, options);

  function close() {
    setSearch(false);
    navOpen = !mobile.matches;
    syncNavigation();
  }
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) close();
  }, options);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (searchOpen) { setSearch(false, { focus: true }); event.preventDefault(); }
    else if (navOpen && mobile.matches) { close(); brand.focus(); event.preventDefault(); }
  }, options);
  function resetMotion() {
    if (wasMobile !== mobile.matches) {
      wasMobile = mobile.matches;
      if (!searchOpen) navOpen = !mobile.matches;
    }
    cancelAnimations(trailAnimations);
    trail.replaceChildren();
    cancelAnimations(searchAnimations);
    ++searchRevision;
    header.classList.remove('is-search-animating');
    results.hidden = !searchOpen;
    syncNavigation();
  }
  window.addEventListener('resize', resetMotion, options);
  reducedMotion.addEventListener('change', resetMotion, options);
  syncNavigation();
  return {
    close,
    dispose() {
      controller.abort();
      cancelAnimations(searchAnimations);
      cancelAnimations(trailAnimations);
      trail.replaceChildren();
    },
  };
}
