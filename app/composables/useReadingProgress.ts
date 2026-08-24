export function useReadingProgress() {
  const progress = ref(0)
  onMounted(() => {
    let frame = 0
    const update = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const max = document.documentElement.scrollHeight - window.innerHeight
        progress.value = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    onBeforeUnmount(() => {
      window.removeEventListener('scroll', update)
      if (frame) cancelAnimationFrame(frame)
    })
  })
  return progress
}
