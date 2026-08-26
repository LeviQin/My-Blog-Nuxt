import { isIP } from 'node:net'

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

  const clientIp = getTrustedClientIp(event)
  if (clientIp) {
    ;(requestOptions.headers as Record<string, string>)['x-forwarded-for'] = clientIp
    ;(requestOptions.headers as Record<string, string>)['x-real-ip'] = clientIp
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

function normalizeAddress(value: unknown) {
  return String(value || '').replace(/^::ffff:/i, '').trim()
}

function getTrustedProxyAddresses() {
  const configured = process.env.NUXT_TRUSTED_PROXY_IPS || process.env.TRUSTED_PROXY_IPS || '127.0.0.1,::1,::ffff:127.0.0.1'
  return new Set(configured.split(',').map(normalizeAddress).filter(Boolean))
}

function getTrustedClientIp(event: any) {
  const socketIp = normalizeAddress(getRequestIP(event))
  if (!socketIp) return ''
  if (!getTrustedProxyAddresses().has(socketIp)) return socketIp
  const candidates = [
    getHeader(event, 'cf-connecting-ip'),
    getHeader(event, 'true-client-ip'),
    getHeader(event, 'x-real-ip'),
    getHeader(event, 'x-forwarded-for')?.split(',')[0],
  ]
  return candidates.map(normalizeAddress).find((value) => isIP(value)) || socketIp
}
