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

  const userAgent = getHeader(event, 'user-agent')
  if (userAgent) {
    ;(requestOptions.headers as Record<string, string>)['user-agent'] = userAgent
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

function getTrustedProxyEntries() {
  const configured = process.env.NUXT_TRUSTED_PROXY_IPS || process.env.TRUSTED_PROXY_IPS || '127.0.0.1,::1,::ffff:127.0.0.1'
  return configured.split(',').map(normalizeAddress).filter(Boolean)
}

function ipv4ToNumber(value: string) {
  const parts = String(value || '').split('.')
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null
  return parts.reduce((number, part) => number * 256 + Number(part), 0)
}

function matchesTrustedProxy(address: string, entry: string) {
  if (address === entry) return true
  const [network, prefixText] = entry.split('/')
  if (prefixText === undefined) return false
  const prefix = Number(prefixText)
  const addressNumber = ipv4ToNumber(address)
  const networkNumber = ipv4ToNumber(network)
  if (addressNumber === null || networkNumber === null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (addressNumber & mask) === (networkNumber & mask)
}

function isTrustedProxy(address: string) {
  return getTrustedProxyEntries().some((entry) => matchesTrustedProxy(address, entry))
}

function getTrustedClientIp(event: any) {
  const socketIp = normalizeAddress(getRequestIP(event))
  if (!socketIp) return ''
  if (!isTrustedProxy(socketIp)) return socketIp
  const candidates = [
    getHeader(event, 'cf-connecting-ip'),
    getHeader(event, 'true-client-ip'),
    getHeader(event, 'x-real-ip'),
    getHeader(event, 'x-forwarded-for')?.split(',')[0],
  ]
  return candidates.map(normalizeAddress).find((value) => isIP(value)) || socketIp
}
