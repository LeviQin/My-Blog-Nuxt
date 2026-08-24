export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiBase = String(config.apiBase || '').replace(/\/$/, '')

  setResponseHeader(event, 'cache-control', 'no-store')

  try {
    const response = await $fetch<{ status?: string }>(`${apiBase}/health`, { timeout: 4_000 })
    if (response?.status !== 'ok') throw new Error('Unexpected health response')
    return { status: 'ok' }
  } catch {
    throw createError({ statusCode: 503, statusMessage: '博客服务暂时不可用' })
  }
})
