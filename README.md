# Levi Blog Nuxt

基于 Nuxt 4 构建的 SSR 个人博客前端，提供文章阅读、归档分类、站内搜索、联系站长、友链与作品集等功能，并通过服务端 API 代理连接统一博客后端。

## 项目简介

Levi Blog 是一个以“记录代码，也记录生活里的风景”为主题的个人博客前端项目。项目采用 Nuxt 4 服务端渲染，浏览器通过 Nuxt 的 `/api/*` 接口访问后端，不直接暴露 Koa 服务地址。

文章正文由服务端渲染 Markdown，支持代码高亮和目录生成；网站主题通过 Cookie 保存，文章封面和正文图片使用后端返回的资源地址。

## Levi Blog 版本

Levi Blog 目前有两个前端版本，共用 `levi-blog-service` 后端：

| 版本 | 技术栈 | 定位 |
| --- | --- | --- |
| [Levi-Blog](https://github.com/LeviQin/Levi-Blog) | Vue 3 + Vite | 功能完整的经典版本，包含工具箱、动态背景特效和互动组件 |
| **My-Blog-Nuxt**（当前项目） | Nuxt 4 + Vue 3 | SSR 博客版本，强调内容阅读、SEO、服务端渲染和更轻量的阅读体验 |

两个版本的数据接口保持一致，可以根据部署环境和产品侧重点选择使用。

## 功能特性

- 首页展示最新文章、文章分类、进行中的项目和个人信息
- 文章列表、文章详情、时间归档和分类浏览
- 站内搜索文章标题、摘要和正文内容
- Markdown 正文渲染、代码高亮、文章目录和阅读进度
- 文章点赞和联系站长
- 友链、作品集和关于页面
- 浅色 / 深色主题切换
- 服务端渲染和页面 SEO 元信息
- 响应式布局，适配桌面端与移动端

## 技术栈

- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- TypeScript
- Markdown-it
- Highlight.js
- Nuxt SSR / Nitro

## 项目结构

```text
.
├── app/
│   ├── components/       # 通用 Vue 组件
│   ├── composables/      # API、主题、SEO 等组合式逻辑
│   ├── pages/            # 页面与动态路由
│   ├── types/            # TypeScript 类型定义
│   └── assets/            # 全局样式
├── public/                # 静态图片、字体和 favicon
├── server/api/            # Nuxt 服务端 API 代理
├── nuxt.config.ts         # Nuxt 配置
├── package.json           # 项目脚本与依赖
└── package-lock.json      # npm 依赖锁定文件
```

## 环境要求

- Node.js 20+
- npm 11.x
- 已启动的 `levi-blog-service` 后端服务

本项目默认连接本机 `http://127.0.0.1:3000` 的博客后端。后端项目需要单独部署和运行。

## 快速开始

### 1. 安装依赖

```bash
npm ci
```

### 2. 配置环境变量

在项目根目录创建 `.env` 文件：

```dotenv
# levi-blog-service 后端地址
NUXT_API_BASE=http://127.0.0.1:3000

# 网站公开访问地址，用于 SEO 和 Open Graph 信息
NUXT_PUBLIC_SITE_URL=http://localhost:3006

# Nuxt 前面的反向代理或容器网段；生产环境写入 /www/env/my-blog-nuxt.env。
# 未设置时会自动信任 Docker 容器默认网关；独立代理容器仍应在此显式配置。
NUXT_TRUSTED_PROXY_IPS=127.0.0.1,::1,172.24.0.1
```

### 3. 启动开发服务

```bash
npm run dev
```

开发服务器默认运行在 `http://localhost:3006`。

## 构建与部署

生成生产环境构建产物：

```bash
npm run build
```

本地预览生产构建：

```bash
npm run preview
```

也可以直接运行 Nitro 服务：

```bash
node .output/server/index.mjs
```

生产环境请配置正确的 `NUXT_API_BASE` 和 `NUXT_PUBLIC_SITE_URL`，并确保前端服务器能够访问博客后端服务。

## 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm ci` | 根据锁文件安装项目依赖 |
| `npm run dev` | 启动开发服务器，端口为 `3006` |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |
| `npm run generate` | 生成静态站点 |

## 后端说明

本项目是博客前端，不包含数据库和管理后台。文章、站点配置、联系站长、友链和作品集等数据来自独立的 `levi-blog-service` 服务。

Nuxt 服务端代理统一处理前端请求：

```text
浏览器 → Nuxt /api/* → levi-blog-service
```

这样可以避免在浏览器端直接暴露后端服务地址，也便于在不同环境中切换 API 地址。

## 开源协议

本项目基于 [MIT License](./LICENSE) 开源。使用、修改和再发布时请保留原项目的版权声明与许可声明。
