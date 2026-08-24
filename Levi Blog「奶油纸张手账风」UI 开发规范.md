# Levi Blog「奶油纸张手账风」UI 开发规范

> 版本：UI Spec v1.0  
> 设计基准：1536 × 1024 Desktop  
> 产品类型：个人博客 / 技术博客 / 摄影记录 / 生活手账  
> 视觉关键词：**奶油纸张、手账、温暖、自然、轻复古、克制、技术 × 生活**

---

# 1. 项目目标

将 Levi Blog 打造成一个具有明显个人辨识度的博客首页。

博客需要同时承载：

- 前端开发文章
- 技术项目
- 摄影作品
- 旅行记录
- 生活随笔
- 猫咪日常
- 个人介绍
- 社交平台
- 当前项目进度

整体不能设计成传统技术文档站，也不能过度卡通化。

核心视觉定位：

> **像一本放在书桌上的数字手账。**

页面要同时体现：

- 开发者的专业感
- 摄影爱好者的审美
- 生活记录者的温度
- 猫咪元素带来的轻松感

整体设计比例建议：

**专业内容 70% + 手账氛围 20% + 个性装饰 10%。**

---

# 2. 整体视觉方向

## 2.1 风格名称

**Warm Digital Journal**

中文可定义为：

**奶油纸张数字手账风**

---

## 2.2 核心视觉特征

页面大量采用：

- 奶油白
- 米白
- 暖灰
- 橄榄绿
- 咖啡棕

避免：

- 高饱和颜色
- 纯白大面积背景
- 纯黑
- 科技霓虹
- 大面积蓝色
- 强烈渐变

页面质感主要来自：

1. 纸张纹理
2. 微弱阴影
3. 不完全规整的纸张边缘
4. 胶带
5. 手写字体
6. Polaroid 照片
7. 笔记本
8. 摄影照片
9. 留白

---

# 3. 基础设计尺寸

设计稿基准：

```text
Viewport
1536 × 1024
```

网页实际开发采用：

```css
max-width: 1456px;
margin: 0 auto;
padding-inline: 24px;
```

推荐：

```css
--page-max-width: 1456px;
```

桌面端实际有效内容区域约：

```text
1450px
```

---

# 4. 页面整体 Grid

Desktop 页面主体采用：

```text
┌───────────────────────────────────────────────┐
│ Header                                        │
├───────────────────────────────┬───────────────┤
│                               │               │
│       Main Content            │    Sidebar    │
│                               │               │
├───────────────────────────────┴───────────────┤
│ Footer                                        │
└───────────────────────────────────────────────┘
```

推荐 CSS：

```css
.page-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 400px;
  gap: 24px;
}
```

1536px 设计稿下：

```text
Main Content：约 1008px
Sidebar：约 400px
Gap：24px
```

---

# 5. Design Tokens

## 5.1 主色

### 页面背景

```css
--bg-page: #F7F1E7;
```

用于：

- Body
- 页面基础背景

---

### 主卡片背景

```css
--bg-surface: #FFFDF8;
```

用于：

- Header
- Sidebar
- Article Card
- Project Card

---

### 手账纸张

```css
--bg-paper: #F5EDDF;
```

用于：

- Hero 左侧纸张
- Section Label
- Note Card

---

### 浅卡片底色

```css
--bg-soft: #FAF6EE;
```

---

# 6. 品牌色

## Primary Olive

```css
--primary: #70783E;
```

用于：

- 主按钮
- 当前导航
- 标签
- Progress
- Link Hover

Hover：

```css
--primary-hover: #5E6633;
```

Pressed：

```css
--primary-active: #50572B;
```

浅背景：

```css
--primary-soft: #ECEBD8;
```

---

# 7. 辅助色

## Warm Brown

```css
--brown: #6A4C31;
```

---

## Accent Brown

```css
--brown-soft: #A88B6A;
```

---

## Warm Orange

用于旅行、生活标签。

```css
--orange: #C78A46;
```

---

## Soft Blue

用于：

- 项目图标
- 少量系统功能状态

