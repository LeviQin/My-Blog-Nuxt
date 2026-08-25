export function useAwayTitle() {
  let titleBeforeAway = ''

  function onVisibilityChange() {
    if (document.hidden) {
      titleBeforeAway = document.title
      document.title = '这一页还没看完…'
    } else if (titleBeforeAway) {
      document.title = titleBeforeAway
      titleBeforeAway = ''
    }
  }

  onMounted(() => { titleBeforeAway = document.title; document.addEventListener('visibilitychange', onVisibilityChange) })
  onBeforeUnmount(() => document.removeEventListener('visibilitychange', onVisibilityChange))
}
