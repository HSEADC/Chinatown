# Незавершённая работа в другом чате: Android-прокрутка

Отдельный срез: **2026-10-23T01:03:41+03:00**. База: `d664ac05a1cb7e0b88cb6887c560fd3d35f849e4`. Файлы меняются в общем checkout во время подготовки передачи.

Этот раздел новее основного технического описания. В ZIP `repository/` оставлен точным снимком базы d664ac0 (кроме добавленного локального аудита), для которой здесь проверены 48 тестов и сборка. В `work-in-progress/files/` сохранены более свежие файлы, а `work-in-progress/changes.patch` показывает их отличия. Не накладывать их поверх ещё более свежего checkout без сравнения.

## Что успело измениться

- В `scene-rail.css` добавлены телефонные правила: `overflow-y: auto` у html статьи, `overflow: visible` у body статьи с правой оболочкой и `touch-action: pan-y pinch-zoom` у `#media-content`. Комментарий связывает это с сохранением нативного владельца прокрутки в Android custom tabs. Это выбранный защитный патч; точная причина сбоя на устройстве пользователя пока не установлена.
- `scripts/check-mobile-sheet.mjs` теперь проверяет свайпы прямо с обложки до программного перехода к `artist-intro`, движение самой обложки и вычисленные overflow. Старый пробел регрессии описан в основном контексте именно для базы.
- Добавлен `scripts/check-android-article-scroll.mjs`: Playwright подключается к уже открытому Android-браузеру через CDP, жест выполняется настоящим Android-вводом `adb shell input swipe`. Проверяются оба направления, жест после изменения высоты окна и снятие блокировки после меню/поиска.
- Обновляются `docs/mobile-shell.md`, результаты Chromium-регрессии и Android-отчёт. Изменённые PNG не включены в текстовый пакет; они остаются в рабочей папке автора.

## Что известно о результате

Пользователь подтвердил, что проблема возникает **только во встроенном окне приложения**. Обычные Android Chrome и DuckDuckGo в проведённых другим чатом проверках прокручиваются. В эмуляторе с новым WebView исходный сбой также не воспроизводился. У пользователя запрошены версии Android и DuckDuckGo; подтверждения на его исходном устройстве пока нет.

Захваченный Android-отчёт: `topResumedActivity=ActivityRecord{132648269 u0 com.duckduckgo.mobile.android/com.duckduckgo.app.browser.customtabs.CustomTabActivity t19}`; жестов: **5**, ошибок JS: **0**. Отчёт описывает успешную проверку эмулятора, а не телефона пользователя.
User Agent из отчёта: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36`. В обновлённой документации другого чата указаны DuckDuckGo 5.299.0 и WebView 149.0.7827.5.

Эта передача не запускала проверки после чужого патча. Не переносить 48/48 и успешную сборку базы на изменённый код без нового прогона. Перед продолжением проверить завершение исходного чата «Спроектировать мобильную плашку», git status и новые коммиты. Не удалять и не откатывать эту работу.

## Запуск новой регрессии

Нужны ADB, Playwright и уже открытая статья в нужном Android-окне. Проброс DevTools-сокета выполняется отдельно. Поддерживаемые переменные: `ANDROID_CDP_URL` (по умолчанию `http://localhost:9224`), `ANDROID_SERIAL`, `ADB_EXECUTABLE`, `PLAYWRIGHT_MODULE`, `MEDIA_TEST_URL` (по умолчанию `http://localhost:4182/`). Скрипт пишет `deliverables/android-article-scroll/validation.json` и screenshot.

## Захваченные текстовые файлы

- `deliverables/android-article-scroll/validation.json` — новый файл
- `deliverables/mobile-sheet-scroll/validation.json`
- `docs/mobile-shell.md`
- `scene-rail.css`
- `scripts/check-android-article-scroll.mjs` — новый файл
- `scripts/check-mobile-sheet.mjs`
