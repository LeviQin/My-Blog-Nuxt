<template>
  <form class="comment-form message-form" @submit.prevent="submit">
    <p class="private-form-note">内容只会发送给站长，不会公开展示。</p>
    <div class="form-grid"><label>昵称<input v-model="form.user_nickname" required maxlength="40" autocomplete="nickname"></label><label>邮箱<input v-model="form.email" required type="email" autocomplete="email"></label></div>
    <label>内容<textarea ref="contentInput" v-model="form.content" required maxlength="1000" rows="7" placeholder="写下你想告诉站长的内容，支持换行和表情～" /></label>
    <div class="message-tools">
      <div class="message-tool-group"><EmojiPicker @select="insertText" /><span v-if="form.content" class="message-length">{{ form.content.length }}/1000</span></div>
      <div class="captcha-field"><label for="message-captcha">验证码</label><span class="captcha-question">{{ captchaQuestion }}</span><button class="captcha-refresh" type="button" aria-label="换一题" @click="refreshCaptcha">换一题</button><input id="message-captcha" v-model="captchaInput" required inputmode="numeric" autocomplete="off" placeholder="答案"></div>
    </div>
    <label class="consent-row"><input v-model="consented" type="checkbox" required> <span>我已阅读并同意留言内容仅用于联系和处理本次事项。</span></label>
    <div class="form-actions"><span v-if="message" class="form-message">{{ message }}</span><button class="button primary" type="submit" :disabled="pending">{{ pending ? '发送中…' : '发送给站长' }}</button></div>
  </form>
</template>

<script setup lang="ts">
const api = useBlogApi()
const pending = ref(false)
const message = ref('')
const contentInput = ref<HTMLTextAreaElement>()
const captchaFirst = ref(2)
const captchaSecond = ref(7)
const captchaInput = ref('')
const consented = ref(false)
const captchaQuestion = computed(() => `${captchaFirst.value} + ${captchaSecond.value} =`)
const form = reactive({ user_nickname: '', email: '', content: '' })
onMounted(refreshCaptcha)

function refreshCaptcha() {
  captchaFirst.value = Math.floor(Math.random() * 10) + 1
  captchaSecond.value = Math.floor(Math.random() * 10) + 1
  captchaInput.value = ''
}

function insertText(value: string) {
  const textarea = contentInput.value
  const start = textarea?.selectionStart ?? form.content.length
  const end = textarea?.selectionEnd ?? start
  form.content = `${form.content.slice(0, start)}${value}${form.content.slice(end)}`
  nextTick(() => { textarea?.focus(); textarea?.setSelectionRange(start + value.length, start + value.length) })
}

async function submit() {
  message.value = ''
  if (Number(captchaInput.value) !== captchaFirst.value + captchaSecond.value) { message.value = '验证码错误，请重新计算。'; refreshCaptcha(); return }
  pending.value = true
  try {
    await api.submitMessage({ ...form })
    form.user_nickname = ''; form.email = ''; form.content = ''; captchaInput.value = ''; consented.value = false
    message.value = '内容已发送给站长，我会尽快处理。'
    refreshCaptcha()
  } catch (error: any) { message.value = error?.statusMessage || '提交失败，请稍后再试。' }
  finally { pending.value = false }
}
</script>
