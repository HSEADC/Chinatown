import { mountActionButtons } from './components/action-button.js';
import { mountEmailSubscribe } from './email-subscribe.js';

mountActionButtons();

const PROMPT_DELAY_MS = 45_000;
const PROMPT_SHOWN_KEY = 'chinatown:subscribe-prompt-shown';

const intro = document.querySelector('#intro');
const modal = document.querySelector('#subscribe-modal');
const panel = modal.querySelector('[role="dialog"]');
const openButton = document.querySelector('#intro-whitelist');
const closeButton = document.querySelector('#subscribe-close');
const backdrop = modal.querySelector('[data-close-modal]');
const form = document.querySelector('#subscribe-form');
const emailInput = document.querySelector('#subscribe-email');
const submitButton = form.querySelector('[type="submit"]');
const status = document.querySelector('#subscribe-status');
const phone = matchMedia('(max-width: 760px)');

let remainingMs = PROMPT_DELAY_MS;
let visibleSince = null;
let timerId = 0;
let lastFocus = null;
let prompted = false;

try {
  prompted = sessionStorage.getItem(PROMPT_SHOWN_KEY) === 'true';
} catch {
  // Storage can be unavailable in private browsing.
}

function markPrompted() {
  prompted = true;
  window.clearTimeout(timerId);
  timerId = 0;
  visibleSince = null;
  try { sessionStorage.setItem(PROMPT_SHOWN_KEY, 'true'); } catch { /* no storage */ }
}

const isOpen = () => modal.dataset.state === 'open';

function openModal() {
  if (isOpen()) return;
  markPrompted();
  // Reopening during the exit reverses it from the current position and keeps the original return target.
  if (modal.hidden) lastFocus = document.activeElement;
  status.textContent = '';
  emailInput.removeAttribute('aria-invalid');
  modal.classList.remove('is-entering-email');
  modal.inert = false;
  if (modal.hidden) {
    modal.hidden = false;
    // Commit the closed position once so the entry transition has a starting point.
    getComputedStyle(panel).transform;
  }
  modal.dataset.state = 'open';
  panel.scrollTop = 0;
  intro.inert = true;
  (phone.matches ? panel : emailInput).focus({ preventScroll: true });
}

async function finishClose() {
  // Flush styles so the exit transitions exist, then wait for them; reopening changes the state and cancels the hide.
  getComputedStyle(panel).transform;
  await Promise.allSettled(modal.getAnimations({ subtree: true }).map(animation => animation.finished));
  if (modal.dataset.state === 'closing') {
    modal.hidden = true;
    delete modal.dataset.state;
  }
}

function closeModal() {
  if (!isOpen()) return;
  // The leaving dialog stops taking input immediately, then slides out.
  modal.dataset.state = 'closing';
  modal.inert = true;
  modal.classList.remove('is-entering-email');
  intro.inert = false;
  if (lastFocus instanceof HTMLElement && lastFocus.isConnected) {
    lastFocus.focus({ preventScroll: true });
  } else {
    openButton.focus({ preventScroll: true });
  }
  finishClose();
}

function syncInputViewport() {
  if (!isOpen() || !phone.matches || !modal.classList.contains('is-entering-email')) return;
  const viewport = window.visualViewport;
  const height = viewport?.height || innerHeight;
  const bottom = Math.max(0, innerHeight - height - (viewport?.offsetTop || 0));
  modal.style.setProperty('--subscribe-input-height', `${height}px`);
  modal.style.setProperty('--subscribe-input-bottom', `${bottom}px`);
  // Keep the field and submit button together inside this sheet's own scroller.
  if (document.activeElement === emailInput) panel.scrollTop = panel.scrollHeight;
}

function pauseTimer() {
  if (visibleSince === null) return;
  remainingMs -= performance.now() - visibleSince;
  visibleSince = null;
  window.clearTimeout(timerId);
  timerId = 0;
}

function resumeTimer() {
  if (prompted || document.hidden || isOpen() || visibleSince !== null) return;
  visibleSince = performance.now();
  timerId = window.setTimeout(() => {
    visibleSince = null;
    openModal();
  }, Math.max(0, remainingMs));
}

openButton.addEventListener('click', openModal);
closeButton.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseTimer();
  else resumeTimer();
});
window.addEventListener('pagehide', pauseTimer);
window.addEventListener('pageshow', resumeTimer);
modal.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
  }
  if (event.key !== 'Tab') return;
  const focusables = [emailInput, submitButton, closeButton];
  const first = focusables[0];
  const last = focusables.at(-1);
  if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

emailInput.addEventListener('focus', () => {
  if (!phone.matches) return;
  modal.classList.add('is-entering-email');
  syncInputViewport();
});
window.addEventListener('resize', syncInputViewport, { passive: true });
window.visualViewport?.addEventListener('resize', syncInputViewport, { passive: true });
window.visualViewport?.addEventListener('scroll', syncInputViewport, { passive: true });

mountEmailSubscribe(form);

resumeTimer();
