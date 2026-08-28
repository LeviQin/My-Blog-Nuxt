<template>
  <div class="container page-section articles-page">
    <SectionHeading eyebrow="all stories" :level="1">全部文章</SectionHeading>
    <div class="articles-toolbar"><p class="page-lead">浏览所有公开文章，按卡片方式查看封面、分类和标签。</p><span v-if="pagination.total">共 {{ pagination.total }} 篇文章</span></div>
    <div v-if="articles.length" class="article-grid">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" :tags="tags" />
    </div>
    <EmptyState v-else title="还没有文章" message="文章正在整理中。" />
    <nav v-if="pagination.totalPages > 1" class="article-pagination" aria-label="文章分页">
      <NuxtLink v-if="page > 1" class="pagination-button" :to="pageLink(page - 1)">上一页</NuxtLink>
      <span v-else class="pagination-button is-disabled">上一页</span>
      <div class="pagination-pages">
        <template v-for="(item, index) in pageNumbers" :key="`${item}-${index}`">
          <span v-if="item === '…'" class="pagination-ellipsis">…</span>
          <NuxtLink v-else class="pagination-page" :class="{ active: item === page }" :to="pageLink(Number(item))">{{ item }}</NuxtLink>
        </template>
      </div>
      <NuxtLink v-if="page < pagination.totalPages" class="pagination-button" :to="pageLink(page + 1)">下一页</NuxtLink>
      <span v-else class="pagination-button is-disabled">下一页</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Article, Tag } from '~/types/api'

const api = useBlogApi()
const route = useRoute()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const { data } = await useAsyncData('articles-page', async () => {
  const results = await Promise.allSettled([api.articlesPage({ page: String(page.value), pageSize: '12' }), api.tags()])
  return {
    articles: results[0].status === 'fulfilled' ? results[0].value : { items: [], total: 0, page: page.value, pageSize: 12, totalPages: 0 },
    tags: results[1].status === 'fulfilled' ? results[1].value : [],
  }
}, { default: () => ({ articles: { items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 }, tags: [] }), watch: [page] })
const articles = computed(() => (data.value?.articles?.items || []) as Article[])
const pagination = computed(() => data.value?.articles || { items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 })
const tags = computed(() => (data.value?.tags || []) as Tag[])
const pageNumbers = computed<Array<number | '…'>>(() => {
  const total = pagination.value.totalPages
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(2, page.value - 2)
  const end = Math.min(total - 1, page.value + 2)
  const result: Array<number | '…'> = [1]
  if (start > 2) result.push('…')
  for (let value = start; value <= end; value += 1) result.push(value)
  if (end < total - 1) result.push('…')
  result.push(total)
  return result
})
function pageLink(value: number) { return { path: '/articles', query: { page: String(value) } } }
const pageTitle = computed(() => page.value > 1 ? `全部文章 · 第 ${page.value} 页` : '全部文章')
const canonical = computed(() => page.value > 1 ? `/articles?page=${page.value}` : '/articles')
useBlogSeo({ title: pageTitle, description: '浏览 Levi Blog 的全部文章。', canonical })
</script>
