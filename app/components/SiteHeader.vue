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
      <button class="menu-button" type="button" :aria-expanded="open" aria-label="打开导航" @click="open = !open"><img src="/images/ui/icons/icon-menu.webp" alt="" width="25" height="25" decoding="async"></button>
      <nav class="site-nav" :class="{ 'is-open': open }" aria-label="主导航">
        <NuxtLink v-for="item in navItems" :key="item.to" :to="item.to" @click="open = false">{{ item.label }}</NuxtLink>
        <form class="header-search" role="search" @submit.prevent="submitSearch">
          <label class="sr-only" for="header-keyword">搜索文章、标签</label>
          <input id="header-keyword" v-model="keyword" type="search" placeholder="搜索文章、标签...">
          <button type="submit" aria-label="提交搜索"><img src="/images/ui/handmade/magnifier.webp" alt="" width="25" height="25" decoding="async"></button>
        </form>
        <button class="theme-button" type="button" :aria-label="theme === 'light' ? '切换深色主题' : '切换浅色主题'" @click="toggleTheme"><img :src="theme === 'light' ? '/images/ui/handmade/moon.webp' : '/images/ui/handmade/sun.webp'" alt="" width="25" height="25" decoding="async"></button>
      </nav>
    </div>
  </header>
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
const { theme, toggleTheme } = useTheme()
const { settings } = useSiteSettings()
const router = useRouter()
const secretOpen = ref(false)
const navItems = [
  { label: '首页', to: '/' }, { label: '文章', to: '/articles' }, { label: '归档', to: '/archive' },
  { label: '作品', to: '/portfolio' }, { label: '友链', to: '/links' }, { label: '实验室', to: '/lab' }, { label: '联系', to: '/guestbook' }, { label: '关于', to: '/about' },
]
function submitSearch() { const value = keyword.value.trim(); if (value) router.push({ path: '/search', query: { keyword: value } }); open.value = false }

function closeSecretOnEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') secretOpen.value = false
}

onMounted(() => window.addEventListener('keydown', closeSecretOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeSecretOnEscape))
</script>
