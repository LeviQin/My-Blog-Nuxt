export default defineNuxtPlugin((nuxtApp) => {
  const { track, flush } = useAnalytics()
  const router = useRouter()
  let lastPath = ''
  let isFirstPageView = true

  const getCampaignProperties = () => {
    const params = new URLSearchParams(window.location.search)
    return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign']
      .map(key => [key, params.get(key)?.trim() || ''])
      .filter(([, value]) => value))
  }

  const trackPageView = (path: string) => {
    if (!path || path === lastPath) return
    lastPath = path
    track('page_view', { page_path: path, ...(isFirstPageView ? getCampaignProperties() : {}) })
    isFirstPageView = false
  }

  nuxtApp.hook('app:mounted', () => {
    trackPageView(router.currentRoute.value.path)
  })
  router.afterEach(to => trackPageView(to.path))

  const flushOnLeave = () => { void flush(true) }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnLeave()
  })
  window.addEventListener('pagehide', flushOnLeave)
})
