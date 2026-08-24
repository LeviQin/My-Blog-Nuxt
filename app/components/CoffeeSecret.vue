<template>
  <div class="coffee-secret">
    <button type="button" aria-label="喝一口咖啡" :aria-describedby="secretText ? 'coffee-secret-text' : undefined" @click="drink">
      <img src="/images/ui/handmade/icon-coffee.webp" alt="" width="44" height="44" decoding="async">
      <span class="coffee-cup-fill" :style="{ transform: `scaleY(${level})` }" aria-hidden="true" />
    </button>
    <span class="coffee-secret-hint" aria-hidden="true">喝一口</span>
    <span v-if="secretText" id="coffee-secret-text" class="coffee-secret-text" role="status" aria-live="polite">{{ secretText }}</span>
  </div>
</template>

<script setup lang="ts">
const { state, update } = useEasterEggSession()
const secretText = computed(() => state.value.coffeeClicks >= 5 ? '咖啡没了，灵感还在。' : '')
const level = computed(() => Math.max(0, 1 - state.value.coffeeClicks / 5))

function drink() {
  update({ coffeeClicks: Math.min(5, state.value.coffeeClicks + 1) })
}
</script>
