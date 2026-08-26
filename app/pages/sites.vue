<template>
  <div class="container page-section sites-page">
    <SectionHeading eyebrow="useful corners" :level="1">常用网站</SectionHeading>
    <p class="page-lead">整理常用的网站入口，方便随时快速访问。</p>

    <nav v-if="groups.length" class="site-category-nav" aria-label="网站分类">
      <a v-for="group in groups" :key="group.value" :href="`#site-category-${group.value}`">{{ group.label }}</a>
    </nav>

    <div v-if="groups.length" class="site-groups">
      <section v-for="group in groups" :id="`site-category-${group.value}`" :key="group.value" class="paper-card site-group">
        <div class="site-group-heading">
          <div>
            <p class="card-kicker">SITE CATEGORY</p>
            <h2>{{ group.label }}</h2>
          </div>
          <span>{{ group.items.length }} 个站点</span>
        </div>
        <div class="site-grid">
          <a v-for="item in group.items" :key="item.id || item.url" class="site-card" :href="item.url" target="_blank" rel="noreferrer">
            <span class="site-card-image">
              <img v-if="item.image" :src="item.image" :alt="`${item.title} 图标`" width="52" height="52" loading="lazy" decoding="async">
              <span v-else class="site-card-image-placeholder" aria-hidden="true"></span>
            </span>
            <span class="site-card-copy">
              <strong>{{ item.title }}</strong>
              <small v-if="item.description">{{ item.description }}</small>
              <em>{{ siteHost(item.url) }}</em>
            </span>
          </a>
        </div>
      </section>
    </div>
    <EmptyState v-else title="常用网站还在整理" message="暂时还没有可以展示的网站入口。" />
  </div>
</template>

<script setup lang="ts">
import type { SiteNavItem } from '~/types/api'

const api = useBlogApi()
const { data } = await useAsyncData('sites', () => api.siteNav(), { default: () => [] })
const items = computed(() => (data.value || []) as SiteNavItem[])
const categoryLabels = [
  { value: 1, label: '开发资源' },
  { value: 2, label: '设计资源' },
  { value: 3, label: '博客论坛' },
  { value: 4, label: '工具服务' },
  { value: 5, label: '学习平台' },
  { value: 6, label: '社交媒体' },
  { value: 7, label: '新闻资讯' },
  { value: 8, label: 'AI应用' },
  { value: 9, label: '招聘平台' },
  { value: 10, label: '视频剪辑' },
  { value: 11, label: '原型工具' },
  { value: 12, label: '开发软件' },
  { value: 13, label: '云服务器' },
]
const groups = computed(() => categoryLabels
  .map(category => ({ ...category, items: items.value.filter(item => Number(item.type) === category.value) }))
  .filter(group => group.items.length))

function siteHost(value: string) {
  try { return new URL(value).host.replace(/^www\./, '') } catch { return value }
}

useBlogSeo({ title: '常用网站', description: 'Levi Blog 整理的常用网站导航。' })
</script>

<style scoped>
.sites-page { display: grid; gap: 22px; }
.site-category-nav { display: flex; flex-wrap: wrap; gap: 9px; }
.site-category-nav a { padding: 8px 13px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); font-size: 13px; text-decoration: none; }
.site-category-nav a:hover { color: var(--ink); border-color: var(--sage); }
.site-groups { display: grid; gap: 18px; }
.site-group { padding: 24px; }
.site-group-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.site-group-heading h2 { margin: 4px 0 0; color: var(--ink); font-size: 21px; }
.site-group-heading > span { color: var(--muted); font-size: 12px; }
.site-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.site-card { display: flex; align-items: flex-start; gap: 12px; min-width: 0; padding: 14px; border: 1px solid var(--line); border-radius: 14px; color: inherit; text-decoration: none; transition: transform .2s ease, border-color .2s ease; }
.site-card:hover { transform: translateY(-2px); border-color: var(--sage); }
.site-card-image { display: grid; flex: 0 0 52px; width: 52px; height: 52px; place-items: center; overflow: hidden; border-radius: 13px; background: var(--paper-deep); }
.site-card-image img { width: 100%; height: 100%; object-fit: cover; }
.site-card-image-placeholder { width: 18px; height: 18px; border: 2px solid var(--muted); border-radius: 50%; opacity: .45; }
.site-card-copy { display: grid; min-width: 0; gap: 4px; }
.site-card-copy strong { overflow: hidden; color: var(--ink); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.site-card-copy small { display: -webkit-box; overflow: hidden; color: var(--muted); font-size: 12px; line-height: 1.5; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.site-card-copy em { overflow: hidden; color: var(--muted); font-size: 11px; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 900px) { .site-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px) { .site-group { padding: 18px; } .site-grid { grid-template-columns: 1fr; } }
</style>
