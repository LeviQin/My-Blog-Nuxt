import { getCurrentInstance, onMounted } from 'vue'
import { readingRewards } from '~/data/reading-rewards'

export interface ReadingRewardState {
  version: 1
  completedArticleIds: string[]
  unlockedRewardIds: string[]
  updatedAt: string
}

const STORAGE_KEY = 'levi-blog:reading-rewards:v1'
const defaultState = (): ReadingRewardState => ({ version: 1, completedArticleIds: [], unlockedRewardIds: [], updatedAt: '' })

function calculateUnlocked(ids: string[]) {
  return readingRewards.filter((reward) => ids.length >= reward.threshold).map((reward) => reward.id)
}

export function useReadingRewards() {
  const state = useState<ReadingRewardState>('reading-rewards', defaultState)
  const hydrated = useState('reading-rewards-hydrated', () => false)
  const newlyUnlocked = useState<string | null>('reading-reward-newly-unlocked', () => null)

  function load() {
    if (!import.meta.client || hydrated.value) return
    hydrated.value = true
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const ids = Array.isArray(saved.completedArticleIds) ? saved.completedArticleIds.map(String) : []
      state.value = { ...defaultState(), ...saved, version: 1, completedArticleIds: [...new Set(ids)], unlockedRewardIds: calculateUnlocked(ids) }
    } catch {
      state.value = defaultState()
    }
  }

  function save() {
    if (!import.meta.client) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value)) } catch {}
  }

  function completeArticle(id: string | number) {
    load()
    const articleId = String(id)
    if (!articleId || state.value.completedArticleIds.includes(articleId)) return
    const before = new Set(state.value.unlockedRewardIds)
    const ids = [...state.value.completedArticleIds, articleId]
    const unlocked = calculateUnlocked(ids)
    state.value = { version: 1, completedArticleIds: ids, unlockedRewardIds: unlocked, updatedAt: new Date().toISOString() }
    const reward = unlocked.find((rewardId) => !before.has(rewardId))
    if (reward) newlyUnlocked.value = reward
    save()
  }

  function clear() {
    state.value = defaultState()
    newlyUnlocked.value = null
    if (import.meta.client) {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
  }

  if (getCurrentInstance()) onMounted(load)
  else load()
  return { state, newlyUnlocked, rewards: readingRewards, load, completeArticle, clear }
}
