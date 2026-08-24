<template>
  <LabToolPage :meta="meta">
    <section class="lab-workspace image-workspace" aria-labelledby="image-workspace-title">
      <div class="lab-panel lab-settings-panel">
        <div class="lab-panel-heading"><div><p class="card-kicker">01 · INPUT</p><h2 id="image-workspace-title">把图片放到这张纸上</h2></div><span class="lab-step">本地</span></div>
        <div ref="dropzone" class="lab-dropzone" :class="{ 'is-dragging': isDragging, 'has-file': file }" tabindex="0" @dragenter.prevent="isDragging = true" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @paste="handlePaste">
          <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only" @change="handleInputChange">
          <span class="lab-drop-icon" aria-hidden="true">▧</span><strong>{{ file ? file.name : isDragging ? '松开即可读取图片' : '把图片放到这张纸上' }}</strong><span>{{ file ? `${formatBytes(file.size)} · ${sourceWidth} × ${sourceHeight}px` : '拖放、点击选择，或粘贴剪贴板图片' }}</span>
          <button class="lab-button is-secondary" type="button" @click="fileInput?.click()">{{ file ? '重新选择图片' : '选择图片' }}</button>
          <small>支持 JPG、PNG、WebP · 单文件不超过 30 MB</small>
        </div>
        <p v-if="errorMessage" id="image-error" class="lab-message is-error" role="alert">{{ errorMessage }}</p>
        <div class="lab-setting-group"><div class="lab-setting-heading"><strong>输出格式</strong><small>保持原格式或转换</small></div><div class="lab-choice-grid"><label v-for="option in formatOptions" :key="option.value" class="lab-choice"><input v-model="outputFormat" type="radio" name="output-format" :value="option.value" :disabled="!file || (option.value === 'webp' && !webpSupported)"><span>{{ option.label }}</span></label></div></div>
        <div class="lab-setting-group"><div class="lab-setting-heading"><strong>图片质量</strong><output>{{ quality }}%</output></div><div class="lab-preset-row"><button v-for="preset in qualityPresets" :key="preset.label" type="button" class="lab-chip" :class="{ active: quality === preset.value }" @click="quality = preset.value">{{ preset.label }}</button></div><input v-model.number="quality" class="lab-range" type="range" min="1" max="100" aria-label="图片质量"><p class="lab-hint">PNG 输出只调整尺寸，质量滑块不会伪装成无损压缩。</p></div>
        <div class="lab-setting-group"><div class="lab-setting-heading"><strong>输出尺寸</strong><small>适应范围，不裁剪</small></div><select v-model="sizeMode" class="lab-select" aria-label="输出尺寸模式"><option value="original">保持原尺寸</option><option value="max-width">最大宽度</option><option value="max-height">最大高度</option><option value="exact">精确宽高（适应范围）</option></select><div class="lab-number-grid"><label><span>宽度</span><input v-model.number="targetWidth" type="number" min="1" max="4096" :disabled="sizeMode === 'original'" @input="syncHeight"></label><label><span>高度</span><input v-model.number="targetHeight" type="number" min="1" max="4096" :disabled="sizeMode === 'original'" @input="syncWidth"></label></div><label class="lab-check"><input v-model="lockRatio" type="checkbox"><span>锁定比例</span></label><div class="lab-preset-row"><button v-for="preset in sizePresets" :key="preset.label" type="button" class="lab-chip" @click="applySizePreset(preset)">{{ preset.label }}</button></div></div>
        <div v-if="outputMime === 'image/jpeg' && sourceHasAlpha" class="lab-setting-group"><div class="lab-setting-heading"><strong>透明背景</strong><small>JPEG 不支持透明</small></div><label class="lab-color-input"><span>填充颜色</span><input v-model="backgroundColor" type="color" aria-label="JPEG 透明背景填充颜色"></label></div>
        <button class="lab-button is-primary lab-full-button" type="button" :disabled="!file || state === 'processing'" @click="processImage">{{ state === 'processing' ? '正在生成结果…' : '生成压缩结果' }}</button>
        <p class="lab-privacy-line"><span aria-hidden="true">⌁</span>图片在当前浏览器中完成解码与导出，不会上传。</p>
      </div>
      <div class="lab-panel lab-result-panel" aria-live="polite">
        <div class="lab-panel-heading"><div><p class="card-kicker">02 · RESULT</p><h2>前后对比</h2></div><span v-if="state === 'success'" class="lab-status is-success">已生成</span></div>
        <div v-if="!file" class="lab-empty-result"><span aria-hidden="true">✦</span><h3>先选一张图片</h3><p>生成结果后，会在这里看到尺寸、体积和预览对比。</p></div>
        <template v-else>
          <div class="lab-image-preview" :class="{ 'is-processing': state === 'processing' }"><img :src="sourceUrl" alt="待处理图片预览"><div v-if="resultUrl" class="lab-image-after" :style="{ width: `${comparePosition}%` }"><img :src="resultUrl" alt="处理后图片预览"></div><span v-if="resultUrl" class="lab-compare-handle" :style="{ left: `${comparePosition}%` }" aria-hidden="true"></span><div v-if="state === 'processing'" class="lab-preview-overlay">正在生成</div></div>
          <label v-if="resultUrl" class="lab-compare-control"><span>原图 / 结果</span><input v-model.number="comparePosition" type="range" min="5" max="95" aria-label="调整原图和结果预览比例"></label>
          <div class="lab-stats-grid"><div><span>原始图片</span><strong>{{ sourceWidth }} × {{ sourceHeight }}px</strong><small>{{ file.type }} · {{ formatBytes(file.size) }}</small></div><div><span>输出图片</span><strong>{{ outputWidth }} × {{ outputHeight }}px</strong><small>{{ outputMime }} · {{ resultFile ? formatBytes(resultFile.size) : '等待生成' }}</small></div></div>
          <p v-if="resultFile" class="lab-message" :class="sizeDelta >= 0 ? 'is-success' : 'is-warning'">{{ sizeDelta >= 0 ? `已经省下 ${formatBytes(sizeDelta)}（${sizeDeltaPercent}%）` : `当前设置使文件增加了 ${formatBytes(Math.abs(sizeDelta))}，可降低质量或保持原格式。` }}</p>
          <div class="lab-result-actions"><button class="lab-button is-primary" type="button" :disabled="!resultUrl" @click="downloadResult">下载 {{ mimeExtension(outputMime).toUpperCase() }}</button><button class="lab-button is-secondary" type="button" @click="resetImage">重新选择图片</button></div>
        </template>
      </div>
    </section>
  </LabToolPage>
