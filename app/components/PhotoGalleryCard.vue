<template>
  <article class="photo-gallery-card">
    <div class="photo-gallery-media">
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
        <div v-if="visibleTags.length" class="photo-gallery-tags" aria-label="摄影标签">
          <template v-for="tag in visibleTags" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else># {{ tag.name }}</span></template>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Article, Tag } from '~/types/api'
import { articleDate, articleImage, resolveArticleTags } from '~/utils/article'

const props = defineProps<{
  article: Article
  tags?: Tag[]
}>()
const emit = defineEmits<{
  'image-click': [payload: {
    image: { src: string; alt: string }
    images: Array<{ src: string; alt: string }>
    index: number
    dialogLabel: string
  }]
}>()

const imageFailed = ref(false)
const coverImage = computed(() => imageFailed.value ? '' : articleImage(props.article))
const visibleTags = computed(() => resolveArticleTags(props.article.article_tags, props.tags, 3))

function openPreview() {
  if (!coverImage.value) return
  const image = { src: coverImage.value, alt: props.article.title }
  emit('image-click', {
    image,
    images: [image],
    index: 0,
    dialogLabel: '查看摄影作品大图',
  })
}
</script>
