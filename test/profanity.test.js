import test from 'node:test';
import assert from 'node:assert/strict';
import { maskProfanity } from '../scripts/profanity.mjs';
import { scanServedFiles } from '../scripts/mask-profanity.mjs';

test('mat is masked with asterisks, the rest of the word stays readable', () => {
  assert.equal(maskProfanity('Так похуй'), 'Так пох*й');
  assert.equal(maskProfanity('ТАК ПОХУЙ'), 'ТАК ПОХ*Й');
  assert.equal(maskProfanity('Разбить бы ебасос твоему новому уёбку'), 'Разбить бы е*асос твоему новому уё*ку');
  assert.equal(maskProfanity('посылал нахуй работу'), 'посылал нах*й работу');
  assert.equal(maskProfanity('попиздаче, блядь'), 'поп*здаче, бл*дь');
});

test('ordinary words and links are left alone', () => {
  const clean = 'небо хлеб себе тебя требование употребляя бляха мандат мудрый хулиган страхуй хуже побег вебинар отъезд съёмка шалава сотку';
  assert.equal(maskProfanity(clean), clean);
  const link = 'https://www.shazam.com/ru-ru/song/1802942825/так-похуй';
  assert.equal(maskProfanity(link), link);
});

test('served pages, scripts and docs contain no unmasked mat', async () => {
  const hits = await scanServedFiles();
  assert.deepEqual(hits.map(hit => `${hit.file}:${hit.line} ${hit.word}`), [], 'run npm run mat:mask; Latin ids have to be renamed by hand');
});
