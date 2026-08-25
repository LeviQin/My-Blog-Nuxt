export function useTheme() {
  const theme = useCookie<'light' | 'dark'>('blog-theme', { default: () => 'light', watch: true })
  useHead({ htmlAttrs: { 'data-theme': () => theme.value } })
  const apply = () => { if (import.meta.client) document.documentElement.dataset.theme = theme.value }
  watch(theme, apply, { immediate: true })
  return { theme, toggleTheme: () => { theme.value = theme.value === 'light' ? 'dark' : 'light' } }
}
