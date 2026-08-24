import type { ApiResponse, BlogProject, Link, PaginatedArticles, SiteSetting, Tag, Category } from '~/types/api'
import { normalizeArticle } from '~/utils/blog'

async function request<T>(path: string, options: Record<string, unknown> = {}) {
  const response = await $fetch<ApiResponse<T>>(`/api/${path}`, options)
  if (response.code !== 200) throw createError({ statusCode: response.code || 500, statusMessage: response.message || '请求失败' })
  return response.data
}

export function useBlogApi() {
  return {
    articles: async (query: Record<string, string> = {}) => (await request<any[]>('articles/article', { query })).map(normalizeArticle),
    articlesPage: async (query: Record<string, string> = {}) => {
      const payload = await request<any>('articles/article', { query })
      if (Array.isArray(payload)) {
        const page = Math.max(1, Number(query.page) || 1)
        const pageSize = Math.max(1, Number(query.pageSize) || 12)
        return { items: payload.slice((page - 1) * pageSize, page * pageSize).map(normalizeArticle), total: payload.length, page, pageSize, totalPages: Math.ceil(payload.length / pageSize) } as PaginatedArticles
      }
      return { ...payload, items: (payload.items || []).map(normalizeArticle) } as PaginatedArticles
    },
    article: async (id: string | number) => {
      const item = (await request<any[]>('articles/article/' + id))[0]
      if (!item) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
      return normalizeArticle(item)
    },
    search: async (keyword: string) => (await request<any[]>('articles/searchKeyword', { method: 'POST', body: { keyword } })).map(normalizeArticle),
    tags: async () => request<Tag[]>('articles/tags'),
    categories: async () => request<Category[]>('articles/categories'),
    statistics: async () => request<Record<string, number>>('articles/statistics'),
    settings: async () => request<SiteSetting | SiteSetting[]>('blog-setting/settings', { query: { key: 'levi-blog' } }),
    links: async () => request<Link[]>('links/link'),
    projects: async () => request<BlogProject[]>('blog-projects/projects'),
    like: async (articleId: number) => request<unknown>('articles/likes', { method: 'POST', body: { id: articleId } }),
    submitMessage: async (body: Record<string, unknown>) => request<unknown>('message/messages', { method: 'POST', body }),
  }
}
