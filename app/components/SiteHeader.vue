<template>
  <header class="site-header">
    <div class="container header-inner">
      <div class="brand">
        <button class="brand-notebook-trigger" type="button" aria-label="打开隐藏手账" @click="secretOpen = true">
          <img class="brand-notebook" src="/images/ui/handmade/notebook.webp" alt="" width="58" height="66" decoding="async">
        </button>
        <NuxtLink class="brand-copy" to="/" aria-label="返回首页">
          <strong v-if="settings.blog_name">{{ settings.blog_name }}</strong>
          <small v-if="settings.blog_description">{{ settings.blog_description }}</small>
        </NuxtLink>
      </div>
      <nav id="site-navigation" class="site-nav" :class="{ 'is-open': open }" aria-label="主导航">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="open = false">{{ item.label }}</NuxtLink>
      </nav>
      <div class="header-actions">
        <button
          ref="searchTrigger"
          class="nav-search search-trigger"
          type="button"
          :aria-expanded="searchOpen"
          :aria-label="searchOpen ? '关闭搜索' : '打开搜索'"
          aria-controls="header-search-popover"
          @click="toggleSearch"
        >
          <img src="/images/ui/handmade/magnifier.webp" alt="" width="25" height="25" decoding="async">
        </button>
        <button class="theme-button" type="button" :aria-label="theme === 'light' ? '切换深色主题' : '切换浅色主题'" @click="toggleTheme"><img :src="theme === 'light' ? '/images/ui/handmade/moon.webp' : '/images/ui/handmade/sun.webp'" alt="" width="25" height="25" decoding="async"></button>
        <button class="menu-button" :class="{ 'is-open': open }" type="button" :aria-expanded="open" :aria-label="open ? '关闭导航' : '打开导航'" aria-controls="site-navigation" @click="open = !open">
          <span class="menu-icon" aria-hidden="true">
            <span class="menu-icon-line"></span>
            <span class="menu-icon-line"></span>
            <span class="menu-icon-line"></span>
          </span>
        </button>
      </div>
    </div>
  </header>
  <Teleport to="body">
    <Transition name="header-search">
      <div v-if="searchOpen" class="header-search-layer" :style="{ paddingTop: `${searchLayerTop}px` }" @click.self="closeSearch">
        <form id="header-search-popover" class="header-search-popover" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="header-keyword">搜索文章、标签</label>
          <input id="header-keyword" ref="searchInput" v-model="keyword" type="search" placeholder="搜索文章、标签..." @keydown.enter.prevent="submitSearch">
          <button type="submit" aria-label="提交搜索"><img src="/images/ui/handmade/magnifier.webp" alt="" width="25" height="25" decoding="async"></button>
        </form>
      </div>
    </Transition>
  </Teleport>
  <Transition name="secret-note">
    <div v-if="secretOpen" class="secret-note-backdrop" role="presentation" @click.self="secretOpen = false">
      <section class="secret-note" role="dialog" aria-modal="true" aria-labelledby="secret-note-title">
        <button class="secret-note-close" type="button" aria-label="关闭隐藏手账" @click="secretOpen = false">×</button>
        <p class="card-kicker">a little secret</p>
        <h2 id="secret-note-title">给偶然翻到这页的人</h2>
        <p>谢谢你在这里停留。这个博客不只记录代码，也收集一些风、树影、咖啡和还没写完的想法。</p>
        <div class="secret-note-signature">
          <img src="/images/ui/handmade/leaf.webp" alt="" width="46" height="46" decoding="async">
          <span>愿每一次阅读，都像翻到一页刚刚好的手账。</span>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const open = ref(false)
const keyword = ref('')
const searchOpen = ref(false)
const searchLayerTop = ref(0)
const searchTrigger = ref<HTMLButtonElement>()
const searchInput = ref<HTMLInputElement>()
const { theme, toggleTheme } = useTheme()
const { settings } = useSiteSettings()
const router = useRouter()
const secretOpen = ref(false)
const navItems = computed(() => [
  { label: '首页', to: '/' }, { label: '文章', to: '/articles' }, { label: '归档', to: '/archive' }, { label: '作品', to: '/portfolio' },
  ...(isSiteModuleEnabled(settings.value, 'show_friend_link_module') ? [{ label: '友链', to: '/friends' }] : []),
  ...(isSiteModuleEnabled(settings.value, 'show_sites_module') ? [{ label: '常用网站', to: '/sites' }] : []),
  ...(isSiteModuleEnabled(settings.value, 'show_widget_module') ? [{ label: '实验室', to: '/lab' }] : []),
  ...(isSiteModuleEnabled(settings.value, 'show_guestbook_module') ? [{ label: '联系', to: '/guestbook' }] : []),
  ...(isSiteModuleEnabled(settings.value, 'show_about_module') ? [{ label: '关于', to: '/about' }] : []),
])
function openSearch() {
  open.value = false
  searchOpen.value = true
  nextTick(() => {
    updateSearchPosition()
    searchInput.value?.focus()
  })
}
function closeSearch() {
  searchOpen.value = false
}
function toggleSearch() {
  if (searchOpen.value) closeSearch()
  else openSearch()
}
function submitSearch() { const value = keyword.value.trim(); if (value) router.push({ path: '/search', query: { keyword: value } }); closeSearch() }

function updateSearchPosition() {
  const rect = searchTrigger.value?.getBoundingClientRect()
  if (rect) searchLayerTop.value = rect.bottom + 10
}

function closeSecretOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    secretOpen.value = false
    closeSearch()
  }
}

onMounted(() => {
  window.addEventListener('keydown', closeSecretOnEscape)
  window.addEventListener('resize', updateSearchPosition)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeSecretOnEscape)
  window.removeEventListener('resize', updateSearchPosition)
})
</script>
