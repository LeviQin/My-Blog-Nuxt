import { readFileSync } from 'node:fs'
import { isIP } from 'node:net'

const PUBLIC_READ_CACHE_TTL = 60_000
const PUBLIC_READ_CACHE_MAX_ENTRIES = 100
const PUBLIC_READ_CACHE_PATHS = new Set([
  'articles/article',
  'articles/categories',
  'articles/statistics',
  'articles/tags',
  'blog-projects/projects',
  'blog-setting/settings',
  'frontEnd/siteNav',
  'links/link',
])
const publicReadCache = new Map<string, { expiresAt: number; value: unknown }>()

function setPublicReadCache(key: string, value: unknown) {
  const now = Date.now()
  for (const [entryKey, entry] of publicReadCache) {
    if (entry.expiresAt <= now) publicReadCache.delete(entryKey)
  }
  while (publicReadCache.size >= PUBLIC_READ_CACHE_MAX_ENTRIES) {
    const oldestKey = publicReadCache.keys().next().value
    if (oldestKey === undefined) break
    publicReadCache.delete(oldestKey)
  }
  publicReadCache.set(key, { expiresAt: now + PUBLIC_READ_CACHE_TTL, value })
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const config = useRuntimeConfig(event)

  const routePath = getRouterParam(event, 'path') || ''
  const method = getMethod(event)
  const authorization = getHeader(event, 'authorization')
  const cacheKey = method === 'GET' && !authorization && PUBLIC_READ_CACHE_PATHS.has(routePath)
    ? `${routePath}${getRequestURL(event).search}`
    : ''
  if (cacheKey) {
    const cached = publicReadCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) return cached.value
    if (cached) publicReadCache.delete(cacheKey)
  }

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

  if (authorization) {
    ;(requestOptions.headers as Record<string, string>).authorization = authorization
  }

  if (!['GET', 'HEAD'].includes(method)) {
    requestOptions.body = await readBody(event)
  }

  try {
    const response = await $fetch<unknown>(
      `${config.apiBase}/api/${routePath}`,
      requestOptions,
    )
    if (cacheKey) setPublicReadCache(cacheKey, response)
    return response
  }
  catch (error: unknown) {
    const { statusCode, statusMessage, data } = getProxyErrorDetails(error)
    throw createError({
      statusCode,
      statusMessage,
      ...(data === undefined ? {} : { data }),
    })
  }
})

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? value as Record<string, unknown> : undefined
}

function asStatusCode(value: unknown): number | undefined {
  const statusCode = Number(value)
  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599 ? statusCode : undefined
}

function asMessage(value: unknown): string | undefined {
  const message = typeof value === 'string' ? value.trim() : ''
  return message || undefined
}

function getProxyErrorDetails(error: unknown) {
  const errorRecord = asRecord(error)
  const response = asRecord(errorRecord?.response)
  const responseData = response?._data
  const data = responseData === undefined ? errorRecord?.data : responseData
  const dataRecord = asRecord(data)
  const statusCode = asStatusCode(response?.status) || asStatusCode(errorRecord?.statusCode) || 502
  const statusMessage = asMessage(dataRecord?.message)
    || asMessage(response?.statusText)
    || asMessage(errorRecord?.statusMessage)
    || (error instanceof Error ? asMessage(error.message) : undefined)
    || '博客服务暂时不可用'
  return { statusCode, statusMessage, data }
}

function normalizeAddress(value: unknown) {
  return String(value || '').replace(/^::ffff:/i, '').trim()
}

function getTrustedProxyEntries() {
  const configured = String(process.env.NUXT_TRUSTED_PROXY_IPS || process.env.TRUSTED_PROXY_IPS || '').trim()
  if (configured) return configured.split(',').map(normalizeAddress).filter(Boolean)
  const defaults = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
  const dockerHostGateway = getDockerHostGateway()
  return dockerHostGateway ? [...defaults, dockerHostGateway] : defaults
}

function getDockerHostGateway() {
  if (process.platform !== 'linux') return ''
  try {
    const defaultRoute = readFileSync('/proc/net/route', 'utf8').split(/\r?\n/).slice(1)
      .map(line => line.trim().split(/\s+/))
      .find(fields => fields[1] === '00000000' && /^[0-9a-fA-F]{8}$/.test(fields[2] || ''))
    if (!defaultRoute) return ''
    const gatewayHex = defaultRoute[2]
    if (!gatewayHex) return ''
    const gatewayParts = gatewayHex.match(/../g)
    return gatewayParts ? gatewayParts.reverse().map(part => String(parseInt(part, 16))).join('.') : ''
  } catch {
    return ''
  }
}

function ipv4ToNumber(value: string) {
  const parts = String(value || '').split('.')
  if (parts.length !== 4 || parts.some((part) => !/^\d{1,3}$/.test(part) || Number(part) > 255)) return null
  return parts.reduce((number, part) => number * 256 + Number(part), 0)
}

function matchesTrustedProxy(address: string, entry: string) {
  if (address === entry) return true
  const [network, prefixText] = entry.split('/')
  if (!network || prefixText === undefined) return false
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
  const socketIp = normalizeAddress(event?.node?.req?.socket?.remoteAddress || event?.node?.req?.connection?.remoteAddress)
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
