<template>
  <div class="container lab-tool-page">
    <nav class="lab-breadcrumbs" aria-label="面包屑"><NuxtLink to="/lab">手账实验室</NuxtLink><span aria-hidden="true">/</span><span>{{ meta.name }}</span></nav>
    <header class="lab-tool-hero">
      <div><p class="card-kicker">LEVI LAB · {{ meta.category.toUpperCase() }}</p><h1>{{ meta.name }}</h1><p>{{ meta.description }}</p><LabProcessingBadge :processing="meta.processing" /></div>
      <span class="lab-tool-hero-icon" aria-hidden="true">{{ meta.icon }}</span>
    </header>
    <slot />
    <section class="lab-info-grid" aria-label="工具说明">
      <article class="lab-info-card"><p class="card-kicker">HOW IT WORKS</p><h2>三步完成</h2><ol><li>选择或拖入一张图片。</li><li>调整参数并生成预览。</li><li>复制或下载可以带走的结果。</li></ol></article>
      <article class="lab-info-card"><p class="card-kicker">PRIVACY NOTE</p><h2>数据留在这张纸上</h2><p>图片只在当前浏览器中读取、计算和导出，不会上传到 Levi Blog 服务器。关闭或刷新页面后，当前图片会被清除。</p></article>
      <article class="lab-info-card"><p class="card-kicker">FAQ</p><h2>小小提醒</h2><p>{{ meta.id === 'image' ? '支持 JPG、PNG 和 WebP，单文件建议不超过 30 MB。' : meta.id === 'cover' ? '封面模板、尺寸和照片均在本地 Canvas 中生成。' : '透明像素不会参与主色统计，结果可复制为 CSS 或 JSON。' }}</p></article>
    </section>
    <div class="lab-related-tools"><span>继续在实验室里走走</span><NuxtLink v-for="tool in relatedTools" :key="tool.id" :to="tool.path">{{ tool.shortName }} →</NuxtLink></div>
  </div>
</template>

<script setup lang="ts">
import type { LabToolMeta } from '~/data/lab-tools'
import { labTools } from '~/data/lab-tools'
const props = defineProps<{ meta: LabToolMeta }>()
const relatedTools = computed(() => labTools.filter((tool) => tool.id !== props.meta.id && ['image', 'cover', 'color'].includes(tool.id)).slice(0, 2))
</script>
