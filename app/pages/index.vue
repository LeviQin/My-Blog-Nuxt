<template>
  <div class="journal-home">
    <div class="journal-container">
      <div class="journal-layout">
        <main class="journal-main">
          <section v-if="hasHeroCopy" class="journal-hero" aria-labelledby="home-hero-title">
            <div class="hero-paper">
              <div class="hero-paper-copy">
                <p v-if="heroKicker" class="hero-kicker">{{ heroKicker }}</p>
                <h1 v-if="heroTitle || heroTitleEmphasis" id="home-hero-title"><span v-if="heroTitle">{{ heroTitle }}</span><br v-if="heroTitle && heroTitleEmphasis"><em v-if="heroTitleEmphasis">{{ heroTitleEmphasis }}</em></h1>
                <p v-if="heroDescription || heroDescriptionExtra" class="hero-description"><span v-if="heroDescription">{{ heroDescription }}</span><br v-if="heroDescription && heroDescriptionExtra"><span v-if="heroDescriptionExtra">{{ heroDescriptionExtra }}</span></p>
                <div v-if="heroPrimaryText || heroSecondaryText" class="hero-actions">
                  <NuxtLink v-if="heroPrimaryText" class="journal-button journal-button-primary" :to="articlePath(articleItems[0])"><img class="button-icon" src="/images/ui/handmade/leaf.webp" alt="" width="18" height="18" aria-hidden="true"> {{ heroPrimaryText }}</NuxtLink>
                  <NuxtLink v-if="heroSecondaryText" class="journal-button journal-button-secondary" to="/archive"><img class="button-icon" src="/images/ui/handmade/book.webp" alt="" width="18" height="18" aria-hidden="true"> {{ heroSecondaryText }}</NuxtLink>
                </div>
              </div>
            </div>
            <div class="desk-collage" aria-label="最近文章封面拼贴">
              <div class="desk-code-card" aria-hidden="true"><span>const life = {</span><span>  learn: true,</span><span>  share: true,</span><span>  enjoy: true</span><span>}</span></div>
              <img :src="heroImage" alt="桌面上的代码、相机、咖啡和手账" width="720" height="480" decoding="async">
              <CoffeeSecret />
              <div class="desk-polaroid" aria-hidden="true"><img :src="collageImages[0]" alt="" width="70" height="70" loading="lazy"></div>
              <span class="desk-note" aria-hidden="true">Keep coding.<br>Keep exploring.</span>
            </div>
          </section>

          <section class="latest-section" aria-labelledby="latest-title">
            <div class="journal-section-heading">
              <h2 id="latest-title">最新文章</h2>
              <NuxtLink to="/articles">查看全部文章 <span aria-hidden="true">→</span></NuxtLink>
            </div>
            <div v-if="articleItems.length" class="journal-article-grid">
              <article v-for="(article, index) in articleItems" :key="article.id || article.title" class="journal-article-card">
                <div class="journal-cover-wrap">
                  <NuxtLink :to="articlePath(article)" class="journal-cover-link">
                    <img v-if="articleImage(article)" class="journal-cover" :src="articleImage(article)" :alt="article.title" width="720" height="420" loading="lazy" decoding="async" @error="onArticleImageError($event, article)">
                    <span v-else class="journal-cover-placeholder" aria-label="未配置文章封面" />
                  </NuxtLink>
                  <span v-if="categoryName(article.category)" class="journal-category">{{ categoryName(article.category) }}</span>
                </div>
                <div class="journal-article-body">
                  <h3><NuxtLink :to="articlePath(article)">{{ article.title }}</NuxtLink></h3>
                  <p v-if="article.article_description">{{ article.article_description }}</p>
                  <div class="article-meta"><time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time><span v-if="categoryName(article.category)">{{ categoryName(article.category) }}</span></div>
                  <div class="journal-tags"><span v-for="tag in articleTags(article)" :key="tag">{{ tag }}</span></div>
                </div>
              </article>
            </div>
            <EmptyState v-else title="文章正在整理中" message="暂时还没有可以展示的公开文章。" />
          </section>
        </main>

        <aside class="journal-sidebar" aria-label="博客侧栏">
          <section v-if="hasProfileData" class="journal-card profile-card">
            <div class="profile-topline"><div v-if="profileImage" class="profile-avatar"><img :src="profileImage" alt="博客头像" width="140" height="140" decoding="async"></div><div v-if="profileName || profileJob || profileDescription" class="profile-intro"><div class="profile-name-row"><h2 v-if="profileName">{{ profileName }}</h2><span v-if="profileJob" class="profile-badge">{{ profileJob }}</span></div><p v-if="profileDescription" class="profile-quote">“ {{ profileDescription }} ”</p></div></div>
            <div v-if="profileTags.length" class="profile-tags"><span v-for="tag in profileTags" :key="tag">{{ tag }}</span></div>
            <div class="profile-socials">
              <a v-for="social in socialLinks" :key="social.label" :href="social.href" target="_blank" rel="noreferrer" :aria-label="social.label" :title="social.label"><img :src="social.icon" alt="" width="38" height="38"></a>
              <a href="/api/articles/rss.xml" aria-label="订阅 RSS" title="订阅 RSS"><img src="/images/ui/handmade/social-rss.svg" alt="" width="38" height="38"></a>
              <NuxtLink v-if="showAboutModule" to="/about" aria-label="联系我" title="联系我"><img src="/images/ui/handmade/icon-contact.svg" alt="" width="38" height="38"></NuxtLink>
              <a v-if="profileEmail" :href="`mailto:${profileEmail}`" :aria-label="`发送邮件至 ${profileEmail}`" :title="profileEmail"><img src="/images/ui/handmade/social-email.svg" alt="" width="38" height="38"></a>
            </div>
          </section>

          <section v-if="projectItems.length" class="journal-card project-card">
            <div class="card-title-row"><h2>最近项目</h2><NuxtLink to="/portfolio" aria-label="查看全部项目">→</NuxtLink></div>
            <NuxtLink v-for="project in projectItems.slice(0, 4)" :key="project.id || project.name" class="project-item" :to="project.link ? undefined : '/portfolio'" :href="project.link || undefined" :target="project.link ? '_blank' : undefined" :rel="project.link ? 'noreferrer' : undefined">
              <span class="project-copy"><strong>{{ project.name }}</strong><small v-if="project.category">{{ project.category }}</small></span><span v-if="projectStatus(project)" class="project-status">{{ projectStatus(project) }}</span>
            </NuxtLink>
          </section>

          <NuxtLink v-if="showWidgetModule" class="journal-card lab-entry-card" to="/lab">
            <img src="/images/ui/handmade/icon-lab-flask-real.svg" alt="" width="46" height="52" aria-hidden="true">
            <span><small>LEVI LAB</small><strong>手账实验室</strong><em>调一张纸，写一段 Markdown。</em></span>
            <b aria-hidden="true">→</b>
          </NuxtLink>

          <section v-if="showCategoryModule && categories.length" class="journal-card category-card">
            <div class="card-title-row"><h2>文章分类</h2><NuxtLink to="/archive" aria-label="查看文章归档">→</NuxtLink></div>
            <NuxtLink v-for="category in categories" :key="category.slug" class="category-item" :to="`/category/${category.slug}`"><img v-if="category.icon" class="category-icon-img" :src="category.icon" alt="" width="19" height="19" aria-hidden="true"><span>{{ category.name }}</span><small>{{ categoryCount(category.value) }}</small></NuxtLink>
          </section>
        </aside>
      </div>
    </div>
    <button v-show="showBackToTop" class="back-to-top" type="button" aria-label="返回顶部" @click="backToTop"><img src="/images/ui/handmade/arrow-up.svg" alt="" width="30" height="30" aria-hidden="true"></button>
  </div>
