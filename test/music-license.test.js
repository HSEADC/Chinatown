import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { musicTracks } from '../src/music-library.js';

test('every playable recording matches its verified license manifest and original bytes', async () => {
  const manifest = JSON.parse(await readFile(new URL('../assets/audio/manifest.json', import.meta.url), 'utf8'));
  for (const track of musicTracks) {
    const record = manifest.find((item) => item.id === track.id);
    assert.ok(record, `Missing rights evidence for ${track.id}`);
    assert.equal(record.title, track.title);
    assert.equal(record.isrc, track.isrc);
    assert.equal(record.license, 'CC BY 4.0');
    assert.equal(record.sourceUrl, track.sourceUrl);
    assert.equal(record.licenseUrl, track.licenseUrl);
    const bytes = await readFile(new URL(track.src));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256);
    assert.equal(bytes.length, record.bytes);
  }
});
