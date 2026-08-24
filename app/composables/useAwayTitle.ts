export function useAwayTitle() {
  const awayTitle = useState<string | null>('away-title', () => null)

  function onVisibilityChange() {
    awayTitle.value = document.hidden ? '这一页还没看完…' : null
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', onVisibilityChange)
  })
  onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibilityChange))
  return { awayTitle }
}
