# Контекст CHINATOWN для другого ИИ — 23 октября 2026

Проверенная версия: `b543636d34f1b7d01ad033102815bd2308bfc39a`, ветка `main`. Локальный `origin/main` указывает на тот же коммит. Репозиторий: [pentaoo/media](https://github.com/pentaoo/media). Рабочая папка автора: `/Users/penta/GitHub/media`.

Ссылки на код ниже закреплены за этим коммитом и ведут на конкретные строки GitHub. Они пригодны для передачи ИИ вне этой рабочей папки. При работе с более новой версией сначала сверить изменения.

## Готовый вводный контекст

Ты продолжаешь работу над CHINATOWN — статическим прототипом медиа о музыке, независимой культуре, людях и местах сцены. Сейчас есть запусковая главная, временная страница «О нас», одна полная статья madk1d и служебные стенды. Нет React/Vue, CMS, базы данных или собственного API: HTML, CSS, нативные JavaScript ES-модули, Node-скрипты.

Цель текущего обсуждения — разобраться в накопленных частях проекта и подготовить очистку. Проведён подробный аудит на 44 пункта. В этом чате реализация ещё не очищалась. Не считай все старые идеи обязательным планом внедрения и не удаляй действующие функции только потому, что они сложные.

Основной аудит: `audits/code-cleanup-2026-10-22.md`; измерения и прежний граф импортов: `audits/code-cleanup-evidence-2026-10-22.json`. Это локальные, пока не добавленные в Git файлы; передать их вместе с этим документом. Аудит относится к `7b4da4a`, поэтому новые изменения ниже имеют приоритет.

## 1. Что изменилось после аудита

- Поисковый индекс содержит **девять**, а не пять демонстрационных материалов, с разными картинками. Реальных адресов статей у записей по-прежнему нет: оба рендера задают `./index.html`. Источник: [src/article-search-data.js:2](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-search-data.js#L2), [src/article-header.js:107](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-header.js#L107), [src/mobile-shell.js:242](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L242).
- Постер `assets/video/editorial/madk1d-chorus-6e39d25cf629/poster.jpg` теперь используется девятым анонсом поиска: [src/article-search-data.js:11](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-search-data.js#L11). Старое предложение удалить этот постер устарело. Не применять прежние списки ресурсов и цифры экономии без повторной проверки ссылок.
- Песенные сцены снова анимируются и показывают видео **на телефоне**. Условие усиленного режима теперь зависит только от reduced motion: [src/quote-scene.js:37](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/quote-scene.js#L37). Старое описание «на телефоне сцена всегда статична» неверно.
- У мобильной панели три положения: `hidden`, `preview`, `expanded`. Прежней остановки `peek`/40% больше нет. Первый материал появляется компактным превью: [src/mobile-shell-state.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell-state.js#L1), [src/mobile-shell-state.js:12](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell-state.js#L12), [src/mobile-shell-state.js:45](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell-state.js#L45).
- Появилась общая система прерываемых анимаций: токены длительности/кривых, CSS-переходы по состояниям корня и жесты из текущего визуального положения. [src/design-tokens.css:51](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/design-tokens.css#L51), [src/mobile-shell.js:150](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L150), [src/mobile-shell.js:319](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L319), [src/mobile-shell.css:60](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.css#L60).
- Панель материала и меню закреплены нативным `bottom: 0`; поисковая поверхность отдельно учитывает клавиатуру через `visualViewport`. У панели меняются размеры содержимого при resize, а положения задаются transform. [src/mobile-shell.js:135](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L135), [src/mobile-shell.css:60](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.css#L60), [docs/mobile-shell.md:18](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/docs/mobile-shell.md#L18).
- Окно подписки имеет вход/выход с возможностью прерывания. На телефоне открытие фокусирует панель, чтобы сразу не поднимать клавиатуру; режим ввода учитывает доступный viewport. [src/subscribe-modal.js:42](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/subscribe-modal.js#L42), [src/subscribe-modal.js:62](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/subscribe-modal.js#L62), [src/subscribe-modal.js:87](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/subscribe-modal.js#L87).
- Добавлены отдельные браузерные и Android-регрессии, перечисленные в разделе проверок. Сейчас unit-тестов **48**, прежнее число 47 относится к старому срезу.

В `deliverables/ai-handoff-2026-10-23/` уже есть другой пакет передачи и ZIP, основанные на более раннем `d664ac0` и снимке незакоммиченного патча. Это история предыдущего состояния. Не накатывать их патч поверх нынешнего HEAD без сравнения.

## 2. Обязательные правила проекта

Полный источник: [AGENTS.md:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/AGENTS.md#L1).

1. Песенная сцена содержит минимум четыре **исходные** строки. Исключение — короткий припев целиком один раз. Переносы верстки не считаются строками; не дописывать и не повторять цитату ради количества. Сразу после сцены нужен обычный текст с разбором показанного фрагмента. [AGENTS.md:3](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/AGENTS.md#L3).
2. Общая CTA зафиксирована: прямоугольная розовая `#fc5cff`, белые текст и стрелка, без скруглений. Страница задаёт только положение и доступную ширину. Не менять её дизайн и внутреннюю разметку при очистке страниц; hover/focus текстовых ссылок должны исключать CTA. [AGENTS.md:15](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/AGENTS.md#L15), [src/components/action-button.js:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/action-button.js#L5), [src/components/action-button.css:3](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/action-button.css#L3).
3. Только два профиля типографики/основных контролов: телефон ≤760 px, десктоп ≥761 px. Значения в токенах, роли в общем CSS. Без подгонки шрифта по ширине, `clamp()`/`vw`/`cqw` для текста и новой планшетной шкалы. Граница правой панели 1200 px относится к компоновке. [AGENTS.md:25](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/AGENTS.md#L25), [src/design-tokens.css:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/design-tokens.css#L5), [src/components/typography.css:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/typography.css#L1).
4. Сохранять клавиатурное управление, reduced motion, возврат фокуса, поведение без JS и освобождение контроллеров. Данные справки перемещаются между представлениями одним DOM-узлом, не дублируются. Ручной выбор важнее автоматического контекста. [src/article-context.js:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context.js#L4), [src/article-context-state.js:9](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context-state.js#L9), [src/article.js:72](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article.js#L72).

## 3. Карта входов и источников данных

| Часть | Где читать |
|---|---|
| Команды, отсутствие runtime-зависимостей | [package.json:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/package.json#L1) |
| Запусковая главная | [index.html:15](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/index.html#L15) |
| Видеосфера, заголовок, копирование URL | [src/intro.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/intro.js#L1), [src/video-sphere.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/video-sphere.js#L1), [src/headline-glitch.js:9](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/headline-glitch.js#L9) |
| Диалог подписки и отправка | [src/subscribe-modal.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/subscribe-modal.js#L1), [index.html:52](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/index.html#L52) |
| Общий bootstrap «О нас»/статьи, постоянная шапка и шторка | [src/media-demo.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/media-demo.js#L1) |
| Клиентская маршрутизация только двух страниц | [src/media-demo.js:17](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/media-demo.js#L17), [src/media-demo.js:42](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/media-demo.js#L42) |
| Временный «О нас» | [src/media-views.js:3](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/media-views.js#L3) |
| Утверждённый текст, источники, цитаты и хронология | [src/article-copy.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-copy.js#L1) |
| Композиция статьи | [src/article-view.js:96](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-view.js#L96) |
| Вставка ссылок/сносок в конкретные абзацы | [src/article-view.js:18](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-view.js#L18) |
| Данные карточек и привязки глав | [src/article-context-data.js:2](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context-data.js#L2), [src/article-context-data.js:204](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context-data.js#L204) |
| Статическая разметка справок и входных ссылок | [src/article-context-view.js:6](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context-view.js#L6) |
| Подключение и освобождение контроллеров статьи | [src/article.js:13](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article.js#L13) |
| Шапка и десктопный поиск | [src/article-header.js:11](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-header.js#L11) |
| Выбор автоматической/ручной справки, hover, размещение, Back | [src/article-context.js:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context.js#L5), [src/article-context-state.js:9](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context-state.js#L9) |
| Десктопная правая шторка, видео, сворачивание | [src/scene-rail.js:21](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/scene-rail.js#L21) |
| Перелистывание тех же DOM-узлов | [src/context-pager.js:2](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/context-pager.js#L2) |
| Телефонные FAB, панель, меню, поиск и жесты | [src/mobile-shell.js:12](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L12), [src/mobile-shell-state.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell-state.js#L1), [src/mobile-shell.css:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.css#L1) |
| Городское видео телефона | [src/mobile-city-video.js:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-city-video.js#L4) |
| Песенные сцены и расчёты прокрутки | [src/quote-scene.js:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/quote-scene.js#L5), [src/quote-scroll-state.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/quote-scroll-state.js#L1) |
| Локальный немой видеофон сцены | [src/quote-background-video.js:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/quote-background-video.js#L4) |
| Изображения, увеличение, анимация, возврат истории/фокуса | [src/article-images.js:2](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-images.js#L2) |
| Закрепляемые заголовки разделов | [src/section-headings.js:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/section-headings.js#L5) |
| Контролы и типографика | [src/design-tokens.css:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/design-tokens.css#L5), [src/components/action-button.js:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/action-button.js#L5), [src/components/email-field.css:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/email-field.css#L1) |
| Каталог и исполняемые образцы | [components.html:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/components.html#L1), [src/component-catalog.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/component-catalog.js#L1), [src/component-preview.js:82](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/component-preview.js#L82) |
| Условная DEV-панель | [src/dev-tools.js:3](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/dev-tools.js#L3), [src/dev-settings.js:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/dev-settings.js#L4), [src/dev-panel.js:9](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/dev-panel.js#L9) |
| Генерация статических article.html/about.html | [scripts/generate-article.mjs:8](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/generate-article.mjs#L8) |
| Состав публикуемой сборки | [scripts/build.mjs:6](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/build.mjs#L6) |
| Подготовка видео и монтажные рецепты | [scripts/prepare-videos.mjs:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/prepare-videos.mjs#L1), [config/video-cuts.json:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/config/video-cuts.json#L1) |

Текст меняется в `article-copy.js`, справки — в `article-context-data.js`, структура — в `article-view.js`. Не редактировать вручную сгенерированное тело `article.html`: следующая генерация его заменит. Обвязка HTML/head сохраняется генератором, поэтому её правки делаются в самих HTML.

На первой загрузке `media-demo.js` повторно создаёт HTML внутри `main`, хотя статическая разметка уже существует. Это кандидат на осторожный рефакторинг инициализации, а не повод удалять статический fallback. [src/media-demo.js:23](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/media-demo.js#L23).

## 4. Подтверждённые кандидаты на очистку

Это конкретные следы старых решений. Перед удалением сверить нынешних потребителей; ниже перечислены файлы, которые повторно прочитаны в текущем срезе.

| Кандидат | Доказательство и граница удаления |
|---|---|
| Клубный свет | Контроллер требует отсутствующий `[data-article-end]` и возвращает пустые методы: [src/story-club.js:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/story-club.js#L4). Декоративные слои остались: [src/article-view.js:98](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-view.js#L98). Обычное подключение сохранилось: [src/article.js:22](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article.js#L22). Убирать целиком эффект/интеграцию, если он больше не нужен |
| Редактор света и настройки | [src/story-club-editor.js:21](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/story-club-editor.js#L21), [src/story-club-settings.js:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/story-club-settings.js#L1), [src/dev-panel.js:173](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/dev-panel.js#L173), [article.css:210](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/article.css#L210). Это отдельный комплект; полезный редактор сетки не удалять вместе с ним |
| Постоянно невидимая подсказка руки | Интро сразу `intro--revealed`: [index.html:15](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/index.html#L15). Этот класс скрывает руку: [styles.css:77](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/styles.css#L77). Сфера всё ещё создаёт её: [src/video-sphere.js:145](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/video-sphere.js#L145), [src/drag-hint.js:55](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/drag-hint.js#L55). Решить: вернуть видимость или удалить только подсказку |
| Недостижимый compact/ambient глитч | `compact` начинается с false, меняется лишь через `setCompact`, внешних вызовов нет. [src/headline-glitch.js:20](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/headline-glitch.js#L20), [src/headline-glitch.js:248](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/headline-glitch.js#L248), [src/headline-glitch.js:354](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/headline-glitch.js#L354). Сам hover/scroll-глитч работает |
| Обычный видеоблок без DOM-потребителя | Поиск `video[data-editorial-video]`: [src/editorial-video.js:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/editorial-video.js#L4). Его bootstrap всё ещё вызывает: [src/media-demo.js:36](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/media-demo.js#L36). Концертный фон и городское видео — другие живые контроллеры |
| Figma capture в посетительском HTML | Безусловный внешний скрипт разработки: [index.html:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/index.html#L4), [article.html:4](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/article.html#L4) |
| Демонстрационный поиск | Девять анонсов, поиск только по artist/title, все результаты на главную: [src/article-search-data.js:2](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-search-data.js#L2), [src/article-search-data.js:14](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-search-data.js#L14), [src/article-header.js:107](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-header.js#L107), [src/mobile-shell.js:242](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L242) |
| Заглушки меню | Два одинаковых «Карта артистов» и disabled-разделы: [src/article-view.js:114](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-view.js#L114). Мобильные пункты все ведут на главную: [src/mobile-shell.js:57](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.js#L57) |
| Ненастроенная основная форма | `YOUR_FORM_ID`: [index.html:52](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/index.html#L52). Это незавершённая интеграция, а не лишний общий компонент CTA |
| Служебные страницы в product-build | Стенд глитча, каталог, превью, DEV CSS; все `src`, `docs`, `assets` копируются целиком: [scripts/build.mjs:11](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/build.mjs#L11). `noindex` не исключает файлы из публикации |
| Старый CSS | `.landing-placeholder`: [styles.css:336](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/styles.css#L336); `.story-margin-note`: [article.css:163](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/article.css#L163); `.story-footnotes`: [article.css:206](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/article.css#L206). Современные `article-context-material` и `article-context-backlink` сохранить |
| Неподключённый мобильный шрифт поля | Генератор создаёт Input Mobile: [scripts/generate-input-fonts.py:20](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/generate-input-fonts.py#L20), но мобильные токены используют обычный Benzin: [src/design-tokens.css:93](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/design-tokens.css#L93). Десктопный Benzin Input используется |
| Малые производные видео | Перед выбором small/large шторка возвращается при !wide, поэтому small не достигается: [src/scene-rail.js:160](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/scene-rail.js#L160). На телефоне используются article-версии: [src/mobile-city-video.js:44](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-city-video.js#L44). Менять экспортёр, manifest и тесты одновременно |
| Подгонка малого заголовка под ширину | `measuredWidth * .018` против правила токенов: [src/section-headings.js:41](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/section-headings.js#L41). Сохранить саму скролл-анимацию, конечный размер сделать фиксированным |

Сохранять живую подсветку связи абзаца/карточки: [src/article-context.js:89](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context.js#L89), [src/mobile-shell.css:3](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/mobile-shell.css#L3), [src/components/editorial-typography.css:38](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/editorial-typography.css#L38). Не путать её с будущими идеями исследования.

У пустого контроллера контекста есть технический риск: он возвращает только три метода, а `article.js` вызывает также `refresh`, `closeManual`, `openManual`. При отделении шторки унифицировать контракт: [src/article-context.js:7](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article-context.js#L7), [src/article.js:38](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/article.js#L38).

## 5. Что уже удалено и что является только идеей

Музыкальные оболочки (`music-controller`, `music-player`, `media-yandex-player`, `yandex-music`, `releases`), MP3-плеер, Twitch/live-модули, countdown и редактор набросков отсутствуют в текущих исходниках. Их упоминания в старых документах не означают скрытую обязательную зависимость.

Архив исследований прямо помечен историей: [docs/article-interactions.md:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/docs/article-interactions.md#L1). Там перечислены управляемые аудиофрагменты, сравнение студия/концерт, stems, карты, сохранённое, шаринг связки, графы и другие идеи. Реализация всего этого не поручена автоматически.

При этом карточки артиста/трека/альбома, внешние ссылки на источники и статическая хронология действуют. Библиотечные `editorialQuoteView`, `fact` и вторичная CTA используются стендами; отсутствие в одной статье не равно бесхозному коду. [src/components/editorial-typography.js:5](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/editorial-typography.js#L5), [src/components/editorial-data.js:3](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/editorial-data.js#L3), [src/components/action-button.js:34](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/src/components/action-button.js#L34).

`deliverables/` — архив материалов и прежних проверок, сборка его не копирует. В нём также лежит согласованный редакционный исходник статьи, поэтому весь каталог вслепую не удалять. Старые validation.json не доказывают нынешнюю работоспособность.

## 6. Проверки и продолжение работы

Свежая проверка при подготовке этого контекста: **23.10.2026, `npm test` — 48/48, `npm run build` — успешно**. Отслеживаемые исходники после генерации не изменились. Браузерный и физический мобильный прогон в этой задаче не повторялся.

Базовые команды:

```sh
npm run dev
npm test
npm run build
npm run article:generate
npm run video:prepare -- --only madk1d-chorus
```

Локальный сервер по умолчанию использует порт 4173: [scripts/serve.mjs:9](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/serve.mjs#L9). Подготовка видео требует ffmpeg/ffprobe и локальных оригиналов `video-originals/`; обычная сборка использует готовые assets, оригиналы ей не нужны.

Дополнительные регрессии лежат отдельно от `npm test`:

- мобильная панель и viewport: [scripts/check-mobile-sheet.mjs:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/check-mobile-sheet.mjs#L1);
- песенные сцены: [scripts/check-quote-scenes.mjs:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/check-quote-scenes.mjs#L1);
- окно подписки и клавиатура: [scripts/check-subscribe-dialog.mjs:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/check-subscribe-dialog.mjs#L1);
- прерываемое движение оболочки: [scripts/check-mobile-motion.mjs:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/check-mobile-motion.mjs#L1);
- Android-прокрутка: [scripts/check-android-article-scroll.mjs:1](https://github.com/pentaoo/media/blob/b543636d34f1b7d01ad033102815bd2308bfc39a/scripts/check-android-article-scroll.mjs#L1).

Они требуют отдельного окружения Playwright, а Android-проверка — также ADB/подходящего устройства; наличие этих файлов не означает, что они запускаются обычным `npm test`. Не объявлять конкретную пользовательскую проблему встроенного мобильного браузера решённой лишь по unit-тестам или старому отчёту эмулятора.

Предлагаемый порядок следующей задачи по очистке:

1. Сверить HEAD, `git status`, правила `AGENTS.md`, старый аудит и поправки этого документа.
2. Удалять небольшими связными комплектами: сначала подтверждённые отключённые части, затем заглушки/состав публикации, после — экспорт лишних видео.
3. Перед удалением ресурса искать прямые и вычисляемые пути; учитывать manifest, CSS url, конструкторы new URL и демонстрационные карточки поиска.
4. После изменений выполнить тесты/сборку и проверить затронутый интерфейс: обе CTA, диалог/фокус/клавиатуру, справки/изображение/Back, обе песенные сцены, шторку и телефонные жесты.
5. Отчитаться: что удалено, что сохранено, чем подтверждена проверка. Публикация и полная реализация старого backlog не следуют из самого факта передачи контекста.
