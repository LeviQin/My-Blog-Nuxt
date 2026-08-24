import { toValue, type MaybeRefOrGetter } from 'vue'

interface BlogSeoOptions {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  type?: 'website' | 'article'
  publishedTime?: MaybeRefOrGetter<string | undefined>
  modifiedTime?: MaybeRefOrGetter<string | undefined>
  canonical?: MaybeRefOrGetter<string | undefined>
  robots?: MaybeRefOrGetter<string | undefined>
  keywords?: MaybeRefOrGetter<string | undefined>
  breadcrumbs?: MaybeRefOrGetter<Array<{ name: string; path: string }> | undefined>
}

function absoluteUrl(value: string | undefined, siteUrl: string) {
  const raw = String(value || '').trim()
  if (!raw) return undefined
  if (/^https?:\/\//i.test(raw)) return raw
  return siteUrl ? `${siteUrl}${raw.startsWith('/') ? raw : `/${raw}`}` : raw
}

export function useBlogSeo(options: BlogSeoOptions) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const { settings } = useSiteSettings()
  const siteUrl = String(config.public.siteUrl || '').replace(/\/$/, '')
  const siteName = computed(() => String(settings.value.blog_name || '').trim())
  const title = computed(() => {
    const pageTitle = String(toValue(options.title) || '').trim()
    if (!pageTitle || !siteName.value || pageTitle === siteName.value || pageTitle.endsWith(` · ${siteName.value}`)) return pageTitle || siteName.value
    return `${pageTitle} · ${siteName.value}`
  })
  const description = computed(() => String(toValue(options.description) || settings.value.blog_description || '').trim())
  const image = computed(() => absoluteUrl(String(toValue(options.image) || settings.value.blog_logo || '').trim(), siteUrl))
  const canonical = computed(() => absoluteUrl(String(toValue(options.canonical) || `${siteUrl}${route.path}`), siteUrl) || `${siteUrl}${route.path}`)
  const type = options.type || 'website'
  const robots = computed(() => String(toValue(options.robots) || 'index,follow,max-image-preview:large').trim())
  const keywords = computed(() => String(toValue(options.keywords) || '').trim() || undefined)
  const breadcrumbs = computed(() => toValue(options.breadcrumbs) || [])

  useSeoMeta({
    title,
    description,
    author: siteName,
    robots,
    keywords,
    ogTitle: title,
    ogDescription: description,
    ogType: type,
    ogUrl: canonical,
    ogSiteName: siteName,
    ogImage: image,
    ogImageAlt: title,
    ogLocale: 'zh_CN',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })

  useHead(() => {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'BlogPosting' : 'WebPage',
      url: canonical.value,
      name: title.value,
      description: description.value,
      inLanguage: 'zh-CN',
      isPartOf: { '@type': 'WebSite', name: siteName.value, url: siteUrl },
    }
    if (image.value) schema.image = image.value
    if (type === 'article') {
      schema.headline = title.value
      schema.author = { '@type': 'Person', name: siteName.value }
      schema.mainEntityOfPage = { '@type': 'WebPage', '@id': canonical.value }
      if (toValue(options.publishedTime)) schema.datePublished = toValue(options.publishedTime)
      if (toValue(options.modifiedTime)) schema.dateModified = toValue(options.modifiedTime)
    }
    if (keywords.value) schema.keywords = keywords.value
    const breadcrumbSchema = breadcrumbs.value.length ? {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.value.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path, siteUrl),
      })),
    } : undefined
    return {
      link: [{ rel: 'canonical', href: canonical.value }],
      script: [
        { key: 'blog-page-schema', type: 'application/ld+json', innerHTML: JSON.stringify(schema) },
        ...(breadcrumbSchema ? [{ key: 'blog-breadcrumb-schema', type: 'application/ld+json', innerHTML: JSON.stringify(breadcrumbSchema) }] : []),
      ],
    }
  })
}
