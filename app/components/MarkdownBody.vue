<template><div ref="root" class="markdown-body" v-html="html" @click="handleClick" /></template>

<script setup lang="ts">
import { renderMarkdown } from '~/utils/blog'

const props = defineProps<{ source?: string }>()
const root = ref<HTMLElement>()
const html = computed(() => renderMarkdown(props.source || ''))

async function handleClick(event: MouseEvent) {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-code-action]')
  if (!target || !root.value?.contains(target)) return
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
}

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
