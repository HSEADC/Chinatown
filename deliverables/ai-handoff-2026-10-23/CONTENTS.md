# Состав пакета передачи CHINATOWN

Упакован: 2026-10-23T01:03:41+03:00. База: `d664ac05a1cb7e0b88cb6887c560fd3d35f849e4`.

- `PROJECT_CONTEXT.md` — единый контекст проекта.
- `WORK_IN_PROGRESS.md` — свежее дополнение о незакоммиченном Android-исправлении.
- `START_HERE.md` — готовый промпт для следующего ИИ.
- `SNAPSHOT.json` — версия, проверки и SHA-256 файлов.
- `repository/` — текстовые исходники базы, документация, исторические брифы/отчёты и локальный аудит.
- `work-in-progress/files/` — более свежие текстовые версии изменённых/новых файлов из другого чата.
- `work-in-progress/changes.patch` — diff этих версий относительно базы.

Снимок базы: **222 файла**, 1,947,986 байт до сжатия. Дополнение: **6 текстовых файлов** и patch.

**Пакет не запускается самостоятельно:** бинарные assets нужно получить из Git. Текстовые SVG, manifest и лицензия включены; фото, шрифты, MP4 и внешние recordings исключены. Полная Git-история отсутствует. Не включены сторонний архив музыкальных лицензий и два больших старых QA JSON по заданиям 10–14. Пропущенные отслеживаемые файлы перечислены с хешами в SNAPSHOT.json.

Пути основного контекста относятся к корню репозитория (`repository/` в ZIP). Более позднее дополнение имеет приоритет для статуса Android-задачи. Архивные брифы не являются новыми поручениями.

## Разделы базового снимка

| Область | Файлов |
| --- | ---: |
| `.github/` | 1 |
| `assets/` | 44 |
| `audits/` | 2 |
| `config/` | 1 |
| `deliverables/` | 77 |
| `docs/` | 9 |
| `scripts/` | 8 |
| `src/` | 53 |
| `test/` | 10 |
| `корневые файлы` | 17 |

## Включённые пути базы