```css
--blue: #6E8AA4;
```

---

# 8. 文字颜色

Primary：

```css
--text-primary: #29231D;
```

Secondary：

```css
--text-secondary: #71685E;
```

Tertiary：

```css
--text-tertiary: #9A9085;
```

Disabled：

```css
--text-disabled: #B9B0A6;
```

---

# 9. Border

默认 Border：

```css
--border: #E6DDD0;
```

弱 Border：

```css
--border-soft: #EEE7DD;
```

建议：

```css
border: 1px solid var(--border-soft);
```

不要使用：

```text
#ddd
#ccc
#eee
```

这些冷灰会破坏整体暖色调。

---

# 10. Shadow

整个项目禁止使用明显的 Material Design 大阴影。

推荐：

## Small

```css
box-shadow:
  0 2px 8px rgba(70, 52, 35, 0.04);
```

## Card

```css
box-shadow:
  0 8px 24px rgba(70, 52, 35, 0.07);
```

## Hover

```css
box-shadow:
  0 12px 32px rgba(70, 52, 35, 0.11);
```

---

# 11. Border Radius

统一 Radius 系统。

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-pill: 999px;
```

建议：

| 元素 | Radius |
|---|---|
| Button | 10px |
| Tag | 8px |
| Search | 12px |
| Article | 14px |
| Sidebar Card | 16px |
| Hero | 18px |
| Avatar | 50% |

---

# 12. Spacing System

严格采用 4px Grid。

```text
4
8
12
16
20
24
32
40
48
64
80
```

禁止出现：

```text
13px
17px
23px
27px
```

等不规则间距。

---

# 13. Typography

## 13.1 UI 正文字体

推荐：

```css
font-family:
  "Noto Sans SC",
  "PingFang SC",
  "Microsoft YaHei",
  sans-serif;
```

---

# 14. 手写字体

Hero 主标题以及 Logo 可以使用：

```text
LXGW WenKai
```

或者：

```text
霞鹜文楷
```

Logo 英文字体可使用：

```text
Kalam
Caveat
```

注意：

**手写字体只能用于：**

- Logo
- Hero 标题
- 手账小纸条
- 极少量 Quote

不能用于：

- Article Body
- Navigation
- Metadata
- Button

---

# 15. 字体等级

## H1

```css
font-size: 48px;
line-height: 1.35;
font-weight: 600;
```

---

## H2

```css
font-size: 24px;
line-height: 1.4;
font-weight: 600;
```

---

## H3

```css
font-size: 18px;
line-height: 1.5;
font-weight: 600;
```

---

## Body Large

```css
font-size: 16px;
line-height: 1.75;
```

---

## Body

```css
font-size: 14px;
line-height: 1.7;
```

---

## Caption

```css
font-size: 12px;
line-height: 1.5;
```

---

# 16. Header

Desktop Header：

```text
高度：96px
```

建议：

```css
.header {
  height: 96px;
}
```

内部布局：

```text
Logo                     Navigation                 Tools
```

---

# 17. Logo

左侧：

```text
[Notebook Icon]
Levi Blog
记录代码，也记录生活
```

尺寸：

Notebook：

```text
40 × 40
```

Logo：

```text
30px
```

Subtitle：

```text
12px
```

---

# 18. Navigation

导航：

```text
首页
文章
归档
作品
留言
关于
```

间距：

```text
40px
```

字体：

```text
16px
```

Default：

```css
color: var(--text-primary);
```

Active：

```css
color: var(--primary);
```

底部：

```css
width: 40px;
height: 2px;
background: var(--primary);
```

---

# 19. Navigation Hover

Hover：

```css
.nav-item {
  transition:
    color 180ms ease,
    transform 180ms ease;
}
```

Hover：

```css
color: var(--primary);
transform: translateY(-1px);
```

不要：

- 放大
- 强烈 glow
- 高饱和动画

---

# 20. Search

尺寸建议：

```text
230 × 44
```

样式：

```css
background: rgba(255,255,255,.3);
border: 1px solid var(--border);
border-radius: 12px;
```

Placeholder：

```text
搜索文章、标签...
```

Focus：

```css
border-color: var(--primary);
box-shadow:
  0 0 0 3px rgba(112,120,62,.1);
