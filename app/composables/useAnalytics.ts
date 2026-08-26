type AnalyticsEventName = 'page_view' | 'article_view' | 'article_engaged'

type AnalyticsPayload = {
  page_path?: string
  article_id?: number
  referrer_host?: string
  [key: string]: unknown
}

type QueuedEvent = {
  event_id: string
  event_name: AnalyticsEventName
  visitor_id: string
  session_id: string
  page_path: string
  article_id?: number
  referrer_host?: string
  properties?: Record<string, unknown>
}

const VISITOR_KEY = 'levi-blog-analytics-visitor-id'
const SESSION_KEY = 'levi-blog-analytics-session-id'
const SESSION_LAST_ACTIVE_KEY = 'levi-blog-analytics-session-last-active'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const MAX_BATCH_SIZE = 25

let queue: QueuedEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let flushing = false
let hasTrackedInitialPageView = false

function createId() {
  if (import.meta.client && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getStorageId(type: 'local' | 'session', key: string) {
  if (!import.meta.client) return ''
  try {
    const storage = type === 'local' ? window.localStorage : window.sessionStorage
    const existing = storage.getItem(key)
    if (existing) return existing
    const value = createId()
    storage.setItem(key, value)
    return value
  } catch {
    return createId()
  }
}

function getSessionId() {
  if (!import.meta.client) return ''
  try {
    const now = Date.now()
    const lastActive = Number(window.sessionStorage.getItem(SESSION_LAST_ACTIVE_KEY) || 0)
    let sessionId = window.sessionStorage.getItem(SESSION_KEY) || ''
    if (!sessionId || !lastActive || now - lastActive > SESSION_TIMEOUT_MS) {
      sessionId = createId()
      window.sessionStorage.setItem(SESSION_KEY, sessionId)
    }
    window.sessionStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now))
    return sessionId
  } catch {
    return createId()
  }
}

function getReferrerHost() {
  if (!import.meta.client || !document.referrer) return ''
  try {
    return new URL(document.referrer).hostname
  } catch {
    return ''
  }
}

function getCurrentPath() {
  return import.meta.client ? window.location.pathname : '/'
}

export function useAnalytics() {
  const send = async (events: QueuedEvent[]) => {
    if (!events.length) return true
    try {
      const response = await $fetch<{ code: number }>('/api/analytics/events', {
        method: 'POST',
        body: { events },
      })
      return response?.code === 200
    } catch {
      return false
    }
  }

  const flush = async (preferBeacon = false) => {
    if (!import.meta.client || flushing || !queue.length) return
    const events = queue.splice(0, MAX_BATCH_SIZE)
    if (preferBeacon && navigator.sendBeacon) {
      const sent = navigator.sendBeacon(
        '/api/analytics/events',
        new Blob([JSON.stringify({ events })], { type: 'application/json' }),
      )
      if (sent) return
      queue.unshift(...events)
    }

    flushing = true
    try {
      const sent = await send(events)
      if (!sent) queue.unshift(...events)
    } finally {
      flushing = false
    }
  }

  const scheduleFlush = () => {
    if (flushTimer || queue.length >= MAX_BATCH_SIZE) {
      if (queue.length >= MAX_BATCH_SIZE) void flush()
      return
    }
    flushTimer = setTimeout(() => {
      flushTimer = null
      void flush()
    }, 3000)
  }

  const track = (eventName: AnalyticsEventName, payload: AnalyticsPayload = {}) => {
    if (!import.meta.client) return
    const { page_path, article_id, referrer_host, ...properties } = payload
    const inferredReferrer = eventName === 'page_view' && !hasTrackedInitialPageView ? getReferrerHost() : ''
    queue.push({
      event_id: createId(),
      event_name: eventName,
      visitor_id: getStorageId('local', VISITOR_KEY),
      session_id: getSessionId(),
      page_path: String(page_path || getCurrentPath()).slice(0, 255),
      ...(Number.isInteger(article_id) && Number(article_id) > 0 ? { article_id: Number(article_id) } : {}),
      ...(referrer_host || inferredReferrer ? { referrer_host: String(referrer_host || inferredReferrer).slice(0, 255) } : {}),
      ...(Object.keys(properties).length ? { properties } : {}),
    })
    if (eventName === 'page_view') hasTrackedInitialPageView = true
    scheduleFlush()
  }

  return { track, flush }
}
