export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig(event)

  const routePath = getRouterParam(event, 'path') || ''
  const method = getMethod(event)

  const requestOptions: Record<string, unknown> = {
    method,
    query: getQuery(event),
    headers: {
      accept: getHeader(event, 'accept') || 'application/json',
    },
  }

  const authorization = getHeader(event, 'authorization')

  if (authorization) {
    ;(requestOptions.headers as Record<string, string>).authorization = authorization
  }

  if (!['GET', 'HEAD'].includes(method)) {
    requestOptions.body = await readBody(event)
  }

  try {
    return await $fetch<unknown>(
      `${config.apiBase}/api/${routePath}`,
      requestOptions,
    )
  }
  catch (error: any) {
    throw createError({
      statusCode: error?.response?.status || error?.statusCode || 502,
      statusMessage: error?.data?.message || '博客服务暂时不可用',
      data: error?.data,
    })
  }
})