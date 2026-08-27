import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import type { Article, Tag } from '~/types/api'
import markdownItAttrs from 'markdown-it-attrs'

export function articleImage(article?: Pick<Article, 'image'>) { return String(article?.image || '').trim() }

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
  return { name: String(item.name || item.tag_name || ''), count: Number(item.count || item.article_count || 0) }
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

const CODE_LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Shell', c: 'C', cpp: 'C++', csharp: 'C#', css: 'CSS', diff: 'Diff', dockerfile: 'Dockerfile', go: 'Go', graphql: 'GraphQL', html: 'HTML', ini: 'INI', java: 'Java', javascript: 'JavaScript', js: 'JavaScript', json: 'JSON', jsx: 'JSX', kotlin: 'Kotlin', less: 'Less', lua: 'Lua', makefile: 'Makefile', markdown: 'Markdown', md: 'Markdown', nginx: 'Nginx', objectivec: 'Objective-C', perl: 'Perl', php: 'PHP', plaintext: 'Text', powershell: 'PowerShell', ps1: 'PowerShell', py: 'Python', python: 'Python', r: 'R', ruby: 'Ruby', rust: 'Rust', scss: 'SCSS', shell: 'Shell', sql: 'SQL', swift: 'Swift', text: 'Text', ts: 'TypeScript', tsx: 'TSX', typescript: 'TypeScript', vbnet: 'VB.NET', vue: 'Vue', wasm: 'WebAssembly', xml: 'XML', yaml: 'YAML', yml: 'YAML',
}

function normalizeCodeLanguage(language = '') { return language.trim().split(/\s+/)[0].toLowerCase() || 'text' }
function codeLanguageLabel(language: string) { return CODE_LANGUAGE_LABELS[language] || (language === 'text' ? 'Text' : language.toUpperCase()) }

const renderer = new MarkdownIt({
  html: false, linkify: true, typographer: true, breaks: true,
})

renderer.use(markdownItAttrs)

function renderCodeBlock(code: string, language = '') {
  const requestedLanguage = normalizeCodeLanguage(language)
  let resolvedLanguage = requestedLanguage
  let highlighted = renderer.utils.escapeHtml(code)

  if (requestedLanguage !== 'text' && hljs.getLanguage(requestedLanguage)) {
    try {
      highlighted = hljs.highlight(code, { language: requestedLanguage }).value
    } catch { }
  } else if (!language.trim()) {
    try {
      const detected = hljs.highlightAuto(code)
      highlighted = detected.value
      resolvedLanguage = detected.language || 'text'
    } catch { }
  }

  const languageLabel = renderer.utils.escapeHtml(codeLanguageLabel(resolvedLanguage))
  return `<div class="markdown-code-block" data-code-block><div class="markdown-code-toolbar"><span class="markdown-code-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="markdown-code-language">${languageLabel}</span><div class="markdown-code-actions"><button type="button" data-code-action="copy">复制</button><button type="button" data-code-action="toggle" aria-expanded="true">折叠</button></div></div><pre class="hljs"><code>${highlighted}</code></pre></div>`
}

