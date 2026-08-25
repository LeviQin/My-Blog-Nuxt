<template>
  <LabToolPage :meta="meta">
    <section class="lab-workspace cover-workspace" aria-labelledby="cover-workspace-title">
      <div class="lab-panel cover-controls-panel">
        <div class="lab-panel-heading"><div><p class="card-kicker">01 · COMPOSE</p><h2 id="cover-workspace-title">先选一张纸</h2></div><span class="lab-step">Canvas</span></div>
        <fieldset class="lab-setting-group"><legend>模板</legend><div class="cover-template-grid"><button v-for="template in templates" :key="template.id" type="button" class="cover-template" :class="{ active: cover.template === template.id }" @click="cover.template = template.id"><span :style="{ background: 'linear-gradient(135deg, ' + template.paper + ', ' + template.accent + ')' }"></span>{{ template.name }}</button></div></fieldset>
        <div class="lab-setting-group"><div class="lab-setting-heading"><label for="cover-title">主标题</label><output>{{ cover.title.length }}/40</output></div><input id="cover-title" v-model="cover.title" class="lab-input" maxlength="40"><label for="cover-subtitle">副标题</label><textarea id="cover-subtitle" v-model="cover.subtitle" class="lab-textarea" maxlength="80" rows="2"></textarea><div class="lab-number-grid"><label><span>分类</span><input v-model="cover.category" maxlength="12"></label><label><span>标签</span><input v-model="cover.tags" maxlength="36"></label></div></div>
        <details class="lab-setting-group lab-disclosure"><summary class="lab-setting-heading"><strong>输出尺寸</strong><small>{{ cover.width }} × {{ cover.height }}px</small></summary><select v-model="cover.size" class="lab-select" aria-label="封面输出尺寸"><option v-for="size in sizes" :key="size.id" :value="size.id">{{ size.label }}</option></select><div v-if="cover.size === 'custom'" class="lab-number-grid"><label><span>宽度</span><input v-model.number="cover.width" type="number" min="320" max="4096"></label><label><span>高度</span><input v-model.number="cover.height" type="number" min="320" max="4096"></label></div></details>
        <details class="lab-setting-group lab-disclosure"><summary class="lab-setting-heading"><strong>封面信息</strong><small>默认可直接使用</small></summary><label class="lab-check"><input v-model="cover.showDate" type="checkbox"><span>显示日期</span></label><label class="lab-check"><input v-model="cover.showBrand" type="checkbox"><span>显示 LEVI BLOG 小标</span></label><label for="cover-author">署名</label><input id="cover-author" v-model="cover.author" class="lab-input" maxlength="24"></details>
        <details class="lab-setting-group lab-disclosure"><summary class="lab-setting-heading"><strong>背景照片</strong><small>可选 · 只在本地读取</small></summary><input ref="backgroundInput" type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" @change="handleBackground"><button class="lab-button is-secondary lab-full-button" type="button" @click="backgroundInput?.click()">{{ backgroundUrl ? '替换背景照片' : '添加本地背景照片' }}</button><div v-if="backgroundUrl" class="lab-number-grid"><label><span>亮度 {{ cover.brightness }}%</span><input v-model.number="cover.brightness" type="range" min="40" max="140"></label><label><span>遮罩 {{ cover.overlay }}%</span><input v-model.number="cover.overlay" type="range" min="0" max="80"></label></div><button v-if="backgroundUrl" class="lab-text-button" type="button" @click="clearBackground">移除背景照片</button></details>
        <div class="lab-primary-actions"><button class="lab-button is-primary lab-full-button" type="button" @click="exportCover('png')">下载 PNG 封面</button><button class="lab-button is-secondary lab-full-button" type="button" @click="exportCover('jpeg')">下载 JPEG 封面</button></div>
        <p v-if="exportMessage" class="lab-message" :class="exportMessage.includes('失败') ? 'is-error' : 'is-success'" aria-live="polite">{{ exportMessage }}</p>
      </div>
      <div class="lab-panel cover-preview-panel"><div class="lab-panel-heading"><div><p class="card-kicker">02 · PREVIEW</p><h2>实时预览</h2></div><span class="lab-status">{{ cover.width }}×{{ cover.height }}</span></div><div class="cover-canvas-wrap"><canvas ref="previewCanvas" :width="cover.width" :height="cover.height" aria-label="手账封面预览"></canvas></div><p class="lab-privacy-line">封面内容与背景照片只在当前浏览器中处理。</p></div>
    </section>
  </LabToolPage>
</template>

