<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { settings } = useSiteSettings()
const config = useRuntimeConfig()
useAwayTitle()
useHead(() => {
  const siteName = String(settings.value.blog_name || '').trim()
  const siteDescription = String(settings.value.blog_description || '').trim()
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: String(config.public.siteUrl || '').replace(/\/$/, ''),
    inLanguage: 'zh-CN',
  }
  if (siteName) {
    schema.name = siteName
    schema.publisher = { '@type': 'Person', name: siteName, ...(settings.value.blog_logo ? { image: settings.value.blog_logo } : {}) }
  }
  if (siteDescription) schema.description = siteDescription
  return {
    link: [
      { rel: 'icon', href: settings.value.blog_logo || '/favicon.ico' },
      { rel: 'alternate', type: 'application/rss+xml', title: `${siteName || '博客'} RSS`, href: '/api/articles/rss.xml' },
    ],
    meta: [...(siteName ? [{ name: 'author', content: siteName }] : []), { name: 'robots', content: 'index,follow,max-image-preview:large' }],
    script: [{ key: 'blog-website-schema', type: 'application/ld+json', innerHTML: JSON.stringify(schema) }],
  }
})
</script>