</template>

<script setup lang="ts">
import { articleDate, articleImage as resolveArticleImage, normalizeTag } from '~/utils/blog'

const api = useBlogApi()
const { data, error } = await useAsyncData('home', async () => {
  const results = await Promise.allSettled([api.articles(), api.statistics(), api.tags(), api.settings(), api.projects(), api.categories()])
  return {
    articles: results[0].status === 'fulfilled' ? results[0].value : [],
    stats: results[1].status === 'fulfilled' ? results[1].value : {},
    tags: results[2].status === 'fulfilled' ? results[2].value : [],
    settings: results[3].status === 'fulfilled' ? results[3].value : {},
    projects: results[4].status === 'fulfilled' ? results[4].value : [],
    categories: results[5].status === 'fulfilled' ? results[5].value : [],
  }
}, { default: () => ({ articles: [], stats: {}, tags: [], settings: {}, projects: [], categories: [] }) })

const collageImages = ['/images/life-mountain.webp', '/images/life-cat.webp', '/images/life-coast.webp']
const articles = computed<any[]>(() => data.value?.articles || [])
const tags = computed<any[]>(() => data.value?.tags || [])
const settings = computed<any>(() => Array.isArray(data.value?.settings) ? data.value?.settings[0] || {} : data.value?.settings || {})
const showCategoryModule = computed(() => isSiteModuleEnabled(settings.value, 'show_category_module'))
const showWidgetModule = computed(() => isSiteModuleEnabled(settings.value, 'show_widget_module'))
const showAboutModule = computed(() => isSiteModuleEnabled(settings.value, 'show_about_module'))
const projects = computed<any[]>(() => data.value?.projects || [])
const failedArticleImages = ref<Record<string, boolean>>({})
const articleItems = computed(() => articles.value.slice(0, 3))
const projectItems = computed(() => [...projects.value].sort((a, b) => {
  const sortDiff = Number(a.sort || 0) - Number(b.sort || 0)
  if (sortDiff) return sortDiff
  const updatedDiff = new Date(String(b.updated_at || '')).getTime() - new Date(String(a.updated_at || '')).getTime()
  return (Number.isNaN(updatedDiff) ? 0 : updatedDiff) || Number(a.id || 0) - Number(b.id || 0)
}))
const categories = computed(() => {
  return (data.value?.categories || []).map((item: any) => ({
    value: String(item.id),
    slug: item.slug || `category-${item.id}`,
    name: String(item.name || item.category_name || item.slug || '').trim(),
    icon: String(item.icon || '').trim(),
  })).filter((item: any) => item.name)
})
const tagNames = computed(() => new Map(tags.value.map((tag) => [String(tag.id), normalizeTag(tag).name])))
const showBackToTop = ref(false)
const heroImage = '/images/ui/hero-desk.webp'
const hasHeroCopy = computed(() => [
  settings.value.blog_hero_kicker,
  settings.value.blog_hero_title,
  settings.value.blog_hero_title_emphasis,
  settings.value.blog_hero_description,
  settings.value.blog_hero_description_extra,
  settings.value.blog_hero_primary_text,
  settings.value.blog_hero_secondary_text,
].some((value) => String(value || '').trim()))
const heroKicker = computed(() => String(settings.value.blog_hero_kicker || '').trim())
const heroTitle = computed(() => String(settings.value.blog_hero_title || '').trim())
const heroTitleEmphasis = computed(() => String(settings.value.blog_hero_title_emphasis || '').trim())
const heroDescription = computed(() => String(settings.value.blog_hero_description || '').trim())
const heroDescriptionExtra = computed(() => String(settings.value.blog_hero_description_extra || '').trim())
const heroPrimaryText = computed(() => String(settings.value.blog_hero_primary_text || '').trim())
const heroSecondaryText = computed(() => String(settings.value.blog_hero_secondary_text || '').trim())
const profileImage = computed(() => String(settings.value.blog_logo || '').trim())
const profileName = computed(() => String(settings.value.blog_name || '').trim())
const profileJob = computed(() => String(settings.value.blog_about_job || '').trim())
const profileTags = computed(() => {
  const raw = settings.value.blog_profile_tags
  if (Array.isArray(raw)) return raw.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12)
  const text = String(raw || '').trim()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 12)
  } catch {}
  return text.split(/[,，、\n|]+/).map((tag) => tag.trim()).filter(Boolean).slice(0, 12)
})
const profileDescription = computed(() => String(settings.value.blog_description || '').trim())
const profileEmail = computed(() => String(settings.value.blog_connect_email || '').trim())
const socialLinks = computed(() => settings.value.blog_connect_github ? [{ label: 'GitHub', href: String(settings.value.blog_connect_github), icon: '/images/ui/handmade/social-github.svg' }] : [])
const hasProfileData = computed(() => Boolean(profileImage.value || profileName.value || profileJob.value || profileDescription.value || profileTags.value.length || socialLinks.value.length || profileEmail.value))

