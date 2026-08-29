import type { Article, Tag } from '~/types/api'

export function articleImage(article?: Pick<Article, 'image'>) { return String(article?.image || '').trim() }

export function isPinnedArticle(article?: Pick<Article, 'is_top'>) {
  return article?.is_top === true || Number(article?.is_top) === 1
}

function galleryImageKey(value: string) {
  try {
    const parsed = new URL(value, 'http://localhost')
    const pathname = decodeURIComponent(parsed.pathname).replace(/\/+$/, '')
    const legacyMatch = pathname.match(/\/(?:articleImages|editorImages)\/([^/]+)$/i)
    return legacyMatch?.[1] || `${parsed.host.toLowerCase()}${pathname}`
  } catch {
    return value.split(/[?#]/, 1)[0].toLowerCase()
  }
}

export function dedupeGalleryImages(values: unknown[]) {
  const seen = new Set<string>()
  return values
    .map((value) => String(value || '').trim())
    .filter((value) => {
      if (!value) return false
      const key = galleryImageKey(value)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

export function categoryName(value?: string | number) {
  const category = String(value || '').trim()
  return /^\d+$/.test(category) ? '' : category
}

export function articleDate(value?: string) {
  if (!value) return '未记录日期'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
}

export function messageDate(value?: string) {
  if (!value) return ''
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return value
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean)
  if (typeof tags === 'string') {
    try { const parsed = JSON.parse(tags); if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean) } catch { }
    return tags.split(/[,，]/).map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export function normalizeArticle(item: any): Article {
  return { ...item, id: Number(item?.id), article_tags: normalizeTags(item?.article_tags ?? item?.tags), view_count: Number(item?.view_count || 0), likes: Number(item?.likes || 0) }
}

export function normalizeTag(item: Tag | string) {
  if (typeof item === 'string') return { name: item, count: 0 }
  return { name: String(item.name || item.tag_name || ''), count: Number(item.count || item.article_count || item.associated_article_count || 0) }
}

export interface ArticleTagItem { name: string; id?: string; href?: string }

export function resolveArticleTags(values: unknown, tags: Tag[] = [], limit?: number): ArticleTagItem[] {
  const byId = new Map(tags.filter((tag) => tag.id !== undefined).map((tag) => [String(tag.id), tag]))
  const byName = new Map(tags.map((tag) => [normalizeTag(tag).name, tag]))
  const items = normalizeTags(values).flatMap<ArticleTagItem>((raw) => {
    const tag = byId.get(raw) || byName.get(raw)
    const name = tag ? normalizeTag(tag).name : (/^\d+$/.test(raw) ? '' : raw)
    if (!name) return []
    const id = tag?.id === undefined ? undefined : String(tag.id)
    return [{ name, ...(id ? { id, href: `/tags/${encodeURIComponent(id)}` } : {}) }]
  })
  return limit ? items.slice(0, limit) : items
}

function archiveTimestamp(article: Article) {
  const time = new Date(article.published_at || article.updated_at).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function groupArchive(articles: Article[]) {
  const years = new Map<string, Map<string, Article[]>>()
  for (const article of articles) {
    const date = new Date(article.published_at || article.updated_at)
    const year = Number.isNaN(date.getTime()) ? '其他年份' : String(date.getFullYear())
    const month = Number.isNaN(date.getTime()) ? '其他月份' : `${date.getMonth() + 1} 月`
    if (!years.has(year)) years.set(year, new Map())
    const months = years.get(year)!
    if (!months.has(month)) months.set(month, [])
    months.get(month)!.push(article)
  }
  return [...years.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([year, months]) => ({ year, months: [...months.entries()].sort((a, b) => Number.parseInt(b[0]) - Number.parseInt(a[0])).map(([month, items]) => ({ month, items: items.sort((a, b) => archiveTimestamp(b) - archiveTimestamp(a)) })) }))
}

export function slugifyHeading(value: string) { return value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/[\s-]+/g, '-') || 'section' }
export function markdownHeadings(markdown = '') { return markdown.split(/\r?\n/).flatMap((line) => { const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line); return match ? [{ level: match[1].length, text: match[2].replace(/[*_`]/g, ''), id: slugifyHeading(match[2]) }] : [] }) }
