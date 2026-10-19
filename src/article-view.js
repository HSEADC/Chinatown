import { madk1dContext as context } from './article-context-data.js';
import { contextMaterialView, contextEntryView, nextArticleView } from './article-context-view.js';
const material = id => context.materials.find(item => item.id === id);
const artwork = './assets/figma/article/';
const icons = `${artwork}header/`;
const trackUrl = 'https://www.shazam.com/de-de/song/1802942825/так-похуй';

export const articleTitle = 'madk1d: слишком громко, чтобы было всё равно';

/** The complete article, shared by the static page and client-side navigation. */
export function articleView() {
  return `<div class="story-page" data-node-id="250:107" data-video-clip="kitay-night" data-article-id="${context.articleId}">
    <div class="story-club" data-story-club aria-hidden="true">
      <div class="story-club__haze"></div>
      <div class="story-club__bloom"></div>
      <div class="story-club__beam story-club__beam--pink"></div>
      <div class="story-club__beam story-club__beam--blue"></div>
      <div class="story-club__beam story-club__beam--green"></div>
      <div class="story-club__seam"></div>
    </div>
    <a class="story-skip" href="#article-content">Перейти к статье</a>
    <header class="story-header" data-node-id="272:111">
      <div class="story-header__bar">
        <div class="story-header__identity" data-node-id="272:112">
          <button class="story-icon story-brand" type="button" aria-label="Навигация Чайнатаун" aria-controls="article-menu" aria-expanded="true" data-node-id="272:113">
            <img src="${icons}star.svg" alt="" width="53.1136" height="53.3759">
          </button>
        </div>
        <nav class="story-menu" id="article-menu" aria-label="Навигация Чайнатаун" data-node-id="272:116">
          <button class="story-menu__item" type="button" aria-disabled="true" title="Раздел готовится" data-node-id="272:118">Карта артистов</button>
          <button class="story-menu__item" type="button" aria-disabled="true" title="Раздел готовится" data-node-id="272:119">Карта артистов</button>
          <a class="story-menu__item" href="#article-content" data-node-id="272:120">Статьи</a>
          <button class="story-menu__item" type="button" aria-disabled="true" title="Раздел готовится" data-node-id="272:121">Тесты</button>
          <button class="story-menu__item" type="button" aria-disabled="true" title="Раздел готовится" data-node-id="272:122">Мерч</button>
        </nav>
        <form class="story-search" id="article-search-form" role="search" aria-label="Поиск по статье" data-node-id="272:103" inert>
          <button class="story-icon story-search__submit" type="submit" aria-label="Найти в статье" data-node-id="272:104">
            <img src="${icons}search.svg" alt="" width="32" height="32">
          </button>
          <label class="story-visually-hidden" for="article-search">О чем скучаешь? Найти в статье</label>
          <input id="article-search" name="q" type="search" placeholder="О чем скучаешь?" autocomplete="off" aria-controls="article-search-results" data-node-id="272:108">
        </form>
        <div class="story-header__controls" data-node-id="272:123">
          <button class="story-icon story-search-toggle" type="button" aria-label="Открыть поиск" aria-expanded="false" aria-controls="article-search-form article-search-results" data-node-id="272:124">
            <img src="${icons}search.svg" alt="" width="32" height="32">
          </button>
          <button class="story-icon story-menu-toggle" type="button" aria-label="Открыть навигацию" aria-expanded="false" aria-controls="article-menu" hidden>
            <img src="${icons}menu.svg" alt="" width="32" height="32" data-node-id="272:110">
          </button>
        </div>
      </div>
      <div class="story-search__results" id="article-search-results" data-node-id="263:254" hidden>
        <div class="story-search__inner">
          <p class="story-search__status" role="status" aria-live="polite" hidden></p>
          <ul></ul>
        </div>
      </div>
    </header>
    <article class="story" aria-labelledby="article-title">
      <header class="story-cover" data-node-id="290:69">
        <img class="story-cover__photo" src="${artwork}madk1d-concert.png" alt="madk1d выступает перед зрителями на освещённой сцене" width="3516" height="1984" fetchpriority="high">
        <div class="story-cover__shade" aria-hidden="true"></div>
        <div class="story-cover__meta" data-node-id="290:70">
          <p class="media-eyebrow story-category" data-node-id="290:71">Новая сцена  <span aria-hidden="true">/</span>  Портрет</p>
          <p class="story-meta" data-node-id="290:72">3 минуты</p>
        </div>
        <div class="story-cover__intro-row" data-node-id="293:210">
          <p class="story-cover__intro" data-node-id="293:209">В «так похуй» madk1d собирает злость и браваду в одну цепкую фразу. Разбираемся, что скрывается за равнодушием.</p>
        </div>
        <h1 class="story-cover__title" id="article-title" data-node-id="290:74"><span class="story-cover__artist"><span class="media-accent">madk1d</span>:</span> слишком громко, чтобы было всё равно</h1>
      </header>
      <div class="story-content" id="article-content" tabindex="-1">
        <section class="story-section story-column story-section--anchored" id="artist" aria-labelledby="artist-title" data-search-section>
          <div class="story-section__heading"><h2 id="artist-title">Равнодушие с адресатом</h2></div>
          <div class="story-column story-section__copy">
          <p id="artist-intro">madk1d — музыкант из Томска. Для знакомства с ним можно начать с «так похуй», трека с альбома <em>sexyswag</em>. Здесь сразу возникает конфликт: герой объявляет, что давно оставил человека в прошлом, и тут же выдаёт раздражение его новой жизнью. Заявленная дистанция оказывается хрупкой. Это прочтение текста песни, а не вывод о личных переживаниях артиста. <a href="https://www.shazam.com/de-de/artist/madk1d/1598190372">Профиль madk1d</a>, <a href="${trackUrl}">страница трека</a>.</p>
          ${contextEntryView(material('madk1d-live'))}
          ${contextMaterialView(material('madk1d-live'))}
          </div>
        </section>
        <section class="story-section story-analysis story-section--anchored" id="chorus" aria-labelledby="chorus-title" data-search-section>
          <div class="story-section__heading"><h2 id="chorus-title">Что прячется внутри припева</h2></div>
          <div class="story-column story-section__copy">
            <p>Равнодушие в припеве существует только на словах. Герой пытается оттолкнуть адресата и немедленно переключить внимание на себя. Но само обращение оставляет другого человека в центре разговора: чтобы доказать, что связь закончилась, герою всё ещё нужен тот, с кем он её разрывает.</p>
            <p id="chorus-doubt">Слово «давно» особенно показательно. Оно должно подтверждать, что всё уже закончилось. Но возвращение припева позволяет услышать в этом утверждении попытку убедить самого себя. Чем настойчивее герой объявляет о равнодушии, тем заметнее становится адресат его речи.</p>
            ${contextMaterialView(material('address-note'))}
            <p id="chorus-conflict">Раздражение новой жизнью адресата делает эту дистанцию ещё менее убедительной. Герой обращает злость на соперника: чужая новая связь всё ещё задевает его настолько, что он хочет в неё вмешаться. Грубость можно прочитать как попытку вернуть себе преимущество в ситуации, которую герой не контролирует. Дальше припев меняет направление — от чужих отношений к рассказу о собственных удовольствиях и независимости.</p>
          </div>
        </section>
        <figure class="story-quote story-quote-scene" id="quote" data-quote-scene data-node-id="125:3">
          <div class="story-quote-scene__media" data-video-clip="madk1d-chorus" aria-hidden="true">
            <img class="story-quote-scene__photo" src="${artwork}madk1d-concert.png" alt="" width="3516" height="1984" loading="lazy" data-node-id="125:4">
            <div class="story-quote-scene__video"></div>
            <div class="story-quote-scene__shade" data-node-id="125:5"></div>
          </div>
          <div class="story-quote-scene__scroll">
            <div class="story-quote-scene__stage">
              <blockquote class="story-quote-scene__lyrics" aria-label="Цитата из припева «так похуй»" data-node-id="125:6">
                <p class="is-current" data-quote-line>На тебя давно так похуй, я хаваю всю сотку</p>
                <p data-quote-line>Разбить бы ебасос твоему новому уёбку</p>
                <p data-quote-line>Я в Питере пью водку, давать шалаве в глотку</p>
                <p data-quote-line>Я хаслил в интернете, посылал нахуй работу</p>
              </blockquote>
            </div>
          </div>
          <figcaption>Фрагмент припева «так похуй». <a href="${trackUrl}">Текст на Shazam</a>. <a href="https://www.youtube.com/watch?v=7r8eppkaOZM&amp;t=417s">Запись выступления</a>.</figcaption>
        </figure>
        <section class="story-section story-analysis story-section--anchored" id="chorus-freedom" aria-labelledby="chorus-freedom-title" data-search-section>
          <div class="story-section__heading"><h2 id="chorus-freedom-title">Свобода напоказ</h2></div>
          <div class="story-column story-section__copy">
            <p>В показанном фрагменте заявление о безразличии сразу соседствует с демонстрацией избытка. Разговорное «хаваю» делает первую строку грубой и телесной: герой предъявляет себя как человека, который берёт всё целиком. Во второй строке этот напор превращается в фантазию о насилии над новым партнёром адресата. Рассказ о себе и злость на соперника работают на один образ — человека, который старается выглядеть сильнее.</p>
            <p>Третья строка переключает речь на собственную жизнь: другой город, алкоголь и сексуальную браваду. Этот набор можно услышать как демонстрацию свободы — у героя якобы достаточно впечатлений, чтобы не думать об адресате. Но унизительное описание женщины продолжает тот же способ самоутверждения через обесценивание других. Меняется предмет разговора, а потребность выглядеть сильнее остаётся.</p>
            <p>Четвёртая строка добавляет к этому образу заработок в интернете и отказ от обычной работы. Разговорное «хаслил» поддерживает образ человека, который сам ищет возможности заработать. Герой предъявляет ещё один аргумент в пользу собственной независимости: он сам выбирает, чем заниматься. Однако в последовательности припева эта самостоятельность звучит как часть всё той же речи перед адресатом — как доказательство того, насколько хорошо он устроился без него.</p>
            <p>Весь фрагмент движется от объявления безразличия к конфликту, а затем — к рассказу о собственных удовольствиях и независимости. Его цепкость держится на этом несоответствии: герой предлагает слушателю образ человека, которому всё равно, но продолжает объяснять, почему он сильнее и свободнее других. Бравада поддерживает дистанцию, которую само обращение к адресату ставит под сомнение. <a href="${trackUrl}">Текст песни</a>.</p>
          </div>
        </section>
        <section class="story-section story-column story-section--anchored" id="delivery" aria-labelledby="delivery-title" data-search-section>
          <div class="story-section__heading"><h3 id="delivery-title">Слушать за словами</h3></div>
          <div class="story-column story-section__copy">
          <p>При повторном прослушивании попробуй сосредоточиться на подаче<sup><a class="story-footnote-ref" id="footnote-ref-1" href="#footnote-1" data-context-ref="footnote-1" aria-label="Сноска 1: что такое подача" role="doc-noteref">1</a></sup>. Насколько уверенно звучит заявление о безразличии? Что происходит с ним после куплета? Один и тот же припев может восприниматься сначала как вызов, затем — как застрявшая мысль, к которой герой снова возвращается.</p>
          ${contextMaterialView(material('footnote-1'))}
          <ul>
            <li>Как обращение к другому человеку соседствует с рассказом о себе.</li>
            <li>Как меняется восприятие припева после куплета.</li>
            <li>Что сильнее определяет героя: уверенность, злость или желание произвести впечатление.</li>
          </ul>
          </div>
        </section>
        <figure class="story-artwork story-column" id="sexyswag-artwork" data-context-material="sexyswag-artwork" tabindex="-1" aria-labelledby="sexyswag-artwork-caption">
          <a href="https://www.shazam.com/album/1802942624/sexyswag" aria-label="Альбом sexyswag на Shazam"><img src="${artwork}sexyswag-cover.webp" alt="Обложка альбома sexyswag — стилизованная страница поиска" width="632" height="632" loading="lazy"></a>
          <figcaption id="sexyswag-artwork-caption">Обложка <em>sexyswag</em> — альбома, в который вошёл «так похуй».</figcaption>
        </figure>
        <div class="story-listen story-column" id="listen">
          <a class="story-listen__link" href="https://soundcloud.com/madk1d-sc/tak-poxuj">Слушать «так похуй» <span aria-hidden="true">→</span></a>
          <span class="article-context-end" id="article-end" data-article-end aria-hidden="true"></span>
        </div>
        ${nextArticleView(context.next)}
      </div>
      <footer class="media-footer story-footer"><a href="./about.html" data-media-route>О нас</a><a href="#article-title">Наверх ↑</a></footer>
    </article>
  </div>`.replace(/[ \t]+$/gm, '');
}