```

---

# 21. Subscribe Button

尺寸：

```text
104 × 44
```

内容：

```text
✉ 订阅
```

Default：

```css
background: var(--primary);
color: #fff;
```

Hover：

```css
background: var(--primary-hover);
transform: translateY(-1px);
```

---

# 22. Theme Toggle

尺寸：

```text
44 × 44
```

默认：

```text
☾
```

Hover：

```css
background: #F1E7D8;
```

点击：

切换：

```text
Light
Dark
System
```

推荐使用：

```text
Light / Dark
```

两种即可。

---

# 23. Hero

位置：

```text
Main Column Top
```

尺寸：

```text
约 1008 × 454px
```

布局：

```text
┌─────────────────────────────────────────┐
│ Paper Copy          Desk Photography    │
│                                         │
│ H1                 Code / Camera        │
│ Description                             │
│ Button                                  │
│ Note                                    │
└─────────────────────────────────────────┘
```

---

# 24. Hero Background

建议 Hero 为一张完整视觉背景。

不是简单：

```text
左文字 + 右图片
```

而是：

```text
纸张与摄影场景自然融合
```

建议 Background：

```text
桌面
笔记本
Laptop
Camera
Coffee
Polaroid
Plant
```

---

# 25. Hero 左侧 Paper

Paper 宽约：

```text
50%
```

内部 Padding：

```text
48px
```

标题：

```text
记录代码，
也记录生活里的风景
```

“风景”使用：

```css
color: var(--primary);
```

并增加：

```text
手绘式 underline
```

---

# 26. Hero Description

内容：

```text
这里是 Levi 的数字笔记本，我用代码构建世界，
也用镜头和文字收藏生活的温度。
```

建议宽度：

```text
460px
```

颜色：

```css
color: var(--text-secondary);
```

---

# 27. Hero CTA

Primary：

```text
阅读最新文章
```

Secondary：

```text
浏览所有归档
```

尺寸：

```text
Primary
180 × 52

Secondary
190 × 52
```

---

# 28. Hero CTA Hover

Primary：

```css
transform: translateY(-2px);
box-shadow:
  0 8px 18px rgba(90, 92, 48, .18);
```

Secondary：

```css
background: #F7EFE2;
border-color: #CFC2AD;
```

---

# 29. Hero Note

小纸条：

```text
Keep coding.
Keep exploring.
```

样式：

```text
撕边纸张
+
胶带
+
小叶片图标
```

可以轻微旋转：

```css
transform: rotate(-1.5deg);
```

Hover：

```css
transform:
  rotate(-1deg)
  translateY(-2px);
```

---

# 30. Desk Visual

Hero 右侧元素：

```text
Laptop
Camera
Coffee
Notebook
Pencil
Polaroid
Plant
```

建议 Hero 图片比例：

```text
16:9
```

实际素材建议：

```text
1920 × 1080
```

---

# 31. Laptop

Screen 内容建议显示：

```js
const life = {
  learn: true,
  share: true,
  enjoy: true
}

function build() {
  return 'Better Together'
}
```

注意：

代码内容只作为氛围。

不能成为 Hero 的主要视觉焦点。

---

# 32. Sidebar

宽度：

```text
400px
```

组件：

```text
Profile
Projects
Categories
```

Gap：

```text
20px
```

---

# 33. Profile Card

高度：

```text
约 365px
```

Padding：

```text
24px
```

Radius：

```text
16px
```

---

# 34. Profile Header

布局：

```text
Avatar    Levi
          全栈开发者
```

Avatar：

```text
112 × 112
```

推荐：

```text
人物 + 猫咪
```

照片风格：

```text
暖色
自然光
低饱和
```

---

# 35. Profile Copy

示例：

```text
热爱技术，喜欢记录
相信分享与热爱能让世界更美好。
```

建议：

```css
font-size: 14px;
line-height: 1.7;
```

---

# 36. Skill Tags

例如：

```text
Vue 3
TypeScript
Node.js
摄影
旅行
猫咪
```

Tag：

```css
height: 32px;
padding: 0 16px;

