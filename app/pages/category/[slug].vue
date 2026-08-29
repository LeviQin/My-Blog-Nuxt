<template>
  <div
    class="container page-section category-page"
    :class="{ 'collection-page': isCollection, 'learning-page': isLearning, 'development-page': isDevelopment }"
  >
    <SectionHeading :eyebrow="isDevelopment ? 'category / development' : 'category'" :level="1">{{ category.name }}</SectionHeading>
    <div v-if="isDevelopment && displayArticles.length" class="development-overview">
      <p class="page-lead">{{ intro }}</p>
      <div class="development-stats" aria-label="开发文章统计">
        <span><strong>{{ displayArticles.length }}</strong> 篇笔记</span>
        <span v-if="featuredArticle"><strong>{{ articleDate(featuredArticle.published_at || featuredArticle.updated_at) }}</strong> 最近更新</span>
      </div>
    </div>
    <p v-else class="page-lead">{{ intro }}</p>

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
      <article
        v-for="(article, index) in displayArticles"
        :key="article.id"
        class="pet-card"
        :class="`pet-card--${index % 3}`"
      >
        <NuxtLink class="pet-photo" :to="`/posts/${article.id}`">
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
        </NuxtLink>
        <div class="pet-caption">
          <time :datetime="article.published_at || article.updated_at">{{
            articleDate(article.published_at || article.updated_at)
          }}</time>
          <h2><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h2>
          <p v-if="article.article_description">{{ article.article_description }}</p>
          <div v-if="visibleTags(article).length" class="tag-row">
            <template v-for="tag in visibleTags(article)" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" class="tag" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else class="tag"># {{ tag.name }}</span></template>
          </div>
        </div>
      </article>
    </div>

    <div v-else-if="displayArticles.length && isPhoto" class="photo-gallery">
      <PhotoGalleryCard
        v-for="article in displayArticles"
        :key="article.id"
        :article="article"
        :tags="tagItems"
        @image-click="openLightbox"
      />
    </div>

    <div v-else-if="displayArticles.length && isDaily" class="life-moments">
      <LifeMomentCard
        v-for="article in displayArticles"
        :key="article.id"
        :article="article"
        :tags="tagItems"
        :author-name="authorName"
        :author-image="authorImage"
        @image-click="openLightbox"
      />
    </div>

    <div v-else-if="displayArticles.length && isDevelopment" class="development-content">
      <div class="development-featured" :class="{ 'has-cover': Boolean(featuredArticle && photoImage(featuredArticle)) }">
        <div class="development-featured-copy">
          <div class="development-entry-meta"><span>FEATURED NOTE</span><time v-if="featuredArticle" :datetime="featuredArticle.published_at || featuredArticle.updated_at">{{ articleDate(featuredArticle.published_at || featuredArticle.updated_at) }}</time></div>
          <h2 v-if="featuredArticle"><NuxtLink :to="`/posts/${featuredArticle.id}`">{{ featuredArticle.title }}</NuxtLink></h2>
          <p v-if="featuredArticle?.article_description">{{ featuredArticle.article_description }}</p>
          <div v-if="featuredArticle && visibleTags(featuredArticle).length" class="development-tags"><template v-for="tag in visibleTags(featuredArticle)" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else># {{ tag.name }}</span></template></div>
          <NuxtLink v-if="featuredArticle" class="development-read" :to="`/posts/${featuredArticle.id}`">阅读精选文章 <UiIcon name="arrow-right" /></NuxtLink>
        </div>
        <NuxtLink v-if="featuredArticle && photoImage(featuredArticle)" class="development-featured-cover" :to="`/posts/${featuredArticle.id}`" :aria-label="`打开《${featuredArticle.title}》`">
          <img :src="photoImage(featuredArticle)" :alt="featuredArticle.title" width="900" height="520" loading="lazy" decoding="async" @error="onPhotoError($event, featuredArticle)">
        </NuxtLink>
      </div>

      <div class="development-layout">
        <section class="development-list" aria-labelledby="development-list-title">
          <div class="development-list-heading"><div><p class="card-kicker">DEV NOTES</p><h2 id="development-list-title">按时间整理</h2></div><span>{{ developmentArticles.length }} 篇</span></div>
          <article v-for="(article, index) in developmentArticles" :key="article.id" class="development-entry">
            <span class="development-entry-index" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="development-entry-main">
              <div class="development-entry-meta"><span>DEV NOTE</span><time :datetime="article.published_at || article.updated_at">{{ articleDate(article.published_at || article.updated_at) }}</time></div>
              <h3><NuxtLink :to="`/posts/${article.id}`">{{ article.title }}</NuxtLink></h3>
              <p v-if="article.article_description">{{ article.article_description }}</p>
              <div v-if="visibleTags(article).length" class="development-tags"><template v-for="tag in visibleTags(article)" :key="tag.id || tag.name"><NuxtLink v-if="tag.href" :to="tag.href"># {{ tag.name }}</NuxtLink><span v-else># {{ tag.name }}</span></template></div>
            </div>
            <NuxtLink class="development-entry-read" :to="`/posts/${article.id}`" :aria-label="`阅读《${article.title}》`"><UiIcon name="arrow-right" /></NuxtLink>
          </article>
          <p v-if="!developmentArticles.length" class="development-list-empty">精选文章已经是这个分类的全部内容。</p>
        </section>

        <aside class="development-index" aria-label="开发文章索引">
          <p class="card-kicker">TOPICS</p>
          <h2>技术标签</h2>
          <div v-if="developmentTagItems.length" class="development-topic-list">
            <NuxtLink v-for="item in developmentTagItems" :key="item.name" class="development-topic-item" :to="item.href"><b># {{ item.name }}</b><small>{{ item.count }}</small></NuxtLink>
          </div>
          <p v-else class="development-index-empty">文章标签会显示在这里。</p>
          <NuxtLink class="development-index-link" to="/archive">查看全部归档 <UiIcon name="arrow-right" /></NuxtLink>
        </aside>
      </div>
    </div>

    <div v-else-if="displayArticles.length && isLearning" class="learning-notes">
      <LearningNoteCard
        v-for="(article, index) in displayArticles"
        :key="article.id"
        :article="article"
        :index="index + 1"
        :tags="tagItems"
      />
    </div>

    <div v-else-if="displayArticles.length" class="article-grid">
      <ArticleCard
        v-for="article in displayArticles"
        :key="article.id"
        :article="article"
        :tags="tagItems"
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
      :images="lightboxImages"
      :index="lightboxIndex"
      :dialog-label="lightboxDialogLabel"
      @close="closeLightbox"
      @change="changeLightbox"
    />
  </div>
