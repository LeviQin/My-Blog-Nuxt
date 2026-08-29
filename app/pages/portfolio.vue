<template>
  <div class="container page-section">
    <SectionHeading eyebrow="things I have grown" :level="1">作品集</SectionHeading>
    <p class="page-lead">一些正在进行和曾经参与过的项目。</p>
    <div class="filter-row"><button v-for="category in categories" :key="category" class="filter-button" :class="{ active: active === category }" type="button" @click="active = category">{{ category }}</button></div>
    <section v-if="featuredProjects.length" class="portfolio-featured" aria-labelledby="featured-projects-title">
      <div class="portfolio-featured-heading"><div><p class="card-kicker">selected work</p><h2 id="featured-projects-title">重点项目</h2></div><span>{{ featuredProjects.length }} 个精选项目</span></div>
      <div class="portfolio-featured-grid">
        <article v-for="project in featuredProjects" :key="project.id" class="portfolio-featured-card">
          <div><span>{{ project.category }}</span><span v-if="project.projectStatus || project.project_status">{{ project.projectStatus || project.project_status }}</span></div>
          <h3>{{ project.name }}</h3>
          <p v-if="project.description || project.desc">{{ project.description || project.desc }}</p>
          <div class="project-tags"><span v-for="tag in project.tags.slice(0, 5)" :key="tag" class="tag">{{ tag }}</span></div>
          <a v-if="project.link" :href="project.link" target="_blank" rel="noreferrer">查看项目 <UiIcon name="arrow-right" /></a>
        </article>
      </div>
    </section>
    <div v-if="archiveProjects.length" class="portfolio-grid">
      <article v-for="(project, index) in archiveProjects" :key="project.id" class="project-card project-card--archive">
        <div class="project-card-top"><span class="project-number">{{ projectNumber(index) }}</span><span class="project-category">{{ project.category }}</span><span v-if="project.isFeatured" class="project-featured">精选</span></div>
        <div class="project-card-content"><h2>{{ project.name }}</h2><p v-if="project.description || project.desc">{{ project.description || project.desc }}</p><div v-if="project.tags.length" class="project-tags"><span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span></div></div>
        <div class="project-card-footer"><span v-if="project.category">{{ project.category }}</span><a v-if="project.link" :href="project.link" target="_blank" rel="noreferrer">查看项目 <UiIcon name="arrow-right" /></a></div>
      </article>
    </div>
    <EmptyState v-else-if="!featuredProjects.length" title="作品还在整理中" />
  </div>
</template>

<script setup lang="ts">
import type { BlogProject } from '~/types/api'
const api = useBlogApi()
const { data } = await useAsyncData('portfolio', () => api.projects(), { default: () => [] })
const projects = computed(() => (data.value || []) as BlogProject[])
const active = ref('全部')
const categories = computed(() => ['全部', ...new Set(projects.value.map((project) => project.category).filter(Boolean))])
const filtered = computed(() => active.value === '全部' ? projects.value : projects.value.filter((project) => project.category === active.value))
const featuredProjects = computed(() => filtered.value.filter((project) => Boolean(project.isFeatured)).slice(0, 3))
const featuredIds = computed(() => new Set(featuredProjects.value.map((project) => project.id)))
const archiveProjects = computed(() => filtered.value.filter((project) => !featuredIds.value.has(project.id)))
function projectNumber(index: number) { return String(index + 1).padStart(2, '0') }
useBlogSeo({ title: '作品集', description: '浏览 Levi 的项目作品。' })
</script>
