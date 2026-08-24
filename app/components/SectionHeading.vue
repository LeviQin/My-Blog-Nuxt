<template>
  <div class="section-heading"><div><p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p><h1 v-if="level === 1"><slot /></h1><h2 v-else><slot /></h2></div><slot name="aside" /></div>
</template>
<script setup lang="ts">defineProps<{ eyebrow?: string; level?: 1 | 2 }>()</script>