</template>

<script setup lang="ts">
import { cleanFileName, containSize, formatBytes, isSupportedImage, mimeExtension } from '~/utils/lab'
import { labTools } from '~/data/lab-tools'
const meta = labTools.find((tool) => tool.id === 'image')!
const fileInput = ref<HTMLInputElement>()
const dropzone = ref<HTMLElement>()
const file = ref<File | null>(null); const sourceUrl = ref(''); const resultUrl = ref(''); const resultFile = ref<File | null>(null)
const sourceImage = ref<HTMLImageElement | null>(null); const sourceWidth = ref(0); const sourceHeight = ref(0); const sourceHasAlpha = ref(false)
const state = ref<'idle' | 'processing' | 'success' | 'error'>('idle'); const errorMessage = ref(''); const isDragging = ref(false); const comparePosition = ref(50)
const outputFormat = ref<'same' | 'jpeg' | 'png' | 'webp'>('same'); const quality = ref(80); const sizeMode = ref('original'); const targetWidth = ref(1280); const targetHeight = ref(720); const lockRatio = ref(true); const backgroundColor = ref('#F7F2E8'); const webpSupported = ref(true)
const formatOptions = [{ value: 'same', label: '保持原格式' }, { value: 'jpeg', label: 'JPEG' }, { value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }] as const
const qualityPresets = [{ label: '清晰 90', value: 90 }, { label: '均衡 80', value: 80 }, { label: '更小 65', value: 65 }]
const sizePresets = [{ label: '文章封面 1600×900', width: 1600, height: 900 }, { label: '正文 1280w', width: 1280, height: 0 }, { label: '社交方图 1080×1080', width: 1080, height: 1080 }]
const outputMime = computed(() => outputFormat.value === 'same' ? file.value?.type || 'image/jpeg' : `image/${outputFormat.value}`)
const outputSize = computed(() => containSize(sourceWidth.value, sourceHeight.value, sizeMode.value, { width: targetWidth.value, height: targetHeight.value }))
const outputWidth = computed(() => outputSize.value.width); const outputHeight = computed(() => outputSize.value.height)
const sizeDelta = computed(() => resultFile.value ? file.value!.size - resultFile.value.size : 0); const sizeDeltaPercent = computed(() => file.value && resultFile.value ? Math.max(0, Math.round(sizeDelta.value / file.value.size * 100)) : 0)
function revoke(url: string) { if (url) URL.revokeObjectURL(url) }
function setError(message: string) { errorMessage.value = message; state.value = 'error' }
async function readFile(candidate: File) {
  errorMessage.value = ''; state.value = 'idle'
  if (!isSupportedImage(candidate)) return setError('图片格式暂不支持，请选择 JPG、PNG 或 WebP。')
  if (candidate.size > 30 * 1024 * 1024) return setError('图片超过 30 MB，请选择体积更小的图片。')
  const url = URL.createObjectURL(candidate); const image = new Image()
  image.onload = () => { if (image.width * image.height > 50_000_000) { revoke(url); return setError('图片像素过大，建议先选择尺寸较小的图片。') }; revoke(sourceUrl.value); revoke(resultUrl.value); file.value = candidate; sourceUrl.value = url; resultUrl.value = ''; resultFile.value = null; sourceImage.value = image; sourceWidth.value = image.width; sourceHeight.value = image.height; sourceHasAlpha.value = candidate.type !== 'image/jpeg'; targetWidth.value = image.width; targetHeight.value = image.height; outputFormat.value = 'same' }
  image.onerror = () => { revoke(url); setError('无法读取这张图片，请换一张再试。') }; image.src = url
}
function handleInputChange(event: Event) { const picked = (event.target as HTMLInputElement).files?.[0]; if (picked) readFile(picked); (event.target as HTMLInputElement).value = '' }
function handleDrop(event: DragEvent) { isDragging.value = false; const dropped = event.dataTransfer?.files?.[0]; if (dropped) readFile(dropped) }
function handlePaste(event: ClipboardEvent) { const pasted = [...(event.clipboardData?.items || [])].find((item) => item.kind === 'file' && item.type.startsWith('image/'))?.getAsFile(); if (pasted) { event.preventDefault(); readFile(pasted) } }
function syncHeight() { if (!lockRatio.value || !sourceWidth.value) return; targetHeight.value = Math.max(1, Math.round(Number(targetWidth.value) * sourceHeight.value / sourceWidth.value)) }
function syncWidth() { if (!lockRatio.value || !sourceHeight.value) return; targetWidth.value = Math.max(1, Math.round(Number(targetHeight.value) * sourceWidth.value / sourceHeight.value)) }
function applySizePreset(preset: { width: number; height: number }) { sizeMode.value = preset.height ? 'exact' : 'max-width'; targetWidth.value = preset.width; if (preset.height) targetHeight.value = preset.height; else syncHeight() }
function canvasBlob(canvas: HTMLCanvasElement, mime: string, qualityValue: number) { return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('encode failed')), mime, qualityValue / 100)) }
async function processImage() {
  if (!file.value || !sourceImage.value) return; state.value = 'processing'; errorMessage.value = ''; await nextTick()
  try { const canvas = document.createElement('canvas'); canvas.width = outputWidth.value; canvas.height = outputHeight.value; const context = canvas.getContext('2d')!; if (outputMime.value === 'image/jpeg' && sourceHasAlpha.value) { context.fillStyle = backgroundColor.value; context.fillRect(0, 0, canvas.width, canvas.height) }; context.drawImage(sourceImage.value, 0, 0, canvas.width, canvas.height); const blob = await canvasBlob(canvas, outputMime.value, quality.value); if (blob.type !== outputMime.value) throw new Error('format unsupported'); revoke(resultUrl.value); resultUrl.value = URL.createObjectURL(blob); resultFile.value = new File([blob], `${cleanFileName(file.value.name)}-levi-compressed.${mimeExtension(outputMime.value)}`, { type: outputMime.value }); state.value = 'success' } catch { setError('浏览器暂时无法生成这个格式，请更换输出格式后重试。') }
}
function downloadResult() { if (!resultUrl.value || !resultFile.value) return; const link = document.createElement('a'); link.href = resultUrl.value; link.download = resultFile.value.name; link.click() }
function resetImage() { revoke(sourceUrl.value); revoke(resultUrl.value); file.value = null; sourceUrl.value = ''; resultUrl.value = ''; resultFile.value = null; sourceImage.value = null; state.value = 'idle'; errorMessage.value = '' }
onMounted(() => { const canvas = document.createElement('canvas'); const data = canvas.toDataURL('image/webp'); webpSupported.value = data.startsWith('data:image/webp'); dropzone.value?.focus({ preventScroll: true }); dropzone.value?.blur() })
onBeforeUnmount(() => { revoke(sourceUrl.value); revoke(resultUrl.value) })
useBlogSeo({ title: '图片压缩与格式转换', description: '在浏览器本地压缩、缩放并转换 JPG、PNG 和 WebP 图片，不上传原图，可对比处理前后体积与尺寸。', canonical: '/lab/image', keywords: '图片压缩,图片格式转换,WebP,JPG,PNG', breadcrumbs: [{ name: '手账实验室', path: '/lab' }, { name: meta.name, path: meta.path }] })
</script>
