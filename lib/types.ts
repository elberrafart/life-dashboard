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

// 11 ranks. Ranks 1-10 are XP-gated.
// Rank 11 (Immortal) requires 14,400 XP + a 60-day streak — exactly 2 months of no misses.
export const LEVELS: Level[] = [
  { level: 1,  name: 'Recruit',   emoji: '🌱', minXp: 0,      maxXp: 199 },
  { level: 2,  name: 'Soldier',   emoji: '⚔️',  minXp: 200,    maxXp: 599 },
  { level: 3,  name: 'Fighter',   emoji: '🥊',  minXp: 600,    maxXp: 1299 },
  { level: 4,  name: 'Warrior',   emoji: '💪',  minXp: 1300,   maxXp: 2499 },
  { level: 5,  name: 'Guardian',  emoji: '🛡️',  minXp: 2500,   maxXp: 4199 },
  { level: 6,  name: 'Veteran',   emoji: '🏅',  minXp: 4200,   maxXp: 6499 },
  { level: 7,  name: 'Champion',  emoji: '🔥',  minXp: 6500,   maxXp: 8999 },
  { level: 8,  name: 'Gladiator', emoji: '⚡',  minXp: 9000,   maxXp: 11499 },
  { level: 9,  name: 'Elite',     emoji: '💎',  minXp: 11500,  maxXp: 13999 },
  { level: 10, name: 'Legend',    emoji: '👑',  minXp: 14000,  maxXp: Infinity },
]

export const IMMORTAL_LEVEL: Level = {
  level: 11, name: 'Immortal', emoji: '🐐', minXp: 14400, maxXp: Infinity,
}
export const IMMORTAL_XP_THRESHOLD  = 14400
export const IMMORTAL_STREAK_DAYS   = 60

export function getLevelInfo(
  xp: number,
  streak = 0,
): Level & { progress: number; xpInLevel: number; xpToNext: number } {
  // Immortal: requires 60-day unbroken streak AND 14,400+ XP (2 months perfect)
  if (xp >= IMMORTAL_XP_THRESHOLD && streak >= IMMORTAL_STREAK_DAYS) {
    return { ...IMMORTAL_LEVEL, progress: 100, xpInLevel: xp - IMMORTAL_LEVEL.minXp, xpToNext: 0 }
  }
  const level = LEVELS.slice().reverse().find((l) => xp >= l.minXp) ?? LEVELS[0]
  const xpInLevel = xp - level.minXp
  const xpToNext = level.maxXp === Infinity ? 0 : level.maxXp - level.minXp + 1
  const progress = level.maxXp === Infinity ? 100 : Math.min(100, (xpInLevel / xpToNext) * 100)
  return { ...level, progress, xpInLevel, xpToNext }
}
