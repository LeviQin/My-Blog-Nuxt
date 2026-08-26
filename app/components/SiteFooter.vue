<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <NightNote />
      <span v-if="settings.blog_record_name">{{ settings.blog_record_name }}</span>
      <a v-if="settings.blog_record_number" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" aria-label="在工信部备案查询系统查看备案信息">{{ settings.blog_record_number }}</a>
      <NuxtLink v-if="showLab" class="footer-lab-link" to="/lab">Levi Lab</NuxtLink>
      <span class="footer-status" :class="{ 'is-offline': serviceAvailable === false }" :title="serviceAvailable === false ? '博客服务暂时不可用' : '博客服务运行正常'">
        <span class="footer-status-dot" aria-hidden="true"></span>{{ serviceAvailable === false ? '服务异常' : '服务正常' }}
      </span>
    </div>
  </footer>
</template>
<script setup lang="ts">
const { settings } = useSiteSettings()
const showLab = computed(() => isSiteModuleEnabled(settings.value, 'show_widget_module'))
const STATUS_CHECK_INTERVAL = 15_000
let statusTimer: number | undefined
let checking = false

async function probeService() {
  if (import.meta.client && !navigator.onLine) return false
  try {
    const response = await $fetch<{ status?: string }>('/api/service-health', {
      query: { _: Date.now() },
      timeout: 4_000,
    })
    return response?.status === 'ok'
  } catch {
    return false
  }
}

const { data: serviceAvailable } = await useAsyncData('footer-service-status', probeService, { default: () => true })

async function refreshServiceStatus() {
  if (checking) return
  checking = true
  try {
    serviceAvailable.value = await probeService()
  } finally {
    checking = false
  }
}

function handleOffline() {
  serviceAvailable.value = false
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') void refreshServiceStatus()
}

onMounted(() => {
  void refreshServiceStatus()
  statusTimer = window.setInterval(() => {
    if (document.visibilityState === 'visible') void refreshServiceStatus()
  }, STATUS_CHECK_INTERVAL)
  window.addEventListener('online', refreshServiceStatus)
  window.addEventListener('offline', handleOffline)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (statusTimer !== undefined) window.clearInterval(statusTimer)
  window.removeEventListener('online', refreshServiceStatus)
  window.removeEventListener('offline', handleOffline)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>
