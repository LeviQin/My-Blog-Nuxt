<template>
  <article class="photo-gallery-card">
    <button
      v-if="coverImage"
      class="photo-gallery-image-button"
      type="button"
      :aria-label="`查看《${article.title}》大图`"
      aria-haspopup="dialog"
      @click="openPreview"
    >
      <img
        class="photo-gallery-image"
        :src="coverImage"
        :alt="article.title"
        loading="lazy"
        decoding="async"
        @error="imageFailed = true"
      />
    </button>
    <div v-else class="photo-gallery-no-image" role="img" aria-label="未配置照片">
      <span>未配置照片</span>
    </div>

    <div class="photo-gallery-caption">
      <time :datetime="article.published_at || article.updated_at">
        {{ articleDate(article.published_at || article.updated_at) }}
      </time>
      <h2><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h2>
      <p v-if="article.article_description">{{ article.article_description }}</p>
      <div v-if="visibleTags.length" class="photo-gallery-tags" aria-label="摄影标签">
        <span v-for="tag in visibleTags" :key="tag"># {{ tag }}</span>
      </div>
      <NuxtLink class="photo-gallery-more" :to="`/posts/${article.id}`">
        查看拍摄记录 <span aria-hidden="true">→</span>
      </NuxtLink>
    </div>

  </article>
</template>

<script setup lang="ts">
import type { Article } from '~/types/api'
import { articleDate, articleImage } from '~/utils/blog'

const props = defineProps<{
  article: Article
  tagNames?: Map<string, string>
}>()
const emit = defineEmits<{
  'image-click': [image: { src: string; alt: string; dialogLabel: string }]
}>()

const imageFailed = ref(false)
const coverImage = computed(() => imageFailed.value ? '' : articleImage(props.article))
const visibleTags = computed(() => props.article.article_tags
  .slice(0, 3)
  .map((tag) => props.tagNames?.get(String(tag)) || (/^\d+$/.test(String(tag)) ? '' : String(tag)))
  .filter(Boolean))

function openPreview() {
  if (coverImage.value) emit('image-click', {
    src: coverImage.value,
    alt: props.article.title,
    dialogLabel: '查看摄影作品大图',
  })
}
</script>