background: #EEEAD7;
border-radius: 16px;
```

Hover：

```css
background: #E3E1C5;
transform: translateY(-1px);
```

---

# 37. Social Buttons

Social：

```text
GitHub
知乎
掘金
Bilibili
小红书
微信
```

Icon：

```text
40 × 40
```

推荐使用品牌色。

但默认状态：

```css
filter: saturate(.85);
```

Hover：

```css
transform:
  translateY(-3px)
  scale(1.04);

filter: saturate(1);
```

---

# 38. Projects Card

Section：

```text
进行中的项目
```

推荐高度：

```text
268px
```

内容：

```text
LeviBlog 2.0
照片管理工具
旅行足迹地图
```

---

# 39. Project Item

结构：

```text
Icon
Project
Description

Status                     Progress
████████                  65%
```

高度：

```text
70px
```

---

# 40. Project Status

状态：

```text
进行中
规划中
已完成
暂停
```

颜色：

进行中：

```css
background: #E9E9D0;
color: #6B7438;
```

规划中：

```css
background: #F4E6D3;
color: #AF7135;
```

已完成：

```css
background: #E5EFE5;
color: #587758;
```

---

# 41. Progress

高度：

```text
4px
```

Track：

```css
background: #EEE7DC;
```

Fill：

```css
background: var(--primary);
```

动画：

```css
transition:
  width 600ms cubic-bezier(.2,.8,.2,1);
```

进入 viewport 后：

```text
0 → actual progress
```

---

# 42. Category Card

标题：

```text
文章分类
```

分类：

```text
开发技术      32
摄影随笔      18
生活日常      21
旅行记录      15
资源分享       9
```

Item：

```text
44px height
```

Hover：

```css
background: #F7F1E7;
padding-left: 8px;
```

右侧 Count：

```text
小型 Pill
```

---

# 43. Latest Articles Section

位置：

```text
Hero 下方
```

标题：

```text
最新文章
```

标题本身使用：

```text
撕纸 Label
```

右侧：

```text
查看全部文章 →
```

---

# 44. Article Grid

Desktop：

```css
grid-template-columns:
  repeat(3, minmax(0, 1fr));
gap: 20px;
```

---

# 45. Article Card

结构：

```text
Image
Category
Bookmark

Title

Excerpt

Meta

Tags
```

---

# 46. Article Image

尺寸：

```text
100%
约 160px
```

建议比例：

```text
16:9
```

```css
object-fit: cover;
```

---

# 47. Article Image Hover

```css
.image {
  transition: transform 400ms ease;
}
```

Hover Card：

```css
.image {
  transform: scale(1.035);
}
```

图片必须：

```css
overflow: hidden;
```

---

# 48. Card Hover

```css
.article-card {
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}
```

Hover：

```css
transform: translateY(-4px);

box-shadow:
  0 14px 32px rgba(68, 51, 34, .10);
```

---

# 49. Article Category

例如：

```text
开发
摄影
生活
```

位置：

```text
图片左上
```

样式：

```css
backdrop-filter: blur(8px);
```

开发：

```text
Olive
```

摄影：

```text
Muted Olive
```

生活：

```text
Warm Brown
```

---

# 50. Bookmark

位置：

```text
右上角
```

尺寸：

```text
32 × 32
```

Default：

```text
Outline bookmark
```

Hover：

```text
Primary
```

Saved：

```text
Filled Primary
```

点击：

```text
Scale 1 → 1.15 → 1
```

Duration：

```text
180ms
```

---

# 51. Article Title

```css
font-size: 18px;
font-weight: 600;
line-height: 1.5;
```

最多：

```text
2 行
```

```css
-webkit-line-clamp: 2;
```

---

# 52. Article Description

```css
font-size: 13px;
line-height: 1.7;
color: var(--text-secondary);
```

最多：

```text
2 行
```

---

# 53. Article Meta

结构：

```text
Avatar
Levi
Date
Views
Comments
```

字体：

```text
12px
```

颜色：

```text
Tertiary
```

---

# 54. Article Tags

例：

```text
Vue3
TypeScript
前端工程化
```

建议最多：

```text
3 个
```

不要超过。

---

# 55. Section Label

设计稿中：

```text
最新文章
文章分类
进行中的项目
```

均采用：

```text
Tape / Paper Label
```

推荐实现：

```css
background: #F4EBDC;
border-radius: 4px;
```

使用：

```css
::before
```

模拟：

```text
胶带
```

---

# 56. 背景纸张纹理

整个页面添加极弱纹理。

推荐：

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;

  opacity: .025;

  background-image:
    url('/textures/paper-noise.webp');
}
```

