export function useReadingProgress(track = false) {
  const progress = useState<number>('reading-progress', () => 0)
  const route = useRoute()
  if (!track) return progress

  let frame = 0
  let resizeObserver: ResizeObserver | null = null
  let stopRouteWatch: (() => void) | undefined

  const getReadingBounds = () => {
    const scope = document.querySelector<HTMLElement>('[data-reading-scope]')
    const end = document.querySelector<HTMLElement>('[data-reading-end]')
    if (!scope || !end) return null

    const start = scope.getBoundingClientRect().top + window.scrollY
    const finish = end.getBoundingClientRect().top + window.scrollY
    return { start, finish: Math.max(start, finish) }
  }

  const update = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const bounds = getReadingBounds()
      if (!bounds) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        progress.value = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0
        return
      }

      const max = bounds.finish - bounds.start - window.innerHeight
      if (max <= 0) {
        progress.value = window.scrollY + window.innerHeight >= bounds.finish ? 100 : 0
        return
      }
      progress.value = Math.min(100, Math.max(0, Math.round(((window.scrollY - bounds.start) / max) * 100)))
    })
  }

  const refreshScope = () => {
    resizeObserver?.disconnect()
    const scope = document.querySelector<HTMLElement>('[data-reading-scope]')
    if (scope && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(update)
      resizeObserver.observe(scope)
    }
    update()
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    stopRouteWatch = watch(() => route.fullPath, () => nextTick(refreshScope))
    nextTick(refreshScope)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
    stopRouteWatch?.()
    resizeObserver?.disconnect()
    if (frame) cancelAnimationFrame(frame)
  })
  return progress
}
