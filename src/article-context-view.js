// Trusted editorial data is escaped here, including URLs and attributes.
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const safeUrl = value => /^(https?:\/\/|\.\.?\/|#)/i.test(value || '') ? escape(value) : '';
const entityTypes = { artist: 'Артист', album: 'Альбом', track: 'Трек' };

export function contextMaterialView(material) {
  const { id, title, paragraphs, image, sources, backTo, kind, entity } = material;
  return `<aside class="article-context-material${entity ? ` entity-card entity-card--${escape(entity.type)}` : ''}" id="${escape(id)}" data-context-material="${escape(id)}" tabindex="-1"${kind === 'footnote' ? ' role="doc-footnote"' : ''}${title ? ` aria-labelledby="${escape(id)}-title"` : ' aria-label="Пояснение к тексту"'}>
    ${title ? `<h2 id="${escape(id)}-title">${escape(title)}</h2>` : ''}
    ${entity ? `<p class="entity-card__type">${escape(entityTypes[entity.type] || '')}</p>` : ''}
    ${image ? `<figure><img src="${safeUrl(image.src)}" alt="${escape(image.alt)}" width="${image.width}" height="${image.height}" loading="lazy">${image.credit ? `<figcaption>${escape(image.credit)}</figcaption>` : ''}</figure>` : ''}
    ${entity?.subtitle ? `<p class="entity-card__subtitle">${escape(entity.subtitle)}</p>` : ''}
    ${entity?.details?.length ? `<dl class="entity-card__details">${entity.details.map(item => `<div><dt>${escape(item.label)}</dt><dd>${escape(item.value)}</dd></div>`).join('')}</dl>` : ''}
    ${paragraphs.map(text => `<p>${escape(text)}</p>`).join('')}
    ${sources?.length ? `<p class="article-context-sources">${sources.map(source => `<a href="${safeUrl(source.href)}"${source.releaseId ? ` data-yandex-release="${escape(source.releaseId)}" aria-controls="media-yandex-frame" aria-expanded="false"` : ''}>${escape(source.label)}</a>`).join(entity ? '' : ' · ')}</p>` : ''}
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