Opacity：

```text
0.02–0.04
```

不能超过：

```text
0.05
```

否则会影响阅读。

---

# 57. 胶带

Tape 建议使用 CSS，而不是大量 PNG。

```css
.tape {
  background:
    rgba(210,190,150,.45);

  backdrop-filter: blur(2px);
}
```

Rotation：

```text
-4° ~ 4°
```

---

# 58. Polaroid

尺寸：

```text
120 × 100
```

Rotation：

```text
-2°
```

Hover：

```text
rotate(0)
scale(1.02)
```

---

# 59. Interaction Philosophy

整个网站动效关键词：

```text
Soft
Slow
Natural
Paper
```

不要：

```text
Bounce
Elastic
Neon
Strong Scale
Heavy Parallax
```

---

# 60. Animation Duration

Small：

```text
160ms
```

Normal：

```text
220ms
```

Large：

```text
400ms
```

Page：

```text
500ms
```

---

# 61. Easing

统一：

```css
cubic-bezier(.2,.8,.2,1)
```

CSS：

```css
--ease-out:
  cubic-bezier(.2,.8,.2,1);
```

---

# 62. Page Entry Animation

页面加载：

Header：

```text
opacity 0 → 1
translateY(-8 → 0)
```

Hero：

```text
opacity 0 → 1
translateY(12 → 0)
```

Articles：

逐个：

```text
60ms stagger
```

注意：

总动画时间不要超过：

```text
700ms
```

---

# 63. Hero Parallax

允许非常轻微。

鼠标移动：

```text
Camera
Notebook
Polaroid
```

位移范围：

```text
2–5px
```

不要：

```text
10px+
```

---

# 64. Scroll Reveal

文章卡：

进入 viewport：

```text
opacity:
0 → 1

translateY:
12 → 0
```

Duration：

```text
400ms
```

---

# 65. Back To Top

Desktop：

右下：

```text
52 × 52
```

背景：

```css
background: var(--primary);
```

Icon：

```text
↑
```

出现：

```text
scrollY > 500
```

进入：

```text
opacity + scale
```

---

# 66. Loading State

Article Card Skeleton：

```text
Image Placeholder
2 Title Lines
2 Text Lines
Meta
```

颜色：

```css
#EEE5D8
#F6EFE5
```

Shimmer：

非常弱。

---

# 67. Empty State

例如没有文章：

```text
一本空白笔记本
```

文案：

```text
这里还没有留下文字。
```

按钮：

```text
返回首页
```

---

# 68. Error State

推荐：

```text
纸张撕裂插图
```

文案：

```text
这页笔记好像被风吹走了。
```

CTA：

```text
返回首页
```

---

# 69. Responsive

## Desktop XL

```text
>= 1440px
```

布局：

```text
Main + Sidebar
3 Article Cards
```

---

# 70. Desktop

```text
1200–1439px
```

Sidebar：

```text
340px
```

主区：

```text
剩余宽度
```

Article：

```text
3 columns
```

Hero H1：

```text
42px
```

---

# 71. Tablet

```text
768–1199px
```

布局：

```text
Hero
Profile

Articles
Projects
Categories
```

Sidebar 取消固定右栏。

建议：

```css
grid-template-columns: 1fr;
```

Profile / Projects：

```text
2 columns
```

Article：

```text
2 columns
```

