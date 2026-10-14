import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quoteScrollState } from '../src/quote-scroll-state.js';

const scene = { height: 1000, travel: 200, runway: 480, exit: 680 };

test('quote background is absent on approach and fully visible at the reading position', () => {
  assert.equal(quoteScrollState(-600, scene).mediaOpacity, 0);
  assert.equal(quoteScrollState(-450, scene).mediaOpacity, 0);
  assert.equal(quoteScrollState(-225, scene).mediaOpacity, .5);
  assert.equal(quoteScrollState(0, scene).mediaOpacity, 1);
});

test('the last phrase reaches the reading position before the background fades', () => {
  assert.equal(quoteScrollState(140, scene).travel, 0);
  assert.equal(quoteScrollState(340, scene).travel, 200);
  assert.equal(quoteScrollState(340, scene).mediaOpacity, 1);
  assert.equal(quoteScrollState(480, scene).mediaOpacity, 1);
  assert.equal(quoteScrollState(820, scene).mediaOpacity, .5);
  assert.equal(quoteScrollState(1160, scene).mediaOpacity, 0);
  assert.equal(quoteScrollState(1600, scene).mediaOpacity, 0);
});

test('lyrics clear before the following article is fully revealed, including reverse scroll', () => {
  const forward = [-600, -225, 0, 240, 480, 820, 1160].map(distance => quoteScrollState(distance, scene));
  const backward = [1160, 820, 480, 240, 0, -225, -600].map(distance => quoteScrollState(distance, scene)).reverse();
  assert.deepEqual(backward, forward);
  assert.equal(quoteScrollState(820, scene).lyricsOpacity, 0);
  for (const state of forward) {
    assert.ok(state.mediaOpacity >= 0 && state.mediaOpacity <= 1);
    assert.ok(state.lyricsOpacity >= 0 && state.lyricsOpacity <= 1);
  }
});
