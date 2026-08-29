<template>
  <div v-if="article" class="container post-page">
    <div v-if="isPreview" class="preview-banner" role="status">
      <strong>预览模式</strong>
      <span>当前内容仅供查看，不会计入阅读量，也不会公开展示。</span>
    </div>
    <article data-reading-scope>
      <header class="post-header post-reveal">
        <div class="article-meta"><span v-if="isPinnedArticle(article)" class="article-pin" aria-label="置顶文章">置顶</span><time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time><span v-if="categoryLabel">{{ categoryLabel }}</span><span>{{ article.view_count }} 次阅读</span></div>
        <h1>{{ article.title }}</h1>
        <p>{{ article.article_description }}</p>
        <div v-if="visibleTags.length" class="tag-row"><template v-for="tag in visibleTags" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" class="tag" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else class="tag"># {{ tag.name }}</span></template></div>
      </header>
      <button v-if="coverImage" class="post-cover-trigger post-reveal post-reveal--cover" type="button" aria-label="查看文章封面大图" @click="openCoverImage"><img class="post-cover" :src="coverImage" :alt="article.title" width="1200" height="640" decoding="async" @error="onCoverError"></button>
      <div class="post-layout post-reveal post-reveal--layout">
        <aside class="toc-card" aria-label="文章目录">
          <p class="card-kicker">on this page</p>
          <a v-for="heading in headings" :key="heading.id" :class="[`toc-level-${heading.level}`, { active: activeHeading === heading.id }]" :href="`#${heading.id}`" :aria-current="activeHeading === heading.id ? 'location' : undefined" @click="scrollToHeading($event, heading.id)">{{ heading.text }}</a>
        </aside>
        <div class="post-content"><MarkdownBody ref="markdownBody" :source="article.content" :enable-image-preview="true" @image-click="openImageFromBody" /><div ref="completionMarker" class="article-completion-marker" data-reading-end aria-hidden="true"></div><div v-if="!isPreview" class="post-actions"><div class="post-action-group"><button class="button like-button" :class="{ liked }" type="button" :disabled="liked || liking" @click="likeArticle">{{ liked ? '已喜欢' : '喜欢这篇' }} · {{ article.likes + (liked ? 1 : 0) }}</button><ArticleShare :url="shareUrl" /></div><span class="reading-note">阅读进度 {{ progress }}%</span></div><Transition name="read-stamp"><div v-if="hasCompletedReading" class="read-complete-stamp" role="status" aria-live="polite"><img src="/images/ui/handmade/bookmark.webp" alt="" width="34" height="48" decoding="async"><div><strong>已读</strong><span>这一页被你认真翻完了</span></div></div></Transition></div>
      </div>
    </article>
    <section v-if="relatedArticles.length" class="post-related" aria-label="继续阅读">
      <SectionHeading eyebrow="read next">你可能还会喜欢</SectionHeading>
      <div class="article-grid post-related-grid">
        <ArticleCard v-for="related in relatedArticles" :key="related.id" :article="related" :tags="tags" :category-names="categoryNames" />
      </div>
    </section>
    <section class="post-comments"><SectionHeading eyebrow="private note">交流</SectionHeading><p class="page-lead">文章暂不开放公开评论。如果你有想法、问题或建议，欢迎私下联系站长。</p><NuxtLink class="button primary" to="/guestbook">联系站长 <UiIcon name="arrow-right" /></NuxtLink></section>
    <nav class="neighbor-nav" aria-label="相邻文章"><NuxtLink v-if="previous" :to="`/posts/${previous.id}`"><UiIcon name="arrow-left" /> {{ previous.title }}</NuxtLink><span v-else /><NuxtLink v-if="next" :to="`/posts/${next.id}`">{{ next.title }} <UiIcon name="arrow-right" /></NuxtLink></nav>
    <ImageLightbox :open="Boolean(lightboxImage)" :images="lightboxImages" :index="lightboxIndex" dialog-label="查看文章大图" @close="closeImage" @change="changeLightbox" />
  </div>
</template>

<script setup lang="ts">
import type { Category, Tag } from '~/types/api'
import { articleDate, articleImage, isPinnedArticle, markdownHeadings, resolveArticleTags } from '~/utils/article'

const route = useRoute()
const api = useBlogApi()
const id = Number(route.params.id)
const previewToken = typeof route.query.preview === 'string' ? route.query.preview.trim() : ''
const isPreview = Boolean(previewToken)
type GalleryImage = { src: string; alt: string }
const likedIds = useCookie<number[]>('liked-posts', { default: () => [] })
const liked = computed(() => likedIds.value.includes(id))
const liking = ref(false)
const coverImageFailed = ref(false)
const activeHeading = ref('')
const markdownBody = ref<{ getImages: () => GalleryImage[] }>()
const lightboxImages = ref<GalleryImage[]>([])
const lightboxIndex = ref(0)
const lightboxImage = computed(() => lightboxImages.value[lightboxIndex.value])
let headingObserver: IntersectionObserver | null = null

const { data, error } = await useAsyncData(`post-${id}${isPreview ? '-preview' : ''}`, async () => {
  const [article, all, tags, categories] = await Promise.all([
    api.article(id, isPreview ? { preview: previewToken } : {}),
    isPreview ? Promise.resolve([]) : api.articles(),
    api.tags(),
    api.categories().catch(() => []),
  ])
  return { article, all, tags, categories }
})
if (error.value) throw error.value

