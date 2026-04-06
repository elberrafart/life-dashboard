import { AppState } from './types'

function storageKey(userId?: string) {
  return userId ? `life-dashboard-v5-${userId}` : 'life-dashboard-v5'
}
function imageStorageKey(userId?: string) {
  return userId ? `elite-action-images-v1-${userId}` : 'elite-action-images-v1'
}

function saveImages(goals: AppState['goals'], userId?: string): void {
  if (typeof window === 'undefined') return
  try {
    const images: Record<string, string> = {}
    for (const goal of goals) {
      if (goal.visionImageBase64) images[goal.id] = goal.visionImageBase64
    }
    localStorage.setItem(imageStorageKey(userId), JSON.stringify(images))
  } catch {
    // quota exceeded
  }
}

export function loadImages(userId?: string): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(imageStorageKey(userId))
    return raw ? (JSON.parse(raw) as Record<string, string>) : {}
  } catch {
    return {}
  }
}

export const DEFAULT_STATE: AppState = {
  playerName: 'Player',
  firstName: '',
  lastName: '',
  profileYear: '',
  tagline: '',
  goals: [],
  habits: [],
  checked: {},
  kanban: [],
  xpFeed: [],
  goalArchive: [],
  kanbanArchive: [],
  vision: {
    quoteText: 'The only way to do great work is to love what you do.',
    quoteSub: '— Steve Jobs',
  },
  habitHistory: {},
  streak: 0,
  lastCheckedDate: '',
  habitXP: 0,
  journalEntries: {},
  moodLog: {},
}

export function loadState(userId?: string): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<AppState>
    const merged = { ...DEFAULT_STATE, ...parsed }
    // Merge images stored separately (prefer separate key; fall back to embedded for old data)
    const images = loadImages(userId)
    merged.goals = merged.goals.map(g => ({
      ...g,
      visionImageBase64: images[g.id] ?? g.visionImageBase64,
    }))
    // Ensure archive arrays exist (backward compat)
    if (!merged.goalArchive) merged.goalArchive = []
    if (!merged.kanbanArchive) merged.kanbanArchive = []
    // Auto-archive done kanban cards older than 1 day
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const toArchive = merged.kanban.filter(k =>
      k.column === 'done' && k.completedAt && new Date(k.completedAt).getTime() < oneDayAgo
    )
    if (toArchive.length > 0) {
      const archiveIds = new Set(toArchive.map(k => k.id))
      merged.kanban = merged.kanban.filter(k => !archiveIds.has(k.id))
      merged.kanbanArchive = [...(merged.kanbanArchive ?? []), ...toArchive]
    }
    return merged
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: AppState, userId?: string): void {
  if (typeof window === 'undefined') return
  // Save images separately to avoid hitting the main-state quota limit
  saveImages(state.goals, userId)
  try {
    const stateWithoutImages = {
      ...state,
      goals: state.goals.map(({ visionImageBase64: _, ...rest }) => rest),
    }
    localStorage.setItem(storageKey(userId), JSON.stringify(stateWithoutImages))
  } catch {
    // storage full or unavailable
  }
}

export function exportState(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `life-dashboard-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importState(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as Partial<AppState>
        resolve({ ...DEFAULT_STATE, ...parsed })
      } catch {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}
