# Контекст задачи: очистка, конфликты и оптимизация кода CHINATOWN

Дата повторной проверки: **23 октября 2026**. Проверенный HEAD: `2d5e45641a4345bb616436576cbe831126b244c1`.

## Задача для следующего ИИ

Проведи очистку существующего проекта по конкретным находкам ниже. Цель — убрать неиспользуемые части, исправить конфликты контроллеров и сократить доказуемую лишнюю работу. Сохрани действующий читательский интерфейс. Не превращай задачу в переписывание приложения, создание CMS или реализацию старого списка идей.

Этот документ заменяет прежний общий контекст передачи: он посвящён именно очистке. Здесь **24 пункта**: четыре конфликта, девять мест оптимизации, восемь групп лишних частей и три незавершённые продуктовые интеграции. У каждого указаны основание, границы исправления и проверка. Два интеграционных дефекта воспроизведены в браузере; расходы на операции и ресурсы подсчитаны. Измерения FPS, LCP и длительности Layout на физическом телефоне не проводились.

Саму реализацию в ходе повторного аудита не меняли. Обновлены этот контекст и файл доказательств `audits/cleanup-review-evidence-2026-10-23.json`. Старый полный аудит `audits/code-cleanup-2026-10-22.md` — справочный снимок на `7b4da4a`, не готовый скрипт удаления. Ссылки на код ниже закреплены за нынешним HEAD; этот документ и JSON нужно приложить отдельно, если следующий ИИ не имеет локального репозитория.

Обозначения: **P2** — исправить в ближайшем проходе очистки; **P3** — следующий проход/упрощение. Это не список аварийных P0/P1. «Браузер» означает реальное воспроизведение в окне 390×844; «код» — доказанный путь выполнения без такого интерактивного прогона; «гипотеза» требует проверки до изменения поведения.

## 1. Сначала исправить конфликты состояния

### C1 · P2 · Поиск сбрасывает вручную закреплённую карточку — подтверждено браузером

**Сценарий:** в статье нажать имя madk1d в первом абзаце → открыть поиск через мобильную FAB → закрыть поиск крестиком.

**Факт:** перед поиском `mode=context`, `snap=expanded`, материал `artist-madk1d`, ссылка активна. После закрытия `mode=context` и размер сохранены, но карточка исчезает, заголовок становится «Китай-город», активных ссылок нет. Временный поиск меняет состояние чтения, которое должен был сохранить.

