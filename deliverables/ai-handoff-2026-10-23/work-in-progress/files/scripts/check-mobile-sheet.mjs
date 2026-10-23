// Optional browser regression: supply Playwright via PLAYWRIGHT_MODULE if not installed locally.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}) });
const url = new URL('article.html?dev=0', process.env.MEDIA_TEST_URL || 'http://localhost:4173/').href;
const output = new URL('../deliverables/mobile-sheet-scroll/', import.meta.url);
await mkdir(output, { recursive: true });
const checks = [];
const errors = [];

async function checkPhone(width, height) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  page.on('pageerror', error => errors.push(error.message));
  const settle = () => page.waitForTimeout(650);
  const snap = () => page.locator('.mobile-shell').getAttribute('data-snap');
  const mode = () => page.locator('.mobile-shell').getAttribute('data-mode');
  const articleY = () => page.evaluate(() => scrollY);
  async function swipe(startY, endY) {
    const x = width / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: startY }] });
    for (let step = 1; step <= 12; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: startY + (endY - startY) * step / 12 }] });
      await page.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settle();
  }
  async function assertArticleSwipe(startY, endY) {
    const before = await articleY();
    await swipe(startY, endY);
    const delta = await articleY() - before;
    assert(Math.sign(delta) === Math.sign(startY - endY) && Math.abs(delta) > 40, `Article swipe failed at ${width}x${height}: ${delta}px`);
    return Math.round(delta);
  }
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await settle();
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY), 'auto');
  assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'visible');
  assert.equal(await articleY(), 0);
  const coverSwipe = await assertArticleSwipe(height * .65, height * .25);
  assert(await page.locator('.story-cover').evaluate(element => element.getBoundingClientRect().top < -40));
  await assertArticleSwipe(height * .25, height * .65);
  await page.locator('#artist-intro').evaluate(element => scrollTo(0, scrollY + element.getBoundingClientRect().top - Math.min(160, innerHeight * .25)));
  await settle();
  assert.equal(await snap(), 'preview');
  const previewHeight = await page.locator('.mobile-shell__sheet').evaluate(element => element.getBoundingClientRect().height);
  assert(Math.abs(previewHeight - Math.min(88, height * .25)) < 1);
  const forward = await assertArticleSwipe(height * .5, height * .2);
  const backward = await assertArticleSwipe(height * .2, height * .5);
  // The regression: this gesture starts on the visible card image, below its drag handle.
  const previewSwipe = await assertArticleSwipe(height - 16, Math.max(90, height - 250));
  assert.equal(await snap(), 'preview');
  assert.equal(await page.locator('.mobile-shell__content').evaluate(element => element.scrollTop), 0);
  await page.screenshot({ path: fileURLToPath(new URL(`preview-${width}x${height}.png`, output)) });
  await page.locator('.mobile-shell__preview-toggle').click({ position: { x: width / 2, y: previewHeight - 16 } });
  await settle();
  assert.equal(await snap(), 'expanded');
  const expandedHeight = await page.locator('.mobile-shell__sheet').evaluate(element => element.getBoundingClientRect().height);
  assert(Math.abs(expandedHeight - (height - 48)) < 1);
  await page.locator('.mobile-shell__collapse').click();
  await settle();
  assert.equal(await snap(), 'preview', 'A single collapse must skip the former 40% stop');
  const handleY = height - previewHeight + 6;
  await swipe(handleY, Math.max(50, handleY - 240));
  assert.equal(await snap(), 'expanded');
  await swipe(54, Math.min(height - 90, 320));
  assert.equal(await snap(), 'preview');
  await page.locator('.mobile-shell__collapse').click();
  await settle();
  assert.equal(await mode(), 'closed');
  for (const surface of ['menu', 'search']) {
    await page.locator(`[data-mobile-mode="${surface}"]`).click();
    assert.equal(await page.locator('.story-page').evaluate(element => element.inert), true);
    await page.goBack();
    await settle();
    assert.equal(await mode(), 'closed');
    assert.equal(await page.locator('.story-page').evaluate(element => element.inert), false);
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '');
    await assertArticleSwipe(height * .5, height * .2);
  }
  await page.locator('[data-mobile-mode="context"]').click();
  await settle();
  assert.equal(await snap(), 'expanded', 'The FAB should open the full card directly');
  if (width === 390) {
    // Use a known long card and a low viewport to exercise its separate native scroll.
    await page.locator('#artist-intro').evaluate(element => scrollTo(0, scrollY + element.getBoundingClientRect().top - Math.min(160, innerHeight * .25)));
    await page.setViewportSize({ width, height: 510 });
    await settle();
    const before = await articleY();
    await swipe(340, 160);
    assert(await page.locator('.mobile-shell__content').evaluate(element => element.scrollTop) > 0);
    assert(Math.abs(await articleY() - before) < 2, 'Expanded card scrolling must not move the article');
    await page.locator('.mobile-shell__content .context-image-trigger').first().click();
    await settle();
    assert.equal(await page.locator('.article-image-viewer[open]').count(), 1);
    await page.locator('.article-image-viewer__close').click();
    await settle();
    assert.equal(await page.locator('.article-image-viewer[open]').count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '');
    await page.setViewportSize({ width, height });
    await page.locator('.mobile-shell__collapse').click();
    await settle();
    await assertArticleSwipe(height - 16, height - 250);
  }
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
  checks.push({ width, height, previewHeight, expandedHeight, coverSwipe, articleSwipe: forward, reverseSwipe: backward, swipeStartingOnPreview: previewSwipe });
  await context.close();
}

try {
  for (const [width, height] of [[320, 510], [390, 844], [760, 360]]) await checkPhone(width, height);
  assert.deepEqual(errors, []);
  const result = { browser: 'Chromium with native touch input', checks, errors };
  await writeFile(new URL('validation.json', output), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
}
