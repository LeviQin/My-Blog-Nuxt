<template>
  <div class="container page-section search-page">
    <SectionHeading eyebrow="find a note" :level="1">站内搜索</SectionHeading>

    <form class="search-form" @submit.prevent="search">
      <label class="sr-only" for="keyword">搜索关键词</label>
      <input id="keyword" v-model="keyword" type="search" placeholder="输入标题、摘要或正文关键词" autofocus>
      <button class="button primary" type="submit">搜索</button>
    </form>

    <p v-if="searched" class="result-summary">找到 {{ results.length }} 篇与“{{ submitted }}”有关的文章</p>

    <div v-if="pageResults.length" class="article-grid">
      <ArticleCard v-for="article in pageResults" :key="article.id" :article="article" :tag-names="tagNames" />
    </div>
    <EmptyState v-else :title="searched ? '没有找到相关文章' : '从一个词开始'" :message="searched ? '试试更短的关键词，或者换个表达。' : '搜索文章标题、摘要和正文内容。'" />

    <nav v-if="totalPages > 1" class="article-pagination" aria-label="搜索结果分页">
      <NuxtLink v-if="page > 1" class="pagination-button" :to="pageLink(page - 1)">上一页</NuxtLink>
      <span v-else class="pagination-button is-disabled">上一页</span>
      <div class="pagination-pages">
        <template v-for="(item, index) in pageNumbers" :key="`${item}-${index}`">
          <span v-if="item === '…'" class="pagination-ellipsis">…</span>
          <NuxtLink v-else class="pagination-page" :class="{ active: item === page }" :to="pageLink(Number(item))">{{ item }}</NuxtLink>
        </template>
      </div>
      <NuxtLink v-if="page < totalPages" class="pagination-button" :to="pageLink(page + 1)">下一页</NuxtLink>
      <span v-else class="pagination-button is-disabled">下一页</span>
    </nav>
  </div>
</template>

<script setup lang="ts">
import type { Tag } from '~/types/api'
import { normalizeTag } from '~/utils/blog'

const pageSize = 12
const route = useRoute()
const router = useRouter()
const api = useBlogApi()
const keyword = ref(String(route.query.keyword || ''))

const { data } = await useAsyncData('search', async () => {
  const term = String(route.query.keyword || '').trim()
  const [articleResult, tagResult] = await Promise.allSettled([
    term ? api.search(term) : Promise.resolve([]),
    api.tags(),
  ])
  return {
    articles: articleResult.status === 'fulfilled' ? articleResult.value : [],
    tags: tagResult.status === 'fulfilled' ? tagResult.value : [],
  }
}, {
  default: () => ({ articles: [], tags: [] }),
  watch: [() => route.query.keyword],
})

const submitted = computed(() => String(route.query.keyword || '').trim())
const searched = computed(() => Boolean(submitted.value))
const results = computed(() => data.value?.articles || [])
const totalPages = computed(() => Math.ceil(results.value.length / pageSize))
const requestedPage = computed(() => Math.max(1, Number(route.query.page) || 1))
const page = computed(() => Math.min(requestedPage.value, Math.max(1, totalPages.value)))
const pageResults = computed(() => results.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const tagNames = computed(() => new Map(((data.value?.tags || []) as Tag[]).map((tag) => [String(tag.id), normalizeTag(tag).name])))

const pageNumbers = computed<Array<number | '…'>>(() => {
  const total = totalPages.value
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)
  const start = Math.max(2, page.value - 2)
  const end = Math.min(total - 1, page.value + 2)
  const numbers: Array<number | '…'> = [1]
  if (start > 2) numbers.push('…')
  for (let value = start; value <= end; value += 1) numbers.push(value)
  if (end < total - 1) numbers.push('…')
  numbers.push(total)
  return numbers
})

async function search() {
  const value = keyword.value.trim()
  await router.replace({ path: '/search', query: value ? { keyword: value } : {} })
}

function pageLink(value: number) {
  return { path: '/search', query: { ...(submitted.value ? { keyword: submitted.value } : {}), page: String(value) } }
}

useBlogSeo({ title: '站内搜索', description: '搜索 Levi Blog 的文章。', robots: 'noindex,follow', canonical: '/search' })
</script>
