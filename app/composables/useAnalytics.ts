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
  page_path: string
  article_id?: number
  referrer_host?: string
  properties?: Record<string, unknown>
}

const MAX_BATCH_SIZE = 25
const MAX_QUEUE_SIZE = 200

let queue: QueuedEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
let flushing = false
let hasTrackedInitialPageView = false

function createId() {
  if (import.meta.client && globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
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

function isAutomatedBrowser() {
  if (!import.meta.client) return false
  try {
    return navigator.webdriver === true
  } catch {
    return false
  }
}

function isPreviewPage() {
  if (!import.meta.client) return false
  try {
    return new URLSearchParams(window.location.search).has('preview')
  } catch {
    return false
  }
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
      if (sent) {
        if (queue.length) scheduleFlush(0)
        return
      }
      queue = [...events, ...queue].slice(-MAX_QUEUE_SIZE)
    }

    flushing = true
    try {
      const sent = await send(events)
      if (!sent) {
        queue = [...events, ...queue].slice(-MAX_QUEUE_SIZE)
        scheduleFlush(5000)
      }
    } finally {
      flushing = false
      if (queue.length) scheduleFlush(queue.length >= MAX_BATCH_SIZE ? 0 : 3000)
    }
  }

  const scheduleFlush = (delay = 3000) => {
    if (flushTimer || !queue.length) return
    flushTimer = setTimeout(() => {
      flushTimer = null
      void flush()
    }, delay)
  }

  const track = (eventName: AnalyticsEventName, payload: AnalyticsPayload = {}) => {
    if (!import.meta.client || import.meta.dev || isAutomatedBrowser() || isPreviewPage()) return
    const { page_path, article_id, referrer_host, ...properties } = payload
    const inferredReferrer = eventName === 'page_view' && !hasTrackedInitialPageView ? getReferrerHost() : ''
    queue.push({
      event_id: createId(),
      event_name: eventName,
      page_path: String(page_path || getCurrentPath()).slice(0, 255),
      ...(Number.isInteger(article_id) && Number(article_id) > 0 ? { article_id: Number(article_id) } : {}),
      ...(referrer_host || inferredReferrer ? { referrer_host: String(referrer_host || inferredReferrer).slice(0, 255) } : {}),
      ...(Object.keys(properties).length ? { properties } : {}),
    })
    if (queue.length > MAX_QUEUE_SIZE) queue.splice(0, queue.length - MAX_QUEUE_SIZE)
    if (eventName === 'page_view') hasTrackedInitialPageView = true
    if (queue.length >= MAX_BATCH_SIZE) void flush()
    else scheduleFlush()
  }

  return { track, flush }
}
