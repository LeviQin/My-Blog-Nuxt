<template>
  <div class="easter-egg-layer" aria-live="polite">
    <Transition name="easter-pop">
      <div v-if="catVisible" class="idle-cat" aria-hidden="true">
        <img class="idle-cat-image" src="/images/ui/icons/icon-cat-real.png" alt="" width="120" height="120">
        <span class="cat-paw paw-one"><img src="/images/ui/handmade/icon-paw-real.png" alt="" width="28" height="28"></span>
        <span class="cat-paw paw-two"><img src="/images/ui/handmade/icon-paw-real.png" alt="" width="24" height="24"></span>
        <span class="cat-paw paw-three"><img src="/images/ui/handmade/icon-paw-real.png" alt="" width="22" height="22"></span>
      </div>
    </Transition>
    <Transition name="easter-pop">
      <div v-if="fireflyVisible" class="firefly-wrap">
        <button class="firefly" type="button" aria-label="查看萤火虫纸条" @click="showQuote = true; stopFirefly()"><span /></button>
        <Transition name="easter-note"><p v-if="showQuote" class="firefly-note" role="status">{{ quote }}<button type="button" aria-label="关闭萤火虫纸条" @click="showQuote = false">×</button></p></Transition>
      </div>
    </Transition>
    <Transition name="easter-note">
      <div v-if="reward" class="reward-toast" role="status">
        <img :src="reward.image" alt="" width="42" height="42">
        <span><strong>解锁：{{ reward.name }}</strong><small>{{ reward.description }}</small></span>
        <button type="button" aria-label="关闭奖励提示" @click="clearReward">×</button>
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
const fireflyVisible = ref(false)
const showQuote = ref(false)
const quote = ref('')
const reducedMotion = ref(false)
let visibleSeconds = 0
let timer: ReturnType<typeof setInterval> | null = null
let fireflyTimer: ReturnType<typeof setTimeout> | null = null
let themeObserver: MutationObserver | null = null

const reward = computed(() => newlyUnlocked.value ? readingRewards.find((item) => item.id === newlyUnlocked.value) : null)

function clearReward() { newlyUnlocked.value = null }
function stopFirefly() { fireflyVisible.value = false; if (fireflyTimer) clearTimeout(fireflyTimer) }
function tickVisibleTime() {
  if (document.hidden || state.value.catShown || reducedMotion.value || window.innerWidth < 700) return
  visibleSeconds += 1
  if (visibleSeconds >= 60) {
    catVisible.value = true
    update({ catShown: true })
    if (timer) clearInterval(timer)
    window.setTimeout(() => { catVisible.value = false }, 7200)
  }
}
function scheduleFirefly() {
  if (fireflyTimer) clearTimeout(fireflyTimer)
  if (state.value.fireflyShownCount >= 2 || document.hidden || document.documentElement.dataset.theme !== 'dark' || reducedMotion.value) return
  fireflyTimer = window.setTimeout(() => {
    if (document.documentElement.dataset.theme !== 'dark' || document.hidden) return scheduleFirefly()
    fireflyVisible.value = true
    quote.value = fireflyQuotes[Math.floor(Math.random() * fireflyQuotes.length)]
    update({ fireflyShownCount: state.value.fireflyShownCount + 1 })
    window.setTimeout(stopFirefly, 6500)
  }, 25000 + Math.random() * 35000)
}
function onVisibility() { if (!document.hidden) scheduleFirefly() }
function onThemeChange() { if (document.documentElement.dataset.theme === 'dark') scheduleFirefly(); else stopFirefly() }

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  timer = window.setInterval(tickVisibleTime, 1000)
  scheduleFirefly()
  document.addEventListener('visibilitychange', onVisibility)
  themeObserver = new MutationObserver(onThemeChange)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => { if (timer) clearInterval(timer); if (fireflyTimer) clearTimeout(fireflyTimer); themeObserver?.disconnect(); document.removeEventListener('visibilitychange', onVisibility) })
</script>