const article = computed(() => data.value?.article)
const config = useRuntimeConfig()
const shareUrl = computed(() => `${String(config.public.siteUrl || '').replace(/\/$/, '')}/posts/${id}`)
const coverImage = computed(() => coverImageFailed.value ? '' : articleImage(article.value))
const headings = computed(() => markdownHeadings(article.value?.content || ''))
const tags = computed(() => (data.value?.tags || []) as Tag[])
const categoryNames = computed(() => new Map(((data.value?.categories || []) as Category[]).map((category) => [String(category.id), category.name || category.category_name || category.slug])))
const categoryLabel = computed(() => categoryNames.value.get(String(article.value?.category)) || (/^\d+$/.test(String(article.value?.category || '')) ? '' : String(article.value?.category || '').trim()))
const visibleTags = computed(() => resolveArticleTags(article.value?.article_tags, tags.value))
const allArticles = computed(() => data.value?.all || [])
const relatedArticles = computed(() => {
  if (isPreview || !article.value) return []

  const tagKey = (tag: { id?: string; name: string }) => tag.id ? `id:${tag.id}` : `name:${tag.name.trim().toLowerCase()}`
  const currentTagKeys = new Set(visibleTags.value.map(tagKey))
  const currentCategory = String(article.value.category || '').trim()

  return allArticles.value
    .filter((candidate) => candidate.id !== id)
    .map((candidate) => {
      const sharedTags = resolveArticleTags(candidate.article_tags, tags.value)
        .filter((tag) => currentTagKeys.has(tagKey(tag))).length
      const sameCategory = Boolean(currentCategory && String(candidate.category || '').trim() === currentCategory)
      const timestamp = new Date(candidate.published_at || candidate.updated_at).getTime()
      return { candidate, score: sharedTags * 3 + (sameCategory ? 2 : 0), timestamp: Number.isNaN(timestamp) ? 0 : timestamp }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp || b.candidate.id - a.candidate.id)
    .slice(0, 3)
    .map((item) => item.candidate)
})
const index = computed(() => allArticles.value.findIndex((item) => item.id === id))
const previous = computed(() => index.value > 0 ? allArticles.value[index.value - 1] : undefined)
const next = computed(() => index.value >= 0 ? allArticles.value[index.value + 1] : undefined)
const progress = useReadingProgress()
const hasCompletedReading = ref(false)
const completionMarker = ref<HTMLElement>()
const { completeArticle } = useReadingRewards()
const { track } = useAnalytics()
let completionObserver: IntersectionObserver | null = null
let engagementTimer: ReturnType<typeof setTimeout> | null = null
let engagementTracked = false

function trackEngagement() {
  if (isPreview || engagementTracked) return
  engagementTracked = true
  track('article_engaged', { article_id: id, page_path: route.path })
}

function onCoverError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.onerror = null
  coverImageFailed.value = true
}
function openGallery(images: GalleryImage[], index: number) {
  if (!images.length) return
  lightboxImages.value = images
  lightboxIndex.value = Math.min(Math.max(index, 0), images.length - 1)
}
function openImageFromBody(payload: { image: GalleryImage; images: GalleryImage[]; index: number }) {
  const images = coverImage.value
    ? [{ src: coverImage.value, alt: article.value?.title || '文章封面' }, ...payload.images]
    : payload.images
  openGallery(images, payload.index + (coverImage.value ? 1 : 0))
}
function openCoverImage() {
  if (!coverImage.value) return
  openGallery([
    { src: coverImage.value, alt: article.value?.title || '文章封面' },
    ...(markdownBody.value?.getImages() || []),
  ], 0)
}
function changeLightbox(index: number) {
  if (index >= 0 && index < lightboxImages.value.length) lightboxIndex.value = index
}
function closeImage() {
  lightboxImages.value = []
  lightboxIndex.value = 0
}
async function likeArticle() { if (isPreview || liked.value) return; liking.value = true; try { await api.like(id); likedIds.value = [...likedIds.value, id] } finally { liking.value = false } }

watch(progress, (value) => {
  if (!isPreview && value >= 100) {
    hasCompletedReading.value = true
    trackEngagement()
  }
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
  if (!isPreview) {
    track('article_view', { article_id: id, page_path: route.path })
    engagementTimer = setTimeout(trackEngagement, 30000)
  }
  nextTick(() => {
    observeHeadings()
    if (!isPreview && completionMarker.value) {
      completionObserver = new IntersectionObserver(([entry]) => {
        if (!entry?.isIntersecting || hasCompletedReading.value) return
        hasCompletedReading.value = true
        trackEngagement()
        completeArticle(id)
        completionObserver?.disconnect()
      }, { threshold: 0.1 })
      completionObserver.observe(completionMarker.value)
    }
  })
})
onBeforeUnmount(() => { headingObserver?.disconnect(); completionObserver?.disconnect(); if (engagementTimer) clearTimeout(engagementTimer) })

useBlogSeo({
  title: () => article.value?.title || '文章',
  description: () => article.value?.article_description || '',
  image: coverImage,
  type: 'article',
  publishedTime: () => article.value?.published_at,
  modifiedTime: () => article.value?.content_updated_at,
  keywords: () => visibleTags.value.map(tag => tag.name).join(', '),
  robots: () => isPreview ? 'noindex,nofollow,noarchive' : undefined,
  breadcrumbs: () => [
    { name: '首页', path: '/' },
    { name: '全部文章', path: '/articles' },
    ...(article.value ? [{ name: article.value.title, path: `/posts/${article.value.id}` }] : []),
  ],
})
</script>

<style scoped>
.preview-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 12px 16px;
  border: 1px solid rgba(183, 132, 72, 0.28);
  border-radius: 12px;
  color: #7f5d36;
  background: rgba(255, 248, 232, 0.92);
  font-size: 14px;
}

.preview-banner strong {
  color: #9b6424;
}
</style>
