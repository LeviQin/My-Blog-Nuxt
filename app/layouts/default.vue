<template>
  <div class="site-shell">
    <div class="reading-bar" :style="{ width: `${progress}%` }" aria-hidden="true" />
    <PointerEffects />
    <EasterEggLayer />
    <SiteHeader />
    <main class="site-main"><slot /></main>
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
const progress = useReadingProgress(true)
</script>
