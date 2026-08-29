<template>
  <div class="coffee-secret" :class="{ 'is-empty': isEmpty, 'is-drinking': isDrinking }">
    <span class="coffee-secret-note" aria-hidden="true">桌边补给</span>
    <button type="button" :aria-label="isEmpty ? '再来一杯咖啡' : '喝一口咖啡'" :aria-describedby="'coffee-secret-status'" @click="drink">
      <img src="/images/ui/handmade/icon-coffee.webp" alt="" width="44" height="44" decoding="async">
      <span class="coffee-cup-fill" :style="{ transform: `scaleY(${level})` }" aria-hidden="true" />
    </button>
    <div id="coffee-secret-status" class="coffee-secret-hint" role="status" aria-live="polite">
      <strong>{{ isEmpty ? '咖啡见底了' : '喝一口' }}</strong>
      <small>{{ isEmpty ? '再来一杯灵感' : `剩余 ${remaining} 口` }}</small>
    </div>
    <div class="coffee-secret-meter" aria-hidden="true">
      <span v-for="sip in maxSips" :key="sip" :class="{ active: sip <= state.coffeeClicks }" />
    </div>
    <span v-if="secretText" class="coffee-secret-text" role="status" aria-live="polite">{{ secretText }}</span>
  </div>
</template>

<script setup lang="ts">
const { state, update } = useEasterEggSession()
const maxSips = 5
const isDrinking = ref(false)
let drinkingTimer: number | null = null
const isEmpty = computed(() => state.value.coffeeClicks >= maxSips)
const remaining = computed(() => Math.max(0, maxSips - state.value.coffeeClicks))
const secretText = computed(() => isEmpty.value ? '咖啡没了，灵感还在。' : '')
const level = computed(() => Math.max(0, 1 - state.value.coffeeClicks / maxSips))

function drink() {
  update({ coffeeClicks: isEmpty.value ? 0 : Math.min(maxSips, state.value.coffeeClicks + 1) })
  isDrinking.value = true
  if (drinkingTimer) clearTimeout(drinkingTimer)
  drinkingTimer = window.setTimeout(() => { isDrinking.value = false }, 420)
}

onBeforeUnmount(() => { if (drinkingTimer) clearTimeout(drinkingTimer) })
</script>
