export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /category/daily\nSitemap: ${siteUrl}/sitemap.xml\n`
})
