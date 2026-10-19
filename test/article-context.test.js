import test from 'node:test';
import assert from 'node:assert/strict';
import { contextAtPosition, selectContextState } from '../src/article-context-state.js';
import { nextArticleView, contextMaterialView } from '../src/article-context-view.js';
import { madk1dContext } from '../src/article-context-data.js';

const ranges = [{ id: 'artist', start: 100, end: 400 }, { id: 'note', start: 700, end: 900 }];

test('reading line follows explicit ranges, gaps, fast jumps and reverse scrolling', () => {
  let previous = null;
  const positions = [0, 150, 350, 500, 800, 1200, 750, 550, 200, 0];
  assert.deepEqual(positions.map(y => previous = contextAtPosition(ranges, y, previous)), [null, 'artist', 'artist', null, 'note', null, 'note', null, 'artist', null]);
  assert.equal(contextAtPosition(ranges, 850), 'note', 'opening directly in the middle selects the current range');
});

test('a 24 pixel dead band prevents boundary flicker in both directions', () => {
  assert.equal(contextAtPosition(ranges, 410, 'artist'), 'artist');
  assert.equal(contextAtPosition(ranges, 423, 'artist'), 'artist');
  assert.equal(contextAtPosition(ranges, 425, 'artist'), null);
  assert.equal(contextAtPosition(ranges, 90, 'artist'), 'artist');
  assert.equal(contextAtPosition(ranges, 75, 'artist'), null);
  assert.equal(contextAtPosition(ranges, 690), null);
  assert.equal(contextAtPosition(ranges, 710), 'note');
});

test('a layout change remeasures ranges and overlap priority follows editorial order', () => {
  assert.equal(contextAtPosition([{ id: 'first', start: 0, end: 100 }, { id: 'second', start: 50, end: 200 }], 75), 'first');
  assert.equal(contextAtPosition([{ id: 'artist', start: 500, end: 800 }], 200, 'artist'), null);
  assert.equal(contextAtPosition([], 200, 'removed'), null);
});

test('manual context overrides ranges, interaction and the article end until closed', () => {
  const state = { automaticId: 'note', endVisible: true, hasNext: true, interactionId: 'artist', manualId: 'footnote-1' };
  assert.deepEqual(selectContextState(state), { type: 'material', id: 'footnote-1', manual: true });
  assert.deepEqual(selectContextState({ ...state, manualId: 'other-note' }), { type: 'material', id: 'other-note', manual: true });
  assert.deepEqual(selectContextState({ ...state, manualId: null, interactionId: null }), { type: 'next' });
  assert.deepEqual(selectContextState({ ...state, manualId: null, interactionId: null, endVisible: false }), { type: 'material', id: 'note', manual: false });
});

test('interaction holds automatic material until blur or selection ends, then catches up immediately', () => {
  assert.deepEqual(selectContextState({ interactionId: 'artist', automaticId: 'note', endVisible: true, hasNext: true }), { type: 'material', id: 'artist', manual: false });
  assert.deepEqual(selectContextState({ interactionId: 'next' }), { type: 'next' });
  assert.deepEqual(selectContextState({ automaticId: 'note' }), { type: 'material', id: 'note', manual: false });
  assert.deepEqual(selectContextState({ endVisible: true, hasNext: false }), { type: 'video' });
  assert.deepEqual(selectContextState(), { type: 'video' });
});

test('the next story renders a real published link or a plain upcoming announcement', () => {
  const upcoming = nextArticleView(madk1dContext.next);
  assert(!/<a[\s>]/.test(upcoming) && !upcoming.includes('<button') && !upcoming.includes('→'));
  assert(upcoming.includes('Скоро'));
  const published = nextArticleView({ status: 'published', title: 'О нас', description: 'Знакомство с редакцией', href: './about.html' });
  assert(published.includes('href="./about.html"'));
  assert(!published.includes('Скоро'));
  assert.equal(nextArticleView(null), '');
  assert.equal(nextArticleView({ status: 'published', href: '' }), '');
  assert.equal(nextArticleView({ status: 'published', href: 'javascript:alert(1)' }), '');
});

test('editorial material supports several paragraphs, source links, image credit and safe text', () => {
  const html = contextMaterialView({ id: 'test', kind: 'card', title: '<Имя>', paragraphs: ['Первый абзац', 'Второй абзац'], image: { src: './photo.jpg', alt: 'Фото', width: 100, height: 100, credit: 'Автор' }, sources: [{ label: 'Источник', href: 'https://example.com/?a=1&b=2' }] });
  assert(html.includes('&lt;Имя&gt;'));
  assert(html.includes('<p>Первый абзац</p><p>Второй абзац</p>'));
  assert(html.includes('<figcaption>Автор</figcaption>'));
  assert(html.includes('href="https://example.com/?a=1&amp;b=2"'));
});
