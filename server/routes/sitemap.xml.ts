interface ApiEnvelope<T> {
  code?: number
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

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
  const apiBase = String(config.apiBase || '').replace(/\/$/, '')
  const urls = new Map<string, string | undefined>()
  const add = (path: string, lastmod?: unknown) => urls.set(`${siteUrl}${path}`, asDate(lastmod))

  add('/')
  add('/articles')
  add('/archive')
  add('/about')
  add('/links')
  add('/portfolio')
  add('/lab')
  add('/lab/image')
  add('/lab/cover')
  add('/lab/color')
  add('/lab/weather')
  add('/lab/ip')
  add('/lab/qr')
  add('/lab/dev')

  async function fetchApi<T>(path: string) {
    try {
      const response = await $fetch<ApiEnvelope<T>>(`${apiBase}/api/${path}`, { timeout: 5000 })
      return response?.code === 200 ? response.data : undefined
    } catch {
      return undefined
    }
  }

  const [articleData, categoryData, tagData] = await Promise.all([
    fetchApi<any[]>('articles/article'),
    fetchApi<any[]>('articles/categories'),
    fetchApi<any[]>('articles/tags'),
  ])
  const articles = (Array.isArray(articleData) ? articleData : Array.isArray((articleData as any)?.items) ? (articleData as any).items : [])
    .filter((article: any) => article?.is_show === undefined || article.is_show === true || Number(article.is_show) === 1)
  const categories = (Array.isArray(categoryData) ? categoryData : [])
    .filter((category: any) => category?.status === undefined || category.status === true || Number(category.status) === 1)
  const tags = (Array.isArray(tagData) ? tagData : [])
    .filter((tag: any) => (tag?.status === undefined || tag.status === true || Number(tag.status) === 1) && Number(tag?.associated_article_count || tag?.article_count || tag?.count || 0) > 0)

  for (const category of categories) {
    const slug = String(category?.slug || '').trim()
    if (slug) add(`/category/${encodeURIComponent(slug)}`)
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
  const body = [...urls.entries()].map(([loc, lastmod]) => `  <url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
})
