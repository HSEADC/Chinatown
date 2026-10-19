// Trusted editorial data is escaped here, including URLs and attributes.
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const safeUrl = value => /^(https?:\/\/|\.\.?\/|#)/i.test(value || '') ? escape(value) : '';

export function contextMaterialView(material) {
  const { id, title, paragraphs, image, sources, backTo, kind } = material;
  return `<aside class="article-context-material" id="${escape(id)}" data-context-material="${escape(id)}" tabindex="-1"${kind === 'footnote' ? ' role="doc-footnote"' : ''}${title ? ` aria-labelledby="${escape(id)}-title"` : ' aria-label="Пояснение к тексту"'}>
    ${title ? `<h2 id="${escape(id)}-title">${escape(title)}</h2>` : ''}
    ${image ? `<figure><img src="${safeUrl(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy">${image.credit ? `<figcaption>${escape(image.credit)}</figcaption>` : ''}</figure>` : ''}
    ${paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}
    ${sources?.length ? `<p class="article-context-sources">${sources.map(source => `<a href="${safeUrl(source.href)}">${escape(source.label)}</a>`).join(' · ')}</p>` : ''}
    ${backTo ? `<a class="article-context-backlink" href="#${escape(backTo)}" role="doc-backlink">К тексту ↑</a>` : ''}
  </aside>`;
}

export function contextEntryView(material) {
  return `<p class="article-context-entry"><a href="#${escape(material.id)}" data-context-ref="${escape(material.id)}">${escape(material.title)} <span aria-hidden="true">↗</span></a></p>`;
}

export function nextArticleView(next) {
  if (!next || !['published', 'upcoming'].includes(next.status)) return '';
  const href = next.status === 'published' ? safeUrl(next.href) : '';
  if (next.status === 'published' && !href) return '';
  return `<aside class="story-next" data-context-next aria-labelledby="story-next-title">
    ${next.image ? `<img src="${safeUrl(next.image.src)}" alt="${escape(next.image.alt || '')}" loading="lazy">` : ''}
    <h2 class="story-next__title" id="story-next-title">${escape(next.title)}</h2>
    <p class="story-next__copy">${escape(next.description)}</p>
    ${href ? `<a class="story-next__link" href="${href}">Читать →</a>` : '<p class="story-next__status">Скоро</p>'}
  </aside>`;
}
