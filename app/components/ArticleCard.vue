<template>
  <article class="article-card" :class="{ featured: featured }">
    <NuxtLink class="article-card-image" :class="{ 'is-empty': !coverImage }" :to="`/posts/${article.id}`">
      <img v-if="coverImage" :src="coverImage" :alt="article.title" width="900" height="520" loading="lazy" decoding="async" @error="onImageError">
      <span v-else class="image-placeholder" aria-label="未配置文章封面" />
    </NuxtLink>
    <div class="article-card-body"><div class="article-meta"><time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time><span v-if="categoryLabel">{{ categoryLabel }}</span></div><h2><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h2><p v-if="article.article_description">{{ article.article_description }}</p><div v-if="visibleTags.length" class="tag-row"><template v-for="tag in visibleTags" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" class="tag" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else class="tag"># {{ tag.name }}</span></template></div></div>
  </article>
</template>
<script setup lang="ts">
import type { Article, Tag } from '~/types/api'
import { articleDate, articleImage, resolveArticleTags } from '~/utils/blog'

const props = defineProps<{ article: Article; featured?: boolean; tags?: Tag[]; categoryNames?: Map<string, string> }>()
const imageFailed = ref(false)
const coverImage = computed(() => imageFailed.value ? '' : articleImage(props.article))
const categoryLabel = computed(() => props.categoryNames?.get(String(props.article.category)) || '')
const visibleTags = computed(() => resolveArticleTags(props.article.article_tags, props.tags, 3))
function onImageError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.onerror = null
  imageFailed.value = true
}
</script>
