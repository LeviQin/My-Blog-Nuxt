interface ApiEnvelope<T> {
  code?: number
  data?: T
}

interface ApiResult<T> {
  ok: boolean
  data?: T
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character] || character)
}

function asDate(value: unknown) {
  const date = new Date(String(value || ''))
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function articleLastmod(article: any) {
  return article?.content_updated_at || article?.published_at
}

function isEnabled(value: unknown) {
  return value === undefined || value === null || value === '' || value === true || value === 1 || value === '1'
}

function isPublicArticle(article: any) {
  if (!isEnabled(article?.is_show)) return false
  if (article?.deleted_at) return false
  const status = String(article?.status || '').trim().toLowerCase()
  if (status && status !== 'published') return false
  const visibility = String(article?.visibility || '').trim().toLowerCase()
  if (visibility && visibility !== 'public') return false
  const scheduledAt = String(article?.scheduled_at || '').trim()
  if (scheduledAt) {
    const scheduledTime = new Date(scheduledAt).getTime()
    if (!Number.isFinite(scheduledTime) || scheduledTime > Date.now()) return false
  }
  return true
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
  const apiBase = String(config.apiBase || '').replace(/\/$/, '')
  const urls = new Map<string, string | undefined>()
  const add = (path: string, lastmod?: unknown) => urls.set(`${siteUrl}${path}`, asDate(lastmod))

  add('/')
  add('/articles')
  add('/archive')
  add('/portfolio')

  async function fetchApi<T>(path: string): Promise<ApiResult<T>> {
    try {
      const response = await $fetch<ApiEnvelope<T>>(`${apiBase}/api/${path}`, { timeout: 5000 })
      return response?.code === 200 ? { ok: true, data: response.data } : { ok: false }
    } catch {
      return { ok: false }
    }
  }

  const [articleResult, categoryResult, tagResult, settingResult] = await Promise.all([
    fetchApi<any[]>('articles/article'),
    fetchApi<any[]>('articles/categories'),
    fetchApi<any[]>('articles/tags'),
    fetchApi<Record<string, unknown> | Array<Record<string, unknown>>>('blog-setting/settings?key=levi-blog'),
  ])
  if (![articleResult, categoryResult, tagResult, settingResult].every(result => result.ok)) {
    setResponseHeader(event, 'cache-control', 'no-store')
    throw createError({ statusCode: 503, statusMessage: '站点索引数据暂时不可用' })
  }
  const articleData = articleResult.data
  const categoryData = categoryResult.data
  const tagData = tagResult.data
  const settingData = settingResult.data
  const settings = Array.isArray(settingData) ? settingData[0] || {} : settingData || {}
  const moduleEnabled = (key: string) => {
    const value = settings[key]
    if (value === undefined || value === null || value === '') return true
    return value === true || value === 1 || value === '1'
  }

  if (moduleEnabled('show_about_module')) add('/about')
  if (moduleEnabled('show_friend_link_module')) add('/friends')
  if (moduleEnabled('show_sites_module')) add('/sites')
  if (moduleEnabled('show_guestbook_module')) add('/guestbook')
  if (moduleEnabled('show_widget_module')) {
    add('/lab')
    add('/lab/image')
    add('/lab/cover')
    add('/lab/color')
    add('/lab/weather')
    add('/lab/ip')
    add('/lab/qr')
    add('/lab/dev')
  }
  const articles = (Array.isArray(articleData) ? articleData : Array.isArray((articleData as any)?.items) ? (articleData as any).items : [])
    .filter(isPublicArticle)
  const categories = (Array.isArray(categoryData) ? categoryData : [])
    .filter((category: any) => isEnabled(category?.status) && Number(category?.article_count || 0) > 0)
  const tags = (Array.isArray(tagData) ? tagData : [])
    .filter((tag: any) => (tag?.status === undefined || tag.status === true || Number(tag.status) === 1) && Number(tag?.associated_article_count || tag?.article_count || tag?.count || 0) > 0)

  if (moduleEnabled('show_category_module')) {
    for (const category of categories) {
      const slug = String(category?.slug || '').trim()
      if (slug && slug !== 'daily') add(`/category/${encodeURIComponent(slug)}`)
    }
  }
  for (const tag of tags) {
    const id = Number(tag?.id)
    if (Number.isFinite(id) && id > 0) add(`/tags/${id}`)
  }
  for (const article of articles) {
    const id = Number(article?.id)
    if (Number.isFinite(id) && id > 0) add(`/posts/${id}`, articleLastmod(article))
  }

  setResponseHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'cache-control', 'public, max-age=600, s-maxage=600, stale-while-revalidate=86400')
  const body = [...urls.entries()].map(([loc, lastmod]) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
})