**След:** [src/mobile-shell.js:200](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L200) заменяет собственную запись истории вместо вложенной; [src/mobile-shell.js:210](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L210) вызывает `history.back()` при закрытии; [src/mobile-shell.js:366](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L366) трактует выход из записи как снятие ручного контекста и вызывает `onDismissContext`; [src/article.js:39](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article.js#L39) снимает manual.

**Исправление:** разделить закрытие временного поиска/меню и закрытие ручного материала. Сохранить нижнее состояние истории, ID, snap, фокус, прокрутку и тот же DOM-узел. Исправление только reducer проблему не закрывает.

**Проверка:** повторить сценарий для поиска и меню, затем Back/Forward. Карточка/ID должны сохраниться до явного закрытия материала. [test/mobile-shell.test.js:35](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/test/mobile-shell.test.js#L35) проверяет reducer, но не интеграцию history с контроллером контекста.

### C2 · P2 · Пустой контроллер контекста имеет неполный API — подтверждено браузером

**Сценарий:** открыть `component-preview.html?family=header&variant=nav&dev=0` на телефоне → нажать FAB «Открыть меню».

**Факт:** консоль выдаёт `TypeError: context?.refresh is not a function`. Stack: `article.js:38 → mobile-shell.js:198 → :113 → :271 → :280`. Флаг `previewReady` остаётся true, поэтому сам готовый вид стенда не означает отсутствие ошибки.

**След:** [src/article-context.js:7](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L7) при отсутствии `sceneRail` возвращает только `setSuspended/setFrozen/dispose`. [src/article.js:38](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article.js#L38) ожидает ещё `refresh/closeManual/openManual`. Стенды шапки и картинки явно отключают шторку: [src/component-preview.js:113](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/component-preview.js#L113), [src/component-preview.js:138](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/component-preview.js#L138).

**Исправление:** единый полный контракт пустого контроллера; затем, при необходимости, отвязать телефонный контекст от обязательного desktop sceneRail. `context?.refresh()` проверяет объект, а не метод. Не прятать ошибку простым catch.

**Проверка:** header/image preview на 390 px, открытие/закрытие меню/поиска и переход через breakpoint в обе стороны; консоль чистая.

### C3 · P2 · Открытие уже показанной карточки не передаёт manual в оболочку — подтверждено кодом

**Сценарий:** автоматически показан `track-tak-pohuy`; читатель нажимает ссылку именно этого трека.

**След:** [src/article-context.js:223](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L223) устанавливает manual, но ключ размещения на [src/article-context.js:131](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L131) — только `mobile:${id}`. При том же ID ранний return на строке 135 пропускает `mobileShell.setContext(..., {manual})` на [src/article-context.js:148](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L148). История оболочки на [src/mobile-shell.js:201](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L201) записывает materialId только при `context.manual`. Получаются два разных представления одного выбора: контроллер статьи считает его ручным, оболочка — автоматическим.

**Исправление:** обновлять metadata выбора независимо от переноса DOM. При том же узле не нужно заново перелистывать/сбрасывать scrollTop, но manual и history обязаны обновиться.

**Проверка:** клик по текущему автоматическому ID → прокрутка в другую главу → Back/Forward → прежняя карточка и её ручной приоритет восстановлены. В этом аудите браузером не воспроизводилось.

### C4 · P3 · Два способа раскрыть панель дают разное поведение Back — код; UX-контракт нужно зафиксировать

Нажатие заголовка/preview вызывает `setSnap` без записи истории: [src/mobile-shell.js:224](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L224), [src/mobile-shell.js:231](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L231). Через FAB тот же открытый материал проходит `openMode` с `recordHistory`: [src/mobile-shell.js:262](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L262). После автоматического preview и ручного раскрытия системный Back поэтому может уйти со страницы, а через FAB — закрыть панель.

**Исправление после фиксации ожидания:** явное раскрытие человеком должно одинаково оформлять историю независимо от контрола. Автоматическое появление preview само по себе не должно добавлять запись.

**Проверка:** одинаковые сценарии title / preview overlay / FAB, затем Back/Forward, без лишних записей при обычном скролле.

## 2. Сократить лишнюю работу

### O1 · P2 · 136 чередующихся изменений стиля и измерений за пересчёт заголовков

[src/section-headings.js:39](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/section-headings.js#L39) задаёт размеры; цикл на [src/section-headings.js:45](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/section-headings.js#L45) проходит 17 состояний, каждый раз меняя `--section-heading-progress` и сразу читая `getBoundingClientRect`. В нынешней статье восемь anchored-секций: **8 × 17 = 136 read-after-write измерений** за `measure()`.

Пересчёт инициируют resize, load с capture, шрифты и style-изменения html: [src/section-headings.js:75](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/section-headings.js#L75). Это подтверждённая возможность многократного синхронного Layout, но его миллисекунды ещё не измерены.

**Что делать:** группировать записи и чтения по фазам для всех заголовков; пропускать пересчёт при неизменной геометрии; сузить invalidation. Не удалять резервирование высоты — оно защищает текст от пересечений. Измерять только начало/конец вместо всех состояний можно лишь после проверки промежуточных переносов.

**Сопутствующее расхождение:** [src/section-headings.js:41](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/section-headings.js#L41) вычисляет малый кегль через `measuredWidth * .018` (18–22 px), хотя правила запрещают подгонку текста под ширину. Вынести конечный размер в фиксированный токен, сохранив скролл-анимацию.

### O2 · P2 · Глитч сканирует буквы на каждом движении мыши даже вне экрана

[src/headline-glitch.js:132](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L132) читает прямоугольник каждой буквы. [src/headline-glitch.js:201](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L201) сканирует их при поиске буквы под курсором, затем повторно измеряет кандидатов. Listener стоит на всём document: [src/headline-glitch.js:324](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L324). Быстрого отсечения по видимости/границам H1 до сканирования нет.

На scroll выполняются hover-обновление и отдельный отложенный scan: [src/headline-glitch.js:240](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L240). Ограничение 200 ms проверяется после построения кандидатов: [src/headline-glitch.js:184](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L184).

**Что делать:** быстрый отсев по H1/IntersectionObserver, объединение pointermove в rAF, throttle до дорогой выборки; затем кеш геометрии с корректным сбросом при переносах/шрифтах/resize. Сохранить фирменный эффект и доступный исходный текст. Падение FPS этим аудитом не измерялось.

### O3 · P2 · Статичная сфера всё равно получает источники трёх MP4

[src/video-sphere.js:232](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/video-sphere.js#L232) назначает `src` всем видео и `preload=auto` до проверки reduced motion. На [src/video-sphere.js:252](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/video-sphere.js#L252) блокируется только play, а статичная сфера рисуется из JPEG. Ролики суммарно весят **6 910 014 байт**. Реальное количество скачанных байт зависит от браузера, но назначение preload/src доказано.

Сфера также не учитывает `navigator.connection.saveData`, в отличие от [src/mobile-city-video.js:21](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-city-video.js#L21) и шторки.

**Что делать:** не назначать видеоисточники до разрешённого движения/явного действия, оставить постеры; корректно подключать их при смене настройки. Не удалять всю сферу: ограничение canvas, пауза скрытой вкладки и снижение частоты уже реализованы.

### O4 · P2 · Два используемых PNG дают 17,48 MB без мобильных вариантов

Обложка 3516×1984: [src/article-view.js:149](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-view.js#L149), **8 807 758 байт**. Запасной фон интро: [index.html:25](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/index.html#L25), **8 675 820 байт**. Вместе **17 483 578 байт**. У обоих один полноразмерный PNG для всех экранов.

**Что делать:** подготовить WebP/AVIF и responsive srcset/picture с визуальным сравнением; исходники при необходимости хранить вне публикуемых assets. Это живая графика, её нельзя просто удалить. Повторные img одного адреса не равны повторным полным сетевым загрузкам.

**Проверка:** вид обложки/фона на 320/390/1440, fallback без WebGL/при ошибке видео, затем LCP и трафик на телефоне.

### O5 · P2 · Кеш видео проверяется после полного повторного кодирования

[scripts/prepare-videos.mjs:82](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L82) уже знает fingerprint. Затем создаёт stage и кодирует три MP4 + два JPEG: [scripts/prepare-videos.mjs:84](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L84), [scripts/prepare-videos.mjs:88](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L88), [scripts/prepare-videos.mjs:98](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L98). Только [scripts/prepare-videos.mjs:103](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L103) проверяет существующий destination и выбрасывает stage при совпадении.

Повторный запуск без изменений для пяти рецептов выполняет **15 видеокодирований и 10 постеров**, которые затем не используются.

**Что делать:** проверять готовый набор и соответствие manifest до ffmpeg; пропускать только полный валидный кеш. Сохранить атомарность: не публиковать manifest, пока все нужные выходы не готовы. При отсутствии/повреждении файла перекодировать. Длительность encode в этом аудите не измерена.

### O6 · P3 · Клик вне уже закрытой шапки повторно пересчитывает контроллеры

[src/article-header.js:215](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-header.js#L215) → `close()` → [src/article-header.js:77](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-header.js#L77) → безусловный `onChange()`. [src/article.js:25](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article.js#L25) повторяет setters при том же состоянии; [src/headline-glitch.js:349](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L349) ставит измерение, [src/article-context.js:335](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L335) вызывает render с измерением глав.

**Что делать:** уведомлять лишь при реальном изменении или сделать setters идемпотентными. Это лишняя работа, не доказанный функциональный сбой клика по сущности.

### O7 · P3 · Первый клиентский render уничтожает уже готовый статический HTML

[scripts/generate-article.mjs:8](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/generate-article.mjs#L8) заранее записывает статью и «О нас». На первой загрузке [src/media-demo.js:27](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/media-demo.js#L27) снова заменяет main через innerHTML; bootstrap всегда вызывает render на [src/media-demo.js:57](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/media-demo.js#L57). Статья создаётся повторно, затем выполняются измерения и mount.

**Что делать:** улучшать готовые узлы при первой загрузке, создавать шаблон только при клиентском переходе. Сохранить fallback без JS, перенос шапки, reading-layout и постоянное видео вне роутера. Это более рискованный рефакторинг; делать после локальных исправлений.

### O8 · P3 · Скрытый мобильный поиск заранее строит девять карточек

[src/mobile-shell.js:390](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L390) вызывает и render, и renderSearch на mount, в том числе на десктопе. [src/mobile-shell.js:235](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L235) создаёт девять ссылок/img до открытия поиска. Скрытый root не гарантирует отсутствие загрузки картинок.

**Что делать:** строить выдачу при первом открытии, затем при изменении запроса. Сохранить реакцию оболочки на смену breakpoint; не убирать весь mobile lifecycle на десктопе без remount-контракта. Создание DOM доказано, дополнительный сетевой трафик нужно измерить.

### O9 · P3 · Один manifest загружается и разбирается несколькими независимыми потребителями

[src/scene-rail.js:322](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/scene-rail.js#L322), по одному [src/quote-background-video.js:38](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/quote-background-video.js#L38) на каждую из двух сцен, [src/mobile-city-video.js:52](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-city-video.js#L52). Получается до четырёх fetch/JSON-разборов; HTTP-кеш может убрать часть сетевого трафика.

**Что делать:** общий loader успешного результата/запроса, корректный retry после ошибки. Отмена одного потребителя не должна обрывать запрос другим. Не вводить ради небольшого JSON глобальную сложную систему состояния.

## 3. Убрать отключённые и лишние части

### D1 · P2 · Клубный свет и его редактор

[src/story-club.js:6](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/story-club.js#L6) требует отсутствующий `data-article-end`, поэтому возвращает пустые методы. Разметка из шести слоёв осталась на [src/article-view.js:98](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-view.js#L98), mount — [src/article.js:22](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article.js#L22), вкладка/предпросмотр — [src/dev-panel.js:42](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/dev-panel.js#L42), [src/dev-panel.js:181](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/dev-panel.js#L181), большой редактор — [src/story-club-editor.js:21](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/story-club-editor.js#L21), параметры — [src/story-club-settings.js:1](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/story-club-settings.js#L1), CSS — [article.css:210](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/article.css#L210).

Если эффект не нужен, удалять весь комплект с интеграцией, каталогом и тестами настроек; редактор сетки сохранять. Старая отдельная кнопка редактора на [src/story-club-editor.js:115](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/story-club-editor.js#L115) дополнительно обращается к null без защиты. Восстановление маркера было бы возвратом функции, не обязательным шагом очистки.

### D2 · P3 · Постоянно скрытая подсказка руки

[index.html:15](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/index.html#L15) с самого начала имеет `intro--revealed`, который на [styles.css:77](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/styles.css#L77) скрывает руку и останавливает её анимацию. Ни один текущий контроллер этот класс не снимает. Сфера продолжает создавать подсказку: [src/video-sphere.js:145](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/video-sphere.js#L145), [src/drag-hint.js:55](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/drag-hint.js#L55).

Решение: восстановить видимость либо удалить модуль, вызовы, CSS и его тесты комплектом. SVG ладоней в курсорах — отдельное действующее применение, их не трогать.

### D3 · P3 · Недостижимый compact/ambient режим глитча

`compact=false` на [src/headline-glitch.js:20](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L20); меняется только `setCompact` на [src/headline-glitch.js:354](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L354), внешних вызовов нет. Редкая замена буквы по таймеру [src/headline-glitch.js:248](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/headline-glitch.js#L248), отдельные ветки и soft-CSS не достигаются.

Удалять этот режим, таймер и обслуживание, сохраняя действующий hover/scroll-глитч.

### D4 · P3 · Контроллер обычного видео без потребителя

[src/editorial-video.js:4](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/editorial-video.js#L4) ищет `video[data-editorial-video]`, которых нынешние шаблоны не создают. [src/media-demo.js:36](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/media-demo.js#L36) всё ещё монтирует его на каждом переходе.

Можно убрать модуль, import/dispose и CSS обычного видеоблока. Не затрагивать отдельные живые `quote-background-video`/`mobile-city-video` и нужные им article.mp4.

### D5 · P2 · Служебный внешний capture-скрипт в двух посетительских страницах

[index.html:4](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/index.html#L4), [article.html:4](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/article.html#L4) без условия подключают `mcp.figma.com/.../capture.js`. Читательский интерфейс его не использует. Удалить из публикуемых HTML; генератор сохраняет head и сам этого не сделает.

### D6 · P3 · Подтверждённые CSS-остатки

- `.landing-placeholder*`: [styles.css:336](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/styles.css#L336).
- `.story-margin-note`, `.story-footnotes`, `.story-footnote-back` и их адаптивные повторы: [article.css:163](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/article.css#L163), [article.css:206](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/article.css#L206). Современные context-material/backlink сохранить.
- `.media-section-heading`: [media.css:17](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/media.css#L17), [scene-rail.css:53](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scene-rail.css#L53).
- `.story-video`/обычное editorial video: [scene-rail.css:40](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scene-rail.css#L40).
- `.specimen-type-display/heading`: [src/component-preview.css:12](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/component-preview.css#L12).
- `.editorial-quote__mark`: [src/components/editorial-typography.css:125](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/components/editorial-typography.css#L125).
- `.story-footer` в старом световом editor: [light-editor.css:63](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/light-editor.css#L63).
- Неиспользуемая `--mobile-sheet-height`: [src/mobile-shell.css:20](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.css#L20); теперь используются full/preview/drag.
- Старые телефонные размеры шторки на [scene-rail.css:71](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scene-rail.css#L71) перекрыты полным скрытием ниже1200 на [scene-rail.css:186](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scene-rail.css#L186). Это не новая `.mobile-shell`.

Наличие других @container/@media или повторного правила само по себе не доказывает конфликт: многие переопределения описывают сознательную смену геометрии.

### D7 · P3 · Продукт и инструменты публикуются одним комплектом

[scripts/build.mjs:11](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/build.mjs#L11) копирует тест глитча, каталог/превью, редакторы, а строки14–16 — все src/docs/assets. DEV доступен по URL-флагу: [src/dev-settings.js:4](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/dev-settings.js#L4). Это локальные настройки браузера, не доказанная серверная уязвимость.

Сделать явный product-build и отдельный tools-build либо поддерживаемый allowlist. Сохранённому каталогу нужны его ссылки на документы и исходники: [src/component-catalog.js:5](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/component-catalog.js#L5). Простое исключение всех docs/src его сломает. Не обязательно вводить тяжёлый бандлер.

### D8 · P3 · 23 обычных ресурса и 9 производных видео

Суммарный проверенный объём кандидатов: **5 110 829 байт** (5,11 MB). Все они сегодня копируются в dist. Полный пофайловый список ниже и в JSON доказательств.

Это не включает 17,48 MB действующих PNG из O4, шрифтовые комплекты дизайн-системы или библиотечные компоненты. Для видео обязательно сначала изменить экспортёр/manifest/тесты: [scripts/prepare-videos.mjs:88](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L88), [scripts/prepare-videos.mjs:108](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/prepare-videos.mjs#L108), [test/editorial-video.test.js:20](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/test/editorial-video.test.js#L20). Иначе удаление ломает проверки и следующий encode всё вернёт.

## 4. Незавершённые интеграции, которые нельзя путать с мёртвым кодом

### I1 · P2 перед запуском · Демонстрационный поиск

[src/article-search-data.js:2](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-search-data.js#L2) содержит девять анонсов, а не реальные публикации с href. [src/article-search-data.js:14](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-search-data.js#L14) ищет только по artist/title. Оба рендера ведут на главную: [src/article-header.js:107](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-header.js#L107), [src/mobile-shell.js:242](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L242). Даже существующая статья madk1d объявляется будущей.

Нужен минимальный реальный индекс публикаций с адресом/заголовком из редакционного источника либо решение временно убрать поиск. Не удалять индексовые картинки, пока демонстрационный поиск оставлен.

### I2 · P2 перед запуском · Два разных меню с заглушками

[src/article-view.js:114](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-view.js#L114) содержит два одинаковых «Карта артистов» и disabled-разделы. [src/mobile-shell.js:57](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.js#L57) выдаёт четыре активные ссылки, все на index.

Один источник существующих разделов для двух рендеров. Сами анимации меню и мобильную оболочку сохранить. «О нас» тоже временное, но достижимо с главной: [src/media-views.js:3](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/media-views.js#L3); не удалять файл без смены входящей ссылки.

### I3 · P2 перед запуском · Основная форма не отправляет email

[index.html:52](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/index.html#L52) использует `YOUR_FORM_ID`; guard [src/subscribe-modal.js:168](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/subscribe-modal.js#L168) блокирует отправку. Диалог, валидация и состояния работают, но endpoint не настроен.

Подключить реальный сервис либо выбрать существующий способ контакта. Не изменять дизайн зафиксированной CTA и не удалять обработку ошибок как «недостижимую». Таймер45сек — отдельная реально работающая механика; его снятие требует решения по продукту.

## 5. Актуальный список ресурсов D8

Обычные ресурсы: **23 файла, 1 060 394 байта**.

| Файл | Байты |
|---|---:|
| `assets/figma/article/navigation/logo-menu.svg` | 3 697 |
| `assets/figma/article/navigation/logo.svg` | 3 697 |
| `assets/figma/article/navigation/menu-open.svg` | 458 |
| `assets/figma/article/navigation/menu-trail.svg` | 458 |
| `assets/figma/article/navigation/menu.svg` | 456 |
| `assets/figma/article/navigation/search-chevron.svg` | 475 |
| `assets/figma/article/navigation/search-toggle.svg` | 947 |
| `assets/figma/article/navigation/search.svg` | 930 |
| `assets/figma/article/navigation/star.svg` | 3 698 |
| `assets/figma/article/arrow-left.svg` | 482 |
| `assets/figma/article/arrow-right.svg` | 482 |
| `assets/figma/article/star.svg` | 3 685 |
| `assets/figma/article/sexyswag-cover.webp` | 12 390 |
| `assets/figma/clear.svg` | 576 |
| `assets/figma/north-east.svg` | 404 |
| `assets/icons/intro-north-east.svg` | 482 |
| `assets/icons/content-copy-sharp.svg` | 285 |
| `assets/icons/navigate-next-sharp.svg` | 218 |
| `assets/link.svg` | 479 |
| `assets/fonts/Benzin-Input-Mobile-Bold.woff2` | 39 608 |
| `assets/figma/mobile-shell/menu.svg` | 454 |
| `assets/figma/mobile-shell/search.svg` | 894 |
| `assets/figma/mobile-shell/search-scene.png` | 985 139 |

Производные видео/постеры: **9 файлов, 4 050 435 байт**.

| Файл | Байты |
|---|---:|
| `assets/video/editorial/kitay-night-86bc7af48de9/rail-small.mp4` | 427 474 |
| `assets/video/editorial/kitay-street-c41b36032219/rail-small.mp4` | 303 769 |
| `assets/video/editorial/kitay-people-0dd1e134849b/rail-small.mp4` | 304 680 |
| `assets/video/editorial/concert-crowd-7026abb1ab1c/rail-small.mp4` | 257 707 |
| `assets/video/editorial/concert-crowd-7026abb1ab1c/article.mp4` | 1 448 554 |
| `assets/video/editorial/concert-crowd-7026abb1ab1c/article-poster.jpg` | 55 295 |
| `assets/video/editorial/madk1d-chorus-6e39d25cf629/rail-small.mp4` | 590 166 |
| `assets/video/editorial/madk1d-chorus-6e39d25cf629/rail-large.mp4` | 653 218 |
| `assets/video/editorial/madk1d-chorus-6e39d25cf629/article-poster.jpg` | 9 572 |

**Не удалять** `assets/video/editorial/madk1d-chorus-6e39d25cf629/poster.jpg`: после прежнего аудита он стал картинкой поиска на [src/article-search-data.js:11](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-search-data.js#L11). `rail-large`/poster остальных городских роликов могут использоваться переключением видео; нельзя удалять каталог целиком по одному ненужному article-экспорту.

При удалении Input Mobile убрать также запись генератора [scripts/generate-input-fonts.py:20](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/scripts/generate-input-fonts.py#L20), но сохранить десктопный Benzin Input: мобильный токен теперь обычный Benzin на [src/design-tokens.css:93](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/design-tokens.css#L93). Лицензии не удалять по отсутствию JS-ссылки.

## 6. Гипотезы и ограничения, не объявленные готовыми дефектами

1. **Телефонная панель поверх песенной сцены.** [src/article.js:30](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article.js#L30) приостанавливает контекст, но [src/article-context.js:335](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L335) скрывает desktop rail, не mobile shell. В CSS shell z55, слои цитаты z10/11. Оставленная раскрытая панель может перекрывать сцену. Требуются сценарий и UX-решение: временно скрывать с сохранением состояния или разрешать совместный просмотр. Не вносить автоматическое закрытие без проверки.
2. **Старые fingerprint-каталоги.** Новый encode не удаляет прежние каталоги. Сегодня все пять каталогов соответствуют manifest, накопившегося мусора здесь нет. Можно добавить безопасный prune после успешного экспорта, не приписывая ему сегодняшнюю экономию.
3. **Два видео одного концертного источника.** У каждой сцены свой video, узлы остаются до dispose. Возможная цена памяти требует memory-profile; объединение видео — отдельный рискованный рефакторинг.
4. Не доказаны бесконечный rAF-loop цитат, «видео никогда не ставятся на паузу», ежекадровое JS-перестроение context-title или вред всех container queries. Такие утверждения в задачу не включать.

## 7. Что сохранить и в каком порядке работать

**Ограничения:** [AGENTS.md:1](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/AGENTS.md#L1). Основная CTA — только общий action-button, розовый прямоугольник с белым текстом/стрелкой; страницу не использовать для переопределения его дизайна. Две шрифтовые ступени760/761. В каждой песенной сцене минимум4 исходные строки либо короткий припев целиком; сразу далее разбор показанного. Сохранить четыре строки припева и пять строк куплета, а не сокращать их ради оптимизации.

Сохранить единый DOM-узел справки, ручной приоритет, keyboard/focus/Back, reduced motion, статический fallback, обработку отказа storage и освобождение подписок. Живая подсветка абзаца и справки используется: [src/article-context.js:89](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/article-context.js#L89), [src/mobile-shell.css:3](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/src/mobile-shell.css#L3).

Обычная хронология работает; fact, обычные редакционные цитаты и secondary CTA используются стендами. Их отсутствие в одной статье не разрешает удаление общего модуля. Музыкальные плееры, Twitch/live, countdown, редактор набросков уже отсутствуют в src; не восстанавливать их по архивному research. [docs/article-interactions.md:1](https://github.com/pentaoo/media/blob/2d5e45641a4345bb616436576cbe831126b244c1/docs/article-interactions.md#L1) прямо помечен архивом.

Предлагаемые независимые изменения:

1. **Контракты состояния:** C1/C2, затем C3/C4; проверить интеграцию, а не только reducer.
2. **Безопасная очистка:** D1–D6 с их импортами, CSS, каталогом и документацией; D2 — после выбора «восстановить/убрать».
3. **Ресурсы и сборка:** D7/D8, не забыть нынешние картинки поиска; O4 отдельно с визуальным сравнением.
4. **Вычисления и загрузка:** O1/O2/O3/O5/O6, затем более рискованные O7–O9.
5. **Готовность продукта:** I1–I3; это решения о действующих точках интерфейса.

Старые deliverables не запускаются npm test и не доказывают свежую работоспособность. Их архивирование уменьшит шум checkout, но не размер dist: build их уже не копирует. Не удалять весь архив: там лежат утверждённые редакционные исходники.

## 8. Проверка повторного аудита и критерии приёмки очистки

**Выполнено сейчас:** `npm test` — 48/48, `npm run build` — успешно, 184 файла/41 306 672 байта в dist. Исходники после генерации не изменились. Реально воспроизведены C1/C2 на390×844. Локальный тестовый сервер остановлен, временный viewport сброшен. Физический Android/встроенный браузер и новые perf-трейсы не проверялись.

Unit-тесты проходят даже при подтверждённых интеграционных ошибках. Не использовать зелёный npm test как единственное доказательство корректности истории и стендов.

После каждого соответствующего изменения:

- C1/C3/C4: ручной и автоматический ID, поиск/меню поверх панели, крестик, Escape, Back/Forward; материал, snap и позиция чтения сохраняются.
- C2: header/image preview без rail на телефоне и после resize, отсутствие console errors.
- O1/O2: измерение Layout/long tasks и pointermove с H1 вне экрана; переносы заголовков не пересекают текст.
- O3/O4: reduced motion/saveData, статичная сфера, отказ WebGL/видео; размер/загрузка обложки на телефоне.
- O5/D8: повторный encode без изменений не запускает ffmpeg; потерянный файл восстанавливается; manifest корректен; нужные поисковые постеры сохранены.
- Оба CTA: центрирование группы, отсутствие overflow, диалог, фокус/клавиатура, validation/отправка при настроенном сервисе.
- Обе песенные сцены: число исходных строк, следующий разбор, вход/выход в обе стороны, скрытие/возврат desktop rail.
- `npm test`, `npm run build`, затронутые браузерные регрессии в scripts/check-*.mjs. Они требуют отдельного Playwright/ADB-окружения и не входят автоматически в npm test.

Для отчёта следующего ИИ нужны список фактических изменений, проверки и оставшиеся неопределённости. Публикация и реализация архивных идей из этой задачи не следуют.
