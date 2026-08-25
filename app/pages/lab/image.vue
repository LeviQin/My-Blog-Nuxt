<template>
  <LabToolPage :meta="meta">
    <section class="lab-workspace image-workspace" aria-labelledby="image-workspace-title">
      <div class="lab-panel lab-settings-panel">
        <div class="lab-panel-heading"><div><p class="card-kicker">01 · INPUT</p><h2 id="image-workspace-title">把图片放到这张纸上</h2></div><span class="lab-step">本地</span></div>
        <div ref="dropzone" class="lab-dropzone" :class="{ 'is-dragging': isDragging, 'has-file': file }" tabindex="0" :aria-describedby="errorMessage ? 'image-error' : undefined" @dragenter.prevent="isDragging = true" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @paste="handlePaste">
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="handleInputChange">
          <span class="lab-drop-icon is-image" role="img" aria-label="图片处理图标"></span><strong>{{ file ? file.name : isDragging ? '松开即可读取图片' : '把图片放到这张纸上' }}</strong><span>{{ file ? `${formatBytes(file.size)} · ${sourceWidth} × ${sourceHeight}px` : '拖放、点击选择，或粘贴剪贴板图片' }}</span>
          <button class="lab-button is-secondary" type="button" @click="fileInput?.click()">{{ file ? '重新选择图片' : '选择图片' }}</button>
          <small>支持 JPG、PNG、WebP · 单文件不超过 30 MB</small>
        </div>
        <p v-if="errorMessage" id="image-error" class="lab-message is-error" role="alert">{{ errorMessage }}</p>
        <div class="lab-setting-group lab-workflow-group">
          <div class="lab-setting-heading"><strong>快速方案</strong><small>一键组合常用设置</small></div>
          <div class="lab-workflow-grid">
            <button v-for="preset in workflowPresets" :key="preset.id" class="lab-workflow-card" :class="{ active: activeWorkflow === preset.id }" type="button" :disabled="!file || (preset.format === 'webp' && !webpSupported)" @click="applyWorkflowPreset(preset)">
              <strong>{{ preset.label }}</strong><small>{{ preset.description }}</small>
            </button>
          </div>
        </div>
        <div class="lab-setting-group"><div class="lab-setting-heading"><strong>输出格式</strong><small>保持原格式或转换</small></div><div class="lab-choice-grid"><label v-for="option in formatOptions" :key="option.value" class="lab-choice"><input v-model="outputFormat" type="radio" name="output-format" :value="option.value" :disabled="!file || (option.value === 'webp' && !webpSupported)"><span>{{ option.label }}</span></label></div></div>
        <div class="lab-setting-group"><div class="lab-setting-heading"><strong>图片质量</strong><output>{{ qualityEnabled ? `${quality}%` : '无损' }}</output></div><div class="lab-preset-row"><button v-for="preset in qualityPresets" :key="preset.label" type="button" class="lab-chip" :class="{ active: quality === preset.value }" :disabled="!file || !qualityEnabled" @click="quality = preset.value">{{ preset.label }}</button></div><input v-model.number="quality" class="lab-range" type="range" min="1" max="100" :disabled="!file || !qualityEnabled" aria-label="图片质量"><p class="lab-hint">{{ qualityEnabled ? '清晰度越高，文件通常越大；可先用均衡 80。' : 'PNG 采用无损输出，质量参数不参与编码。' }}</p></div>
        <details class="lab-setting-group lab-disclosure"><summary class="lab-setting-heading"><strong>输出尺寸</strong><small>{{ sizeMode === 'custom' ? '自定义宽高' : '适应范围，不裁剪' }}</small></summary><select v-model="sizeMode" class="lab-select" aria-label="输出尺寸模式"><option value="original">保持原尺寸</option><option value="max-width">最大宽度</option><option value="max-height">最大高度</option><option value="exact">精确宽高（适应范围）</option><option value="custom">自定义宽高</option></select><div class="lab-number-grid"><label><span>宽度</span><input v-model.number="targetWidth" type="number" min="1" max="4096" :disabled="sizeMode === 'original' || sizeMode === 'max-height'" @input="syncHeight"></label><label><span>高度</span><input v-model.number="targetHeight" type="number" min="1" max="4096" :disabled="sizeMode === 'original' || sizeMode === 'max-width'" @input="syncWidth"></label></div><label class="lab-check"><input v-model="lockRatio" type="checkbox"><span>锁定比例</span></label><p class="lab-hint">{{ sizeMode === 'custom' ? (lockRatio ? '锁定比例会自动调整另一边；解除后可输出非等比尺寸。' : '未锁定比例将按输入宽高拉伸图片。') : '自定义尺寸会等比适应范围；不会裁剪图片。' }}</p><div class="lab-preset-row"><button v-for="preset in sizePresets" :key="preset.label" type="button" class="lab-chip" @click="applySizePreset(preset)">{{ preset.label }}</button></div></details>
        <div v-if="outputMime === 'image/jpeg' && sourceHasAlpha" class="lab-setting-group"><div class="lab-setting-heading"><strong>透明背景</strong><small>JPEG 不支持透明</small></div><label class="lab-color-input"><span>填充颜色</span><input v-model="backgroundColor" type="color" aria-label="JPEG 透明背景填充颜色"></label></div>
        <div class="lab-output-summary"><div><span>当前输出</span><strong>{{ outputSummary }}</strong></div><button class="lab-text-button" type="button" :disabled="!file" @click="resetOptions">恢复默认</button></div>
        <button class="lab-button is-primary lab-full-button" type="button" :disabled="!file || state === 'processing'" @click="processImage">{{ state === 'processing' ? '正在生成结果…' : `生成 ${outputFormatLabel} 结果` }}</button>
        <p class="lab-privacy-line">图片在当前浏览器中完成解码与导出，不会上传。</p>
      </div>
      <div class="lab-panel lab-result-panel" aria-live="polite">
        <div class="lab-panel-heading"><div><p class="card-kicker">02 · RESULT</p><h2>前后对比</h2></div><span v-if="state === 'success'" class="lab-status is-success">已生成</span></div>
        <div v-if="!file" class="lab-empty-result"><span class="lab-empty-result-icon is-image" role="img" aria-label="图片处理图标"></span><h3>先选一张图片</h3><p>生成结果后，会在这里看到尺寸、体积和预览对比。</p></div>
        <template v-else>
          <div class="lab-image-preview" :class="{ 'is-processing': state === 'processing' }"><img :src="sourceUrl" alt="待处理图片预览"><span class="lab-preview-label is-source">原图</span><div v-if="resultUrl" class="lab-image-after" :style="{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }"><img :src="resultUrl" alt="处理后图片预览"></div><span v-if="resultUrl" class="lab-preview-label is-result">处理后</span><span v-if="resultUrl" class="lab-compare-handle" :style="{ left: `${comparePosition}%` }" aria-hidden="true"></span><div v-if="state === 'processing'" class="lab-preview-overlay">正在生成</div></div>
          <label v-if="resultUrl" class="lab-compare-control"><span>原图 / 结果</span><input v-model.number="comparePosition" type="range" min="5" max="95" aria-label="调整原图和结果预览比例"></label>
          <div class="lab-stats-grid"><div><span>原始图片</span><strong>{{ sourceWidth }} × {{ sourceHeight }}px</strong><small>{{ file.type }} · {{ formatBytes(file.size) }}</small></div><div><span>输出图片</span><strong>{{ outputWidth }} × {{ outputHeight }}px</strong><small>{{ outputMime }} · {{ resultFile ? formatBytes(resultFile.size) : '等待生成' }}</small></div></div>
          <p v-if="resultFile" class="lab-message" :class="sizeDelta >= 0 ? 'is-success' : 'is-warning'">{{ sizeDelta >= 0 ? `已经省下 ${formatBytes(sizeDelta)}（${sizeDeltaPercent}%）` : `当前设置使文件增加了 ${formatBytes(Math.abs(sizeDelta))}，可降低质量或保持原格式。` }}</p>
          <p v-if="resultFile" class="lab-output-file"><span>下载文件</span><strong>{{ resultFile.name }}</strong></p>
          <div class="lab-result-actions"><button class="lab-button is-primary" type="button" :disabled="!resultUrl" @click="downloadResult">下载 {{ mimeExtension(outputMime).toUpperCase() }}</button><button class="lab-button is-secondary" type="button" @click="resetImage">重新选择图片</button></div>
        </template>
      </div>
    </section>
  </LabToolPage>