---

# 72. Mobile

```text
< 768px
```

Header：

```text
Logo
Search
Menu
```

Desktop Nav 隐藏。

Hero：

```text
单列
```

Desk Image：

放 Hero 下半部分。

H1：

```text
32px
```

Article：

```text
1 column
```

Sidebar：

```text
Profile
Projects
Categories
```

顺序移动到文章下面。

---

# 73. Mobile Header

高度：

```text
64px
```

布局：

```text
Logo              Search   ☰
```

Drawer：

```text
首页
文章
归档
作品
留言
关于
```

---

# 74. Mobile Hero

避免完整复制 Desktop Hero。

移动端重新排版：

```text
Paper Title
Description
CTA

Desk Image
```

Hero 图片高度：

```text
220–260px
```

---

# 75. Mobile Article

建议：

```text
Image
Title
Description
Meta
```

不要桌面三列硬压缩。

---

# 76. Accessibility

所有正文最小：

```text
14px
```

Meta：

最低：

```text
12px
```

Interactive target：

```text
>= 40 × 40
```

Mobile：

```text
>= 44 × 44
```

---

# 77. Focus State

所有：

```text
Button
Link
Input
Card Link
Social Button
```

必须提供：

```css
outline:
  2px solid var(--primary);

outline-offset:
  3px;
```

---

# 78. Reduced Motion

必须支持：

```css
@media
(prefers-reduced-motion: reduce)
```

关闭：

```text
Parallax
Scale
Scroll Reveal
Progress Animation
```

---

# 79. Dark Mode

虽然本设计以 Light 为主，但 Header 已有夜间按钮。

建议提供 Dark Theme。

背景：

```css
--bg-page: #1F1D19;
```

Surface：

```css
--bg-surface: #292620;
```

Paper：

```css
--bg-paper: #312D26;
```

Text：

```css
--text-primary: #EEE7DD;
```

Primary：

```css
--primary: #98A064;
```

Dark Mode 不使用：

```text
纯黑 #000
```

仍然保留：

```text
Warm Dark Brown
```

---

# 80. Recommended Components

如果使用 Vue / Nuxt：

```text
components/
│
├─ layout/
│  ├─ BlogHeader.vue
│  ├─ BlogFooter.vue
│  ├─ MobileNav.vue
│  └─ Sidebar.vue
│
├─ home/
│  ├─ HeroJournal.vue
│  ├─ ProfileCard.vue
│  ├─ ProjectProgress.vue
│  ├─ CategoryList.vue
│  └─ LatestArticles.vue
│
├─ article/
│  ├─ ArticleCard.vue
│  ├─ ArticleMeta.vue
│  ├─ ArticleTag.vue
│  └─ BookmarkButton.vue
│
└─ ui/
   ├─ Button.vue
   ├─ Tag.vue
   ├─ SearchBox.vue
   ├─ SocialIcon.vue
   ├─ PaperLabel.vue
   ├─ ProgressBar.vue
   ├─ ThemeToggle.vue
   └─ BackToTop.vue
```

---

# 81. 推荐页面结构

```text
pages/
├─ index.vue
├─ articles/
│  ├─ index.vue
│  └─ [slug].vue
├─ archive.vue
├─ projects.vue
├─ photography.vue
├─ about.vue
└─ message.vue
```

---

# 82. 首页结构

```vue
<BlogLayout>

  <BlogHeader />

  <main class="page-grid">

    <section>

      <HeroJournal />

      <LatestArticles />

    </section>

    <aside>

      <ProfileCard />

      <ProjectProgress />

      <CategoryList />

    </aside>

  </main>

  <BlogFooter />

  <BackToTop />

</BlogLayout>
```

---

# 83. Article Data Model

建议：

```ts
interface Article {
  id: string
  slug: string

  title: string
  description: string

  cover: string

  category: {
    id: string
    name: string
  }

  tags: string[]

  publishedAt: string

  views: number
  comments: number

  readingTime: number

  featured?: boolean
  bookmarked?: boolean
}
```

---

# 84. Project Data

