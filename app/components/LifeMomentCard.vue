<template>
  <article class="life-moment">
    <div v-if="authorName || authorImage" class="life-moment-avatar">
      <img
        v-if="authorImage && !avatarFailed"
        :src="authorImage"
        :alt="authorName ? `${authorName}的头像` : '作者头像'"
        width="48"
        height="48"
        loading="lazy"
        decoding="async"
        @error="avatarFailed = true"
      />
      <span v-else-if="authorName" aria-hidden="true">{{ authorInitial }}</span>
    </div>

    <div class="life-moment-body">
      <header class="life-moment-header">
        <strong v-if="authorName" class="life-moment-author">{{ authorName }}</strong>
        <time :datetime="article.published_at || article.updated_at">
          {{ articleDate(article.published_at || article.updated_at) }}
        </time>
      </header>

      <div class="life-moment-content">
        <h2><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h2>
        <p v-if="article.article_description">{{ article.article_description }}</p>
      </div>

      <button
        v-if="coverImage"
        class="life-moment-image-button"
        type="button"
        :aria-label="`查看《${article.title}》大图`"
        aria-haspopup="dialog"
        @click="openPreview"
      >
        <img
          class="life-moment-image"
          :src="coverImage"
          :alt="article.title"
          loading="lazy"
          decoding="async"
          @error="imageFailed = true"
        />
      </button>

      <div v-if="visibleTags.length" class="life-moment-tags" aria-label="文章标签">
        <span v-for="tag in visibleTags" :key="tag" class="tag"># {{ tag }}</span>
      </div>

      <footer class="life-moment-footer">
        <NuxtLink class="life-moment-read" :to="`/posts/${article.id}`">查看全文 <span aria-hidden="true">→</span></NuxtLink>
        <span v-if="article.likes > 0" class="life-moment-likes" aria-label="喜欢数">♡ {{ article.likes }}</span>
      </footer>
    </div>

  </article>
</template>

<script setup lang="ts">
import type { Article } from '~/types/api'
import { articleDate, articleImage } from '~/utils/blog'

const props = defineProps<{
  article: Article
  tagNames?: Map<string, string>
  authorName?: string
  authorImage?: string
}>()
const emit = defineEmits<{
  'image-click': [image: { src: string; alt: string; dialogLabel: string }]
}>()

const imageFailed = ref(false)
const avatarFailed = ref(false)
const coverImage = computed(() => imageFailed.value ? '' : articleImage(props.article))
const authorName = computed(() => String(props.authorName || '').trim())
const authorImage = computed(() => String(props.authorImage || '').trim())
const authorInitial = computed(() => authorName.value.slice(0, 1).toUpperCase())
const visibleTags = computed(() => props.article.article_tags
  .slice(0, 3)
  .map((tag) => props.tagNames?.get(String(tag)) || (/^\d+$/.test(String(tag)) ? '' : String(tag)))
  .filter(Boolean))

function openPreview() {
  if (coverImage.value) emit('image-click', {
    src: coverImage.value,
    alt: props.article.title,
    dialogLabel: '查看生活碎片大图',
  })
}
</script>
