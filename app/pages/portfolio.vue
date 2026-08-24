<template>
  <div class="container page-section">
    <SectionHeading eyebrow="things I have grown" :level="1">作品集</SectionHeading>
    <p class="page-lead">一些正在进行和曾经参与过的项目。</p>
    <div class="filter-row"><button v-for="category in categories" :key="category" class="filter-button" :class="{ active: active === category }" type="button" @click="active = category">{{ category }}</button></div>
    <div v-if="filtered.length" class="portfolio-grid">
      <article v-for="(project, index) in filtered" :key="project.id" class="project-card project-card--archive" :class="{ 'is-featured': project.isFeatured }">
        <div class="project-card-top"><span class="project-number">{{ projectNumber(index) }}</span><span class="project-category">{{ project.category }}</span><span v-if="project.isFeatured" class="project-featured">精选</span></div>
        <div class="project-card-content"><h2>{{ project.name }}</h2><p v-if="project.description || project.desc">{{ project.description || project.desc }}</p><div v-if="project.tags.length" class="project-tags"><span v-for="tag in project.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span></div></div>
        <div class="project-card-footer"><span v-if="project.category">{{ project.category }}</span><a v-if="project.link" :href="project.link" target="_blank" rel="noreferrer">查看项目 <span aria-hidden="true">→</span></a></div>
      </article>
    </div>
    <EmptyState v-else title="作品还在整理中" />
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
function projectNumber(index: number) { return String(index + 1).padStart(2, '0') }
useBlogSeo({ title: '作品集', description: '浏览 Levi 的项目作品。' })
</script>
