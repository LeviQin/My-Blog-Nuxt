<template><div class="empty-state"><span class="empty-art" aria-hidden="true"><UiIcon name="leaf" /></span><h2>{{ title }}</h2><p>{{ message }}</p></div></template>
<script setup lang="ts">withDefaults(defineProps<{ title?: string; message?: string }>(), { title: '这里还没有内容', message: '换个时间再来看看吧。' })</script>
