<template>
  <div class="easter-egg-layer" aria-live="polite">
    <Transition name="easter-pop">
      <div v-if="catVisible" class="idle-cat" role="status" aria-label="猫咪探头彩蛋">
        <img class="idle-cat-image" src="/images/ui/icons/icon-cat-real.webp" alt="" width="120" height="120">
        <span class="cat-paw paw-one"><img src="/images/ui/handmade/icon-paw-real.webp" alt="" width="28" height="28"></span>
        <span class="cat-paw paw-two"><img src="/images/ui/handmade/icon-paw-real.webp" alt="" width="24" height="24"></span>
        <span class="cat-paw paw-three"><img src="/images/ui/handmade/icon-paw-real.webp" alt="" width="22" height="22"></span>
        <button class="idle-cat-close" type="button" aria-label="关闭猫咪彩蛋" @click="dismissCat"><UiIcon name="close" /></button>
      </div>
    </Transition>
    <Transition name="easter-pop">
      <div v-if="fireflyVisible" class="firefly-wrap" :class="`firefly-corner-${fireflyCorner}`" aria-label="夜间萤火虫彩蛋">
        <button v-for="position in fireflyPositions" :key="position" class="firefly" :class="`firefly-${position}`" type="button" aria-label="查看萤火虫纸条" @click="openFireflyQuote">
          <img src="/images/ui/handmade/icon-firefly-real.svg" alt="" width="30" height="30" decoding="async">
          <span aria-hidden="true" />
        </button>
        <Transition name="easter-note"><p v-if="showQuote" class="firefly-note" role="status">{{ quote }}<button type="button" aria-label="关闭萤火虫纸条" @click="showQuote = false"><UiIcon name="close" /></button></p></Transition>
      </div>
    </Transition>
    <Transition name="easter-note">
      <div v-if="reward" class="reward-toast" role="status">
        <img :src="reward.image" alt="" width="42" height="42">
        <span><strong>解锁：{{ reward.name }}</strong><small>{{ reward.description }}</small></span>
        <button type="button" aria-label="关闭奖励提示" @click="clearReward"><UiIcon name="close" /></button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { fireflyQuotes } from '~/data/easter-egg-quotes'
import { readingRewards } from '~/data/reading-rewards'

const { state, update } = useEasterEggSession()
const { newlyUnlocked } = useReadingRewards()
const catVisible = ref(false)
const catDismissed = ref(false)
const fireflyVisible = ref(false)
const showQuote = ref(false)
const quote = ref('')
const reducedMotion = ref(false)
const fireflyPositions = ['one', 'two', 'three'] as const
const fireflyCorners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const
const fireflyCorner = ref<(typeof fireflyCorners)[number]>('bottom-right')
const maxFireflyShows = 3
let fireflyTimer: number | null = null
let themeObserver: MutationObserver | null = null

const reward = computed(() => newlyUnlocked.value ? readingRewards.find((item) => item.id === newlyUnlocked.value) : null)

function clearReward() { newlyUnlocked.value = null }
function dismissCat() { catDismissed.value = true; catVisible.value = false }
function openFireflyQuote() { showQuote.value = true }
function stopFirefly() { fireflyVisible.value = false; showQuote.value = false; if (fireflyTimer) clearTimeout(fireflyTimer) }
function scheduleFirefly() {
  if (fireflyTimer) clearTimeout(fireflyTimer)
  if (state.value.fireflyShownCount >= maxFireflyShows || document.hidden || document.documentElement.dataset.theme !== 'dark' || reducedMotion.value) return
  fireflyTimer = window.setTimeout(() => {
    if (document.documentElement.dataset.theme !== 'dark' || document.hidden) return scheduleFirefly()
    fireflyVisible.value = true
    fireflyCorner.value = fireflyCorners[Math.floor(Math.random() * fireflyCorners.length)]
    showQuote.value = false
    quote.value = fireflyQuotes[Math.floor(Math.random() * fireflyQuotes.length)]
    update({ fireflyShownCount: state.value.fireflyShownCount + 1 })
    window.setTimeout(stopFirefly, 15000)
  }, 25000 + Math.random() * 35000)
}
function onVisibility() { if (!document.hidden) scheduleFirefly() }
function onThemeChange() { if (document.documentElement.dataset.theme === 'dark') scheduleFirefly(); else stopFirefly() }
function onResize() {
  if (window.innerWidth < 700) catVisible.value = false
  else if (!catDismissed.value && !reducedMotion.value) {
    catVisible.value = true
    update({ catShown: true })
  }
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!reducedMotion.value && window.innerWidth >= 700) {
    catVisible.value = true
    update({ catShown: true })
  }
  scheduleFirefly()
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)
  themeObserver = new MutationObserver(onThemeChange)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => { if (fireflyTimer) clearTimeout(fireflyTimer); themeObserver?.disconnect(); document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('resize', onResize) })
</script>
