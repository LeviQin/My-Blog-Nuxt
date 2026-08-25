<template>
  <div class="container page-section lab-page">
    <header class="lab-hero">
      <div>
        <p class="card-kicker">Levi Lab · little experiments</p>
        <h1>手账实验室</h1>
        <p>把颜色、文字和文章之间的关系，做成可以亲手翻动的小实验。</p>
      </div>
      <img src="/images/ui/handmade/icon-lab-flask-real.png" alt="" width="112" height="128" aria-hidden="true">
    </header>

    <section class="lab-directory" aria-labelledby="lab-directory-title">
      <div class="lab-directory-heading">
        <div><p class="card-kicker">01 · LITTLE TOOLS</p><h2 id="lab-directory-title">把图片、文字和灵感整理成一页</h2><p>从图片、查询到开发者便签，选择一个小工具开始。需要联网的查询会在入口处明确说明。</p></div>
        <span class="lab-processing-badge is-local">{{ v1Tools.length }} 个小工具 · 即开即用</span>
      </div>
      <div class="lab-tool-grid">
        <NuxtLink v-for="tool in v1Tools" :key="tool.id" class="lab-tool-card" :to="tool.path">
          <span class="lab-tool-card-icon" :class="'is-' + tool.id" :style="labToolIconStyle(tool.icon)" role="img" :aria-label="tool.name"></span>
          <div class="lab-tool-card-content">
            <p class="lab-tool-card-kicker">{{ labToolCategoryLabels[tool.category] }}</p>
            <h3>{{ tool.name }}</h3>
            <p>{{ tool.description }}</p>
            <div class="lab-tool-tags" aria-label="工具能力">
              <span v-for="keyword in tool.keywords.slice(0, 2)" :key="keyword">{{ keyword }}</span>
            </div>
          </div>
          <div class="lab-tool-card-footer">
            <span class="lab-processing-badge" :class="'is-' + tool.processing">{{ labToolUsageLabels[tool.id] || tool.processing }}</span>
            <span class="lab-tool-card-action">打开工具</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="lab-rewards-card" aria-labelledby="lab-rewards-title">
      <div class="lab-section-title"><div><p class="card-kicker">my journal collection</p><h2 id="lab-rewards-title">我的手账收藏</h2></div><span>{{ rewardState.completedArticleIds.length }} 篇已读</span></div>
      <div class="reward-grid">
        <article v-for="reward in rewards" :key="reward.id" class="reward-card" :class="{ unlocked: rewardState.unlockedRewardIds.includes(reward.id) }"><img :src="reward.image" :alt="rewardState.unlockedRewardIds.includes(reward.id) ? reward.name : '未解锁奖励'" width="46" height="46"><div><strong>{{ reward.name }}</strong><small>{{ reward.description }}</small></div><span class="reward-status">{{ rewardState.unlockedRewardIds.includes(reward.id) ? '已获得' : `还差 ${Math.max(0, reward.threshold - rewardState.completedArticleIds.length)} 篇` }}</span></article>
      </div>
      <button class="text-button" type="button" @click="clearRewards">清空本地阅读记录</button>
    </section>

    <div class="lab-grid">
      <section class="lab-card palette-lab" aria-labelledby="palette-title">
        <div class="lab-section-title lab-workbench-heading"><div><p class="card-kicker">01 · paper palette</p><h2 id="palette-title">手账纸张调色台</h2><p class="lab-section-description">先选一套基调，再微调纸张、圆角和阴影，看看它们组合后的真实效果。</p></div><div class="lab-heading-actions"><span>实时预览</span><button class="text-button" type="button" @click="resetPalette">恢复默认</button></div></div>
        <div class="palette-workbench">
          <aside class="palette-controls-panel" aria-label="调色台参数">
            <div class="palette-subheading"><span>选择基调</span><small>{{ activePresetName }}</small></div>
            <div class="palette-presets" role="group" aria-label="调色预设">
              <button v-for="preset in palettePresets" :key="preset.id" type="button" :class="{ active: activePreset === preset.id }" :aria-pressed="activePreset === preset.id" @click="applyPreset(preset)"><span class="preset-swatches"><i :style="{ background: preset.paper }"></i><i :style="{ background: preset.olive }"></i><i :style="{ background: preset.brown }"></i></span><strong>{{ preset.name }}</strong><small>{{ preset.description }}</small></button>
            </div>
            <div class="palette-subheading palette-subheading-spaced"><span>微调细节</span><small>拖动即时预览</small></div>
            <div class="palette-control-list">
              <label class="palette-control palette-color-control"><span><strong>纸张背景</strong><small>{{ palette.paper }}</small></span><input v-model="palette.paper" type="color" aria-label="纸张背景颜色"></label>
              <label class="palette-control palette-color-control"><span><strong>橄榄主色</strong><small>{{ palette.olive }}</small></span><input v-model="palette.olive" type="color" aria-label="橄榄主色颜色"></label>
              <label class="palette-control palette-color-control"><span><strong>暖棕墨色</strong><small>{{ palette.brown }}</small></span><input v-model="palette.brown" type="color" aria-label="暖棕墨色颜色"></label>
              <label class="palette-control"><span><strong>卡片圆角</strong><small>{{ palette.radius }}px</small></span><input v-model.number="palette.radius" type="range" min="4" max="32" aria-label="卡片圆角"></label>
              <label class="palette-control"><span><strong>阴影强度</strong><small>{{ palette.shadow }}%</small></span><input v-model.number="palette.shadow" type="range" min="0" max="30" aria-label="阴影强度"></label>
              <label class="palette-control"><span><strong>胶带样式</strong><small>{{ palette.tape === 'polka' ? '波点纸带' : '素色纸带' }}</small></span><select v-model="palette.tape" aria-label="胶带样式"><option value="plain">素色纸带</option><option value="polka">波点纸带</option></select></label>
            </div>
          </aside>
          <div class="palette-stage">
            <div class="palette-stage-bar"><span>页面组件预览</span><small>按钮、标签和正文会一起变化</small></div>
            <div class="palette-preview" :style="paletteStyle">
              <span class="preview-tape" :class="`tape-${palette.tape}`"></span>
              <div class="preview-meta"><small>NOTEBOOK / 2026</small><span>一页小记</span></div>
              <h3>给今天留一张纸</h3>
              <p>颜色、圆角和阴影会即时反映到这张文章卡片上，先在这里找到顺眼的组合。</p>
              <div class="preview-bottom"><button type="button" @click="savePalette">{{ paletteSaved ? '已保存方案' : '保存这一页' }}</button><span class="preview-tag"># 手账实验</span></div>
              <span class="preview-bookmark"></span>
            </div>
            <div class="palette-contrast"><span class="contrast-dot" :class="{ good: contrastScore >= 4.5 }"></span><div><strong>{{ contrastScore >= 4.5 ? '文字对比度舒适' : '建议加深墨色' }}</strong><small>当前暖棕墨色与纸张的对比度约 {{ contrastScore }}:1</small></div></div>
            <div class="css-output"><div class="css-output-heading"><div><strong>生成 CSS 变量</strong><small>可以复制到你的组件或主题文件中</small></div><button class="text-button" type="button" @click="copyCss">{{ copied ? '已复制' : '复制变量' }}</button></div><code>{{ cssVariables }}</code></div>
          </div>
        </div>
      </section>

      <section class="lab-card markdown-lab" aria-labelledby="markdown-title">
        <div class="lab-section-title lab-workbench-heading"><div><p class="card-kicker">02 · markdown desk</p><h2 id="markdown-title">Markdown 排版台</h2><p class="lab-section-description">写下 Markdown，看看它在真实文章里的标题、引用、代码和标签会如何呈现。</p></div><span>{{ markdown.length.toLocaleString() }} / 20,000</span></div>
        <div class="markdown-toolbar"><div class="markdown-example-control"><label for="markdown-example">示例</label><select id="markdown-example" v-model="selectedExample"><option value="journal">一页小记</option><option value="article">文章片段</option><option value="code">代码笔记</option></select><button class="text-button" type="button" @click="applyMarkdownExample">载入</button></div><div class="markdown-actions"><button class="text-button" type="button" @click="copyMarkdown">{{ markdownCopied ? '已复制 Markdown' : '复制 Markdown' }}</button><button class="text-button" type="button" @click="clearMarkdown">清空</button></div></div>
        <div class="markdown-mobile-switch" role="tablist" aria-label="Markdown 工作区视图"><button type="button" :class="{ active: markdownMobileView === 'edit' }" role="tab" :aria-selected="markdownMobileView === 'edit'" @click="markdownMobileView = 'edit'">编辑</button><button type="button" :class="{ active: markdownMobileView === 'preview' }" role="tab" :aria-selected="markdownMobileView === 'preview'" @click="markdownMobileView = 'preview'">预览</button></div>
        <div class="markdown-stats"><span><strong>{{ markdownWordCount.toLocaleString() }}</strong> 字符</span><span><strong>{{ markdownHeadingCount }}</strong> 个标题</span><span><strong>{{ markdownReadingTime }}</strong> 分钟阅读</span><small>本地实时渲染</small></div>
        <div class="markdown-workbench" :class="`markdown-view-${markdownMobileView}`">
          <div class="markdown-input-wrap"><div class="markdown-pane-heading"><strong>编辑 Markdown</strong><small>支持常用 Markdown 语法</small></div><div class="markdown-editor-shell"><div class="markdown-format-toolbar" role="toolbar" aria-label="Markdown 格式工具"><button v-for="tool in markdownTools" :key="tool.label" type="button" :title="tool.hint" :aria-label="tool.hint" @click="insertMarkdown(tool)">{{ tool.label }}</button></div><textarea ref="markdownInput" v-model="markdown" maxlength="20000" aria-label="Markdown 输入" spellcheck="false" placeholder="从一段文字开始……"></textarea></div><small class="markdown-shortcut">提示：工具栏会把语法插入到光标位置，你也可以直接编辑原文。</small></div>
          <div class="markdown-preview"><div class="markdown-pane-heading"><strong>文章预览</strong><small>使用博客现有排版样式</small></div><div class="markdown-preview-scroll"><MarkdownBody :source="markdown || '_在编辑区写一点 Markdown，这里会出现文章预览。_'" /></div></div>
        </div>
        <p class="lab-privacy"><img src="/images/ui/handmade/icon-leaf.webp" alt="" width="18" height="18">内容只在当前浏览器中处理，不会上传服务器，也不会保存到博客。</p>
      </section>
    </div>

    <section class="lab-card article-map-lab" aria-labelledby="map-title">
      <div class="lab-section-title"><div><p class="card-kicker">03 · article garden</p><h2 id="map-title">文章关系地图</h2></div><span>SVG · {{ articles.length }} 篇文章</span></div>
      <div v-if="articles.length" class="article-garden-shell">
        <div class="garden-toolbar">
          <div class="garden-filters" role="group" aria-label="按分类筛选文章">
            <button v-for="category in gardenCategories" :key="category.name" type="button" :class="{ active: selectedCategory === category.name }" :aria-pressed="selectedCategory === category.name" @click="selectCategory(category.name)">{{ category.name }}<small>{{ category.count }}</small></button>
          </div>
          <span class="garden-count">{{ gardenSummary }}</span>
        </div>
        <div class="article-garden">
          <div class="garden-stage" :class="{ 'is-category-view': selectedCategory !== '全部' }" role="group" aria-label="文章花园地图">
            <template v-if="selectedCategory === '全部'">
              <div class="garden-overview">
                <div class="garden-overview-heading"><span class="garden-stamp">ARTICLE GARDEN</span><h3>把文章分成几片小叶子</h3><p>先选一个分类，再慢慢阅读这一片里的内容。</p></div>
                <div class="garden-category-grid">
                  <button v-for="group in gardenGroups" :key="group.name" class="garden-category-node" type="button" :aria-label="`筛选 ${group.name} 分类，共 ${group.count} 篇文章`" @click="selectCategory(group.name)"><span>{{ group.name }}</span><small>{{ group.count }} 篇文章</small></button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="garden-category-header"><span class="garden-stamp">SELECTED CATEGORY</span><h3>{{ selectedCategory }}</h3><span>{{ selectedCategoryCount }} 篇文章</span></div>
              <div v-if="gardenNodes.length" class="garden-article-grid">
                <NuxtLink v-for="node in gardenNodes" :key="node.key" class="garden-article-card" :class="{ 'is-active': activeArticleId === node.articleId }" :to="`/posts/${node.article.id}`" :aria-label="`${node.article.title}，分类：${node.category}`" @mouseenter="activeArticleId = node.articleId" @mouseleave="activeArticleId = ''" @focus="activeArticleId = node.articleId" @blur="activeArticleId = ''"><img src="/images/ui/handmade/leaf.webp" alt="" width="34" height="40"><span><strong>{{ node.article.title }}</strong><small>{{ articleDate(node.article.published_at || node.article.updated_at) }}<template v-if="node.tag"> · # {{ node.tag }}</template></small></span></NuxtLink>
              </div>
            </template>
          </div>
          <aside class="garden-note" aria-live="polite">
            <template v-if="activeArticle">
              <p class="card-kicker">selected leaf</p><h3>{{ activeArticle.article.title }}</h3><span>{{ activeArticle.category }}<template v-if="activeArticle.tag"> · # {{ activeArticle.tag }}</template></span><p>{{ activeArticle.article.article_description || '这片叶子还没有写下摘要。' }}</p><NuxtLink :to="`/posts/${activeArticle.article.id}`">打开文章</NuxtLink>
            </template>
            <template v-else-if="selectedCategory !== '全部'">
              <p class="card-kicker">inside this category</p><h3>{{ selectedCategory }}</h3><p>这里收好最近的 {{ selectedCategoryCount }} 篇文章。选择一张便签，查看它留下的摘要。</p>
            </template>
            <template v-else>
              <p class="card-kicker">how to read it</p><h3>先选择一张纸</h3><p>默认只展示文章分类。点击一张分类纸张，才会展开它的文章叶片。</p>
            </template>
          </aside>
        </div>
      </div><EmptyState v-else title="文章关系还在生长中" message="有了文章之后，这里会生成一张可点击的关系地图。" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Article, Category, Tag } from '~/types/api'
