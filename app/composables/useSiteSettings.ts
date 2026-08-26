import type { SiteSetting } from '~/types/api'

export type SiteModuleKey =
  | 'show_category_module'
  | 'show_widget_module'
  | 'show_sites_module'
  | 'show_guestbook_module'
  | 'show_friend_link_module'
  | 'show_about_module'

export function isSiteModuleEnabled(settings: SiteSetting, key: SiteModuleKey) {
  const value = settings[key]
  if (value === undefined || value === null || value === '') return true
  return value === true || value === 1 || value === '1'
}

export function useSiteSettings() {
  const api = useBlogApi()
  const { data, error, refresh } = useAsyncData('site-settings', () => api.settings(), { default: () => ({}) })
  const settings = computed<SiteSetting>(() => Array.isArray(data.value) ? data.value[0] || {} : data.value || {})
  return { settings, error, refresh }
}