</template>

<script setup lang="ts">
import pica from 'pica'
import { cleanFileName, containSize, formatBytes, isSupportedImage, mimeExtension } from '~/utils/lab'
import { labTools } from '~/data/lab-tools'
const meta = labTools.find((tool) => tool.id === 'image')!
type OutputFormat = 'same' | 'jpeg' | 'png' | 'webp'
type WorkflowPreset = { id: string; label: string; description: string; format: OutputFormat; quality: number; sizeMode: string; width: number; height: number }
const fileInput = ref<HTMLInputElement>()
const dropzone = ref<HTMLElement>()
const file = ref<File | null>(null); const sourceUrl = ref(''); const resultUrl = ref(''); const resultFile = ref<File | null>(null)
const sourceImage = ref<HTMLImageElement | null>(null); const sourceWidth = ref(0); const sourceHeight = ref(0); const sourceHasAlpha = ref(false)
const state = ref<'idle' | 'processing' | 'success' | 'error'>('idle'); const errorMessage = ref(''); const isDragging = ref(false); const comparePosition = ref(50)
const outputFormat = ref<OutputFormat>('same'); const quality = ref(80); const sizeMode = ref('original'); const targetWidth = ref(1280); const targetHeight = ref(720); const lockRatio = ref(true); const backgroundColor = ref('#F7F2E8'); const webpSupported = ref(true); const activeWorkflow = ref('')
const formatOptions = [{ value: 'same', label: '保持原格式' }, { value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }] as const
const qualityPresets = [{ label: '清晰 90', value: 90 }, { label: '均衡 80', value: 80 }, { label: '更小 65', value: 65 }]
const sizePresets = [{ label: '文章封面 1600×900', width: 1600, height: 900 }, { label: '正文 1280w', width: 1280, height: 0 }, { label: '社交方图 1080×1080', width: 1080, height: 1080 }]
const workflowPresets: WorkflowPreset[] = [
  { id: 'web', label: '网页分享', description: 'WebP · 1600w · 均衡', format: 'webp', quality: 80, sizeMode: 'max-width', width: 1600, height: 0 },
  { id: 'blog', label: '博客正文', description: 'WebP · 1280w · 均衡', format: 'webp', quality: 80, sizeMode: 'max-width', width: 1280, height: 0 },
  { id: 'clear', label: '保留清晰度', description: '原格式 · 原尺寸 · 清晰', format: 'same', quality: 90, sizeMode: 'original', width: 0, height: 0 },
]
const outputMime = computed(() => outputFormat.value === 'same' ? file.value?.type || 'image/jpeg' : `image/${outputFormat.value}`)
const outputSize = computed(() => containSize(sourceWidth.value, sourceHeight.value, sizeMode.value, { width: targetWidth.value, height: targetHeight.value }))
const outputWidth = computed(() => outputSize.value.width); const outputHeight = computed(() => outputSize.value.height)
const qualityEnabled = computed(() => outputMime.value !== 'image/png')
const outputFormatLabel = computed(() => formatOptions.find((option) => option.value === outputFormat.value)?.label || 'JPEG')
const outputSummary = computed(() => file.value ? `${outputFormatLabel.value} · ${outputWidth.value} × ${outputHeight.value}px · ${qualityEnabled.value ? `质量 ${quality.value}%` : '无损'}` : '选择图片后显示')
const sizeDelta = computed(() => resultFile.value ? file.value!.size - resultFile.value.size : 0); const sizeDeltaPercent = computed(() => file.value && resultFile.value ? Math.round(Math.abs(sizeDelta.value) / file.value.size * 100) : 0)
let readRequestId = 0
let previewTimer: ReturnType<typeof setTimeout> | undefined
let imageResizer: ReturnType<typeof pica> | undefined
function revoke(url: string) { if (url) URL.revokeObjectURL(url) }
function getImageResizer() { return imageResizer || (imageResizer = pica()) }
function setError(message: string) { errorMessage.value = message; state.value = 'error' }
function detectTransparency(image: HTMLImageElement) {
  try {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64
    const context = canvas.getContext('2d', { willReadFrequently: true }); if (!context) return false
    context.drawImage(image, 0, 0, 64, 64)
    const pixels = context.getImageData(0, 0, 64, 64).data
    for (let index = 3; index < pixels.length; index += 4) if (pixels[index] < 255) return true
  } catch { return false }
  return false
}
async function readFile(candidate: File) {
  errorMessage.value = ''; state.value = 'idle'
  if (!isSupportedImage(candidate)) return setError('图片格式暂不支持，请选择 JPG、PNG 或 WebP。')
  if (candidate.size > 30 * 1024 * 1024) return setError('图片超过 30 MB，请选择体积更小的图片。')
  const requestId = ++readRequestId; const url = URL.createObjectURL(candidate); const image = new Image()
  image.onload = () => { if (requestId !== readRequestId) return revoke(url); if (image.width * image.height > 50_000_000) { revoke(url); return setError('图片像素过大，建议先选择尺寸较小的图片。') }; revoke(sourceUrl.value); revoke(resultUrl.value); file.value = candidate; sourceUrl.value = url; resultUrl.value = ''; resultFile.value = null; sourceImage.value = image; sourceWidth.value = image.width; sourceHeight.value = image.height; sourceHasAlpha.value = candidate.type !== 'image/jpeg' && detectTransparency(image); targetWidth.value = image.width; targetHeight.value = image.height; outputFormat.value = 'same'; sizeMode.value = 'original'; activeWorkflow.value = '' }
  image.onerror = () => { revoke(url); setError('无法读取这张图片，请换一张再试。') }; image.src = url
}
function handleInputChange(event: Event) { const picked = (event.target as HTMLInputElement).files?.[0]; if (picked) readFile(picked); (event.target as HTMLInputElement).value = '' }
function handleDrop(event: DragEvent) { isDragging.value = false; const dropped = event.dataTransfer?.files?.[0]; if (dropped) readFile(dropped) }
function handlePaste(event: ClipboardEvent) { const pasted = [...(event.clipboardData?.items || [])].find((item) => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile(); if (pasted) { event.preventDefault(); readFile(pasted) } }
function syncHeight() { if (!lockRatio.value || !sourceWidth.value) return; targetHeight.value = Math.max(1, Math.round(Number(targetWidth.value) * sourceHeight.value / sourceWidth.value)) }
function syncWidth() { if (!lockRatio.value || !sourceHeight.value) return; targetWidth.value = Math.max(1, Math.round(Number(targetHeight.value) * sourceWidth.value / sourceHeight.value)) }
function applySizePreset(preset: { width: number; height: number }) { sizeMode.value = preset.height ? 'exact' : 'max-width'; targetWidth.value = preset.width; if (preset.height) targetHeight.value = preset.height; else syncHeight() }
function applyWorkflowPreset(preset: WorkflowPreset) { outputFormat.value = preset.format === 'webp' && !webpSupported.value ? 'same' : preset.format; quality.value = preset.quality; sizeMode.value = preset.sizeMode; lockRatio.value = true; activeWorkflow.value = preset.id; if (preset.width) { targetWidth.value = preset.width; if (preset.height) targetHeight.value = preset.height; else syncHeight() } else if (file.value) { targetWidth.value = sourceWidth.value; targetHeight.value = sourceHeight.value } }
function resetOptions() { outputFormat.value = 'same'; quality.value = 80; sizeMode.value = 'original'; lockRatio.value = true; backgroundColor.value = '#F7F2E8'; activeWorkflow.value = ''; if (file.value) { targetWidth.value = sourceWidth.value; targetHeight.value = sourceHeight.value } }
async function resizeToCanvas(source: HTMLImageElement, width: number, height: number) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
  const context = canvas.getContext('2d', { alpha: true }); if (!context) throw new Error('canvas unavailable')
  context.clearRect(0, 0, width, height)
  await getImageResizer().resize(source, canvas)
  return canvas
}
async function canvasBlob(canvas: HTMLCanvasElement, mime: string, qualityValue: number) { return getImageResizer().toBlob(canvas, mime, qualityValue / 100) }
function resultFileName() { if (!file.value) return ''; const suffix = sizeMode.value === 'original' ? 'levi-compressed' : sizeMode.value === 'max-width' ? `${outputWidth.value}w` : `${outputWidth.value}x${outputHeight.value}`; return `${cleanFileName(file.value.name)}-${suffix}.${mimeExtension(outputMime.value)}` }
async function processImage() {
  if (!file.value || !sourceImage.value || state.value === 'processing') return; state.value = 'processing'; errorMessage.value = ''; await nextTick()
  try { const resizedCanvas = await resizeToCanvas(sourceImage.value, outputWidth.value, outputHeight.value); let canvas = resizedCanvas; if (outputMime.value === 'image/jpeg' && sourceHasAlpha.value) { const flattenedCanvas = document.createElement('canvas'); flattenedCanvas.width = outputWidth.value; flattenedCanvas.height = outputHeight.value; const context = flattenedCanvas.getContext('2d')!; context.fillStyle = backgroundColor.value; context.fillRect(0, 0, flattenedCanvas.width, flattenedCanvas.height); context.drawImage(resizedCanvas, 0, 0); canvas = flattenedCanvas }; const blob = await canvasBlob(canvas, outputMime.value, quality.value); if (blob.type !== outputMime.value) throw new Error('format unsupported'); revoke(resultUrl.value); resultUrl.value = URL.createObjectURL(blob); resultFile.value = new File([blob], resultFileName(), { type: outputMime.value }); state.value = 'success' } catch { setError('浏览器暂时无法生成这个格式，请更换输出格式后重试。') }
}
watch([outputFormat, quality, sizeMode, targetWidth, targetHeight, backgroundColor], () => { activeWorkflow.value = ''; if (!file.value || state.value !== 'success') return; if (previewTimer) clearTimeout(previewTimer); previewTimer = setTimeout(() => processImage(), 420) })
function downloadResult() { if (!resultUrl.value || !resultFile.value) return; const link = document.createElement('a'); link.href = resultUrl.value; link.download = resultFile.value.name; link.click() }
function resetImage() { readRequestId += 1; if (previewTimer) clearTimeout(previewTimer); revoke(sourceUrl.value); revoke(resultUrl.value); file.value = null; sourceUrl.value = ''; resultUrl.value = ''; resultFile.value = null; sourceImage.value = null; sourceWidth.value = 0; sourceHeight.value = 0; sourceHasAlpha.value = false; state.value = 'idle'; errorMessage.value = ''; activeWorkflow.value = ''; resetOptions() }
onMounted(() => { const canvas = document.createElement('canvas'); const data = canvas.toDataURL('image/webp'); webpSupported.value = data.startsWith('data:image/webp'); dropzone.value?.focus({ preventScroll: true }); dropzone.value?.blur() })
onBeforeUnmount(() => { if (previewTimer) clearTimeout(previewTimer); revoke(sourceUrl.value); revoke(resultUrl.value) })
useBlogSeo({ title: '图片压缩与格式转换', description: '在浏览器本地压缩、缩放并转换 JPG、PNG 和 WebP 图片，不上传原图，可对比处理前后体积与尺寸。', canonical: '/lab/image', keywords: '图片压缩,图片格式转换,WebP,JPG,PNG', breadcrumbs: [{ name: '手账实验室', path: '/lab' }, { name: meta.name, path: meta.path }] })
</script>
