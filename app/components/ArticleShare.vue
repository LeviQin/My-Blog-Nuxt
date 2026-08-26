<template>
  <div ref="root" class="article-share">
    <button class="button ghost article-share-trigger" type="button" aria-haspopup="dialog" :aria-expanded="open" @click="toggleOpen">
      <img src="/images/ui/share/share.svg" alt="" width="24" height="24" decoding="async">
      <span>分享</span>
    </button>

    <Transition name="share-popover">
      <div v-if="open" class="article-share-popover" role="dialog" aria-label="分享文章">
        <div class="article-share-heading">
          <div>
            <span class="article-share-kicker">SHARE THIS NOTE</span>
            <strong>把这篇文章带走</strong>
          </div>
          <button class="article-share-close" type="button" aria-label="关闭分享菜单" @click="close">×</button>
        </div>

        <div class="article-share-options">
          <button class="article-share-option" type="button" @click="shareWithSystem">
            <img src="/images/ui/share/share.svg" alt="" width="32" height="32" decoding="async">
            <span>系统分享</span>
          </button>
          <button class="article-share-option" type="button" @click="copyLink">
            <img src="/images/ui/share/copy.svg" alt="" width="32" height="32" decoding="async">
            <span>复制链接</span>
          </button>
          <button class="article-share-option" type="button" @click="showQrCode">
            <img src="/images/ui/share/scan.svg" alt="" width="32" height="32" decoding="async">
            <span>扫码打开</span>
          </button>
        </div>

        <div v-if="qrDataUrl" class="article-share-qr">
          <img :src="qrDataUrl" alt="当前文章二维码" width="220" height="220" decoding="async">
          <span>用手机扫一扫，打开这篇文章</span>
        </div>
        <p v-if="statusMessage" class="article-share-status" role="status" aria-live="polite">{{ statusMessage }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import * as QRCode from 'qrcode'

const props = defineProps<{
  url: string
}>()

const open = ref(false)
const qrDataUrl = ref('')
const statusMessage = ref('')
const root = ref<HTMLElement>()
let statusTimer: ReturnType<typeof window.setTimeout> | undefined

function toggleOpen() {
  open.value = !open.value
  if (!open.value) qrDataUrl.value = ''
}

function close() {
  open.value = false
  qrDataUrl.value = ''
}

function setStatus(message: string) {
  statusMessage.value = message
  if (statusTimer) window.clearTimeout(statusTimer)
  statusTimer = window.setTimeout(() => { statusMessage.value = '' }, 2200)
}

async function shareWithSystem() {
  if (!import.meta.client) return
  const shareData = { url: props.url }
  try {
    if (!navigator.share || (navigator.canShare && !navigator.canShare(shareData))) {
      await copyCurrentUrl()
      return
    }
    close()
    await navigator.share(shareData)
  } catch (error) {
    const isCancelled = error && typeof error === 'object' && 'name' in error && error.name === 'AbortError'
    if (!isCancelled) {
      open.value = true
      await copyCurrentUrl()
    }
  }
}

async function copyLink() {
  await copyCurrentUrl()
}

async function copyCurrentUrl() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.url)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = props.url
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const copied = document.execCommand('copy')
      textarea.remove()
      if (!copied) throw new Error('copy failed')
    }
    setStatus('链接已复制，可以发给朋友了。')
  } catch {
    setStatus('复制失败，请手动复制文章地址。')
  }
}

async function showQrCode() {
  if (!import.meta.client) return
  try {
    qrDataUrl.value = await QRCode.toDataURL(props.url, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 220,
      color: { dark: '#2f3b32', light: '#fffdf5' },
    })
    statusMessage.value = ''
  } catch {
    setStatus('二维码生成失败，请改用复制链接。')
  }
}

function handleOutsideClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) close()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) close()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('keydown', handleKeydown)
  if (statusTimer) window.clearTimeout(statusTimer)
})
</script>
