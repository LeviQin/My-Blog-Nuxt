# Levi Blog Nuxt

基于 Nuxt 4 的 SSR 个人博客前端，专注文章阅读、SEO、归档搜索、个人内容展示与轻量开发工具。

## 项目定位

Levi Blog Nuxt 使用 Nuxt 4 和 Vue 3 构建，提供响应式博客页面、Markdown 文章阅读体验、主题切换、站点搜索、友链、作品集和实验性工具页面。

项目采用服务端渲染，适合需要 SEO、快速首屏和内容型页面的个人博客或独立站点。

## Levi Blog 前端入口

Levi Blog 提供两个独立的前端实现，可以根据技术栈和使用场景选择：

| 入口 | 定位 |
| --- | --- |
| [Levi-Blog](https://github.com/LeviQin/Levi-Blog) | Vue 3 + Vite 单页面版本，功能完整，包含工具箱、动态背景特效和互动组件 |
| **My-Blog-Nuxt（当前仓库）** | Nuxt 4 + Vue 3 SSR 版本，强调文章阅读、SEO 和更轻量的内容展示 |
| [在线站点](https://leviqin.top) | 查看博客当前的线上页面和实际交互效果 |

## 功能特性

- **首页展示**：最新文章、分类、项目和个人介绍
- **文章浏览**：列表、详情、归档、分类和标签
- **站内搜索**：搜索文章标题、摘要和正文
- **阅读体验**：Markdown 渲染、代码高亮、文章目录和阅读进度
- **互动功能**：文章点赞、留言和联系表单
- **内容页面**：友链、作品集、关于页面和站点导航
- **主题与布局**：浅色 / 深色主题，适配桌面端与移动端
- **SEO 支持**：SSR、响应式布局和页面 SEO 元信息
- **开发工具**：图片查看、封面生成、颜色分析、二维码、天气、IP 和开发工具

## 技术栈

- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- TypeScript
- Markdown-it
- Highlight.js
- Nitro
- Pica
- QRCode

## 项目结构

```text
.
├── app/
│   ├── components/       # 通用 Vue 组件
│   ├── composables/      # 数据、主题、SEO 等组合式逻辑
│   ├── pages/            # 页面与动态路由
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # Markdown、文章和工具函数
│   └── assets/           # 全局样式
├── public/                # 静态图片、字体和 favicon
├── server/                # Nuxt 运行时路由
├── nuxt.config.ts         # Nuxt 配置
├── package.json           # 项目脚本与依赖
└── package-lock.json      # npm 依赖锁定文件
```

## 环境要求

- Node.js 20+
- npm 11.x

## 快速开始

### 安装依赖

```bash
npm ci
```

### 配置本地环境

在项目根目录创建 `.env` 文件，根据自己的运行环境填写：

```dotenv
# 数据接口地址
NUXT_API_BASE=https://your-api.example.com

# 网站公开访问地址，用于 SEO 和 Open Graph
NUXT_PUBLIC_SITE_URL=http://localhost:3006

# 使用反向代理或容器部署时按实际网络环境配置
NUXT_TRUSTED_PROXY_IPS=127.0.0.1,::1
```

### 启动开发服务

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:3006`。

## 构建与预览

生成生产构建：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run preview
```

生成静态站点：

```bash
npm run generate
```

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm ci` | 根据锁文件安装依赖 |
| `npm run dev` | 启动开发服务器，默认端口为 3006 |
| `npm run typecheck` | 执行 TypeScript 类型检查 |
| `npm run check` | 执行类型检查并构建项目 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run generate` | 生成静态站点 |

## 开发说明

- 页面和组件位于 `app/` 目录。
- 全局样式位于 `app/assets/css/`。
- 静态资源位于 `public/`，修改后可直接通过根路径访问。
- 页面 SEO 信息集中在组合式逻辑和页面配置中维护。
- 站点主题和部分页面模块根据运行时站点配置展示。

## License

[MIT](./LICENSE)
