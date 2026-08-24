<template>
  <NuxtLayout>
    <main class="error-page container">
      <section class="error-paper" aria-labelledby="error-title">
        <img class="error-leaf" src="/images/ui/handmade/leaf.webp" alt="" width="120" height="120" decoding="async">
        <img class="error-magnifier" src="/images/ui/handmade/magnifier.webp" alt="" width="120" height="120" decoding="async">
        <p class="card-kicker">lost paper</p>
        <span class="error-code">{{ statusCode }}</span>
        <h1 id="error-title">{{ title }}</h1>
        <p class="error-message">{{ message }}</p>
        <div class="error-actions">
          <button class="button primary" type="button" @click="go('/')">回到首页</button>
          <button class="button ghost" type="button" @click="go('/articles')">去看文章</button>
        </div>
        <img class="error-bookmark" src="/images/ui/handmade/bookmark.webp" alt="" width="44" height="66" decoding="async">
      </section>
    </main>
  </NuxtLayout>
</template>

<script setup lang="ts">
const props = defineProps<{ error: { statusCode?: number; statusMessage?: string } }>()
const statusCode = computed(() => Number(props.error?.statusCode || 404))
const title = computed(() => statusCode.value === 404 ? '这一页被风吹走了' : '这张纸暂时皱掉了')
const message = computed(() => statusCode.value === 404 ? '放大镜也没有找到它。也许它正在某个抽屉里等你。' : '页面暂时没有回应，请稍后再翻一次。')

function go(path: string) {
  clearError({ redirect: path })
}
</script>