import { v1LabTools } from '~/data/lab-tools'
import { articleDate, normalizeTag } from '~/utils/blog'
const v1Tools = v1LabTools
function labToolIconStyle(icon: string) {
  return icon.startsWith('/') ? { backgroundImage: `url(${icon})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundColor: 'transparent' } : undefined
}
const labToolCategoryLabels: Record<string, string> = {
  image: '图片工具',
  creator: '创作工具',
  query: '查询工具',
  developer: '开发工具',
  experiment: '实验工具',
}
const labToolUsageLabels: Record<string, string> = {
  image: '无需上传',
  cover: '本地生成',
  color: '本地取色',
  weather: '联网查询',
  ip: '联网查询',
  qr: '本地生成',
  dev: '本地处理',
}
const api = useBlogApi()
const { data } = await useAsyncData('lab-articles', async () => {
  const results = await Promise.allSettled([api.articles(), api.categories(), api.tags()])
  return {
    articles: results[0].status === 'fulfilled' ? results[0].value : [],
    categories: results[1].status === 'fulfilled' ? results[1].value : [],
    tags: results[2].status === 'fulfilled' ? results[2].value : [],
  }
})
const articles = computed(() => (data.value?.articles || []) as Article[])
const categoryNames = computed(() => new Map(((data.value?.categories || []) as Category[]).map((category) => [String(category.id), String(category.name || category.category_name || category.slug || '').trim()])))
const tagNames = computed(() => new Map(((data.value?.tags || []) as Tag[]).map((tag) => [String(tag.id), normalizeTag(tag).name])))
function articleCategory(article: Article) {
  const raw = String(article.category || '').trim()
  return categoryNames.value.get(raw) || (/^\d+$/.test(raw) ? '未分类' : raw) || '未分类'
}
function articleTag(article: Article) {
  const raw = String(article.article_tags?.[0] || '').trim()
  return tagNames.value.get(raw) || (/^\d+$/.test(raw) ? '' : raw)
}
const sortedArticles = computed(() => [...articles.value].sort((a, b) => new Date(b.published_at || b.updated_at).getTime() - new Date(a.published_at || a.updated_at).getTime()))
const sourceGroups = computed(() => {
  const groups = new Map<string, Article[]>()
  sortedArticles.value.forEach((article) => {
    const name = articleCategory(article)
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name)!.push(article)
  })
  return [...groups.entries()].map(([name, items]) => ({ name, count: items.length, items })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
})
const gardenCategories = computed(() => [{ name: '全部', count: articles.value.length }, ...sourceGroups.value.map((group) => ({ name: group.name, count: group.count }))])
const selectedCategory = ref('全部')
const activeArticleId = ref('')
const gardenGroups = computed(() => {
  const groups = selectedCategory.value === '全部' ? sourceGroups.value.slice(0, 8) : sourceGroups.value.filter((group) => group.name === selectedCategory.value)
  return groups
})
const gardenNodes = computed(() => gardenGroups.value.flatMap((group) => group.items.slice(0, selectedCategory.value === '全部' ? 0 : 6).map((article) => {
  return { key: `${group.name}-${article.id}`, article, articleId: String(article.id), category: group.name, tag: articleTag(article) }
})))
const selectedCategoryCount = computed(() => selectedCategory.value === '全部' ? articles.value.length : sourceGroups.value.find((group) => group.name === selectedCategory.value)?.count || 0)
const gardenSummary = computed(() => selectedCategory.value === '全部' ? `展示 ${gardenGroups.value.length} 个分类 · 共 ${articles.value.length} 篇文章` : `展示 ${gardenNodes.value.length} 篇 · 共 ${selectedCategoryCount.value} 篇`)
const activeArticle = computed(() => gardenNodes.value.find((node) => node.articleId === activeArticleId.value))
function selectCategory(name: string) { selectedCategory.value = name; activeArticleId.value = '' }
const { state: rewardState, rewards, clear: clearReadingRecords } = useReadingRewards()
interface PalettePreset {
  id: string
  name: string
  description: string
  paper: string
  olive: string
  brown: string
  radius: number
  shadow: number
  tape: 'plain' | 'polka'
}

const palettePresets: PalettePreset[] = [
  { id: 'journal', name: '奶油手账', description: '柔和、温暖', paper: '#f7f0df', olive: '#69733e', brown: '#6b4328', radius: 18, shadow: 14, tape: 'polka' },
  { id: 'study', name: '橄榄书房', description: '安静、沉稳', paper: '#e9ead5', olive: '#4f6339', brown: '#493b2d', radius: 14, shadow: 11, tape: 'plain' },
  { id: 'night', name: '夜间墨纸', description: '深色、克制', paper: '#26382d', olive: '#a9b16b', brown: '#eadbb8', radius: 16, shadow: 20, tape: 'plain' },
  { id: 'newspaper', name: '旧报纸', description: '复古、轻脆', paper: '#eee3c8', olive: '#7d6b3f', brown: '#5b4633', radius: 8, shadow: 9, tape: 'polka' },
]
const defaultPalette = palettePresets[0]
const palette = reactive<PalettePreset>({ ...defaultPalette })
const activePreset = ref(defaultPalette.id)
const paletteSaved = ref(false)
const paletteStorageKey = 'levi-blog:lab-palette:v1'
let applyingPreset = false
let paletteSavedTimer: ReturnType<typeof setTimeout> | null = null
const activePresetName = computed(() => activePreset.value === 'custom' ? '自定义方案' : palettePresets.find((preset) => preset.id === activePreset.value)?.name || '自定义方案')
const copied = ref(false)
const paletteStyle = computed(() => ({
  '--lab-paper': palette.paper,
  '--lab-olive': palette.olive,
  '--lab-brown': palette.brown,
  '--lab-radius': `${palette.radius}px`,
  '--lab-shadow': `0 ${Math.round(palette.shadow / 2)}px ${palette.shadow}px rgba(75, 56, 27, ${palette.shadow / 100})`,
}))
const contrastScore = computed(() => Math.round(contrastRatio(palette.paper, palette.brown) * 10) / 10)
const cssVariables = computed(() => `:root {\n  --paper: ${palette.paper};\n  --olive: ${palette.olive};\n  --brown: ${palette.brown};\n  --radius: ${palette.radius}px;\n  --shadow: 0 ${Math.round(palette.shadow / 2)}px ${palette.shadow}px rgba(75, 56, 27, ${(palette.shadow / 100).toFixed(2)});\n  --tape: ${palette.tape};\n}`)

function applyPreset(preset: PalettePreset) {
  applyingPreset = true
  Object.assign(palette, preset)
  activePreset.value = preset.id
  nextTick(() => { applyingPreset = false })
}
function resetPalette() { applyPreset(defaultPalette); paletteSaved.value = false }
function savePalette() {
  if (!import.meta.client) return
  try { localStorage.setItem(paletteStorageKey, JSON.stringify({ ...palette })); paletteSaved.value = true; if (paletteSavedTimer) clearTimeout(paletteSavedTimer); paletteSavedTimer = window.setTimeout(() => { paletteSaved.value = false }, 1800) } catch {}
}
function hexToRgb(value: string) {
  const hex = value.replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map((part) => part + part).join('') : hex
  const number = Number.parseInt(normalized, 16)
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 }
}
function contrastRatio(first: string, second: string) {
  const luminance = (value: string) => {
    const rgb = hexToRgb(value)
    return [rgb.r, rgb.g, rgb.b].reduce((sum, channel, index) => {
      const normalized = channel / 255
      const linear = normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4
      return sum + linear * [0.2126, 0.7152, 0.0722][index]
    }, 0)
  }
  const lighter = luminance(first)
  const darker = luminance(second)
  return (Math.max(lighter, darker) + .05) / (Math.min(lighter, darker) + .05)
}

interface MarkdownTool {
  label: string
  hint: string
  before: string
  after: string
  placeholder: string
}

const markdownExamples: Record<string, string> = {
  journal: '## 一页小记\n\n今天也写下了一点东西。\n\n- 保持好奇\n- 慢慢完成\n\n> 每一页都算数。',
  article: '# 把想法放进文章\n\n先写下一个清晰的开头，再让内容慢慢长出来。\n\n### 今天留下的三件事\n\n1. 记录一个问题\n2. 找到一个答案\n3. 把它分享出去\n\n[继续阅读](/articles)',
  code: '## 一段代码笔记\n\n```ts\nconst keepGoing = true\n\nif (keepGoing) {\n  console.log("慢慢完成")\n}\n```\n\n> 好的工具应该让思路更清楚。',
}
const markdownTools: MarkdownTool[] = [
  { label: 'H2', hint: '插入二级标题', before: '## ', after: '', placeholder: '小标题' },
  { label: 'B', hint: '插入粗体文字', before: '**', after: '**', placeholder: '重点文字' },
  { label: 'I', hint: '插入斜体文字', before: '*', after: '*', placeholder: '补充说明' },
  { label: '引', hint: '插入引用', before: '> ', after: '', placeholder: '一句值得留下的话' },
  { label: '列', hint: '插入列表', before: '- ', after: '', placeholder: '列表项' },
  { label: '</>', hint: '插入代码块', before: '```\n', after: '\n```', placeholder: 'code' },
  { label: '链', hint: '插入链接', before: '[', after: '](https://)', placeholder: '链接文字' },
]
const markdown = ref(markdownExamples.journal)
const selectedExample = ref('journal')
const markdownInput = ref<HTMLTextAreaElement>()
const markdownCopied = ref(false)
const markdownMobileView = ref<'edit' | 'preview'>('edit')
const markdownWordCount = computed(() => markdown.value.replace(/\s/g, '').length)
const markdownHeadingCount = computed(() => (markdown.value.match(/^#{1,6}\s+/gm) || []).length)
const markdownReadingTime = computed(() => Math.max(1, Math.ceil(markdownWordCount.value / 350)))

function applyMarkdownExample() { markdown.value = markdownExamples[selectedExample.value] || markdownExamples.journal; markdownMobileView.value = 'edit' }
function clearMarkdown() { markdown.value = ''; markdownMobileView.value = 'edit' }
function insertMarkdown(tool: MarkdownTool) {
  const input = markdownInput.value
  const start = input?.selectionStart ?? markdown.value.length
  const end = input?.selectionEnd ?? start
  const selected = markdown.value.slice(start, end)
  const content = selected || tool.placeholder
  markdown.value = `${markdown.value.slice(0, start)}${tool.before}${content}${tool.after}${markdown.value.slice(end)}`
  nextTick(() => { input?.focus(); input?.setSelectionRange(start + tool.before.length, start + tool.before.length + content.length) })
}
async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value)
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copiedValue = document.execCommand('copy')
  textarea.remove()
  if (!copiedValue) throw new Error('copy failed')
}
async function copyCss() { try { await copyToClipboard(cssVariables.value); copied.value = true; window.setTimeout(() => { copied.value = false }, 1500) } catch {} }
async function copyMarkdown() { try { await copyToClipboard(markdown.value); markdownCopied.value = true; window.setTimeout(() => { markdownCopied.value = false }, 1500) } catch {} }
function clearRewards() { if (window.confirm('确定清空本地阅读记录和已解锁奖励吗？')) clearReadingRecords() }
watch(palette, () => { if (!applyingPreset) activePreset.value = 'custom' }, { deep: true })
onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem(paletteStorageKey) || 'null')
    if (saved && typeof saved === 'object') { Object.assign(palette, { ...defaultPalette, ...saved }); activePreset.value = 'custom' }
  } catch {}
})
onBeforeUnmount(() => { if (paletteSavedTimer) clearTimeout(paletteSavedTimer) })
useBlogSeo({ title: '手账实验室', description: '在 Levi Lab 里处理图片、生成手账封面、提取照片色板，也可以继续探索博客里的纸张、Markdown 和文章实验。', canonical: '/lab', keywords: 'Levi Lab,图片压缩,封面生成,图片取色,手账工具', breadcrumbs: [{ name: '手账实验室', path: '/lab' }] })
</script>