```ts
interface Project {
  id: string

  name: string
  description: string

  icon?: string

  status:
    | 'doing'
    | 'planning'
    | 'completed'
    | 'paused'

  progress: number

  url?: string
}
```

---

# 85. Category Data

```ts
interface Category {
  id: string

  name: string

  icon: string

  count: number

  color?: string
}
```

---

# 86. 首页 Article Example

```ts
[
  {
    title:
      'Vue 3 + TypeScript 实战：从零搭建一个高颜值的博客系统',

    category:
      '开发',

    tags: [
      'Vue 3',
      'TypeScript',
      '前端工程化'
    ]
  },

  {
    title:
      '春日胶片：富士拍下的温柔时光',

    category:
      '摄影',

    tags: [
      '胶片',
      '富士 XT5',
      '日本'
    ]
  },

  {
    title:
      '我家猫主子的日常：一只猫的幸福生活指南',

    category:
      '生活',

    tags: [
      '猫咪',
      '日常',
      '治愈'
    ]
  }
]
```

---

# 87. 图片规范

## Hero

```text
推荐：
1920 × 1080

最低：
1600 × 900
```

---

## Article Cover

```text
推荐：
1200 × 675
```

统一：

```text
16:9
```

---

## Avatar

```text
400 × 400
```

最终显示：

```text
112 × 112
```

---

## Polaroid

```text
900 × 700
```

裁切：

```text
4:3
```

---

# 88. 图片处理

必须：

```text
WebP / AVIF
```

推荐：

```text
AVIF
↓
WebP fallback
```

Article：

```text
lazy loading
```

Hero：

```text
priority load
```

---

# 89. Performance

目标：

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

Hero Image：

建议：

```text
< 250KB
```

Article：

```text
< 120KB
```

Avatar：

```text
< 60KB
```

---

# 90. CSS Architecture

推荐全部 Theme Token CSS Variable。

例如：

```css
:root {

  --color-page:
    #F7F1E7;

  --color-surface:
    #FFFDF8;

  --color-paper:
    #F5EDDF;

  --color-primary:
    #70783E;

  --color-primary-hover:
    #5E6633;

  --color-text:
    #29231D;

  --color-text-secondary:
    #71685E;

  --color-border:
    #E6DDD0;

}
```

不要在组件里大量：

```css
color: #xxx
```

硬编码。

---

# 91. 推荐技术栈

如果重新实现博客 UI：

```text
Nuxt 4
Vue 3
TypeScript
Pinia
Tailwind CSS
VueUse
Nuxt Image
```

Animation：

优先：

```text
CSS Transition
```

复杂场景才使用：

```text
Motion / GSAP
```

当前设计不需要大量 GSAP。

---

# 92. Icon

推荐：

```text
Lucide
```

或者：

```text
Iconify
```

整体 Icon：

```text
Stroke
```

建议：

```text
1.5px
```

不要同时出现：

```text
Filled
Outline
3D
Emoji
```

多种体系。

---

# 93. Hero 手账装饰

允许：

```text
Tape
Paper
Notebook
Polaroid
Leaf
Pencil
Coffee
Camera
```

数量控制：

```text
5–8 个视觉元素
```

禁止：

```text
20+ 装饰元素
```

---

# 94. 页面设计原则

整个 UI 最重要的不是：

```text
手账元素
```

而是：

```text
阅读体验
```

所以开发过程中任何元素如果影响：

- 文章阅读
- 信息层级
- 点击
- Accessibility
- 响应式

应该优先删除装饰。

---

# 95. 首页视觉优先级

视觉层级必须保持：

```text
1 Hero H1
2 Hero Photo
3 Latest Articles
4 Profile
5 Projects
6 Categories
7 Decorative Elements
```

绝不能：

```text
Decoration > Content
```

---

# 96. Desktop 首屏视觉目标

1536 × 1024 中：

用户无需滚动应该看到：

```text
Logo
Navigation

Hero

Profile

Latest Articles 标题
至少 2–3 个 Article Card

Projects
Categories
```

这也是当前设计稿的核心优势。

---

