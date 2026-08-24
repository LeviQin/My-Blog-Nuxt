<template>
  <form class="comment-form" @submit.prevent="submit">
    <div class="form-grid"><label>昵称<input v-model="form.user_nickname" required maxlength="40" autocomplete="nickname"></label><label>邮箱<input v-model="form.email" required type="email" autocomplete="email"></label></div>
    <label>内容<textarea v-model="form.content" required maxlength="1000" rows="4" placeholder="写下你的想法…" /></label>
    <div class="form-actions"><span v-if="message" class="form-message">{{ message }}</span><button class="button primary" type="submit" :disabled="pending">{{ pending ? '发送中…' : '提交评论' }}</button></div>
  </form>
</template>
<script setup lang="ts">
const props = defineProps<{ articleId: number }>(); const emit = defineEmits<{ submitted: [] }>()
const api = useBlogApi(); const pending = ref(false); const message = ref(''); const form = reactive({ user_nickname: '', email: '', content: '', user_avatar_url: '', operating_system: '', browser: '' })
async function submit() { pending.value = true; message.value = ''; try { await api.submitComment({ ...form, article_id: props.articleId }); form.user_nickname = ''; form.email = ''; form.content = ''; message.value = '评论已提交，审核后会显示。'; emit('submitted') } catch (error: any) { message.value = error?.statusMessage || '提交失败，请稍后再试。' } finally { pending.value = false } }
</script>
