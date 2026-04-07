import { AppState } from './types'
import { encrypt, decrypt } from './crypto'

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
    if (userId) {
      encrypt(JSON.stringify(images), userId).then(encrypted => {
        try { localStorage.setItem(imageStorageKey(userId), encrypted) } catch { /* quota */ }
      })
    } else {
      localStorage.setItem(imageStorageKey(userId), JSON.stringify(images))
    }
  } catch {
    // quota exceeded
  }
}

export async function loadImagesAsync(userId?: string): Promise<Record<string, string>> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(imageStorageKey(userId))
    if (!raw) return {}
    if (userId) {
      const decrypted = await decrypt(raw, userId)
      return JSON.parse(decrypted) as Record<string, string>
    }
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

export function loadImages(userId?: string): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(imageStorageKey(userId))
    if (!raw) return {}
    // Sync fallback: only works for unencrypted (legacy) data
    if (raw.startsWith('{') || raw.startsWith('[')) {
      return JSON.parse(raw) as Record<string, string>
    }
    return {} // encrypted data must use loadImagesAsync
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

function mergeState(parsed: Partial<AppState>, images: Record<string, string>): AppState {
  const merged = { ...DEFAULT_STATE, ...parsed }
  merged.goals = merged.goals.map(g => ({
    ...g,
    visionImageBase64: images[g.id] ?? g.visionImageBase64,
  }))
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
}

/** Sync load — works for legacy (unencrypted) data only */
export function loadState(userId?: string): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return DEFAULT_STATE
    // If data is encrypted (not JSON), return default — async load will follow
    if (!raw.startsWith('{') && !raw.startsWith('[')) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<AppState>
    const images = loadImages(userId)
    return mergeState(parsed, images)
  } catch {
    return DEFAULT_STATE
  }
}

/** Async load — decrypts encrypted localStorage data */
export async function loadStateAsync(userId?: string): Promise<AppState> {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return DEFAULT_STATE
    let json: string
    if (userId && !raw.startsWith('{') && !raw.startsWith('[')) {
      json = await decrypt(raw, userId)
    } else {
      json = raw
    }
    const parsed = JSON.parse(json) as Partial<AppState>
    const images = await loadImagesAsync(userId)
    return mergeState(parsed, images)
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
    const json = JSON.stringify(stateWithoutImages)
    if (userId) {
      encrypt(json, userId).then(encrypted => {
        try { localStorage.setItem(storageKey(userId), encrypted) } catch { /* quota */ }
      })
    } else {
      localStorage.setItem(storageKey(userId), json)
    }
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
