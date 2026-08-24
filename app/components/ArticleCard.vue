<template>
  <article class="article-card" :class="{ featured: featured }">
    <NuxtLink class="article-card-image" :class="{ 'is-empty': !coverImage }" :to="`/posts/${article.id}`">
      <img v-if="coverImage" :src="coverImage" :alt="article.title" width="900" height="520" loading="lazy" decoding="async" @error="onImageError">
      <span v-else class="image-placeholder" aria-label="未配置文章封面" />
    </NuxtLink>
    <div class="article-card-body"><div class="article-meta"><time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time><span v-if="categoryLabel">{{ categoryLabel }}</span></div><h2><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h2><p v-if="article.article_description">{{ article.article_description }}</p><div v-if="visibleTags.length" class="tag-row"><span v-for="tag in visibleTags" :key="tag" class="tag"># {{ tag }}</span></div></div>
  </article>
</template>
<script setup lang="ts">
import type { Article } from '~/types/api'
import { articleDate, articleImage } from '~/utils/blog'

const props = defineProps<{ article: Article; featured?: boolean; tagNames?: Map<string, string>; categoryNames?: Map<string, string> }>()
const imageFailed = ref(false)
const coverImage = computed(() => imageFailed.value ? '' : articleImage(props.article))
const categoryLabel = computed(() => props.categoryNames?.get(String(props.article.category)) || '')
const visibleTags = computed(() => props.article.article_tags.slice(0, 3).map((tag) => props.tagNames?.get(String(tag)) || (/^\d+$/.test(String(tag)) ? '' : String(tag))).filter(Boolean))
function onImageError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.onerror = null
  imageFailed.value = true
}
</script>
