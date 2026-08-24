import type { SiteSetting } from '~/types/api'

export function useSiteSettings() {
  const api = useBlogApi()
  const { data, error, refresh } = useAsyncData('site-settings', () => api.settings(), { default: () => ({}) })
  const settings = computed<SiteSetting>(() => Array.isArray(data.value) ? data.value[0] || {} : data.value || {})
  return { settings, error, refresh }
}
