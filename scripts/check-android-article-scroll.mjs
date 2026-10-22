// Native Android regression. Open the article in the browser/custom tab first,
// forward its DevTools socket, and set ANDROID_CDP_URL to that endpoint.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.connectOverCDP(process.env.ANDROID_CDP_URL || 'http://localhost:9224');
const adb = args => execFileSync(process.env.ADB_EXECUTABLE || 'adb', [...(process.env.ANDROID_SERIAL ? ['-s', process.env.ANDROID_SERIAL] : []), ...args], { encoding: 'utf8' }).trim();
const output = new URL('../deliverables/android-article-scroll/', import.meta.url);
await mkdir(output, { recursive: true });
const context = browser.contexts()[0];
const page = context.pages().find(page => page.url().includes('article.html')) || context.pages()[0];
assert(page, 'Open the article in the Android browser before running the check');
const size = adb(['shell', 'wm', 'size']).match(/Physical size: (\d+)x(\d+)/);
assert(size, 'ADB must report a screen size');
const width = Number(size[1]);
const height = Number(size[2]);
const errors = [];
const swipes = [];
page.on('pageerror', error => errors.push(error.message));
const read = () => page.evaluate(() => ({
  y: scrollY, height: innerHeight, visualHeight: visualViewport.height,
  rootOverflowY: getComputedStyle(document.documentElement).overflowY,
  bodyOverflow: getComputedStyle(document.body).overflow,
  touchAction: getComputedStyle(document.querySelector('#media-content')).touchAction,
  coverTop: document.querySelector('.story-cover').getBoundingClientRect().top,
}));

async function swipe(direction) {
  const before = await read();
  const start = direction === 'forward' ? .72 : .28;
  const end = direction === 'forward' ? .28 : .72;
  adb(['shell', 'input', 'swipe', String(Math.round(width / 2)), String(Math.round(height * start)), String(Math.round(width / 2)), String(Math.round(height * end)), '450']);
  await page.waitForTimeout(800);
  const after = await read();
  const delta = after.y - before.y;
  assert(direction === 'forward' ? delta > 40 : delta < -40, `Android ${direction} swipe moved the article only ${delta}px`);
  swipes.push({ direction, before, after });
}

try {
  await page.goto(new URL('article.html?dev=0', process.env.MEDIA_TEST_URL || 'http://localhost:4182/').href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  const initial = await read();
  assert.equal(initial.y, 0);
  assert.equal(initial.rootOverflowY, 'auto');
  assert.equal(initial.bodyOverflow, 'visible');
  await swipe('forward');
  assert((await read()).coverTop < -40, 'The cover itself must move, not just the browser toolbar');
  await page.screenshot({ path: fileURLToPath(new URL('cover-after-native-swipe.png', output)) });
  await swipe('backward');
  // Exercise a second gesture after the native toolbar changes viewport height.
  await swipe('forward');
  const collapse = page.locator('.mobile-shell__collapse');
  if (await collapse.isVisible()) await collapse.click();
  for (const mode of ['menu', 'search']) {
    await page.locator(`[data-mobile-mode="${mode}"]`).click();
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden');
    await page.goBack();
    await page.waitForTimeout(500);
    assert.equal((await read()).rootOverflowY, 'auto');
    await swipe('forward');
    if (await collapse.isVisible()) await collapse.click();
  }
  assert.deepEqual(errors, []);
  const activity = adb(['shell', 'dumpsys', 'activity', 'activities']).split('\n').find(line => line.includes('topResumedActivity='))?.trim();
  await writeFile(new URL('validation.json', output), JSON.stringify({ userAgent: await page.evaluate(() => navigator.userAgent), activity, input: 'adb shell input swipe', initial, swipes, errors }, null, 2));
  console.log(JSON.stringify({ activity, nativeSwipes: swipes.length, errors }, null, 2));
} finally {
  await browser.close();
}
