// Mat masking for everything the site serves. HSE portfolio rules: mat must be
// masked with asterisks, otherwise the project needs an 18+ mark. Masking lives
// in the source text itself, so no unmasked word ever reaches the page.
// Rules: AGENTS.md, «Мат». Check: npm test. Fix: npm run mat:mask.

// Each rule matches the start of a lower-case word and names which letters of
// the root turn into asterisks (offsets inside the match). Prefixes are listed
// explicitly so that «небо», «хлеб», «употребляя», «мандат» stay intact.
const rules = [
  // пизд-: anywhere in a word («попиздаче», «распиздяй»).
  { pattern: /п[ие]зд/u, mask: [1] },
  // хуй / хуё / хуя / хуе / хуи / хую with common prefixes.
  { pattern: /^(?:по|на|ни|не|до|за|от|рас|а|о|ох)?ху[йяеёию]/u, mask: ['у'] },
  // бля, блядь, блять; not «бляха», «бляшка», «блямба».
  { pattern: /^(?:вы|за)?бл[яэ](?![хшм])/u, mask: ['я', 'э'] },
  // ебать and its family: «ебал», «ебасос», «уёбок», «заебись», «долбоёб».
  { pattern: /^(?:у|за|на|до|по|вы|об|объ|отъ|съ|разъ|подъ|при|долбо|недо)?[её]б/u, mask: ['б'] },
  { pattern: /^муд(?:ак|ач|ил|озвон)/u, mask: ['у'] },
  { pattern: /^пид(?:[оа]р|р)/u, mask: ['и'] },
  { pattern: /^г[ао]нд[оа]н/u, mask: [1] },
  { pattern: /^залуп/u, mask: ['у'] },
  { pattern: /^манд(?:авош|[аеуы]$|ой$)/u, mask: [1] },
];

// Latin transliterations in ids, anchors and file names are visible in the
// address bar; they cannot be masked, only renamed by hand.
const latin = /(?:^|[^a-z])(?:po|na|ni)?(?:hu[iyj]|pizd|bly[ad]|yob|eba[ln])/i;

const word = /[а-яё]+/giu;
const url = /https?:\/\/[^\s"'`)<>]+/gu;

function maskWord(original) {
  const lower = original.toLocaleLowerCase('ru');
  for (const rule of rules) {
    const match = rule.pattern.exec(lower);
    if (!match) continue;
    const chars = [...original];
    const offsets = new Set();
    for (const mark of rule.mask) {
      if (typeof mark === 'number') offsets.add(match.index + mark);
      else {
        // The last occurrence of the letter inside the match is the root vowel
        // or consonant («похуй» → «пох*й», «уёбку» → «уё*ку»).
        const at = match[0].lastIndexOf(mark);
        if (at >= 0) offsets.add(match.index + at);
      }
    }
    for (const offset of offsets) chars[offset] = '*';
    return chars.join('');
  }
  return original;
}

// Applies the mask to plain text; URLs are left as they are, since links must keep working.
export function maskProfanity(text) {
  let result = '';
  let last = 0;
  for (const link of String(text).matchAll(url)) {
    result += String(text).slice(last, link.index).replace(word, maskWord) + link[0];
    last = link.index + link[0].length;
  }
  return result + String(text).slice(last).replace(word, maskWord);
}

// Lists unmasked words (and Latin transliterations) found in the text, with line numbers.
export function findProfanity(text) {
  const hits = [];
  String(text).split('\n').forEach((line, index) => {
    const bare = line.replace(url, ' ');
    for (const [found] of bare.matchAll(word)) {
      if (maskWord(found) !== found) hits.push({ line: index + 1, word: found });
    }
    for (const token of bare.match(/[a-z0-9-]+/gi) || []) {
      if (latin.test(token)) hits.push({ line: index + 1, word: token, latin: true });
    }
  });
  return hits;
}

// Files that end up in dist/ (see scripts/build.mjs) and contain text.
export const servedTextFiles = {
  root: ['index.html', 'about.html', 'article.html', 'glitch-test.html', 'components.html', 'component-preview.html'],
  dirs: ['src', 'docs'],
  extensions: /\.(?:html|js|mjs|json|md|css|svg|vtt|txt)$/,
};
