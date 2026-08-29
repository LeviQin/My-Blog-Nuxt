<template>
  <aside v-if="visible" class="night-note" aria-label="夜读纸条">
    <img src="/images/ui/handmade/moon.webp" alt="" width="38" height="38" aria-hidden="true">
    <p><strong>夜读纸条</strong><span>还没睡吗？这一页可以明天再慢慢翻。</span></p>
    <button type="button" aria-label="关闭夜读纸条" @click="dismiss"><UiIcon name="close" /></button>
  </aside>
</template>

<script setup lang="ts">
const { state, update } = useEasterEggSession()
const visible = ref(false)

function isNight() {
  const hour = new Date().getHours()
  return hour >= 23 || hour < 5
}

onMounted(() => { visible.value = isNight() && !state.value.nightNoteDismissed })
function dismiss() { visible.value = false; update({ nightNoteDismissed: true }) }
</script>