<script setup lang="ts">
import { cleanFileName } from '~/utils/lab'
import { labTools } from '~/data/lab-tools'
const meta = labTools.find((tool) => tool.id === 'cover')!
const templates = [{ id: 'cream', name: '奶油手账', paper: '#f6eddb', ink: '#3f4839', accent: '#d9a27b', sage: '#789177' }, { id: 'olive', name: '橄榄书房', paper: '#dfe4d1', ink: '#294336', accent: '#9b6e4e', sage: '#54715a' }, { id: 'night', name: '夜间墨纸', paper: '#1e302b', ink: '#edf0df', accent: '#d89b74', sage: '#9bb59b' }, { id: 'newspaper', name: '旧报纸', paper: '#e8dfcc', ink: '#4e4438', accent: '#9f6b4f', sage: '#7b8062' }]
const sizes = [{ id: 'blog', label: '博客封面 · 1600 × 900', width: 1600, height: 900 }, { id: 'share', label: '横向分享 · 1200 × 630', width: 1200, height: 630 }, { id: 'square', label: '方形卡片 · 1080 × 1080', width: 1080, height: 1080 }, { id: 'portrait', label: '竖向分享 · 1080 × 1440', width: 1080, height: 1440 }, { id: 'custom', label: '自定义尺寸', width: 1200, height: 800 }]
const cover = reactive({ template: 'cream', size: 'blog', width: 1600, height: 900, title: '把今天写成一页手账', subtitle: '给正在路上的想法，留一点可以回看的光。', category: '生活记录', tags: '手账 · Levi Lab', date: new Date().toLocaleDateString('zh-CN'), author: 'Levi Blog', showDate: true, showBrand: true, brightness: 100, overlay: 24 })
const previewCanvas = ref<HTMLCanvasElement>(); const backgroundInput = ref<HTMLInputElement>(); const backgroundUrl = ref(''); const backgroundImage = ref<HTMLImageElement | null>(null); const exportMessage = ref('')
watch(() => cover.size, (size) => { const preset = sizes.find((item) => item.id === size); if (preset && size !== 'custom') { cover.width = preset.width; cover.height = preset.height } })
watch(() => [cover.template, cover.width, cover.height, cover.title, cover.subtitle, cover.category, cover.tags, cover.date, cover.author, cover.showDate, cover.showBrand, cover.brightness, cover.overlay, backgroundUrl.value] as const, () => renderCover(), { deep: true })
function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) { const lines: string[] = []; let current = ''; for (const character of text || ' ') { const next = current + character; if (context.measureText(next).width > maxWidth && current) { lines.push(current); current = character } else current = next }; if (current) lines.push(current); return lines.slice(0, 3) }
function drawBackground(context: CanvasRenderingContext2D, template: typeof templates[number], width: number, height: number) { context.fillStyle = template.paper; context.fillRect(0, 0, width, height); if (backgroundImage.value) { const image = backgroundImage.value; const ratio = Math.max(width / image.width, height / image.height); const drawWidth = image.width * ratio; const drawHeight = image.height * ratio; const offsetX = (width - drawWidth) / 2; const offsetY = (height - drawHeight) / 2; context.save(); context.filter = 'brightness(' + cover.brightness + '%) blur(0.3px)'; context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight); context.restore(); context.fillStyle = 'rgba(28, 38, 30, ' + (cover.overlay / 100) + ')'; context.fillRect(0, 0, width, height) } }
function renderCover() {
  if (!previewCanvas.value) return
  const canvas = previewCanvas.value
  const context = canvas.getContext('2d')
  if (!context) return
  const template = templates.find((item) => item.id === cover.template) || templates[0]
  const width = cover.width
  const height = cover.height
  const safe = Math.min(width, height) * .09
  const contentSafe = safe + Math.min(width, height) * .055

  drawBackground(context, template, width, height)
  context.strokeStyle = template.accent + '80'
  context.lineWidth = Math.max(2, width / 500)
  context.strokeRect(safe, safe, width - safe * 2, height - safe * 2)
  context.fillStyle = template.sage
  context.globalAlpha = .9
  context.fillRect(contentSafe, contentSafe, Math.min(width * .24, 280), Math.max(10, width / 130))
  context.globalAlpha = 1
  context.fillStyle = template.ink
  const categoryFontSize = Math.max(18, width / 52)
  const categoryBaseline = contentSafe + Math.max(50, width / 17)
  context.font = '600 ' + categoryFontSize + 'px Inter, sans-serif'
  context.fillText(cover.category.toUpperCase(), contentSafe, categoryBaseline)

  const titleBottomBoundary = height - contentSafe - Math.max(170, height * .22)
  let titleSize = Math.max(32, Math.min(width / 10, height / 5.7))
  let titleLines: string[] = []
  let titleLineHeight = titleSize * 1.2
  let titleTopBoundary = categoryBaseline + Math.max(48, titleSize * .95 + 18)
  for (let attempt = 0; attempt < 6; attempt++) {
    context.font = '600 ' + titleSize + 'px MaoKen, Georgia, serif'
    titleLines = wrapText(context, cover.title, width - contentSafe * 2)
    titleLineHeight = titleSize * 1.2
    titleTopBoundary = categoryBaseline + Math.max(48, titleSize * .95 + 18)
    const availableHeight = titleBottomBoundary - titleTopBoundary
    const requiredHeight = Math.max(0, titleLines.length - 1) * titleLineHeight + titleSize * .24
    if (requiredHeight <= availableHeight || titleSize <= 32) break
    titleSize = Math.max(32, titleSize * .86)
  }
  context.font = '600 ' + titleSize + 'px MaoKen, Georgia, serif'
  const desiredTitleTop = height * .39 - (titleLines.length - 1) * titleLineHeight / 2
  const titleMaxTop = titleBottomBoundary - Math.max(0, titleLines.length - 1) * titleLineHeight - titleSize * .24
  const titleTop = Math.max(titleTopBoundary, Math.min(desiredTitleTop, titleMaxTop))
  titleLines.forEach((line, index) => context.fillText(line, contentSafe, titleTop + index * titleLineHeight))

  context.font = Math.max(16, width / 55) + 'px Inter, sans-serif'
  context.globalAlpha = .82
  const subtitleTop = titleTop + titleLines.length * titleLineHeight + 20
  wrapText(context, cover.subtitle, width * .65).slice(0, 2).forEach((line, index) => context.fillText(line, contentSafe, subtitleTop + index * (width / 30)))
  context.globalAlpha = 1
  context.fillStyle = template.accent
  context.fillRect(contentSafe, height - contentSafe - Math.max(12, width / 90), Math.min(width * .19, 230), Math.max(8, width / 90))
  context.fillStyle = template.ink
  context.font = Math.max(14, width / 70) + 'px Inter, sans-serif'
  context.fillText(cover.tags, contentSafe, height - contentSafe - Math.max(28, width / 34))
  if (cover.showDate) {
    context.globalAlpha = .78
    context.fillText(cover.date, width - contentSafe - context.measureText(cover.date).width, contentSafe + Math.max(50, width / 17))
    context.globalAlpha = 1
  }
  if (cover.showBrand) {
    context.font = '600 ' + Math.max(12, width / 80) + 'px Inter, sans-serif'
    context.fillText(cover.author + '  ·  LEVI BLOG', contentSafe, height - contentSafe + Math.max(10, width / 45))
  }
}
function handleBackground(event: Event) { const candidate = (event.target as HTMLInputElement).files?.[0]; if (!candidate || !candidate.type.startsWith('image/')) return; const url = URL.createObjectURL(candidate); const image = new Image(); image.onload = () => { if (backgroundUrl.value) URL.revokeObjectURL(backgroundUrl.value); backgroundUrl.value = url; backgroundImage.value = image }; image.onerror = () => URL.revokeObjectURL(url); image.src = url; (event.target as HTMLInputElement).value = '' }
function clearBackground() { if (backgroundUrl.value) URL.revokeObjectURL(backgroundUrl.value); backgroundUrl.value = ''; backgroundImage.value = null }
async function exportCover(format: 'png' | 'jpeg') { if (!previewCanvas.value) return; exportMessage.value = '正在准备导出…'; try { if (document.fonts?.ready) await document.fonts.ready; renderCover(); const mime = format === 'png' ? 'image/png' : 'image/jpeg'; const blob = await new Promise<Blob>((resolve, reject) => previewCanvas.value!.toBlob((value) => value ? resolve(value) : reject(new Error('export')), mime, .9)); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = cleanFileName(cover.title, 'levi-cover') + '-levi-cover-' + cover.width + 'x' + cover.height + '.' + format; link.click(); window.setTimeout(() => URL.revokeObjectURL(link.href), 1000); exportMessage.value = '已导出 ' + cover.width + ' × ' + cover.height + 'px 的 ' + format.toUpperCase() + ' 封面。' } catch { exportMessage.value = '导出失败，请稍后再试。' } }
onMounted(() => renderCover())
onBeforeUnmount(() => { if (backgroundUrl.value) URL.revokeObjectURL(backgroundUrl.value) })
useBlogSeo({ title: '手账风文章封面生成器', description: '使用奶油手账、橄榄书房等模板生成博客封面和分享卡片，支持多种尺寸并在浏览器本地导出。', canonical: '/lab/cover', keywords: '文章封面生成器,手账封面,分享卡,Canvas', breadcrumbs: [{ name: '手账实验室', path: '/lab' }, { name: meta.name, path: meta.path }] })
</script>
