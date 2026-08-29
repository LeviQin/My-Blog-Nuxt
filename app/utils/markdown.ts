import MarkdownIt from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'
import { slugifyHeading } from '~/utils/article'

const CODE_LANGUAGE_LABELS: Record<string, string> = {
  bash: 'Shell', c: 'C', cpp: 'C++', csharp: 'C#', css: 'CSS', diff: 'Diff', dockerfile: 'Dockerfile', go: 'Go', graphql: 'GraphQL', html: 'HTML', ini: 'INI', java: 'Java', javascript: 'JavaScript', js: 'JavaScript', json: 'JSON', jsx: 'JSX', kotlin: 'Kotlin', less: 'Less', lua: 'Lua', makefile: 'Makefile', markdown: 'Markdown', md: 'Markdown', nginx: 'Nginx', objectivec: 'Objective-C', perl: 'Perl', php: 'PHP', plaintext: 'Text', powershell: 'PowerShell', ps1: 'PowerShell', py: 'Python', python: 'Python', r: 'R', ruby: 'Ruby', rust: 'Rust', scss: 'SCSS', shell: 'Shell', sql: 'SQL', swift: 'Swift', text: 'Text', ts: 'TypeScript', tsx: 'TSX', typescript: 'TypeScript', vbnet: 'VB.NET', vue: 'Vue', wasm: 'WebAssembly', xml: 'XML', yaml: 'YAML', yml: 'YAML',
}

const CODE_LANGUAGE_ALIASES: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  sh: 'bash', shell: 'bash', md: 'markdown', html: 'xml', py: 'python',
  ps1: 'powershell', yml: 'yaml',
}

function normalizeCodeLanguage(language = '') {
  const requested = language.trim().split(/\s+/)[0].toLowerCase() || 'text'
  return CODE_LANGUAGE_ALIASES[requested] || requested
}
function codeLanguageLabel(language: string) { return CODE_LANGUAGE_LABELS[language] || (language === 'text' ? 'Text' : language.toUpperCase()) }

const renderer = new MarkdownIt({
  html: false, linkify: true, typographer: true, breaks: true,
})

renderer.use(markdownItAttrs)

function renderCodeBlock(code: string, language = '') {
  const requestedLanguage = normalizeCodeLanguage(language)
  const displayLanguage = language.trim().split(/\s+/)[0].toLowerCase() || 'text'
  const languageLabel = renderer.utils.escapeHtml(codeLanguageLabel(displayLanguage))
  const escapedLanguage = renderer.utils.escapeHtml(requestedLanguage)
  const escapedCode = renderer.utils.escapeHtml(code)
  return `<div class="markdown-code-block" data-code-block><div class="markdown-code-toolbar"><span class="markdown-code-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="markdown-code-language">${languageLabel}</span><div class="markdown-code-actions"><button type="button" data-code-action="copy">复制</button><button type="button" data-code-action="toggle" aria-expanded="true">折叠</button></div></div><pre class="hljs"><code data-code-language="${escapedLanguage}">${escapedCode}</code></pre></div>`
}

renderer.renderer.rules.fence = (tokens, index) => renderCodeBlock(tokens[index]?.content || '', tokens[index]?.info || '')
renderer.renderer.rules.code_block = (tokens, index) => renderCodeBlock(tokens[index]?.content || '')
const ADMONITION_LABELS: Record<string, string> = {
  caution: '注意', danger: '危险', error: '错误', important: '重要', info: '提示',
  note: '笔记', success: '完成', tip: '小贴士', warning: '警告',
}
const ADMONITION_ICON_PATHS: Record<string, string> = {
  caution: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/>',
  danger: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/>',
  error: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  important: '<path d="M12 3c.8 5.4 3.6 8.2 9 9-5.4.8-8.2 3.6-9 9-.8-5.4-3.6-8.2-9-9 5.4-.8 8.2-3.6 9-9Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  note: '<path d="m4 20 4.2-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m13.8 7.4 3 3"/>',
  success: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.7 2.7L16.5 9"/>',
  tip: '<path d="M19.5 4.5C12 4.7 6.7 8.2 5.2 14.3c-.5 2 .3 4.1 2 5.2 1.7 1 3.9.8 5.4-.5 4.4-3.7 6.3-8.6 6.9-14.5Z"/><path d="M5.6 18.8c2.4-3 5.3-5.6 8.8-7.8"/>',
  warning: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/>',
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
  const icon = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ADMONITION_ICON_PATHS[type]}</svg>`
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
      return `![${alt}](${src.replace(/[\\\)]/g, '\\$&')})${dimensions}`
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
