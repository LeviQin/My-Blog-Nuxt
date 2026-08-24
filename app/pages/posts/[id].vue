<template>
  <div v-if="article" class="container post-page">
    <article>
      <header class="post-header">
        <div class="article-meta"><time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time><span v-if="categoryLabel">{{ categoryLabel }}</span><span>{{ article.view_count }} 次阅读</span></div>
        <h1>{{ article.title }}</h1>
        <p>{{ article.article_description }}</p>
        <div v-if="visibleTags.length" class="tag-row"><span v-for="tag in visibleTags" :key="tag" class="tag"># {{ tag }}</span></div>
      </header>
      <img v-if="coverImage" class="post-cover" :src="coverImage" :alt="article.title" width="1200" height="640" decoding="async" @error="onCoverError">
      <div class="post-layout">
        <aside class="toc-card" aria-label="文章目录">
          <p class="card-kicker">on this page</p>
          <a v-for="heading in headings" :key="heading.id" :class="[`toc-level-${heading.level}`, { active: activeHeading === heading.id }]" :href="`#${heading.id}`" :aria-current="activeHeading === heading.id ? 'location' : undefined" @click="scrollToHeading($event, heading.id)">{{ heading.text }}</a>
        </aside>
        <div class="post-content"><MarkdownBody :source="article.content" /><div ref="completionMarker" class="article-completion-marker" aria-hidden="true"></div><div class="post-actions"><button class="button like-button" :class="{ liked }" type="button" :disabled="liked || liking" @click="likeArticle">{{ liked ? '已喜欢' : '喜欢这篇' }} · {{ article.likes + (liked ? 1 : 0) }}</button><span class="reading-note">阅读进度 {{ progress }}%</span></div><Transition name="read-stamp"><div v-if="hasCompletedReading" class="read-complete-stamp" role="status" aria-live="polite"><img src="/images/ui/handmade/bookmark.webp" alt="" width="34" height="48" decoding="async"><div><strong>已读</strong><span>这一页被你认真翻完了</span></div></div></Transition></div>
      </div>
    </article>
    <section class="post-comments"><SectionHeading eyebrow="private note">交流</SectionHeading><p class="page-lead">文章暂不开放公开评论。如果你有想法、问题或建议，欢迎私下联系站长。</p><NuxtLink class="button primary" to="/guestbook">联系站长 →</NuxtLink></section>
    <nav class="neighbor-nav" aria-label="相邻文章"><NuxtLink v-if="previous" :to="`/posts/${previous.id}`">← {{ previous.title }}</NuxtLink><span v-else /><NuxtLink v-if="next" :to="`/posts/${next.id}`">{{ next.title }} →</NuxtLink></nav>
  </div>
</template>

<script setup lang="ts">
import type { Category, Tag } from '~/types/api'
import { articleDate, articleImage, markdownHeadings, normalizeTag } from '~/utils/blog'

const route = useRoute()
const api = useBlogApi()
const id = Number(route.params.id)
const likedIds = useCookie<number[]>('liked-posts', { default: () => [] })
const liked = computed(() => likedIds.value.includes(id))
const liking = ref(false)
const coverImageFailed = ref(false)
const activeHeading = ref('')
let headingObserver: IntersectionObserver | null = null

const { data, error } = await useAsyncData(`post-${id}`, async () => {
  const [article, all, tags, categories] = await Promise.all([api.article(id), api.articles(), api.tags(), api.categories().catch(() => [])])
  return { article, all, tags, categories }
})
if (error.value) throw error.value

const article = computed(() => data.value?.article)
const coverImage = computed(() => coverImageFailed.value ? '' : articleImage(article.value))
const headings = computed(() => markdownHeadings(article.value?.content || ''))
const tagNames = computed(() => new Map(((data.value?.tags || []) as Tag[]).map((tag) => [String(tag.id), normalizeTag(tag).name])))
const categoryNames = computed(() => new Map(((data.value?.categories || []) as Category[]).map((category) => [String(category.id), category.name || category.category_name || category.slug])))
const categoryLabel = computed(() => categoryNames.value.get(String(article.value?.category)) || (/^\d+$/.test(String(article.value?.category || '')) ? '' : String(article.value?.category || '').trim()))
const visibleTags = computed(() => (article.value?.article_tags || []).map((tag) => tagNames.value.get(String(tag)) || (/^\d+$/.test(String(tag)) ? '' : String(tag))).filter(Boolean))
const allArticles = computed(() => data.value?.all || [])
const index = computed(() => allArticles.value.findIndex((item) => item.id === id))
const previous = computed(() => index.value > 0 ? allArticles.value[index.value - 1] : undefined)
const next = computed(() => index.value >= 0 ? allArticles.value[index.value + 1] : undefined)
const progress = useReadingProgress()
const hasCompletedReading = ref(false)
const completionMarker = ref<HTMLElement>()
const { completeArticle } = useReadingRewards()
const { track } = useAnalytics()
let completionObserver: IntersectionObserver | null = null

function onCoverError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.onerror = null
  coverImageFailed.value = true
}
async function likeArticle() { if (liked.value) return; liking.value = true; try { await api.like(id); likedIds.value = [...likedIds.value, id] } finally { liking.value = false } }

watch(progress, (value) => {
  if (value >= 100) hasCompletedReading.value = true
})

function observeHeadings() {
  if (!import.meta.client) return
  const elements = headings.value.map((heading) => document.getElementById(heading.id)).filter(Boolean) as HTMLElement[]
  activeHeading.value = elements[0]?.id || ''
  headingObserver?.disconnect()
  if (!elements.length) return
  headingObserver = new IntersectionObserver((entries) => {
    const activeEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (activeEntry) activeHeading.value = (activeEntry.target as HTMLElement).id
  }, { rootMargin: '-110px 0px -65% 0px', threshold: 0 })
  elements.forEach((element) => headingObserver?.observe(element))
}

function scrollToHeading(event: MouseEvent, headingId: string) {
  event.preventDefault()
  const element = document.getElementById(headingId)
  if (!element) return
  activeHeading.value = headingId
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(null, '', `#${headingId}`)
}

onMounted(() => {
  track('article_view', { article_id: id, page_path: route.path })
  nextTick(() => {
    observeHeadings()
    if (completionMarker.value) {
      completionObserver = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || hasCompletedReading.value) return
        hasCompletedReading.value = true
        completeArticle(id)
        completionObserver?.disconnect()
      }, { threshold: 0.1 })
      completionObserver.observe(completionMarker.value)
    }
  })
})
onBeforeUnmount(() => { headingObserver?.disconnect(); completionObserver?.disconnect() })

useBlogSeo({
  title: () => article.value?.title || '文章',
  description: () => article.value?.article_description || '',
  image: coverImage,
  type: 'article',
  publishedTime: () => article.value?.published_at,
  modifiedTime: () => article.value?.content_updated_at,
  keywords: () => visibleTags.value.join(', '),
  breadcrumbs: () => [
    { name: '首页', path: '/' },
    { name: '全部文章', path: '/articles' },
    ...(article.value ? [{ name: article.value.title, path: `/posts/${article.value.id}` }] : []),
  ],
})
</script>
