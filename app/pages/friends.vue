<template>
  <div class="container page-section links-page">
    <section class="links-page-header" aria-labelledby="links-page-title">
      <div class="links-page-copy">
        <p class="links-eyebrow">KINDRED CORNERS</p>
        <h1 id="links-page-title">友链</h1>
        <p class="links-page-lead">互相交换一枚链接，也交换一点路上的风景。</p>
      </div>
      <img class="links-page-leaf" src="/images/ui/handmade/icon-leaf.webp" alt="" width="110" height="110" aria-hidden="true">
    </section>

    <div class="links-section-heading">
      <h2>一起走过的角落</h2>
      <span>{{ links.length }} 个站点</span>
    </div>

    <div v-if="links.length" class="links-grid">
      <a v-for="(link, index) in links" :key="link.id || link.url" class="link-card" :href="link.url" target="_blank" rel="noreferrer">
        <span class="link-card-tape" aria-hidden="true"></span>
        <span class="link-avatar-wrap">
          <img v-if="link.image" :src="link.image" :alt="`${link.name} 的头像`" width="58" height="58" loading="lazy" decoding="async">
          <span v-else class="link-avatar-placeholder" aria-label="未配置站点头像" />
        </span>
        <span class="link-card-copy">
          <span class="link-card-index">0{{ index + 1 }}</span>
          <strong>{{ link.name }}</strong>
          <span v-if="link.description" class="link-description">{{ link.description }}</span>
          <span class="link-host">{{ linkHost(link.url) }}</span>
        </span>
      </a>
    </div>
    <EmptyState v-else title="友链正在整理" message="如果你也想交换链接，欢迎通过留言告诉我。" />

    <aside class="links-disclaimer" aria-labelledby="links-disclaimer-title">
      <div class="links-disclaimer-mark" aria-hidden="true">
        <img src="/images/ui/handmade/icon-leaf.webp" alt="" width="42" height="42">
      </div>
      <div class="links-disclaimer-copy">
        <p class="links-eyebrow">A LITTLE REMINDER</p>
        <h2 id="links-disclaimer-title">友链说明与免责声明</h2>
        <p>这里的链接由站点作者主动提交或经双方确认后收录，仅代表个人整理与推荐，不代表 Levi Blog 对相关网站内容、观点或服务作出认可。</p>
        <p>外部网站的内容、隐私政策及安全风险由其运营者负责。若发现链接失效、内容不当或需要移除，请通过留言联系我，我会及时核查处理。</p>
      </div>
    </aside>

    <section class="links-apply-card" aria-labelledby="links-apply-title">
      <div class="links-apply-copy">
        <p class="links-eyebrow">A NOTE FOR KINDRED BLOGGERS</p>
        <h2 id="links-apply-title">申请友链</h2>
        <p>复制右侧格式，填写你的站点信息后，通过留言发给我即可。</p>
        <NuxtLink v-if="showGuestbook" class="journal-button journal-button-primary" to="/guestbook"><img class="button-icon" :src="'/images/ui/handmade/envelope.webp'" alt="" width="18" height="18" aria-hidden="true">前往留言</NuxtLink>
      </div>
      <div class="links-apply-format">
        <div class="links-apply-format-heading">
          <div>
            <p class="links-eyebrow">COPY &amp; SEND</p>
            <h3>申请格式</h3>
          </div>
          <button class="links-copy-button" type="button" :aria-label="copyStatus === 'success' ? '申请格式已复制' : '复制申请格式'" @click="copyLinkApplication">
            {{ copyStatus === 'success' ? '已复制' : copyStatus === 'error' ? '复制失败' : '复制格式' }}
          </button>
        </div>
        <pre class="links-apply-format-code" aria-label="友链申请格式">{{ linkApplicationFormat }}</pre>
        <p class="links-copy-status" aria-live="polite">{{ copyStatus === 'error' ? '请手动选择上方文字复制。' : '将内容替换成你的站点信息即可。' }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const api = useBlogApi()
const { settings } = useSiteSettings()
const showGuestbook = computed(() => isSiteModuleEnabled(settings.value, 'show_guestbook_module'))
const { data } = await useAsyncData('links', () => api.links(), { default: () => [] })
const links = computed(() => data.value || [])
const linkApplicationFormat = `名称：Levi’s space
地址：https://leviqin.top
头像：https://i.ibb.co/ch2crJbv/qiya.png
描述：写代码，也记录生活；分享折腾、灵感与日常。`
const copyStatus = ref<'idle' | 'success' | 'error'>('idle')
let copyResetTimer: ReturnType<typeof setTimeout> | undefined

function linkHost(value: string) {
  try { return new URL(value).host.replace(/^www\./, '') } catch { return value }
}

async function copyLinkApplication() {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(linkApplicationFormat)
    else {
      const textarea = document.createElement('textarea')
      textarea.value = linkApplicationFormat
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    copyStatus.value = 'success'
  } catch {
    copyStatus.value = 'error'
  }
  window.clearTimeout(copyResetTimer)
  copyResetTimer = window.setTimeout(() => { copyStatus.value = 'idle' }, 1600)
}

onBeforeUnmount(() => window.clearTimeout(copyResetTimer))

useBlogSeo({ title: '友链', description: 'Levi Blog 的友链列表。' })
</script>
