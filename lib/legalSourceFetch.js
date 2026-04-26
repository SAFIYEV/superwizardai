/** Подгрузка фрагментов с официальных порталов (allowlist). Только при use_google_search + jurisdiction. */

export const LEGAL_JURISDICTION_IDS = new Set(['gb', 'us', 'fr', 'de', 'at', 'ru', 'kz', 'uz', 'az']);

const PORTALS_BY_JURISDICTION = {
  ru: [{ url: 'https://pravo.gov.ru/', label: 'Официальный портал правовой информации РФ' }],
  kz: [
    { url: 'https://adilet.zan.kz/rus', label: 'Әділет (Adilet)' },
    { url: 'https://www.parlam.kz/ru', label: 'Парламент РК' },
  ],
  uz: [{ url: 'https://lex.uz/', label: 'Lex.uz' }],
  az: [{ url: 'https://e-qanun.az/', label: 'E-Qanun.az' }],
  gb: [{ url: 'https://www.legislation.gov.uk/', label: 'Legislation.gov.uk' }],
  us: [
    {
      url: 'https://www.archives.gov/founding-docs/constitution-transcript',
      label: 'National Archives — Constitution (transcript)',
    },
  ],
  fr: [{ url: 'https://www.legifrance.gouv.fr/', label: 'Légifrance' }],
  de: [{ url: 'https://www.gesetze-im-internet.de/gg/', label: 'Grundgesetz (Gesetze im Internet)' }],
  at: [{ url: 'https://www.ris.bka.gv.at/', label: 'RIS — Rechtsinformationssystem' }],
};

function collectAllowedHosts() {
  const s = new Set();
  for (const list of Object.values(PORTALS_BY_JURISDICTION)) {
    for (const { url } of list) {
      try {
        s.add(new URL(url).hostname.toLowerCase());
      } catch {
        /* skip */
      }
    }
  }
  return s;
}

const ALLOWED_HOSTS = collectAllowedHosts();

export function normalizeJurisdiction(value) {
  if (typeof value !== 'string') return '';
  const id = value.trim().toLowerCase();
  return LEGAL_JURISDICTION_IDS.has(id) ? id : '';
}

function htmlToPlain(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

/**
 * @param {string} jurisdictionId
 * @param {typeof fetch} fetchFn
 * @returns {Promise<string | null>}
 */
export async function fetchOfficialPortalSnippet(jurisdictionId, fetchFn = globalThis.fetch) {
  const portals = PORTALS_BY_JURISDICTION[jurisdictionId] || PORTALS_BY_JURISDICTION.ru;
  const timeoutMs = 12000;

  for (const { url, label } of portals) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      continue;
    }
    if (!ALLOWED_HOSTS.has(parsed.hostname.toLowerCase())) continue;

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetchFn(url, {
        signal: ac.signal,
        redirect: 'follow',
        headers: {
          Accept: 'text/html,application/xhtml+xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
          'User-Agent': 'SuperWizard/1.0 (+https://github.com/SAFIYEV/superwizardai)',
        },
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (!ct.includes('text/html') && !ct.includes('text/plain')) continue;
      const raw = await res.text();
      let text = htmlToPlain(raw);
      text = text.replace(/\s+/g, ' ').trim();
      if (text.length < 200) continue;
      const max = 22000;
      if (text.length > max) text = `${text.slice(0, max)}\n… [фрагмент обрезан]`;
      return [
        '[Сервер подгрузил фрагмент публичной страницы официального ресурса. Это не полный текст законов; для статей и редакций открывайте URL и сверяйтесь с первоисточником.]',
        `Источник: ${label}`,
        `URL: ${url}`,
        '---',
        text,
      ].join('\n');
    } catch {
      clearTimeout(timer);
      continue;
    }
  }
  return null;
}

/**
 * @param {Array<{ role: string, content: unknown }>} messages
 * @param {string} snippet
 */
export function injectPortalSystemMessage(messages, snippet) {
  if (!snippet || !Array.isArray(messages)) return messages;
  const msg = { role: 'system', content: snippet };
  const out = [...messages];
  const idx = out.findIndex((m) => m.role === 'system');
  if (idx === -1) out.unshift(msg);
  else out.splice(idx + 1, 0, msg);
  return out;
}

/**
 * @param {object} sanitized — как из sanitize(): messages, use_google_search, jurisdiction, …
 * @param {typeof fetch} fetchFn
 */
export async function maybeAugmentWithOfficialPortal(sanitized, fetchFn = globalThis.fetch) {
  if (!sanitized.use_google_search || !sanitized.jurisdiction) return sanitized;
  if (Array.isArray(sanitized.messages) && sanitized.messages.length >= 100) return sanitized;
  const snippet = await fetchOfficialPortalSnippet(sanitized.jurisdiction, fetchFn);
  if (!snippet) return sanitized;
  return {
    ...sanitized,
    messages: injectPortalSystemMessage(sanitized.messages, snippet),
  };
}
