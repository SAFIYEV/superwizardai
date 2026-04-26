/**
 * Канонические ссылки на официальные порталы и публикации норм.
 * Подмешиваются в системный промпт; полные тексты законов приложение не хранит.
 */
export interface OfficialLegalLink {
  title: string
  url: string
  /** Краткая подсказка модели (не юридическая консультация) */
  hint?: string
}

/** Ключи совпадают с JurisdictionId в jurisdictions.ts */
export const OFFICIAL_LEGAL_SOURCES: Record<string, OfficialLegalLink[]> = {
  ru: [
    {
      title: 'Официальное опубликование НПА РФ (в т.ч. Конституция РФ в актуальной редакции)',
      url: 'http://pravo.gov.ru',
      hint: 'Единственный источник официального опубликования федеральных актов; сверка редакций через поиск по сайту.',
    },
    {
      title: 'Конституционный Суд РФ',
      url: 'http://www.ksrf.ru',
      hint: 'Постановления КС РФ, толкование Конституции.',
    },
    {
      title: 'Верховный Суд РФ',
      url: 'http://vsrf.ru',
      hint: 'Обзоры практики, разъяснения.',
    },
  ],
  kz: [
    {
      title: 'Әділет — официальный банк НПА РК',
      url: 'https://adilet.zan.kz',
      hint: 'Актуальные тексты законов и кодексов РК.',
    },
    {
      title: 'Парламент РК (законопроекты и принятые законы)',
      url: 'https://www.parlam.kz',
    },
  ],
  uz: [
    {
      title: 'Национальная база законодательства Lex.uz',
      url: 'https://lex.uz',
      hint: 'Официальные тексты НПА Республики Узбекистан.',
    },
  ],
  az: [
    {
      title: 'E-Qanun — электронный архив НПА АР',
      url: 'https://e-qanun.az',
    },
  ],
  gb: [
    {
      title: 'Legislation.gov.uk — законодательство UK',
      url: 'https://www.legislation.gov.uk',
      hint: 'Официальные тексты статутов Англии, Уэльса, Шотландии, Северной Ирландии (по меткам).',
    },
    {
      title: 'The National Archives (UK)',
      url: 'https://www.nationalarchives.gov.uk',
    },
  ],
  us: [
    {
      title: 'Constitution of the United States (National Archives)',
      url: 'https://www.archives.gov/founding-docs/constitution-transcript',
    },
    {
      title: 'Congress.gov',
      url: 'https://www.congress.gov',
      hint: 'Федеральные законы; для штатов — сайты legislature соответствующего штата.',
    },
    {
      title: 'U.S. Code (Office of the Law Revision Counsel)',
      url: 'https://uscode.house.gov',
    },
  ],
  fr: [
    {
      title: 'Légifrance — официальное право Франции',
      url: 'https://www.legifrance.gouv.fr',
      hint: 'Конституция, кодексы, ЖОРФ.',
    },
    {
      title: 'Conseil constitutionnel',
      url: 'https://www.conseil-constitutionnel.fr',
    },
  ],
  de: [
    {
      title: 'Gesetze im Internet (официальные тексты ФРГ)',
      url: 'https://www.gesetze-im-internet.de',
      hint: 'GG, BGB, StGB и др.; совместный проект Минюста и BMJ.',
    },
    {
      title: 'Bundesgesetzblatt',
      url: 'https://www.bgbl.de',
    },
  ],
  at: [
    {
      title: 'RIS — Rechtsinformationssystem des Bundes',
      url: 'https://www.ris.bka.gv.at',
      hint: 'Федеральные и земельные нормы Австрии.',
    },
  ],
}

export function formatOfficialSourcesForPrompt(jurisdictionId: string): string {
  const links = OFFICIAL_LEGAL_SOURCES[jurisdictionId] ?? OFFICIAL_LEGAL_SOURCES.ru
  const lines = links.map((l) => {
    const h = l.hint ? ` (${l.hint})` : ''
    return `- **${l.title}** — ${l.url}${h}`
  })
  return [
    '### Официальные источники полных текстов (конституции, кодексы, реестры НПА)',
    'Ниже — прямые входы в государственные или уполномоченные системы. В ответах пользователю по возможности называй эти порталы и напоминай сверять статьи по актуальной редакции там, а не полагаться только на память модели.',
    ...lines,
    'Сравнение конституций разных стран (вспомогательно, не заменяет национальный официальный текст): https://www.constituteproject.org',
  ].join('\n')
}
