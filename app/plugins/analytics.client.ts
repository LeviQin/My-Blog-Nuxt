export default defineNuxtPlugin((nuxtApp) => {
  const { track, flush } = useAnalytics()
  let lastPath = ''

  const trackPageView = (path: string) => {
    if (!path || path === lastPath) return
    lastPath = path
    track('page_view', { page_path: path })
  }

  nuxtApp.hook('app:mounted', () => {
    trackPageView(nuxtApp.$router.currentRoute.value.path)
  })
  nuxtApp.$router.afterEach(to => trackPageView(to.path))

  const flushOnLeave = () => { void flush(true) }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnLeave()
  })
  window.addEventListener('pagehide', flushOnLeave)
})
