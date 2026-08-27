<template>
  <Teleport to="body">
    <Transition name="image-lightbox">
      <div
        v-if="open && src"
        class="image-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="dialogLabel"
        @click.self="close"
      >
        <button
          ref="closeButton"
          class="image-lightbox-close"
          type="button"
          aria-label="关闭大图预览"
          @click="close"
        >×</button>
        <figure class="image-lightbox-figure">
          <img :src="src" :alt="alt" class="image-lightbox-image" />
        </figure>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  src: string
  alt: string
  dialogLabel: string
}>()

const emit = defineEmits<{ close: [] }>()
const closeButton = ref<HTMLButtonElement>()

function close() {
  emit('close')
}
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) close()
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