renderer.renderer.rules.fence = (tokens, index) => renderCodeBlock(tokens[index]?.content || '', tokens[index]?.info || '')
renderer.renderer.rules.code_block = (tokens, index) => renderCodeBlock(tokens[index]?.content || '')
const ADMONITION_LABELS: Record<string, string> = {
  caution: '注意', danger: '危险', error: '错误', important: '重要', info: '提示',
  note: '笔记', success: '完成', tip: '小贴士', warning: '警告',
}
const ADMONITION_ICONS: Record<string, string> = {
  caution: '!', danger: '!', error: '!', important: '✦', info: 'i',
  note: '✎', success: '✓', tip: '☘', warning: '!',
}
function normalizeAdmonitionType(value = '') {
  const type = value.toLowerCase()
  return ADMONITION_LABELS[type] ? type : 'note'
}
renderer.block.ruler.before('fence', 'admonition', (state, startLine, endLine, silent) => {
  const start = state.bMarks[startLine] + state.tShift[startLine]
  const line = state.src.slice(start, state.eMarks[startLine]).trim()
  const match = /^!!!(?:\s+([a-z][\w-]*))?(?:\s+(.+?))?\s*$/i.exec(line)
  if (!match) return false
  if (silent) return true

  const type = normalizeAdmonitionType(match[1])
  const bodyLines: string[] = []
  let nextLine = startLine + 1
  for (; nextLine < endLine; nextLine += 1) {
    const bodyStart = state.bMarks[nextLine] + state.tShift[nextLine]
    const bodyLine = state.src.slice(bodyStart, state.eMarks[nextLine])
    if (/^!!!(?:\s*(?:&#x20;|&nbsp;))?\s*$/i.test(bodyLine.trim())) break
    bodyLines.push(bodyLine.replace(/^\s{0,3}/, '').replace(/\\\s*$/, ''))
  }

  const open = state.push('admonition_open', 'aside', 1)
  open.block = true
  open.attrSet('class', `markdown-admonition markdown-admonition-${type}`)
  open.attrSet('role', 'note')
  open.meta = { type, title: match[2]?.trim().replace(/\\\s*$/, '') || ADMONITION_LABELS[type] }

  const content = state.push('inline', '', 0)
  content.block = true
  content.content = bodyLines.join('\n').trim()
  content.children = []

  const close = state.push('admonition_close', 'aside', -1)
  close.block = true
  state.line = nextLine < endLine ? nextLine + 1 : nextLine
  return true
})
renderer.renderer.rules.admonition_open = (tokens, index) => {
  const token = tokens[index]
  const meta = token?.meta as { type?: string; title?: string } | undefined
  const type = normalizeAdmonitionType(meta?.type)
  const title = renderer.utils.escapeHtml(meta?.title || ADMONITION_LABELS[type])
  const icon = renderer.utils.escapeHtml(ADMONITION_ICONS[type])
  return `<aside class="markdown-admonition markdown-admonition-${type}" role="note"><div class="markdown-admonition-title"><span aria-hidden="true">${icon}</span>${title}</div><div class="markdown-admonition-content">`
}
renderer.renderer.rules.admonition_close = () => '</div></aside>'
renderer.renderer.rules.heading_open = (tokens, index, options, env, self) => {
  const token = tokens[index]
  const next = tokens[index + 1]
  if (token && next) token.attrSet('id', slugifyHeading(next.content))
  return self.renderToken(tokens, index, options)
}
function enhanceMarkdownImages(html: string) {
  const withLoading = html.replace(/<img\b([^>]*)>/g, (_match, attributes) => {
    const loading = /\sloading\s*=/.test(attributes) ? '' : ' loading="lazy"'
    const decoding = /\sdecoding\s*=/.test(attributes) ? '' : ' decoding="async"'
    const width = imageDimension(attributes, 'width')
    const height = imageDimension(attributes, 'height')
    const explicitSize = width && height ? ` data-explicit-size style="--markdown-image-width:${width};--markdown-image-height:${height};"` : ''
    return `<img${attributes}${loading}${decoding}${explicitSize}>`
  })

  const withImageParagraphs = withLoading.replace(/(?:<p>\s*(?:(?:<img\b[^>]*>|<br\s*\/?>)\s*)+<\/p>\s*)+/g, (group) => {
    const images = [...group.matchAll(/<img\b[^>]*>/g)].map((match) => match[0])
    if (!images.length) return group
    const className = images.length > 1 ? 'markdown-image-gallery' : 'markdown-image-single'
    return `<div class="${className}">${images.join('')}</div>`
  })

  // A paragraph can also contain text followed by <br><img><img><br>.
  // Keep the surrounding text in place, but turn the explicitly grouped images into one wrapping row.
  return withImageParagraphs.replace(/<br\s*\/?>\s*((?:<img\b[^>]*>\s*){2,})<br\s*\/?>/g, (_match, images) => {
    return `<span class="markdown-image-gallery">${images}</span>`
  })
}

function imageDimension(attributes: string, name: 'width' | 'height') {
  const match = attributes.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([0-9]+(?:\\.[0-9]+)?)(?:px)?"|'([0-9]+(?:\\.[0-9]+)?)(?:px)?'|([0-9]+(?:\\.[0-9]+)?)(?:px)?(?:\\s|$))`, 'i'))
  return match?.[1] || match?.[2] || match?.[3] || ''
}

function normalizeAdmonitionBoundaries(value: string) {
  const lines = value.replace(/\r\n?/g, '\n').split('\n')
  const output: string[] = []
  let insideAdmonition = false
  let insideFence = false

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) insideFence = !insideFence
    const trimmed = line.trim()
    const isClose = /^!!!(?:\s*(?:&#x20;|&nbsp;))?\s*$/i.test(trimmed)
    const isOpen = !isClose && /^!!!(?:\s+[a-z][\w-]*)?(?:\s+.+?)?\\?\s*$/i.test(trimmed)

    if (!insideFence && !insideAdmonition && isOpen) {
      if (output.length && output[output.length - 1] !== '') output.push('')
      insideAdmonition = true
    }
    output.push(line)
    if (!insideFence && insideAdmonition && isClose) {
      insideAdmonition = false
      output.push('')
    }
  }

  return output.join('\n')
}

function normalizeRawImageTags(value: string) {
  let insideFence = false
  return value.split('\n').map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      insideFence = !insideFence
      return line
    }
    if (insideFence) return line
    return line.replace(/<img\b([^>]*?)\/?>/gi, (_match, attributes) => {
      const src = htmlAttribute(attributes, 'src')
      if (!src) return _match
      const alt = htmlAttribute(attributes, 'alt').replace(/[\\\]]/g, '\\$&')
      const width = imageDimension(attributes, 'width')
      const height = imageDimension(attributes, 'height')
      const dimensions = width && height ? `{width=${width} height=${height}}` : ''
      return `![${alt}](${src.replace(/[\\)]/g, '\\$&')})${dimensions}`
    })
  }).join('\n')
}

function htmlAttribute(attributes: string, name: string) {
  const match = attributes.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match?.[1] || match?.[2] || match?.[3] || ''
}

export function renderMarkdown(value = '') {
  return enhanceMarkdownImages(renderer.render(normalizeRawImageTags(normalizeAdmonitionBoundaries(value))))
}
