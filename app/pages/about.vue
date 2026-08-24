<template>
  <div class="container page-section about-page">
    <section v-if="hasAboutIntro" class="about-intro paper-card" :class="{ 'has-background': settings.blog_about_bg_img }" :style="backgroundStyle(settings.blog_about_bg_img)">
      <div>
        <p class="eyebrow">a little about me</p>
        <h1 v-if="settings.blog_about_title">{{ settings.blog_about_title }}</h1>
        <p v-if="settings.blog_about_job" class="page-lead">{{ settings.blog_about_job }}</p>
      </div>
      <div v-if="settings.blog_logo" class="about-profile-avatar"><img :src="settings.blog_logo" alt="博客头像" width="120" height="120" decoding="async"></div>
    </section>

    <section v-if="hasAbility" class="about-ability paper-card" :class="{ 'has-background': settings.blog_ability_bg_img }" :style="backgroundStyle(settings.blog_ability_bg_img)">
      <SectionHeading v-if="settings.blog_ability_title" :eyebrow="settings.blog_ability_title" :level="2">{{ settings.blog_ability_title }}</SectionHeading>
      <div class="about-ability-list"><p v-for="item in abilityItems" :key="item">{{ item }}</p></div>
    </section>

    <section class="about-work">
      <SectionHeading v-if="settings.blog_work_title" :eyebrow="settings.blog_work_title" :level="2">{{ settings.blog_work_title }}</SectionHeading>
      <div v-if="featuredProjects.length" class="about-project-grid">
        <article v-for="(project, index) in featuredProjects" :key="project.id" class="project-card project-card--archive about-project" :class="{ 'is-featured': project.isFeatured }">
          <div class="project-card-top"><span class="project-number">{{ projectNumber(index) }}</span><span class="project-category">{{ project.category }}</span><span class="project-featured">精选</span></div>
          <div class="project-card-content"><h3>{{ project.name }}</h3><p v-if="project.description || project.desc">{{ project.description || project.desc }}</p><div v-if="project.tags.length" class="project-tags"><span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span></div></div>
          <div class="project-card-footer"><span v-if="project.category">{{ project.category }}</span><a v-if="project.link" :href="project.link" target="_blank" rel="noreferrer">查看项目 <span aria-hidden="true">→</span></a></div>
        </article>
      </div>
      <EmptyState v-else title="精选作品还在整理中" />
      <NuxtLink class="button ghost about-more-projects" to="/portfolio">查看更多作品 →</NuxtLink>
    </section>

    <section v-if="hasContactSection" class="about-contact paper-card" :class="{ 'has-background': settings.blog_connect_bg_img }" :style="backgroundStyle(settings.blog_connect_bg_img)">
      <div><p class="eyebrow">say hello</p><h2 v-if="settings.blog_connect_title">{{ settings.blog_connect_title }}</h2><div class="contact-list">
        <a v-if="settings.blog_connect_email" :href="`mailto:${settings.blog_connect_email}`">邮箱：{{ settings.blog_connect_email }}</a><span v-if="settings.blog_connect_wx">微信：{{ settings.blog_connect_wx }}</span><span v-if="settings.blog_connect_qq">QQ：{{ settings.blog_connect_qq }}</span><a v-if="settings.blog_connect_github" :href="String(settings.blog_connect_github)" target="_blank" rel="noreferrer">GitHub →</a><NuxtLink v-if="!hasContact" to="/guestbook">通过联系表单联系我 →</NuxtLink>
      </div></div>
      <img v-if="settings.blog_connect_wx_image" class="contact-qr" :src="settings.blog_connect_wx_image" alt="微信二维码" width="150" height="150" loading="lazy" decoding="async">
    </section>
  </div>
</template>

<script setup lang="ts">
import type { BlogProject, SiteSetting } from '~/types/api'
const api = useBlogApi()
const { data } = await useAsyncData('about', async () => {
  const results = await Promise.allSettled([api.settings(), api.projects()])
  return { settings: results[0].status === 'fulfilled' ? results[0].value : {}, projects: results[1].status === 'fulfilled' ? results[1].value : [] }
}, { default: () => ({ settings: {}, projects: [] }) })
const settings = computed<SiteSetting>(() => Array.isArray(data.value?.settings) ? data.value.settings[0] || {} : data.value?.settings || {})
const projects = computed(() => (data.value?.projects || []) as BlogProject[])
const featuredProjects = computed(() => projects.value.filter((project) => project.isFeatured === true || project.isFeatured === 1))
function projectNumber(index: number) { return String(index + 1).padStart(2, '0') }
const hasAboutIntro = computed(() => Boolean(settings.value.blog_about_title || settings.value.blog_about_job || settings.value.blog_logo || settings.value.blog_about_bg_img))
const abilityItems = computed(() => String(settings.value.blog_ability_description || '').split(/<\/p>\s*<p[^>]*>/i).map((item) => item.replace(/<[^>]*>/g, '').trim()).filter(Boolean))
const hasAbility = computed(() => Boolean(settings.value.blog_ability_title || settings.value.blog_ability_description || settings.value.blog_ability_bg_img))
const hasContact = computed(() => Boolean(settings.value.blog_connect_email || settings.value.blog_connect_wx || settings.value.blog_connect_qq || settings.value.blog_connect_github))
const hasContactSection = computed(() => Boolean(settings.value.blog_connect_title || hasContact.value || settings.value.blog_connect_wx_image || settings.value.blog_connect_bg_img))
const { theme } = useTheme()
function backgroundStyle(image?: string) {
  if (!image) return {}
  const overlay = theme.value === 'dark' ? 'rgba(29, 41, 34, .88)' : 'rgba(255, 253, 247, .92)'
  return { backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${JSON.stringify(image)})` }
}
useBlogSeo({ title: '关于我', description: '了解 Levi 的技术方向与联系方式。', image: () => settings.value.blog_logo })
</script>
