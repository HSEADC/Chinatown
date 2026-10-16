import test from 'node:test';
import assert from 'node:assert/strict';
import { createMusicController } from '../src/music-controller.js';

class TestAudio extends EventTarget {
  paused = true;
  currentTime = 0;
  duration = 214;
  volume = 1;
  playCalls = 0;
  play() { this.playCalls += 1; this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve(); }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }
  load() {}
  removeAttribute() { this.src = ''; }
}

test('mood queue advances on track end and stops at the end of the selection', async () => {
  const audio = new TestAudio();
  const player = createMusicController({ audio });
  player.selectMood('move');
  await Promise.resolve();
  assert.equal(player.state.track.id, 'cipher');
  audio.dispatchEvent(new Event('ended'));
  await Promise.resolve();
  assert.equal(player.state.track.id, 'district-four');
  audio.dispatchEvent(new Event('ended'));
  assert.equal(player.state.playing, false);
  assert.equal(audio.playCalls, 2);
  player.setContinue(false);
  player.selectTrack('cipher');
  audio.dispatchEvent(new Event('ended'));
  assert.equal(player.state.track.id, 'cipher');
  assert.equal(player.state.playing, false);
});

test('restoring a session never auto-plays and seek stays inside the recording', () => {
  const audio = new TestAudio();
  const storage = { getItem: () => JSON.stringify({ id: 'dream-culture', mood: 'night', time: 75, volume: 0.4, continueQueue: false }), setItem() {} };
  const player = createMusicController({ audio, storage });
  assert.equal(audio.playCalls, 0);
  assert.equal(player.state.time, 75);
  assert.equal(player.state.volume, 0.4);
  assert.equal(player.state.continueQueue, false);
  audio.dispatchEvent(new Event('loadedmetadata'));
  assert.equal(audio.currentTime, 75);
  player.seek(-30);
  assert.equal(audio.currentTime, 0);
  player.seek(1000);
  assert.equal(audio.currentTime, 214);
});

test('damaged storage and unsupported track ids cannot inject audio URLs', () => {
  const audio = new TestAudio();
  const player = createMusicController({ audio, storage: { getItem() { return '{broken'; }, setItem() { throw new Error('disabled'); } } });
  player.selectTrack('https://example.com/unlicensed.mp3');
  player.selectMood('unknown');
  assert.equal(player.state.track, null);
  assert.equal(audio.playCalls, 0);
  player.selectTrack('dream-culture');
  assert.match(audio.src, /assets\/audio\/dream-culture\.mp3$/);
  player.close();
  assert.equal(audio.paused, true);
  assert.equal(player.state.track, null);
});

test('closing during a pending play request ignores its later rejection', async () => {
  const audio = new TestAudio();
  let rejectPlay;
  audio.play = () => new Promise((resolve, reject) => { rejectPlay = reject; });
  const player = createMusicController({ audio });
  player.selectTrack('cipher');
  player.close();
  rejectPlay(new Error('Old playback failed'));
  await Promise.resolve();
  assert.equal(player.state.track, null);
  assert.equal(player.state.error, '');
});
