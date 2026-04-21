export type Task = {
  id: string
  name: string
  xp: 10 | 25 | 50 | 100 | 500 | 1000
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
  imageOffset?: { x: number; y: number }
  imageScale?: number
  imageAspect?: 'portrait' | 'landscape'
  archivedAt?: string
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
  completedAt?: string
}

export type XPEvent = {
  id: string
  emoji: string
  description: string
  xpAmount: number
  goalName?: string
  timestamp: string
}

export type RoadmapPhase = {
  id: string
  number: number
  emoji: string
  label: string
  description: string
  weekStart: number
  weekEnd: number
  startedAt?: string
  completedAt?: string
}

export type Roadmap = {
  title?: string
  phases: RoadmapPhase[]
  currentWeekOverride?: number
}

export const DEFAULT_ROADMAP_TITLE = 'Your 6 Month Roadmap'

export const DEFAULT_ROADMAP_PHASES: RoadmapPhase[] = [
  { id: 'p-1', number: 1, emoji: '🌱', label: 'Foundation',      description: 'Metabolic reset. Build the system. Establish baseline habits and identity work.',                        weekStart: 1,  weekEnd: 6  },
  { id: 'p-2', number: 2, emoji: '⚡', label: 'Momentum',        description: 'Fat loss accelerating. Cortisol managed. Identity starting to lock in.',                                 weekStart: 7,  weekEnd: 14 },
  { id: 'p-3', number: 3, emoji: '🌊', label: 'The Messy Middle', description: 'Progress slows visually. This is where most men quit. You won\u2019t. Trust the system.',               weekStart: 15, weekEnd: 18 },
  { id: 'p-4', number: 4, emoji: '👑', label: 'Emergence',       description: 'The physique reveals itself. Identity locked. Standards permanently elevated.',                         weekStart: 19, weekEnd: 24 },
]

// ── Knowledge Hub ──────────────────────────────────────────────────────────
// Global, admin-editable content shared across all users. Stored as a
// singleton row in the knowledge_hub table.

export type KnowledgeVideo = { id: string; title: string }
export type KnowledgeBook  = { title: string; author: string; year?: number }
export type KnowledgePodcast = { name: string; description: string }

export type KnowledgeHubContent = {
  videos: KnowledgeVideo[]
  intro: string
  books: KnowledgeBook[]
  podcasts: KnowledgePodcast[]
}

export const DEFAULT_KNOWLEDGE_HUB: KnowledgeHubContent = {
  videos: [
    { id: 'wy-s8j7SD5k', title: 'Intro to Program' },
    { id: '49Uv4RZVqaQ', title: 'Discipline' },
    { id: 'zjdcF3PEpUY', title: 'Identity' },
    { id: '6vWBEAXRy-o', title: 'Aesthetic Ratios' },
    { id: 'MXZ0rJV5jxE', title: 'Progressive Overload' },
    { id: 'TMKXf64jfPM', title: 'Environment' },
    { id: '3GOaBHEIpI0', title: 'High Test Lifestyle' },
    { id: 'Vzu95T_cSRk', title: 'Lean Year Round' },
    { id: 'ulgR34ObxUY', title: 'Vision' },
    { id: 'iekqfhhwOx4', title: 'Aura Farming' },
  ],
  intro: 'Reading is imperative for success. You can download the wins and mistakes of billionaires, your favourites, or your idols. You\u2019ll notice the same lessons humans have dealt with time and time again on the journey to success \u2014 whether in fitness, business, or relationships.',
  books: [
    { title: 'Psycho-Cybernetics', author: 'Maxwell Maltz' },
    { title: "Rockefeller's Personal 38 Laws of Power He Gave His Son", author: 'Attributed to John D. Rockefeller' },
    { title: 'The Richest Man in Babylon', author: 'George S. Clason', year: 1926 },
    { title: 'As A Man Thinketh', author: 'James Allen', year: 1903 },
    { title: 'Feeling Is the Secret', author: 'Neville Goddard', year: 1944 },
    { title: 'The Power of Your Subconscious Mind', author: 'Joseph Murphy', year: 1963 },
    { title: 'The Way Of The Superior Man', author: 'David Deida' },
    { title: 'The 50th Law', author: 'Robert Greene & 50 Cent' },
  ],
  podcasts: [
    {
      name: 'Founders',
      description: 'Learn from history\u2019s greatest entrepreneurs. Every week, a biography of an entrepreneur is read end-to-end and the ideas are distilled into lessons you can use in your own work.',
    },
  ],
}

export function extractYoutubeId(input: string): string {
  const trimmed = (input ?? '').trim()
  let m = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  m = trimmed.match(/[?&]v=([A-Za-z0-9_-]+)/)
  if (m) return m[1]
  return trimmed
}

/**
 * Compute the current week from a roadmap. Preference order:
 *   1. Admin-set override
 *   2. Weeks elapsed since the earliest startedAt across phases
 *   3. null (nothing started yet)
 */
export function getCurrentRoadmapWeek(roadmap: Roadmap | null | undefined, now = Date.now()): number | null {
  if (!roadmap) return null
  if (typeof roadmap.currentWeekOverride === 'number' && roadmap.currentWeekOverride > 0) {
    return roadmap.currentWeekOverride
  }
  const startedTimes = (roadmap.phases ?? [])
    .map(p => p.startedAt ? Date.parse(p.startedAt) : NaN)
    .filter(t => !isNaN(t))
  if (startedTimes.length === 0) return null
  const earliest = Math.min(...startedTimes)
  const weeks = Math.floor((now - earliest) / (7 * 24 * 60 * 60 * 1000)) + 1
  return Math.max(1, weeks)
}

// User-owned identity workbook. Flat key→value buckets so we can add new
// fields without schema churn. Synced via the existing AppState save loop.
export type IdentityWorkbook = {
  fields: Record<string, string>
  checks: Record<string, boolean>
  lists:  Record<string, string[]>
}

export const EMPTY_IDENTITY_WORKBOOK: IdentityWorkbook = { fields: {}, checks: {}, lists: {} }

export type AppState = {
  playerName: string
  firstName: string
  lastName: string
  profileYear: string
  tagline: string
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
  moodLog: Record<string, string>
  goalArchive: Goal[]
  kanbanArchive: KanbanCard[]
  hideFromLeaderboard?: boolean
  identityWorkbook?: IdentityWorkbook
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