function categoryName(value?: string | number) { return categories.value.find((category) => String(category.value) === String(value) || category.slug === value)?.name || '' }
function projectStatus(project: any) { return String(project?.projectStatus || project?.project_status || '').trim() }
function articlePath(article: any) { return article?.id ? `/posts/${article.id}` : '/articles' }
function articleImage(article: any) { return failedArticleImages.value[String(article?.id)] ? '' : resolveArticleImage(article) }
function onArticleImageError(event: Event, article: any) { const image = event.currentTarget as HTMLImageElement; image.onerror = null; failedArticleImages.value = { ...failedArticleImages.value, [String(article?.id)]: true } }
function articleTags(article: any) { return (article?.article_tags || []).map((tag: string) => tagNames.value.get(String(tag)) || (/^\d+$/.test(String(tag)) ? '' : String(tag))).filter(Boolean).slice(0, 3) }
function categoryCount(category: string) { return articles.value.filter((article) => categoryName(article.category) === categoryName(category)).length }
function backToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

const siteName = computed(() => String(settings.value.blog_name || '').trim())
const siteDescription = computed(() => String(settings.value.blog_description || '').trim())
useBlogSeo({ title: siteName, description: siteDescription, image: () => settings.value.blog_logo })
if (error.value) console.warn('home data unavailable', error.value)
onMounted(() => window.addEventListener('scroll', () => { showBackToTop.value = window.scrollY > 420 }, { passive: true }))
</script>
