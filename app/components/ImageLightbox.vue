<template>
  <Teleport to="body">
    <Transition name="image-lightbox">
      <div
        v-if="open && currentImage"
        class="image-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        @click.self="close"
      >
        <div class="image-lightbox-toolbar">
          <span v-if="images.length > 1" class="image-lightbox-counter" aria-live="polite">{{ index + 1 }} / {{ images.length }}</span>
          <button
            ref="closeButton"
            class="image-lightbox-close"
            type="button"
            aria-label="关闭大图预览"
            @click="close"
          >
            <svg class="image-lightbox-close-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6L18 18M18 6L6 18" />
            </svg>
          </button>
        </div>
        <button
          v-if="images.length > 1"
          class="image-lightbox-nav image-lightbox-previous"
          type="button"
          aria-label="上一张图片"
          :disabled="index === 0"
          @click.stop="showPrevious"
        >
          <svg class="image-lightbox-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M15 5L8 12L15 19" />
          </svg>
        </button>
        <div
          class="image-lightbox-viewport"
          @pointercancel="resetSwipe"
          @pointerdown="startSwipe"
          @pointerup="finishSwipe"
        >
          <figure class="image-lightbox-figure">
            <img
              :src="currentImage.src"
              :alt="currentImage.alt"
              class="image-lightbox-image"
              draggable="false"
              @dragstart.prevent
            />
          </figure>
        </div>
        <button
          v-if="images.length > 1"
          class="image-lightbox-nav image-lightbox-next"
          type="button"
          aria-label="下一张图片"
          :disabled="index === images.length - 1"
          @click.stop="showNext"
        >
          <svg class="image-lightbox-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M9 5L16 12L9 19" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  images: Array<{ src: string; alt: string }>
  index: number
  dialogLabel: string
}>()

const emit = defineEmits<{ close: []; change: [index: number] }>()
const closeButton = ref<HTMLButtonElement>()
const swipeStart = ref<{ x: number; y: number } | null>(null)
const currentImage = computed(() => props.images[props.index])

function close() {
  emit('close')
}
function showPrevious() {
  if (props.index > 0) emit('change', props.index - 1)
}
function showNext() {
  if (props.index < props.images.length - 1) emit('change', props.index + 1)
}
function startSwipe(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return
  swipeStart.value = { x: event.clientX, y: event.clientY }
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture?.(event.pointerId)
}
function resetSwipe() {
  swipeStart.value = null
}
function finishSwipe(event: PointerEvent) {
  const start = swipeStart.value
  resetSwipe()
  if (!start || props.images.length < 2) return
  const deltaX = event.clientX - start.x
  const deltaY = event.clientY - start.y
  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return
  if (deltaX < 0) showNext()
  else showPrevious()
}
function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return
  if (event.key === 'Escape') close()
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    showPrevious()
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    showNext()
  }
}

watch(() => props.open, (open) => {
  if (!import.meta.client) return
  document.body.classList.toggle('image-lightbox-open', open)
  if (open) nextTick(() => closeButton.value?.focus())
}, { immediate: true })

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (import.meta.client) document.body.classList.remove('image-lightbox-open')
})
</script>
