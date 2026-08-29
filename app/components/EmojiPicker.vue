<template>
  <div class="emoji-picker">
    <button class="emoji-trigger" type="button" :aria-expanded="open" aria-label="选择表情" @click.stop="open = !open"><UiIcon name="smile" /> <span>表情</span></button>
    <div v-if="open" class="emoji-panel" role="dialog" aria-label="表情选择器" @click.stop>
      <div class="emoji-panel-header"><strong>选择表情</strong><button type="button" aria-label="关闭表情选择器" @click="open = false"><UiIcon name="close" /></button></div>
      <div class="emoji-tabs"><button type="button" :class="{ active: tab === 'emoji' }" @click="tab = 'emoji'">Emoji</button><button type="button" :class="{ active: tab === 'kaomoji' }" @click="tab = 'kaomoji'">颜文字</button></div>
      <div class="emoji-grid" :class="{ 'is-kaomoji': tab === 'kaomoji' }">
        <button v-for="item in visibleItems" :key="item" type="button" :title="item" @click="select(item)">{{ item }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ select: [value: string] }>()
const open = ref(false)
const tab = ref<'emoji' | 'kaomoji'>('emoji')
const emojis = ['😀', '😄', '😁', '😆', '😂', '🙂', '😉', '😊', '🥰', '😍', '🤩', '😘', '😋', '😜', '🤗', '🤔', '😎', '🥺', '😭', '😱', '😴', '😤', '😈', '👻', '🤖', '💌', '❤️', '💯', '👍', '👏', '🤝', '💪', '👋', '✨', '🌿', '🐱', '🐶', '📷', '☕']
const kaomojis = ['(^_^)', 'ヽ(´▽｀)ノ', 'ヾ(≧▽≦*)o', '(￣▽￣)／', '(｡￫‿￩｡)', '(ง •̀_•́)ง', '( ¬､¬)', '(๑•́ ₃ •̀๑)', '(/= _ =)/~┴┴', '(づ｡◕‿‿◕｡)づ', '（*＾-＾*）', 'ヽ(✿ﾟ▽ﾟ)ノ', '(´• ω •`)', '(っ˘ω˘ς )']
const visibleItems = computed(() => tab.value === 'emoji' ? emojis : kaomojis)
function select(value: string) { emit('select', value); open.value = false }
function close(event: MouseEvent) { if (!(event.target as HTMLElement).closest('.emoji-picker')) open.value = false }
onMounted(() => document.addEventListener('click', close))
onBeforeUnmount(() => document.removeEventListener('click', close))
</script>
