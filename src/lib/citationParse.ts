export interface ParsedCitation {
  label: string
  url: string
  fullText?: string
}

const LINK_RE = /\[([^\]]*🔗[^\]]*)\]\((https?:[^)]+)\)/gi

/**
 * Удаляет блоки ```sw-article``` и сопоставляет их с ссылками [🔗 ...](url) по порядку.
 */
export function stripSwArticleBlocks(text: string): { text: string; bodies: string[] } {
  const bodies: string[] = []
  const swArticle = /```\s*sw-article\s*\n([\s\S]*?)```/gi
  const cleaned = text.replace(swArticle, (_m, body: string) => {
    bodies.push(body.trim())
    return ''
  })
  return { text: cleaned.replace(/\n{3,}/g, '\n\n').trim(), bodies }
}

export function extractCitationLinks(text: string): { label: string; url: string }[] {
  return [...text.matchAll(new RegExp(LINK_RE.source, 'gi'))].map((m) => ({
    label: m[1].trim(),
    url: m[2].trim(),
  }))
}

export function buildCitationIndex(
  rawContent: string
): { displayRaw: string; citations: ParsedCitation[] } {
  const { text, bodies } = stripSwArticleBlocks(rawContent)
  const links = extractCitationLinks(text)
  const citations: ParsedCitation[] = links.map((l, i) => ({
    label: l.label.replace(/\s*🔗\s*/g, ' ').replace(/\s+/g, ' ').trim(),
    url: l.url,
    fullText: bodies[i],
  }))
  return { displayRaw: text, citations }
}
