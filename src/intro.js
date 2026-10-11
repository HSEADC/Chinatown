import { mountVideoSphere } from './video-sphere.js';
import { mountHeadlineGlitch } from './headline-glitch.js';

const intro = document.querySelector('#intro');
const sphere = document.querySelector('#intro-sphere');
const headline = document.querySelector('#intro-headline');
const siteLink = headline.querySelector('.intro__site-link');
const copyStatus = document.querySelector('#intro-copy-status');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const pageBelow = [
  document.querySelector('.site-header'),
  document.querySelector('#app'),
  document.querySelector('#player'),
];

mountVideoSphere(intro);
mountHeadlineGlitch(headline);
document.body.classList.add('intro-active');
for (const item of pageBelow) if (item) item.inert = true;

let pointerStart = null;
let pointerMoved = false;
let copyPending = false;

function isOverHeadline(event) {
  const rect = headline.getBoundingClientRect();
  return event.clientX >= rect.left && event.clientX <= rect.right
    && event.clientY >= rect.top && event.clientY <= rect.bottom;
}

function updateCopyHover(event) {
  intro.classList.toggle('is-copy-hovered', finePointer.matches && event.pointerType !== 'touch'
    && !sphere.classList.contains('is-dragging')
    && !event.target.closest('button, .intro__about') && isOverHeadline(event));
}

async function copySiteUrl() {
  if (copyPending) return;
  copyPending = true;
  try {
    await navigator.clipboard.writeText(siteLink.href);
    copyStatus.textContent = '';
  } catch {
    copyStatus.textContent = 'Не удалось скопировать ссылку.';
  } finally {
    copyPending = false;
  }
}

function revealSphere() {
  intro.classList.add('intro--interacted');
}

sphere.addEventListener('pointerdown', revealSphere);
sphere.addEventListener('wheel', revealSphere, { passive: true });
sphere.addEventListener('keydown', revealSphere);
intro.addEventListener('pointermove', (event) => {
  if (pointerStart?.id === event.pointerId) {
    pointerMoved ||= Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 6;
  }
  updateCopyHover(event);
});
intro.addEventListener('pointerdown', (event) => {
  updateCopyHover(event);
  if (event.pointerType === 'touch' || event.button !== 0) return;
  pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  pointerMoved = false;
});
intro.addEventListener('pointerup', (event) => {
  updateCopyHover(event);
  if (event.pointerId !== pointerStart?.id) return;
  pointerStart = null;
});
intro.addEventListener('pointercancel', () => {
  pointerStart = null;
  pointerMoved = true;
  intro.classList.remove('is-copy-hovered');
});
intro.addEventListener('pointerleave', () => intro.classList.remove('is-copy-hovered'));
intro.addEventListener('click', (event) => {
  if (!finePointer.matches || event.detail === 0 || event.button !== 0
    || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    || event.target.closest('button, a') || pointerMoved || !isOverHeadline(event)) return;
  event.preventDefault();
  copySiteUrl();
});
intro.addEventListener('dragstart', (event) => event.preventDefault());
siteLink.addEventListener('keydown', (event) => {
  if (event.key !== ' ' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  if (!event.repeat) copySiteUrl();
});
