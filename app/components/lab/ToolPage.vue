<template>
  <div class="container lab-tool-page">
    <nav class="lab-breadcrumbs" aria-label="面包屑"><NuxtLink to="/lab">手账实验室</NuxtLink><span aria-hidden="true">/</span><span>{{ meta.name }}</span></nav>
    <header class="lab-tool-hero">
      <div><p class="card-kicker">LEVI LAB · {{ meta.category.toUpperCase() }}</p><h1>{{ meta.name }}</h1><p>{{ meta.description }}</p><LabProcessingBadge :processing="meta.processing" /></div>
      <span class="lab-tool-hero-icon" :class="'is-' + meta.id" :style="labToolIconStyle(meta.icon)" role="img" :aria-label="meta.name"></span>
    </header>
    <slot />
    <section class="lab-info-grid" aria-label="工具说明">
      <article class="lab-info-card"><p class="card-kicker">HOW IT WORKS</p><h2>三步完成</h2><ol><li>{{ meta.processing === 'online' ? '输入要查询的城市或 IP。' : meta.id === 'dev' ? '选择一个便签功能并输入文本。' : '选择或拖入需要处理的内容。' }}</li><li>{{ meta.processing === 'online' ? '发送必要的查询请求。' : '调整参数并生成预览。' }}</li><li>复制、下载或继续使用可以带走的结果。</li></ol></article>
      <article class="lab-info-card"><p class="card-kicker">PRIVACY NOTE</p><h2>{{ meta.processing === 'online' ? '需要联网查询' : '数据留在这张纸上' }}</h2><p>{{ meta.processing === 'online' ? '只有完成查询所需的城市名称或 IP 会发送到博客后端。第三方 Key 保留在服务端，不保存查询历史。' : '输入只在当前浏览器中读取、计算和导出，不会上传，也不会写入 localStorage。关闭或刷新页面后，当前内容会被清除。' }}</p></article>
      <article class="lab-info-card"><p class="card-kicker">FAQ</p><h2>小小提醒</h2><p>{{ meta.id === 'image' ? '支持 JPG、PNG 和 WebP，单文件建议不超过 30 MB。' : meta.id === 'cover' ? '封面模板、尺寸和照片均在本地 Canvas 中生成。' : meta.id === 'color' ? '透明像素不会参与主色统计，结果可复制为 CSS 或 JSON。' : meta.id === 'weather' ? '天气结果来自第三方公开服务，页面会显示数据时间和来源。' : meta.id === 'ip' ? 'IP 归属是粗略位置，不等同于 GPS，也不代表真实居住地。' : meta.id === 'qr' ? '二维码只编码你确认的内容，不会访问或验证 URL。' : '便签输入不执行、不保存，单次默认最多处理 200,000 个字符。' }}</p></article>
    </section>
    <div class="lab-related-tools"><span>继续在实验室里走走</span><NuxtLink v-for="tool in relatedTools" :key="tool.id" :to="tool.path">{{ tool.shortName }}</NuxtLink></div>
  </div>
</template>

<script setup lang="ts">
import type { LabToolMeta } from '~/data/lab-tools'
import { labTools } from '~/data/lab-tools'
const props = defineProps<{ meta: LabToolMeta }>()
function labToolIconStyle(icon: string) {
  return icon.startsWith('/') ? { backgroundImage: `url(${icon})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundColor: 'transparent' } : undefined
}
const relatedTools = computed(() => labTools.filter((tool) => tool.id !== props.meta.id && tool.path.startsWith('/lab/')).slice(0, 3))
</script>
