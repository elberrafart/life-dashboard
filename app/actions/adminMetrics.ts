'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { checkIsAdmin } from './admin'

export type RosterStats = {
  totalClients: number
  activeClients: number         // checked in within last 7 days
  avgStreak: number
  checkInsThisWeek: number
  xpThisWeek: number
}

export type TodayPulseEntry = {
  userId: string
  displayName: string | null
  email: string
  xpTotal: number
  streak: number
  checkedIn: boolean
  mood: string | null
  note: string | null
  xpToday: number
  habitsCompleted: number
}

export type JournalFeedEntry = {
  userId: string
  displayName: string | null
  email: string
  date: string
  text: string
  mood?: string
}

export type AdminDashboard = {
  stats: RosterStats
  todayPulse: TodayPulseEntry[]
  recentJournal: JournalFeedEntry[]
}

// ISO date string (YYYY-MM-DD) for today in local time.
function todayIso(): string {
  return new Date().toISOString().split('T')[0]
}

// ISO date string (YYYY-MM-DD) for Monday of this week in local time.
function weekStartIso(): string {
  const now = new Date()
  const day = now.getDay()            // 0 = Sun
  const diff = (day + 6) % 7          // days since Monday
  now.setHours(0, 0, 0, 0)
  now.setDate(now.getDate() - diff)
  return now.toISOString().split('T')[0]
}

// Journal feed cutoff: 30 days back. Keeps response size bounded.
function journalCutoffIso(): string {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().split('T')[0]
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const today = todayIso()
  const weekStart = weekStartIso()
  const journalCutoff = journalCutoffIso()

  // Parallel queries.
  // For the journal feed we extract only the JSON keys we need (journalEntries
  // + moodLog) instead of the full app_state blob, which can be several MB.
  const [profilesRes, todayCheckInsRes, weekCheckInsRes, journalRes] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('user_id, user_email, display_name, xp_total, streak')
      .order('xp_total', { ascending: false }),
    supabase
      .from('check_ins')
      .select('user_id, mood, note, xp_today, habits_completed')
      .eq('date', today),
    supabase
      .from('check_ins')
      .select('user_id, xp_today')
      .gte('date', weekStart),
    supabase
      .from('user_profiles')
      .select('user_id, user_email, display_name, journal:app_state->journalEntries, moods:app_state->moodLog'),
  ])

  if (profilesRes.error)      throw new Error(profilesRes.error.message)
  if (todayCheckInsRes.error) throw new Error(todayCheckInsRes.error.message)
  if (weekCheckInsRes.error)  throw new Error(weekCheckInsRes.error.message)
  if (journalRes.error)       throw new Error(journalRes.error.message)

  const profiles       = profilesRes.data ?? []
  const todayCheckIns  = todayCheckInsRes.data ?? []
  const weekCheckIns   = weekCheckInsRes.data ?? []
  const journalRows    = journalRes.data ?? []

  // ── Stats ──
  const totalClients = profiles.length
  const activeUserIds = new Set(weekCheckIns.map(c => c.user_id))
  const activeClients = activeUserIds.size
  const avgStreak = profiles.length > 0
    ? Math.round(profiles.reduce((s, p) => s + (p.streak ?? 0), 0) / profiles.length)
    : 0
  const checkInsThisWeek = weekCheckIns.length
  const xpThisWeek = weekCheckIns.reduce((s, c) => s + (c.xp_today ?? 0), 0)

  // ── Today's pulse ──
  const todayByUser = new Map(todayCheckIns.map(c => [c.user_id, c]))
  const todayPulse: TodayPulseEntry[] = profiles.map(p => {
    const c = todayByUser.get(p.user_id)
    return {
      userId: p.user_id,
      displayName: p.display_name ?? null,
      email: p.user_email,
      xpTotal: p.xp_total ?? 0,
      streak: p.streak ?? 0,
      checkedIn: !!c,
      mood: c?.mood ?? null,
      note: c?.note ?? null,
      xpToday: c?.xp_today ?? 0,
      habitsCompleted: c?.habits_completed ?? 0,
    }
  })
  // Checked-in first, then by total XP.
  todayPulse.sort((a, b) => {
    if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1
    return b.xpTotal - a.xpTotal
  })

  // ── Recent journal feed ──
  // Flatten per-user journalEntries (Record<date, text>) across all users.
  // Filter to last 30 days and cap at 50 most recent entries.
  const recentJournal: JournalFeedEntry[] = []
  for (const row of journalRows) {
    const r = row as { user_id: string; user_email: string; display_name: string | null; journal: Record<string, string> | null; moods: Record<string, string> | null }
    const entries = r.journal
    const moods = r.moods
    if (!entries || typeof entries !== 'object') continue
    for (const [date, text] of Object.entries(entries)) {
      if (typeof text !== 'string' || !text.trim()) continue
      if (date < journalCutoff) continue
      recentJournal.push({
        userId: r.user_id,
        displayName: r.display_name,
        email: r.user_email,
        date,
        text,
        mood: moods?.[date],
      })
    }
  }
  recentJournal.sort((a, b) => (a.date < b.date ? 1 : -1))

  return {
    stats: { totalClients, activeClients, avgStreak, checkInsThisWeek, xpThisWeek },
    todayPulse,
    recentJournal: recentJournal.slice(0, 50),
  }
}
