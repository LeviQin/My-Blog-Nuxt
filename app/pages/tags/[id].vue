<template>
  <div class="container page-section tag-page">
    <SectionHeading eyebrow="a collection by tag" :level="1"># {{ tagName }}</SectionHeading>
    <div class="tag-page-toolbar">
      <p class="page-lead">收好所有带有这个标签的文章。</p>
      <span v-if="pagination.total">共 {{ pagination.total }} 篇文章</span>
    </div>

    <div v-if="articles.length" class="article-grid">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" :tags="tags" />
    </div>
    <EmptyState v-else title="这个标签还没有文章" message="暂时没有找到公开文章。" />

    <nav v-if="pagination.totalPages > 1" class="article-pagination" aria-label="标签文章分页">
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
import { normalizeTag } from '~/utils/article'

const route = useRoute()
const api = useBlogApi()
const tagId = String(route.params.id || '').trim()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

if (!/^\d+$/.test(tagId)) throw createError({ statusCode: 404, statusMessage: '标签不存在' })

const { data, error } = await useAsyncData(`tag-${tagId}`, async () => {
  const results = await Promise.allSettled([
    api.tags(),
    api.articlesPage({ tag: tagId, page: String(page.value), pageSize: '12' }),
  ])
  if (results[0].status !== 'fulfilled') throw createError({ statusCode: 503, statusMessage: '标签服务暂时不可用' })
  if (results[1].status !== 'fulfilled') throw createError({ statusCode: 503, statusMessage: '标签内容暂时不可用' })
  const tags = results[0].value
  const tag = tags.find((item) => String(item.id) === tagId)
  if (!tag) throw createError({ statusCode: 404, statusMessage: '标签不存在' })
  const articles = results[1].value
  return {
    tag,
    tags,
    articles,
  }
}, {
  default: () => ({ tag: undefined, tags: [], articles: { items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 } }),
  watch: [page],
})

if (error.value) throw error.value

const tag = computed(() => data.value?.tag as Tag | undefined)
const tagName = computed(() => normalizeTag(tag.value || '').name || `标签 ${tagId}`)
const tags = computed(() => (data.value?.tags || []) as Tag[])
const articles = computed(() => (data.value?.articles?.items || []) as Article[])
const pagination = computed(() => data.value?.articles || { items: [], total: 0, page: 1, pageSize: 12, totalPages: 0 })
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

function pageLink(value: number) { return { path: `/tags/${tagId}`, query: { page: String(value) } } }

useBlogSeo({
  title: () => `# ${tagName.value}`,
  description: () => `浏览带有 ${tagName.value} 标签的文章。`,
  canonical: () => page.value > 1 ? `/tags/${tagId}?page=${page.value}` : `/tags/${tagId}`,
  breadcrumbs: () => [
    { name: '首页', path: '/' },
    { name: '文章标签', path: '/articles' },
    { name: tagName.value, path: `/tags/${tagId}` },
  ],
})
</script>
