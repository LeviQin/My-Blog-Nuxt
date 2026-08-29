<template><div ref="root" class="markdown-body" v-html="html" @click="handleClick" /></template>

<script setup lang="ts">
import { renderMarkdown } from '~/utils/markdown'

type ArticleImage = { src: string; alt: string }

const props = defineProps<{ source?: string; enableImagePreview?: boolean }>()
const emit = defineEmits<{
  'image-click': [payload: { image: ArticleImage; images: ArticleImage[]; index: number }]
}>()
const root = ref<HTMLElement>()
const html = computed(() => renderMarkdown(props.source || ''))
let highlighterPromise: Promise<typeof import('~/utils/highlighter.client')> | undefined

async function enhanceCodeBlocks() {
  if (!import.meta.client || !root.value) return
  const codeBlocks = Array.from(root.value.querySelectorAll<HTMLElement>('[data-code-block]'))
  if (!codeBlocks.length) return

  try {
    const highlighterModule = await (highlighterPromise ||= import('~/utils/highlighter.client'))
    const highlighter = highlighterModule.default
    if (!root.value) return

    codeBlocks.forEach((block) => {
      const code = block.querySelector<HTMLElement>('pre code')
      if (!code || code.dataset.highlighted === 'true') return
      const source = code.textContent || ''
      const language = code.dataset.codeLanguage || 'text'
      let highlighted: { value: string; language?: string }

      try {
        highlighted = language !== 'text' && highlighter.getLanguage(language)
          ? highlighter.highlight(source, { language })
          : highlighter.highlightAuto(source)
        code.innerHTML = highlighted.value
        code.dataset.highlighted = 'true'
      } catch { }
    })
  } catch { }
}

function getImages(): ArticleImage[] {
  return Array.from(root.value?.querySelectorAll<HTMLImageElement>('img') || [])
    .map((image) => ({
      src: image.currentSrc || image.src,
      alt: image.alt || '文章图片',
    }))
    .filter((image) => image.src)
}

async function handleClick(event: MouseEvent) {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-code-action]')
  if (target && root.value?.contains(target)) {
    const block = target.closest<HTMLElement>('[data-code-block]')
    if (!block) return

    if (target.dataset.codeAction === 'toggle') {
      const collapsed = block.classList.toggle('is-collapsed')
      target.textContent = collapsed ? '展开' : '折叠'
      target.setAttribute('aria-expanded', String(!collapsed))
      return
    }

    if (target.dataset.codeAction !== 'copy') return
    const code = block.querySelector('pre code')?.textContent || ''
    try {
      await copyText(code)
      target.textContent = '已复制'
    } catch {
      target.textContent = '复制失败'
    }
    window.setTimeout(() => { target.textContent = '复制' }, 1600)
    return
  }

  if (!props.enableImagePreview) return
  const image = (event.target as HTMLElement).closest<HTMLImageElement>('img')
  if (!image || !root.value?.contains(image)) return
  event.preventDefault()
  const src = image.currentSrc || image.src
  if (src) {
    const images = getImages()
    const index = images.findIndex((item) => item.src === src)
    emit('image-click', {
      image: { src, alt: image.alt || '文章图片' },
      images,
      index: index >= 0 ? index : 0,
    })
  }
}

defineExpose({ getImages })

onMounted(() => { void enhanceCodeBlocks() })
watch(html, () => { nextTick(() => { void enhanceCodeBlocks() }) })

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('copy failed')
}
</script>
