export interface EasterEggSessionState {
  catShown: boolean
  fireflyShownCount: number
  coffeeClicks: number
  nightNoteDismissed: boolean
}

const SESSION_KEY = 'levi-blog:easter-session:v1'
const defaultState = (): EasterEggSessionState => ({ catShown: false, fireflyShownCount: 0, coffeeClicks: 0, nightNoteDismissed: false })

export function useEasterEggSession() {
  const state = useState<EasterEggSessionState>('easter-egg-session', defaultState)
  const hydrated = useState('easter-egg-session-hydrated', () => false)

  function load() {
    if (!import.meta.client || hydrated.value) return
    hydrated.value = true
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || '{}')
      state.value = { ...defaultState(), ...saved }
    } catch {
      state.value = defaultState()
    }
  }

  function save() {
    if (!import.meta.client) return
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.value)) } catch {}
  }

  function update(patch: Partial<EasterEggSessionState>) {
    state.value = { ...state.value, ...patch }
    save()
  }

  onMounted(load)
  return { state, load, update }
}
