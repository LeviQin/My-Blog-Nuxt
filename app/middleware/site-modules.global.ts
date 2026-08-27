const moduleRules = [
  { key: 'show_category_module' as const, matches: (path: string) => path.startsWith('/category/') },
  { key: 'show_widget_module' as const, matches: (path: string) => path === '/lab' || path.startsWith('/lab/') },
  { key: 'show_sites_module' as const, matches: (path: string) => path === '/sites' },
  { key: 'show_guestbook_module' as const, matches: (path: string) => path === '/guestbook' },
  { key: 'show_friend_link_module' as const, matches: (path: string) => path === '/friends' },
  { key: 'show_about_module' as const, matches: (path: string) => path === '/about' },
]

export default defineNuxtRouteMiddleware(async (to) => {
  const normalizedPath = to.path.replace(/\/$/, '') || '/'
  const rule = moduleRules.find(item => item.matches(normalizedPath))
  if (!rule) return

  const { settings, refresh } = useSiteSettings()
  if (!Object.keys(settings.value).length) await refresh()

  if (!isSiteModuleEnabled(settings.value, rule.key)) {
    return navigateTo('/', { replace: true })
  }
})
