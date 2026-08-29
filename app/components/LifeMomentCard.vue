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

      <div
        v-if="galleryImages.length > 1"
        class="life-moment-gallery"
        :class="{ 'life-moment-gallery--two': galleryImages.length === 2 }"
        aria-label="生活照片"
      >
        <button
          v-for="(image, index) in galleryImages"
          :key="image"
          class="life-moment-gallery-item"
          type="button"
          :aria-label="`查看《${article.title}》第${index + 1}张大图`"
          aria-haspopup="dialog"
          @click="openPreview(image, index)"
        >
          <img
            class="life-moment-gallery-image"
            :src="image"
            :alt="`${article.title} 第${index + 1}张照片`"
            loading="lazy"
            decoding="async"
            @error="onImageError($event, image)"
          />
        </button>
      </div>
      <button
        v-else-if="galleryImages[0]"
        class="life-moment-image-button"
        type="button"
        :aria-label="`查看《${article.title}》大图`"
        aria-haspopup="dialog"
        @click="openPreview(galleryImages[0], 0)"
      >
        <img
          class="life-moment-image"
          :src="galleryImages[0]"
          :alt="article.title"
          loading="lazy"
          decoding="async"
          @error="onImageError($event, galleryImages[0])"
        />
      </button>

      <div v-if="visibleTags.length" class="life-moment-tags" aria-label="文章标签">
        <template v-for="tag in visibleTags" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" class="tag" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else class="tag"># {{ tag.name }}</span></template>
      </div>

      <footer class="life-moment-footer">
        <NuxtLink class="life-moment-read" :to="`/posts/${article.id}`">查看全文 <UiIcon name="arrow-right" /></NuxtLink>
        <span v-if="article.likes > 0" class="life-moment-likes" aria-label="喜欢数"><UiIcon name="heart" /> {{ article.likes }}</span>
      </footer>
    </div>

  </article>
</template>

<script setup lang="ts">
import type { Article, Tag } from '~/types/api'
import { articleDate, articleImage, dedupeGalleryImages, resolveArticleTags } from '~/utils/article'

const props = defineProps<{
  article: Article
  tags?: Tag[]
  authorName?: string
  authorImage?: string
}>()
const emit = defineEmits<{
  'image-click': [payload: {
    image: { src: string; alt: string }
    images: Array<{ src: string; alt: string }>
    index: number
    dialogLabel: string
  }]
}>()

const failedImages = ref<Record<string, boolean>>({})
const avatarFailed = ref(false)
const authorName = computed(() => String(props.authorName || '').trim())
const authorImage = computed(() => String(props.authorImage || '').trim())
const authorInitial = computed(() => authorName.value.slice(0, 1).toUpperCase())
const galleryImages = computed(() => {
  const configuredImages = Array.isArray(props.article.gallery_images)
    ? props.article.gallery_images
    : []
  const images = configuredImages.length ? configuredImages : [articleImage(props.article)]
  return dedupeGalleryImages(images).filter((image) => !failedImages.value[image]).slice(0, 9)
})
const visibleTags = computed(() => resolveArticleTags(props.article.article_tags, props.tags, 3))

function onImageError(event: Event, image: string) {
  const target = event.currentTarget as HTMLImageElement
  target.onerror = null
  failedImages.value = { ...failedImages.value, [image]: true }
}
function openPreview(image: string, index: number) {
  if (!image) return
  const images = galleryImages.value.map((src, imageIndex) => ({
    src,
    alt: `${props.article.title} 第${imageIndex + 1}张照片`,
  }))
  emit('image-click', {
    image: images[index],
    images,
    index,
    dialogLabel: '查看生活碎片大图',
  })
}
</script>
