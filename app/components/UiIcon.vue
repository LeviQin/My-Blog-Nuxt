<template>
  <svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <template v-if="name === 'arrow-right'">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </template>
    <template v-else-if="name === 'arrow-left'">
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <path d="m6 9 6 6 6-6" />
    </template>
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6 6 18" />
    </template>
    <template v-else-if="name === 'smile'">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 9h.01M15.5 9h.01M8.5 14.5c1 1.25 2.17 1.88 3.5 1.88s2.5-.63 3.5-1.88" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M20.8 5.8a5.4 5.4 0 0 0-7.6 0L12 7l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 22l8.8-8.6a5.4 5.4 0 0 0 0-7.6Z" />
    </template>
    <template v-else>
      <path d="M19.5 4.5C12 4.7 6.7 8.2 5.2 14.3c-.5 2 .3 4.1 2 5.2 1.7 1 3.9.8 5.4-.5 4.4-3.7 6.3-8.6 6.9-14.5Z" />
      <path d="M5.6 18.8c2.4-3 5.3-5.6 8.8-7.8" />
    </template>
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name: 'arrow-right' | 'arrow-left' | 'chevron-down' | 'close' | 'smile' | 'heart' | 'leaf'
}>()
</script>
