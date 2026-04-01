import { AppState } from './types'

const STORAGE_KEY = 'life-dashboard-v5'
const IMAGE_STORAGE_KEY = 'elite-action-images-v1'

function saveImages(goals: AppState['goals']): void {
  if (typeof window === 'undefined') return
  try {
    const images: Record<string, string> = {}
    for (const goal of goals) {
      if (goal.visionImageBase64) images[goal.id] = goal.visionImageBase64
    }
    localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images))
  } catch {
    // quota exceeded
  }
}

export function loadImages(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(IMAGE_STORAGE_KEY)
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
  goals: [
    {
      id: 'g1',
      emoji: '💪',
      name: 'Fitness',
      category: 'Health',
      xp: 0,
      tasks: [
        { id: 't1', name: 'Morning workout', xp: 50, repeatable: true },
        { id: 't2', name: 'Hit 10k steps', xp: 25, repeatable: true },
        { id: 't3', name: 'Drink 2L water', xp: 10, repeatable: true },
      ],
    },
    {
      id: 'g2',
      emoji: '📚',
      name: 'Learning',
      category: 'Growth',
      xp: 0,
      tasks: [
        { id: 't4', name: 'Read 30 minutes', xp: 25, repeatable: true },
        { id: 't5', name: 'Complete a course lesson', xp: 50, repeatable: true },
      ],
    },
    {
      id: 'g3',
      emoji: '💰',
      name: 'Finance',
      category: 'Wealth',
      xp: 0,
      tasks: [
        { id: 't6', name: 'Review budget', xp: 25, repeatable: false },
        { id: 't7', name: 'Log expenses', xp: 10, repeatable: true },
      ],
    },
  ],
  habits: [
    { id: 'h1', label: 'Morning routine', xp: 25 },
    { id: 'h2', label: 'No junk food', xp: 10 },
    { id: 'h3', label: 'Meditate 10min', xp: 25 },
    { id: 'h4', label: 'Sleep by 11pm', xp: 10 },
  ],
  checked: {},
  kanban: [
    { id: 'k1', name: 'Set up morning routine', column: 'todo', priority: 'high', createdAt: new Date().toISOString(), linkedGoalId: 'g1' },
    { id: 'k2', name: 'Plan weekly meals', column: 'todo', priority: 'medium', createdAt: new Date().toISOString(), linkedGoalId: 'g1' },
    { id: 'k3', name: 'Research index funds', column: 'todo', priority: 'high', createdAt: new Date().toISOString(), linkedGoalId: 'g3' },
    { id: 'k4', name: 'Schedule dentist appointment', column: 'todo', priority: 'low', createdAt: new Date().toISOString() },
    { id: 'k5', name: 'Read Atomic Habits', column: 'inprogress', priority: 'medium', createdAt: new Date().toISOString(), linkedGoalId: 'g2' },
    { id: 'k6', name: '30-day workout challenge', column: 'inprogress', priority: 'high', createdAt: new Date().toISOString(), linkedGoalId: 'g1' },
    { id: 'k7', name: 'Build monthly budget', column: 'inprogress', priority: 'medium', createdAt: new Date().toISOString(), linkedGoalId: 'g3' },
    { id: 'k8', name: 'Track calories for a week', column: 'done', priority: 'low', createdAt: new Date().toISOString(), linkedGoalId: 'g1', xpAwarded: true },
    { id: 'k9', name: 'Create vision board', column: 'done', priority: 'high', createdAt: new Date().toISOString(), xpAwarded: true },
    { id: 'k10', name: 'Join gym membership', column: 'done', priority: 'high', createdAt: new Date().toISOString(), linkedGoalId: 'g1', xpAwarded: true },
    { id: 'k11', name: 'Log daily expenses', column: 'done', priority: 'medium', createdAt: new Date().toISOString(), linkedGoalId: 'g3', xpAwarded: true },
  ],
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

export function loadState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw) as Partial<AppState>
    const merged = { ...DEFAULT_STATE, ...parsed }
    // Migrate: if kanban has fewer than 5 cards, reset to defaults
    if (!parsed.kanban || parsed.kanban.length < 5) {
      merged.kanban = DEFAULT_STATE.kanban
    }
    // Merge images stored separately (prefer separate key; fall back to embedded for old data)
    const images = loadImages()
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

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return
  // Save images separately to avoid hitting the main-state quota limit
  saveImages(state.goals)
  try {
    const stateWithoutImages = {
      ...state,
      goals: state.goals.map(({ visionImageBase64: _, ...rest }) => rest),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithoutImages))
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
