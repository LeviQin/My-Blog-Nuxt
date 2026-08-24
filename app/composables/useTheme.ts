export function useTheme() {
  const theme = useCookie<'light' | 'dark'>('blog-theme', { default: () => 'light', watch: true })
  useHead({ htmlAttrs: { 'data-theme': () => theme.value } })
  const apply = () => { if (import.meta.client) document.documentElement.dataset.theme = theme.value }
  onMounted(apply)
  watch(theme, apply)
  return { theme, toggleTheme: () => { theme.value = theme.value === 'light' ? 'dark' : 'light' } }
}
