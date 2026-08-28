<template>
  <article class="learning-note-card">
    <div class="learning-note-index" aria-hidden="true">{{ serial }}</div>

    <div class="learning-note-main">
      <header class="learning-note-header">
        <span class="learning-note-kicker">LEARNING NOTE</span>
        <time :datetime="article.published_at || article.updated_at">
          {{ articleDate(article.published_at || article.updated_at) }}
        </time>
      </header>

      <NuxtLink
        v-if="coverImage"
        class="learning-note-cover"
        :to="`/posts/${article.id}`"
        :aria-label="`打开《${article.title}》`"
      >
        <img
          :src="coverImage"
          :alt="article.title"
          width="900"
          height="260"
          loading="lazy"
          decoding="async"
          @error="onImageError"
        />
      </NuxtLink>

      <div class="learning-note-body">
        <h2><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h2>
        <p v-if="article.article_description">{{ article.article_description }}</p>

        <div v-if="visibleTags.length" class="learning-note-tags" aria-label="学习标签">
          <template v-for="tag in visibleTags" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else># {{ tag.name }}</span></template>
        </div>

        <NuxtLink class="learning-note-read" :to="`/posts/${article.id}`">
          阅读全文 <span aria-hidden="true">→</span>
        </NuxtLink>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Article, Tag } from '~/types/api'
import { articleDate, articleImage, resolveArticleTags } from '~/utils/blog'

const props = withDefaults(defineProps<{
  article: Article
  index?: number
  tags?: Tag[]
}>(), {
  index: 1,
})

const imageFailed = ref(false)
const coverImage = computed(() => imageFailed.value ? '' : articleImage(props.article))
const serial = computed(() => String(props.index).padStart(2, '0'))
const visibleTags = computed(() => resolveArticleTags(props.article.article_tags, props.tags, 3))

function onImageError(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  image.onerror = null
  imageFailed.value = true
}
</script>
