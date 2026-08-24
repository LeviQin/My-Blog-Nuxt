<template>
  <span class="lab-processing-badge" :class="`is-${processing}`" :title="hint">
    <span aria-hidden="true">{{ icon }}</span>{{ label }}
  </span>
</template>

<script setup lang="ts">
import type { LabProcessing } from '~/data/lab-tools'
const props = defineProps<{ processing: LabProcessing }>()
const label = computed(() => ({ local: '本地处理', online: '需要联网', experimental: '实验功能' }[props.processing]))
const icon = computed(() => ({ local: '⌁', online: '⌘', experimental: '⚗' }[props.processing]))
const hint = computed(() => ({ local: '文件不会上传服务器。', online: '输入会发送到 Levi Blog 后端完成查询。', experimental: '浏览器支持或输出效果可能存在差异。' }[props.processing]))
</script>