# 97. Hover Summary

## Navigation

```text
Text Olive
Underline Expand
```

## Button

```text
TranslateY -2
Shadow Increase
```

## Article

```text
TranslateY -4
Image Scale 1.035
Shadow Increase
```

## Tag

```text
Background Darken
```

## Social

```text
TranslateY -3
Saturation Increase
```

## Polaroid

```text
Rotate → 0
Scale 1.02
```

---

# 98. 建议新增交互

在当前设计稿基础上，实际开发建议增加：

### 1. Hero 小场景微动

Notebook / Camera / Polaroid：

```text
1–3px Mouse Parallax
```

---

### 2. Article Image

Hover：

```text
Slow Zoom
```

---

### 3. Bookmark

点击：

```text
Outline → Filled
```

---

### 4. Progress

进入 viewport：

```text
Animate 0 → percentage
```

---

### 5. Header

页面 Scroll：

```text
Background Blur
Shadow
```

例如：

```css
backdrop-filter:
  blur(16px);
```

---

### 6. Search

支持：

```text
Ctrl + K
⌘ + K
```

打开全局搜索。

---

### 7. Dark Mode

LocalStorage：

```text
theme
```

保存用户选择。

---

# 99. Header Sticky

建议：

```css
position: sticky;
top: 0;
z-index: 100;
```

顶部：

```text
transparent
```

Scroll > 30：

```text
奶油半透明背景
Backdrop Blur
Bottom Border
```

例如：

```css
background:
  rgba(247,241,231,.86);

backdrop-filter:
  blur(16px);
```

---

# 100. 最终开发验收标准

## Visual

- [ ] 页面主背景必须是暖奶油色，而不是纯白
- [ ] Hero 保留纸张 + 桌面摄影组合
- [ ] Logo 使用手账视觉语言
- [ ] 主色使用低饱和橄榄绿
- [ ] Card Shadow 克制
- [ ] 保持 4px Grid
- [ ] Card Radius 统一
- [ ] 所有 Icon 使用同一体系
- [ ] 装饰不抢文章内容
- [ ] Sidebar 与 Main 层级明显

## Interaction

- [ ] Navigation 有 Active 状态
- [ ] Button 有 Hover / Active / Focus
- [ ] Article Card 有 Hover
- [ ] Image 有轻微 Zoom
- [ ] Bookmark 可切换状态
- [ ] Project Progress 有动画
- [ ] Social Icons 有 Hover
- [ ] Search 支持 Focus
- [ ] Header 支持 Sticky
- [ ] Back To Top 正常工作

## Responsive

- [ ] 1440 Desktop 正常
- [ ] 1280 Desktop 正常
- [ ] 1024 Tablet 正常
- [ ] 768 Tablet 正常
- [ ] 390 Mobile 正常
- [ ] 375 Mobile 正常
- [ ] Mobile 不出现横向滚动

## Accessibility

- [ ] Keyboard Navigation 正常
- [ ] Focus Visible
- [ ] 图片有 Alt
- [ ] Button 有 aria-label
- [ ] Search 有 label
- [ ] Dark Mode Button 有 aria-label
- [ ] Contrast 合格
- [ ] 支持 prefers-reduced-motion

## Performance

- [ ] Hero Image 优化
- [ ] Article Images Lazy Load
- [ ] WebP / AVIF
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms

---

# 101. 最终效果定义

完成后的 Levi Blog 不应该像：

```text
普通技术博客模板
```

也不应该像：

```text
纯手账展示站
```

最终应该呈现：

> **一个前端开发者的数字生活手账。**

用户进入网站第一眼能够感受到：

```text
这是 Levi 的博客，
而不是套了一套模板的博客。
```

视觉上：

```text
奶油纸张
+
橄榄绿
+
摄影
+
代码
+
猫咪
+
个人项目
```

共同构成整个品牌语言。

所有后续页面，包括：

```text
文章列表
文章详情
项目
摄影
归档
留言
关于我
```

都应继续沿用这一套 Design Token 和手账视觉语言，避免不同页面重新设计成不同风格。