- `repository/.github/workflows/pages.yml`
- `repository/.gitignore`
- `repository/AGENTS.md`
- `repository/README.md`
- `repository/about.html`
- `repository/article.css`
- `repository/article.html`
- `repository/assets/LICENSE.material-design-icons`
- `repository/assets/figma/article/arrow-left.svg`
- `repository/assets/figma/article/arrow-right.svg`
- `repository/assets/figma/article/header/close.svg`
- `repository/assets/figma/article/header/menu.svg`
- `repository/assets/figma/article/header/search-toggle.svg`
- `repository/assets/figma/article/header/search.svg`
- `repository/assets/figma/article/header/star.svg`
- `repository/assets/figma/article/navigation/logo-menu.svg`
- `repository/assets/figma/article/navigation/logo.svg`
- `repository/assets/figma/article/navigation/menu-open.svg`
- `repository/assets/figma/article/navigation/menu-trail.svg`
- `repository/assets/figma/article/navigation/menu.svg`
- `repository/assets/figma/article/navigation/search-chevron.svg`
- `repository/assets/figma/article/navigation/search-toggle.svg`
- `repository/assets/figma/article/navigation/search.svg`
- `repository/assets/figma/article/navigation/star.svg`
- `repository/assets/figma/article/rail/navigate-before.svg`
- `repository/assets/figma/article/rail/navigate-next.svg`
- `repository/assets/figma/article/star.svg`
- `repository/assets/figma/clear.svg`
- `repository/assets/figma/components/action-next-mobile.svg`
- `repository/assets/figma/intro-north-east.svg`
- `repository/assets/figma/mobile-shell/arrow-down.svg`
- `repository/assets/figma/mobile-shell/arrow-up.svg`
- `repository/assets/figma/mobile-shell/close.svg`
- `repository/assets/figma/mobile-shell/menu-24.svg`
- `repository/assets/figma/mobile-shell/menu.svg`
- `repository/assets/figma/mobile-shell/search-24.svg`
- `repository/assets/figma/mobile-shell/search-field.svg`
- `repository/assets/figma/mobile-shell/search.svg`
- `repository/assets/figma/north-east.svg`
- `repository/assets/figma/subscribe-close.svg`
- `repository/assets/figma/subscribe-star.svg`
- `repository/assets/icons/arrow-cursor.svg`
- `repository/assets/icons/content-copy-sharp.svg`
- `repository/assets/icons/copy-cursor.svg`
- `repository/assets/icons/intro-navigate-next.svg`
- `repository/assets/icons/intro-north-east.svg`
- `repository/assets/icons/navigate-next-sharp.svg`
- `repository/assets/icons/pointer-cursor.svg`
- `repository/assets/icons/text-cursor.svg`
- `repository/assets/link.svg`
- `repository/assets/video/editorial/manifest.json`
- `repository/audits/code-cleanup-2026-10-22.md`
- `repository/audits/code-cleanup-evidence-2026-10-22.json`
- `repository/component-preview.html`
- `repository/components.css`
- `repository/components.html`
- `repository/config/video-cuts.json`
- `repository/deliverables/action-button-276-validation.json`
- `repository/deliverables/article-context-master-prompt.md`
- `repository/deliverables/article-context/artwork-in-rail-validation.json`
- `repository/deliverables/article-context/artwork-viewer-validation.json`
- `repository/deliverables/article-context/chapter-context-validation.json`
- `repository/deliverables/article-context/checks.json`
- `repository/deliverables/article-context/checks.md`
- `repository/deliverables/article-context/paging/validation.json`
- `repository/deliverables/article-cover-figma-validation.json`
- `repository/deliverables/article-cover-validation.json`
- `repository/deliverables/article-features-research-2026-10-09.md`
- `repository/deliverables/article-grid-validation.json`
- `repository/deliverables/article-rail-motion-validation.json`
- `repository/deliverables/article-refinements-validation.json`
- `repository/deliverables/assignments-10-14/figma-audit.json`
- `repository/deliverables/assignments-10-14/Задания-10-14.md`
- `repository/deliverables/caption-margin-note-validation.json`
- `repository/deliverables/club-light-validation.json`
- `repository/deliverables/component-revision/browser-validation.json`
- `repository/deliverables/component-revision/check.html`
- `repository/deliverables/component-system/design-brief.md`
- `repository/deliverables/component-system/responsive.html`
- `repository/deliverables/component-system/validation.json`
- `repository/deliverables/dev-panel-validation.json`
- `repository/deliverables/editorial-typography/primary-listen-motion-validation.json`
- `repository/deliverables/editorial-typography/primary-listen-validation.json`
- `repository/deliverables/editorial-typography/validation.json`
- `repository/deliverables/figma-transfer-validation.json`
- `repository/deliverables/fomo-media-commercial-research-2026-10-14.md`
- `repository/deliverables/header-269-published-validation.json`
- `repository/deliverables/header-269-validation.json`
- `repository/deliverables/header-272-published-validation.json`
- `repository/deliverables/header-272-validation.json`
- `repository/deliverables/header-above-video-validation.json`
- `repository/deliverables/header-animation-validation.json`
- `repository/deliverables/header-article-grid-validation.json`
- `repository/deliverables/header-menu-motion-validation.json`
- `repository/deliverables/input-caret-mobile-geometry.json`
- `repository/deliverables/input-caret-validation.json`
- `repository/deliverables/landing-275-grid-validation.json`
- `repository/deliverables/light-editor-validation.json`
- `repository/deliverables/madk1d-browser-validation.json`
- `repository/deliverables/madk1d-content-transfer/validation.json`
- `repository/deliverables/madk1d-editorial-brief-and-prompt.md`
- `repository/deliverables/madk1d-editorial-layout.md`
- `repository/deliverables/madk1d-editorial-validation.json`
- `repository/deliverables/media-tags-and-interactions-prompt.md`
- `repository/deliverables/mobile-controls/preview.html`
- `repository/deliverables/mobile-controls/validation.json`
- `repository/deliverables/mobile-fab-404/validation.json`
- `repository/deliverables/mobile-lyric-scenes/validation.json`
- `repository/deliverables/mobile-sheet-scroll/validation.json`
- `repository/deliverables/mobile-shell/validation.json`
- `repository/deliverables/mobile-typography/font-assets.json`
- `repository/deliverables/mobile-typography/preview.html`
- `repository/deliverables/mobile-typography/validation.json`
- `repository/deliverables/music-browser-validation.json`
- `repository/deliverables/music-player-implementation-2026-10-09.md`
- `repository/deliverables/planned-features-and-article-ui.md`
- `repository/deliverables/quote-fast-fade-validation.json`
- `repository/deliverables/quote-local-video-validation.json`
- `repository/deliverables/quote-scene-validation.json`
- `repository/deliverables/quote-soft-stops-validation.json`
- `repository/deliverables/quote-transition-validation.json`
- `repository/deliverables/responsive-system/article-checks.json`
- `repository/deliverables/responsive-system/check.html`
- `repository/deliverables/responsive-system/matrix.json`
- `repository/deliverables/right-curtain-spotify-prompt.md`
- `repository/deliverables/right-curtain-spotify-review.md`
- `repository/deliverables/right-curtain/figma-validation.json`
- `repository/deliverables/right-curtain/peek-validation.json`
- `repository/deliverables/right-curtain/validation.json`
- `repository/deliverables/site-grid-validation.json`
- `repository/deliverables/typography-validation.json`
- `repository/deliverables/video-rail-validation.json`
- `repository/deliverables/yandex-player-implementation-2026-10-09.md`
- `repository/deliverables/yandex-player-validation.json`
- `repository/dev-panel.css`
- `repository/docs/article-context.md`
- `repository/docs/article-headings.md`
- `repository/docs/article-interactions.md`
- `repository/docs/component-system.md`
- `repository/docs/editorial-data.md`
- `repository/docs/editorial-typography.md`
- `repository/docs/mobile-shell.md`
- `repository/docs/responsive-system.md`
- `repository/docs/video-workflow.md`
- `repository/glitch-test.html`
- `repository/index.html`
- `repository/light-editor.css`
- `repository/media.css`
- `repository/package.json`
- `repository/scene-rail.css`
- `repository/scripts/build.mjs`
- `repository/scripts/check-mobile-sheet.mjs`
- `repository/scripts/check-quote-scenes.mjs`
- `repository/scripts/generate-article.mjs`
- `repository/scripts/generate-input-fonts.py`
- `repository/scripts/http-range.mjs`
- `repository/scripts/prepare-videos.mjs`
- `repository/scripts/serve.mjs`
- `repository/src/article-context-data.js`
- `repository/src/article-context-state.js`
- `repository/src/article-context-view.js`
- `repository/src/article-context.js`
- `repository/src/article-copy.js`
- `repository/src/article-header.js`
- `repository/src/article-images.js`
- `repository/src/article-search-data.js`
- `repository/src/article-view.js`
- `repository/src/article.js`
- `repository/src/component-catalog-data.js`
- `repository/src/component-catalog.js`
- `repository/src/component-preview.css`
- `repository/src/component-preview.js`
- `repository/src/components/action-button.css`
- `repository/src/components/action-button.js`
- `repository/src/components/context-title.css`
- `repository/src/components/context-title.js`
- `repository/src/components/editorial-data.css`
- `repository/src/components/editorial-data.js`
- `repository/src/components/editorial-typography.css`
- `repository/src/components/editorial-typography.js`
- `repository/src/components/email-field.css`
- `repository/src/components/typography.css`
- `repository/src/components/typography.js`
- `repository/src/context-pager.js`
- `repository/src/design-tokens.css`
- `repository/src/dev-panel.js`
- `repository/src/dev-settings.js`
- `repository/src/dev-tools.js`
- `repository/src/drag-hint.js`
- `repository/src/editorial-video.js`
- `repository/src/fonts.css`
- `repository/src/glitch-preview.js`
- `repository/src/headline-glitch.js`
- `repository/src/intro.js`
- `repository/src/media-demo.js`
- `repository/src/media-views.js`
- `repository/src/mobile-city-video.js`
- `repository/src/mobile-shell-state.js`
- `repository/src/mobile-shell.css`
- `repository/src/mobile-shell.js`
- `repository/src/quote-background-video.js`
- `repository/src/quote-scene.js`
- `repository/src/quote-scroll-state.js`
- `repository/src/scene-rail.js`
- `repository/src/section-headings.js`
- `repository/src/site-cursor.js`
- `repository/src/story-club-editor.js`
- `repository/src/story-club-settings.js`
- `repository/src/story-club.js`
- `repository/src/subscribe-modal.js`
- `repository/src/video-sphere.js`
- `repository/styles.css`
- `repository/test/article-context.test.js`
- `repository/test/dev-settings.test.js`
- `repository/test/drag-hint.test.js`
- `repository/test/editorial-data.test.js`
- `repository/test/editorial-typography.test.js`
- `repository/test/editorial-video.test.js`
- `repository/test/http-range.test.js`
- `repository/test/mobile-shell.test.js`
- `repository/test/quote-scroll-state.test.js`
- `repository/test/story-club-settings.test.js`

## Более свежие версии

- `work-in-progress/files/deliverables/android-article-scroll/validation.json`
- `work-in-progress/files/deliverables/mobile-sheet-scroll/validation.json`
- `work-in-progress/files/docs/mobile-shell.md`
- `work-in-progress/files/scene-rail.css`
- `work-in-progress/files/scripts/check-android-article-scroll.mjs`
- `work-in-progress/files/scripts/check-mobile-sheet.mjs`
