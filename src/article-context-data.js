// One automatic context per chapter. IDs are section anchors in article-view.js.
export const madk1dContext = {
  articleId: 'madk1d-tak-pohuy',
  materials: [
    {
      id: 'footnote-1',
      kind: 'footnote',
      paragraphs: ['Подача — манера исполнения: интонация, расстановка акцентов и то, как голос располагает слова в ритме.'],
      backTo: 'footnote-ref-1',
    },
    {
      id: 'address-note',
      kind: 'card',
      mobile: 'inline',
      paragraphs: ['Иногда фраза о безразличии выдаёт, сколько внимания человек всё ещё занимает.'],
    },
    {
      id: 'madk1d-live',
      kind: 'card',
      mobile: 'screen',
      title: 'madk1d на сцене',
      paragraphs: ['Припев в записи выступления — с 6:57 до 7:21. Этот фрагмент сопровождает цитату в статье.'],
      image: {
        src: './assets/figma/article/madk1d-concert.png',
        alt: 'madk1d выступает перед зрителями на освещённой сцене',
        width: 3516,
        height: 1984,
      },
      sources: [{ label: 'Запись выступления', href: 'https://www.youtube.com/watch?v=7r8eppkaOZM&t=417s' }],
    },
  ],
  chapters: [
    { id: 'artist', materialId: 'madk1d-live' },
    { id: 'chorus', materialId: 'address-note' },
    { id: 'quote' },
    { id: 'chorus-freedom' },
    { id: 'delivery' },
  ],
  next: {
    status: 'upcoming',
    title: 'Там уже началось.',
    description: 'За стеной. Новая сцена. Свои люди. И ещё одна история.',
  },
};

export const articleContexts = { [madk1dContext.articleId]: madk1dContext };
