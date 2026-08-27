<template>
  <div
    class="container page-section category-page"
    :class="{ 'collection-page': isCollection }"
  >
    <SectionHeading eyebrow="category" :level="1">{{ category.name }}</SectionHeading>
    <p class="page-lead">{{ intro }}</p>

    <div v-if="isCollection" class="collection-toolbar">
      <span class="collection-count">{{ displayArticles.length }} {{ isPhoto ? "张作品" : "条记录" }}</span>
      <div v-if="isPhoto || isDaily" class="collection-filters" aria-label="按年份筛选">
        <button
          v-for="year in photoYears"
          :key="year"
          type="button"
          :class="{ active: photoYear === year }"
          @click="photoYear = year"
        >
          {{ year }}
        </button>
      </div>
    </div>

    <div v-if="displayArticles.length && isPet" class="pet-collection">
      <NuxtLink
        v-for="(article, index) in displayArticles"
        :key="article.id"
        class="pet-card"
        :class="`pet-card--${index % 3}`"
        :to="`/posts/${article.id}`"
      >
        <div class="pet-photo">
          <img
            v-if="photoImage(article)"
            :src="photoImage(article)"
            :alt="article.title"
            loading="lazy"
            decoding="async"
            @error="onPhotoError($event, article)"
          /><span v-else class="pet-photo-placeholder" aria-label="未配置文章封面" /><span
            class="pet-tape"
            aria-hidden="true"
          />
        </div>
        <div class="pet-caption">
          <time :datetime="article.published_at || article.updated_at">{{
            articleDate(article.published_at || article.updated_at)
          }}</time>
          <h2>{{ article.title }}</h2>
          <p v-if="article.article_description">{{ article.article_description }}</p>
          <div v-if="visibleTags(article).length" class="tag-row">
            <span v-for="tag in visibleTags(article)" :key="tag" class="tag"
              ># {{ tag }}</span
            >
          </div>
        </div>
      </NuxtLink>
    </div>

    <div v-else-if="displayArticles.length && isPhoto" class="photo-gallery">
      <PhotoGalleryCard
        v-for="article in displayArticles"
        :key="article.id"
        :article="article"
        :tag-names="tagNames"
        @image-click="openLightbox"
      />
    </div>

    <div v-else-if="displayArticles.length && isDaily" class="life-moments">
      <LifeMomentCard
        v-for="article in displayArticles"
        :key="article.id"
        :article="article"
        :tag-names="tagNames"
        :author-name="authorName"
        :author-image="authorImage"
        @image-click="openLightbox"
      />
    </div>

    <div v-else-if="displayArticles.length" class="article-grid">
      <ArticleCard
        v-for="article in displayArticles"
        :key="article.id"
        :article="article"
        :tag-names="tagNames"
        :category-names="categoryNames"
      />
    </div>
    <EmptyState
      v-else
      :title="
        (isPhoto || isDaily) && photoYear !== '全部'
          ? `${photoYear} 年还没有记录`
          : '这个分类还很安静'
      "
      message="暂时没有找到公开文章。"
    />

    <ImageLightbox
      :open="Boolean(lightboxImage)"
      :src="lightboxImage?.src || ''"
      :alt="lightboxImage?.alt || ''"
      :dialog-label="lightboxImage?.dialogLabel || '查看大图'"
      @close="closeLightbox"
    />
  </div>
</template>

<script setup lang="ts">
import type { Article, Tag } from "~/types/api";
import { articleDate, articleImage, normalizeTag } from "~/utils/blog";

const route = useRoute();
const api = useBlogApi();
const remoteCategories = await api.categories().catch(() => []);
const remoteCategory = remoteCategories.find(
  (item) => item.slug === String(route.params.slug)
);
const category = remoteCategory
  ? {
      value: String(remoteCategory.id),
      slug: remoteCategory.slug,
      name: String(
        remoteCategory.name || remoteCategory.category_name || remoteCategory.slug || ""
      ).trim(),
    }
  : undefined;
if (!category) throw createError({ statusCode: 404, statusMessage: "分类不存在" });

const { data } = await useAsyncData(`category-${category.slug}`, async () => {
  const [articleResult, tagResult] = await Promise.allSettled([
    api.articles({ category: category.value }),
    api.tags(),
  ]);
  return {
    articles: articleResult.status === "fulfilled" ? articleResult.value : [],
    tags: tagResult.status === "fulfilled" ? tagResult.value : [],
  };
});
const articles = computed(() => (data.value?.articles || []) as Article[]);
const { settings } = useSiteSettings();
const tagNames = computed(
  () =>
    new Map(
      ((data.value?.tags || []) as Tag[]).map((tag) => [
        String(tag.id),
        normalizeTag(tag).name,
      ])
    )
);
const categoryNames = computed(
  () =>
    new Map(
      remoteCategories.map((item) => [
        String(item.id),
        item.name || item.category_name || item.slug,
      ])
    )
);
const failedImages = ref<Record<string, boolean>>({});
const authorName = computed(() => String(settings.value.blog_name || '').trim());
const authorImage = computed(() => String(settings.value.blog_logo || '').trim());
const lightboxImage = ref<{ src: string; alt: string; dialogLabel: string } | null>(null);
const isPet = computed(() => category.slug === "pets");
const isPhoto = computed(() => category.slug === "photo");
const isDaily = computed(() => category.slug === "daily");
const isCollection = computed(() => isPet.value || isPhoto.value || isDaily.value);
const intro = computed(() =>
  isPet.value
    ? "把每一次撒娇、奔跑和回头，都收进一册柔软的生活相册。"
    : isPhoto.value
    ? "用更大的留白，保存路上遇见的光、风景和安静时刻。"
    : isDaily.value
    ? "把日常里值得记住的片段，慢慢收进这一页。"
    : `在这一页，收好关于${category.name}的片段。`
);
const photoYear = ref("全部");
const photoYears = computed(() => [
  "全部",
  ...new Set(
    articles.value
      .map((article) =>
        new Date(article.published_at || article.updated_at).getFullYear()
      )
      .filter((year) => Number.isFinite(year))
      .sort((a, b) => b - a)
      .map(String)
  ),
]);
const displayArticles = computed(() => {
  if ((!isPhoto.value && !isDaily.value) || photoYear.value === "全部") return articles.value;
  return articles.value.filter(
    (article) =>
      String(new Date(article.published_at || article.updated_at).getFullYear()) ===
      photoYear.value
  );
});

function photoImage(article: Article) {
  return failedImages.value[String(article.id)] ? "" : articleImage(article);
}
function visibleTags(article: Article) {
  return article.article_tags
    .slice(0, 3)
    .map(
      (tag) =>
        tagNames.value.get(String(tag)) || (/^\d+$/.test(String(tag)) ? "" : String(tag))
    )
    .filter(Boolean);
}
function onPhotoError(event: Event, article: Article) {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  failedImages.value = { ...failedImages.value, [String(article.id)]: true };
}
function openLightbox(image: { src: string; alt: string; dialogLabel: string }) {
  lightboxImage.value = image;
}
function closeLightbox() {
  lightboxImage.value = null;
}

useBlogSeo({
  title: category.name,
  description: () =>
    String(remoteCategory.description || `浏览 ${category.name} 分类下的文章。`).trim(),
  breadcrumbs: () => [
    { name: "首页", path: "/" },
    { name: "文章分类", path: "/archive" },
    { name: category.name, path: `/category/${category.slug}` },
  ],
});
</script>