</template>

<script setup lang="ts">
import type { Article, Tag } from "~/types/api";
import { articleDate, articleImage, resolveArticleTags } from "~/utils/article";

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
    api.articles({
      category: category.value,
      ...(category.slug === "daily" ? { include_gallery: "1" } : {}),
    }),
    api.tags(),
  ]);
  return {
    articles: articleResult.status === "fulfilled" ? articleResult.value : [],
    tags: tagResult.status === "fulfilled" ? tagResult.value : [],
  };
});
const articles = computed(() => (data.value?.articles || []) as Article[]);
const { settings } = useSiteSettings();
const tagItems = computed(() => (data.value?.tags || []) as Tag[]);
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
const isPet = computed(() => category.slug === "pets");
const isPhoto = computed(() => category.slug === "photo");
const isDaily = computed(() => category.slug === "daily");
const isLearning = computed(() => category.slug === "learning");
const isDevelopment = computed(() => category.slug === "development");
const isCollection = computed(() => isPet.value || isPhoto.value || isDaily.value);
type LightboxImage = { src: string; alt: string };
type LightboxPayload = {
  image: LightboxImage;
  images: LightboxImage[];
  index: number;
  dialogLabel: string;
};
const lightboxImages = ref<LightboxImage[]>([]);
const lightboxIndex = ref(0);
const lightboxImage = computed(() => lightboxImages.value[lightboxIndex.value]);
const lightboxDialogLabel = ref("查看大图");
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
const featuredArticle = computed(() => {
  if (!isDevelopment.value || !displayArticles.value.length) return undefined;
  return displayArticles.value.find((article) => Number(article.is_top) === 1) || displayArticles.value[0];
});
const developmentArticles = computed(() => {
  const featuredId = featuredArticle.value?.id;
  return displayArticles.value.filter((article) => article.id !== featuredId);
});
const developmentTagItems = computed(() => {
  const counts = new Map<string, { count: number; href: string }>();
  for (const article of displayArticles.value) {
    for (const tag of visibleTags(article)) {
      const current = counts.get(tag.name);
      counts.set(tag.name, { count: (current?.count || 0) + 1, href: current?.href || tag.href || `/tags/${encodeURIComponent(tag.name)}` });
    }
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, count: value.count, href: value.href }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"))
    .slice(0, 8);
});

function photoImage(article: Article) {
  return failedImages.value[String(article.id)] ? "" : articleImage(article);
}
function visibleTags(article: Article) { return resolveArticleTags(article.article_tags, tagItems.value, 3); }
function onPhotoError(event: Event, article: Article) {
  const image = event.currentTarget as HTMLImageElement;
  image.onerror = null;
  failedImages.value = { ...failedImages.value, [String(article.id)]: true };
}
function openLightbox(payload: LightboxPayload) {
  lightboxImages.value = payload.images;
  lightboxIndex.value = payload.index;
  lightboxDialogLabel.value = payload.dialogLabel;
}
function changeLightbox(index: number) {
  if (index >= 0 && index < lightboxImages.value.length) lightboxIndex.value = index;
}
function closeLightbox() {
  lightboxImages.value = [];
  lightboxIndex.value = 0;
}

useBlogSeo({
  title: category.name,
  description: () =>
    String(remoteCategory?.description || `浏览 ${category.name} 分类下的文章。`).trim(),
  breadcrumbs: () => [
    { name: "首页", path: "/" },
    { name: "文章分类", path: "/archive" },
    { name: category.name, path: `/category/${category.slug}` },
  ],
});
</script>
