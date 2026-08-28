<template>
  <div class="container page-section archive-page">
    <SectionHeading eyebrow="a timeline of thoughts" :level="1">文章归档</SectionHeading>
    <p class="page-lead">按时间把写过的内容重新走一遍。</p>
    <form class="time-capsule-search" @submit.prevent="openCapsule">
      <label for="capsule-year">输入一个年份，看看那一年留下了什么</label>
      <div><input id="capsule-year" ref="yearInput" v-model="yearQuery" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="2025" aria-describedby="capsule-help"><button class="button primary" type="submit">打开</button></div>
      <small id="capsule-help">四位数字，例如 2025</small>
    </form>
    <section v-if="capsuleOpen" ref="capsuleCard" class="time-capsule" tabindex="-1" aria-labelledby="capsule-title">
      <div class="time-capsule-tape" aria-hidden="true"></div>
      <template v-if="capsule">
        <p class="card-kicker">a note from {{ capsule.year }}</p>
        <h2 id="capsule-title">{{ capsule.year }} · 时间胶囊</h2>
        <p class="capsule-note">{{ capsule.note || '那一年没有留下手写备注，但每一篇文章都还在这里。' }}</p>
        <div class="capsule-stats"><span><strong>{{ capsule.items.length }}</strong> 篇文章</span><span><strong>{{ capsule.firstDate }}</strong> 最早发布</span><span><strong>{{ capsule.lastDate }}</strong> 最晚发布</span><span><strong>{{ capsule.busyMonth }}</strong> 发文最多</span></div>
        <NuxtLink class="capsule-reread" :to="`/posts/${capsule.random.id}`"><img src="/images/ui/handmade/bookmark.webp" alt="" width="28" height="40">重读：{{ capsule.random.title }}</NuxtLink>
      </template>
      <p v-else class="capsule-empty" id="capsule-title">这个抽屉里暂时没有那一年的纸张。</p>
    </section>
    <template v-if="archive.length">
      <div class="archive-list">
        <section v-for="year in visibleArchive" :id="`year-${year.year}`" :key="year.year" class="archive-year" :class="{ 'is-collapsed': !expandedYears.has(year.year) }">
          <h2>
            <button class="archive-year-toggle" type="button" :aria-expanded="expandedYears.has(year.year)" :aria-controls="`archive-year-content-${year.year}`" @click="toggleYear(year.year)">
              <span>{{ year.year }}</span>
              <small>{{ yearArticleCount(year) }} 篇文章</small>
              <span class="archive-year-chevron" aria-hidden="true">⌄</span>
            </button>
          </h2>
          <div v-if="expandedYears.has(year.year)" :id="`archive-year-content-${year.year}`" class="archive-year-content">
            <div v-for="month in year.months" :key="month.month" class="archive-month">
              <h3>{{ month.month }}</h3>
              <div class="archive-items">
                <div v-for="article in month.items" :key="article.id" class="archive-item">
                  <time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time>
                  <NuxtLink class="archive-item-title" :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink>
                  <small>{{ categoryName(article.category) }}</small>
                  <span v-if="visibleTags(article).length" class="archive-item-tags" aria-label="文章标签">
                    <template v-for="tag in visibleTags(article)" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" class="tag" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else class="tag"># {{ tag.name }}</span></template>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <button v-if="hasEarlierYears" class="button ghost archive-load-more" type="button" @click="showEarlierYears">展开更早年份</button>
    </template>
    <EmptyState v-else title="还没有归档内容" />
  </div>
</template>
<script setup lang="ts">
import { articleDate, categoryName, groupArchive, resolveArticleTags } from '~/utils/blog'
import { timeCapsuleNotes } from '~/data/time-capsules'
import type { Article, Tag } from '~/types/api'
const api = useBlogApi()
const { data } = await useAsyncData('archive', async () => {
  const results = await Promise.allSettled([api.articles(), api.tags()])
  return {
    articles: results[0].status === 'fulfilled' ? results[0].value : [],
    tags: results[1].status === 'fulfilled' ? results[1].value : [],
  }
}, { default: () => ({ articles: [], tags: [] }) })
const articles = computed(() => (data.value?.articles || []) as Article[])
const tags = computed(() => (data.value?.tags || []) as Tag[])
const archive = computed(() => groupArchive(articles.value))
const visibleYearCount = ref(3)
const visibleArchive = computed(() => archive.value.slice(0, visibleYearCount.value))
const hasEarlierYears = computed(() => visibleYearCount.value < archive.value.length)
const firstYear = archive.value[0]?.year
const expandedYears = ref(new Set(firstYear ? [firstYear] : []))
const yearQuery = ref('')
const capsuleOpen = ref(false)
const capsuleCard = ref<HTMLElement>()
const yearInput = ref<HTMLInputElement>()
function visibleTags(article: Article) {
  return resolveArticleTags(article.article_tags, tags.value, 3)
}
const capsule = computed(() => {
  const year = yearQuery.value
  if (!/^\d{4}$/.test(year)) return null
  const items = articles.value.filter((article) => String(new Date(article.published_at || article.updated_at).getFullYear()) === year)
  if (!items.length) return null
  const sorted = [...items].sort((a, b) => new Date(a.published_at || a.updated_at).getTime() - new Date(b.published_at || b.updated_at).getTime())
  const months = new Map<number, number>()
  items.forEach((item) => { const month = new Date(item.published_at || item.updated_at).getMonth() + 1; months.set(month, (months.get(month) || 0) + 1) })
  const busyMonth = [...months.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  return { year, items, firstDate: articleDate(sorted[0].published_at || sorted[0].updated_at), lastDate: articleDate(sorted[sorted.length - 1].published_at || sorted[sorted.length - 1].updated_at), busyMonth: busyMonth ? `${busyMonth} 月` : '—', random: items[Math.floor(Math.random() * items.length)], note: timeCapsuleNotes[year] }
})
function openCapsule() {
  yearQuery.value = yearQuery.value.replace(/\D/g, '').slice(0, 4)
  capsuleOpen.value = true
  if (capsule.value) revealYear(yearQuery.value)
  nextTick(() => { capsuleCard.value?.scrollIntoView({ behavior: 'smooth', block: 'center' }); capsuleCard.value?.focus() })
}
function yearArticleCount(year: (typeof archive.value)[number]) {
  return year.months.reduce((total, month) => total + month.items.length, 0)
}
function toggleYear(year: string) {
  const next = new Set(expandedYears.value)
  if (next.has(year)) next.delete(year)
  else next.add(year)
  expandedYears.value = next
}
function revealYear(year: string) {
  const index = archive.value.findIndex((item) => item.year === year)
  if (index < 0) return false
  visibleYearCount.value = Math.max(visibleYearCount.value, index + 1)
  expandedYears.value = new Set([...expandedYears.value, year])
  return true
}
function showEarlierYears() {
  visibleYearCount.value = Math.min(visibleYearCount.value + 3, archive.value.length)
}
function revealHashYear() {
  const hash = window.location.hash
  if (!hash.startsWith('#year-')) return
  let year = hash.slice(6)
  try { year = decodeURIComponent(year) } catch {}
  if (!revealYear(year)) return
  nextTick(() => document.getElementById(`year-${year}`)?.scrollIntoView({ block: 'start' }))
}
onMounted(() => {
  revealHashYear()
  window.addEventListener('hashchange', revealHashYear)
})
onBeforeUnmount(() => window.removeEventListener('hashchange', revealHashYear))
useBlogSeo({ title: '文章归档', description: '按年份和月份浏览 Levi Blog 的文章。' })
</script>
