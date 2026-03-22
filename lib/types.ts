export type Task = {
  id: string
  name: string
  xp: 10 | 25 | 50 | 100
  repeatable: boolean
  completedAt?: string
}

export type Goal = {
  id: string
  emoji: string
  name: string
  category: string
  xp: number
  tasks: Task[]
  visionImageBase64?: string
}

export type Habit = {
  id: string
  label: string
  xp: number
}

export type KanbanCard = {
  id: string
  name: string
  column: 'todo' | 'inprogress' | 'done'
  linkedGoalId?: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  xpAwarded?: boolean
}

export type XPEvent = {
  id: string
  emoji: string
  description: string
  xpAmount: number
  goalName?: string
  timestamp: string
}

export type AppState = {
  playerName: string
  goals: Goal[]
  habits: Habit[]
  checked: Record<string, boolean>
  kanban: KanbanCard[]
  xpFeed: XPEvent[]
  vision: { quoteText: string; quoteSub: string }
  habitHistory: Record<string, Record<string, boolean>>
  streak: number
  lastCheckedDate: string
  habitXP: number
  journalEntries: Record<string, string>
}

export type Level = {
  level: number
  name: string
  emoji: string
  minXp: number
  maxXp: number
}

export const LEVELS: Level[] = [
  { level: 1, name: 'Rookie', emoji: '🪨', minXp: 0, maxXp: 499 },
  { level: 2, name: 'Grinder', emoji: '⚙️', minXp: 500, maxXp: 1499 },
  { level: 3, name: 'Builder', emoji: '🏗️', minXp: 1500, maxXp: 2999 },
  { level: 4, name: 'Operator', emoji: '⚡', minXp: 3000, maxXp: 4999 },
  { level: 5, name: 'Elite', emoji: '👑', minXp: 5000, maxXp: Infinity },
]

export function getLevelInfo(xp: number): Level & { progress: number; xpInLevel: number; xpToNext: number } {
  const level = LEVELS.slice().reverse().find((l) => xp >= l.minXp) ?? LEVELS[0]
  const xpInLevel = xp - level.minXp
  const xpToNext = level.maxXp === Infinity ? 0 : level.maxXp - level.minXp + 1
  const progress = level.maxXp === Infinity ? 100 : Math.min(100, (xpInLevel / xpToNext) * 100)
  return { ...level, progress, xpInLevel, xpToNext }
}
