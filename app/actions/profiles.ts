'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient, getSessionUser } from '@/lib/supabase-server'
import { checkIsAdmin } from './admin'
import { AppState, Roadmap } from '@/lib/types'

// Payload limits to prevent storage abuse
const MAX_DISPLAY_NAME = 100
const MAX_GOALS = 50
const MAX_HABITS = 100
const MAX_JOURNAL_DATES = 400
const MAX_VISION_IMAGES = 20
// 3 MB per encoded image — accounts for ~33% base64 overhead on top of the
// client-side ~2 MB raw-file ceiling, so client and server agree.
const MAX_VISION_IMAGE_BYTES = 3 * 1024 * 1024
const MAX_APP_STATE_BYTES = 5 * 1024 * 1024 // 5 MB total app state

// YYYY-MM-DD — used to validate journal date keys before they hit the DB.
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

// Per-field caps for profile columns extracted from the appState blob.
// These mirror the limits enforced at onboarding so the client cannot
// bypass them by writing arbitrary values into the dedicated columns.
const PROFILE_FIELD_CAPS = {
  firstName:   50,
  lastName:    50,
  profileYear: 50,
  tagline:    100,
} as const

// Trim a value, return null unless it's a non-empty string within the cap.
function safeProfileString(v: unknown, maxLen: number): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  if (trimmed.length === 0 || trimmed.length > maxLen) return null
  return trimmed
}

export async function syncProfile(data: {
  displayName: string
  xpTotal: number
  streak: number
  goals: { id: string; name: string; emoji: string; category: string; xp: number; taskCount: number }[]
  habits: { id: string; label: string }[]
  journalDates: string[]
  kanbanDone: number
  appState?: Omit<AppState, 'goals'> & { goals: Omit<AppState['goals'][0], 'visionImageBase64'>[] }
  visionImages?: Record<string, string>
}): Promise<{ error?: string }> {
  const user = await getSessionUser()
  if (!user) return { error: 'Not authenticated' }

  // ── Input validation ──────────────────────────────────────────────
  if (typeof data.displayName !== 'string' || data.displayName.length > MAX_DISPLAY_NAME) return { error: 'Invalid display name' }
  if (typeof data.xpTotal !== 'number' || data.xpTotal < 0 || data.xpTotal > 1_000_000) return { error: 'Invalid XP value' }
  if (typeof data.streak !== 'number' || data.streak < 0 || data.streak > 10_000) return { error: 'Invalid streak value' }
  if (typeof data.kanbanDone !== 'number' || data.kanbanDone < 0 || data.kanbanDone > 100_000) return { error: 'Invalid kanban count' }
  if (!Array.isArray(data.goals) || data.goals.length > MAX_GOALS) return { error: 'Too many goals' }
  if (!Array.isArray(data.habits) || data.habits.length > MAX_HABITS) return { error: 'Too many habits' }
  if (!Array.isArray(data.journalDates) || data.journalDates.length > MAX_JOURNAL_DATES) return { error: 'Too many journal dates' }
  // Journal dates become column data; reject anything that isn't a literal
  // YYYY-MM-DD string so the client can't smuggle arbitrary keys.
  if (data.journalDates.some(d => typeof d !== 'string' || !ISO_DATE_RE.test(d))) {
    return { error: 'Invalid journal date format' }
  }

  // Reject oversized app state payloads
  if (data.appState) {
    const stateSize = new TextEncoder().encode(JSON.stringify(data.appState)).length
    if (stateSize > MAX_APP_STATE_BYTES) return { error: 'App state too large' }
  }

  // Validate vision images: count, size, and MIME type (SVG excluded — XSS vector).
  // Bad/oversized images are silently dropped instead of failing the whole sync,
  // so one stuck image can never block app_state, goals, habits, or journal saves.
  const ALLOWED_IMAGE_PREFIXES = [
    'data:image/jpeg;base64,', 'data:image/png;base64,',
    'data:image/gif;base64,', 'data:image/webp;base64,',
  ]
  let cleanedVisionImages: Record<string, string> | undefined
  if (data.visionImages) {
    const keys = Object.keys(data.visionImages)
    if (keys.length > MAX_VISION_IMAGES) return { error: 'Too many vision images' }
    cleanedVisionImages = {}
    for (const key of keys) {
      const img = data.visionImages[key]
      if (typeof img !== 'string') continue
      if (img.length > MAX_VISION_IMAGE_BYTES) continue
      if (!ALLOWED_IMAGE_PREFIXES.some(p => img.startsWith(p))) continue
      cleanedVisionImages[key] = img
    }
  }

  const supabase = await createClient()

  // Extract profile fields from appState to keep individual columns in sync.
  // Each field is type-checked, trimmed, and length-capped before it touches
  // the DB so a malicious or buggy client can't bypass the onboarding limits
  // by syncing arbitrary values into these dedicated columns.
  const appStateRaw = data.appState as Record<string, unknown> | undefined
  const profileFields = appStateRaw ? {
    first_name:   safeProfileString(appStateRaw.firstName,   PROFILE_FIELD_CAPS.firstName),
    last_name:    safeProfileString(appStateRaw.lastName,    PROFILE_FIELD_CAPS.lastName),
    profile_year: safeProfileString(appStateRaw.profileYear, PROFILE_FIELD_CAPS.profileYear),
    tagline:      safeProfileString(appStateRaw.tagline,     PROFILE_FIELD_CAPS.tagline),
  } : {}

  // Save app state first (small payload — must not fail due to image size)
  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      user_id: user.id,
      user_email: user.email,
      display_name: data.displayName,
      xp_total: data.xpTotal,
      streak: data.streak,
      goals: data.goals,
      habits: data.habits,
      journal_dates: data.journalDates,
      kanban_done: data.kanbanDone,
      app_state: data.appState ?? null,
      ...profileFields,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (profileError) return { error: profileError.message }

  // Save vision images in a separate update — may be large, allowed to fail independently
  if (cleanedVisionImages && Object.keys(cleanedVisionImages).length > 0) {
    const { error: imgError } = await supabase
      .from('user_profiles')
      .update({ vision_images: cleanedVisionImages })
      .eq('user_id', user.id)

    if (imgError) return { error: imgError.message }
  }

  return {}
}

export async function loadUserState(): Promise<{ state?: AppState; images?: Record<string, string> }> {
  const user = await getSessionUser()
  if (!user) return {}

  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('app_state, vision_images, first_name, last_name, profile_year, tagline, display_name')
    .eq('user_id', user.id)
    .single()

  if (!data) return {}

  const appState = (data.app_state as AppState) ?? undefined
  // Merge individual profile columns into app_state so onboarding data isn't lost
  const profileOverlay = {
    ...(data.first_name != null && { firstName: data.first_name as string }),
    ...(data.last_name != null && { lastName: data.last_name as string }),
    ...(data.profile_year != null && { profileYear: data.profile_year as string }),
    ...(data.tagline != null && { tagline: data.tagline as string }),
    ...(data.display_name != null && { playerName: data.display_name as string }),
  }

  if (!appState) {
    // No app_state yet (fresh after onboarding) — return profile columns as seed state
    if (Object.keys(profileOverlay).length === 0) return {}
    return { state: profileOverlay as AppState }
  }

  // Merge: individual columns win when app_state fields are empty/missing
  const merged: AppState = { ...appState }
  if (!merged.firstName && profileOverlay.firstName) merged.firstName = profileOverlay.firstName
  if (!merged.lastName && profileOverlay.lastName) merged.lastName = profileOverlay.lastName
  if (!merged.profileYear && profileOverlay.profileYear) merged.profileYear = profileOverlay.profileYear
  if (!merged.tagline && profileOverlay.tagline) merged.tagline = profileOverlay.tagline
  if (!merged.playerName && profileOverlay.playerName) merged.playerName = profileOverlay.playerName

  return {
    state: merged,
    images: (data.vision_images as Record<string, string>) ?? undefined,
  }
}

export type UserProfile = {
  user_id: string
  user_email: string
  display_name: string | null
  xp_total: number
  streak: number
  goals: { id: string; name: string; emoji: string; category: string; xp: number; taskCount: number }[]
  habits: { id: string; label: string }[]
  journal_dates: string[]
  kanban_done: number
  updated_at: string
}

export async function getLeaderboard(): Promise<Pick<UserProfile, 'user_id' | 'display_name' | 'xp_total' | 'streak' | 'kanban_done' | 'updated_at'>[]> {
  const user = await getSessionUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, display_name, xp_total, streak, kanban_done, updated_at, app_state')
    .order('xp_total', { ascending: false })
    .limit(120)

  if (error) throw new Error(error.message)

  return (data ?? [])
    .filter(e => !(e.app_state as Record<string, unknown>)?.hideFromLeaderboard)
    .slice(0, 100)
    .map(({ app_state: _, ...rest }) => rest)
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  // Admin client list only needs summary columns — never pull `app_state` or
  // `vision_images`, which can be multi-MB JSONB blobs per user and turn this
  // into a 2-3 second query. Full app_state is fetched on-demand by the
  // client detail view via `adminGetUserAppState`.
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, user_email, display_name, xp_total, streak, goals, habits, journal_dates, kanban_done, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function adminGetUserAppState(userId: string): Promise<AppState | null> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) throw new Error('Invalid user ID')

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('app_state')
    .eq('user_id', userId)
    .single()

  return (data?.app_state as AppState) ?? null
}

export async function adminSetUserLists(
  userId: string,
  patch: {
    habits?: AppState['habits']
    goals?: AppState['goals']
    kanban?: AppState['kanban']
  }
): Promise<{ error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  // Validate userId format (UUID)
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return { error: 'Invalid user ID' }
  }

  // Validate array sizes to prevent oversized payloads
  if (patch.habits && (!Array.isArray(patch.habits) || patch.habits.length > MAX_HABITS)) {
    return { error: 'Too many habits' }
  }
  if (patch.goals && (!Array.isArray(patch.goals) || patch.goals.length > MAX_GOALS)) {
    return { error: 'Too many goals' }
  }
  if (patch.kanban && (!Array.isArray(patch.kanban) || patch.kanban.length > 500)) {
    return { error: 'Too many kanban cards' }
  }

  const supabase = createAdminClient()

  const { data } = await supabase
    .from('user_profiles')
    .select('app_state')
    .eq('user_id', userId)
    .single()

  const current = (data?.app_state as AppState) ?? {}
  const updated: AppState = {
    ...current,
    ...(patch.habits !== undefined && { habits: patch.habits }),
    ...(patch.goals !== undefined && { goals: patch.goals }),
    ...(patch.kanban !== undefined && { kanban: patch.kanban }),
  } as AppState

  // Update app_state and the denormalized summary columns
  const { error } = await supabase
    .from('user_profiles')
    .update({
      app_state: updated,
      ...(patch.goals !== undefined && {
        goals: patch.goals.map(g => ({
          id: g.id, name: g.name, emoji: g.emoji,
          category: g.category, xp: g.xp, taskCount: g.tasks.length,
        })),
      }),
      ...(patch.habits !== undefined && {
        habits: patch.habits.map(h => ({ id: h.id, label: h.label })),
      }),
    })
    .eq('user_id', userId)

  if (error) return { error: error.message }
  return {}
}

// ── Roadmap ──────────────────────────────────────────────────────────────────
// Stored in its own `roadmap` JSONB column (not inside app_state) because the
// client's "local-wins" sync loop in lib/context.tsx would otherwise overwrite
// admin edits. Only admins write; the owning user reads their own row via RLS.

const MAX_ROADMAP_PHASES = 20
const MAX_ROADMAP_BYTES  = 64 * 1024
const MAX_PHASE_LABEL    = 100
const MAX_PHASE_DESC     = 1000

function validateRoadmap(roadmap: Roadmap): string | null {
  if (!roadmap || typeof roadmap !== 'object') return 'Invalid roadmap'
  if (!Array.isArray(roadmap.phases)) return 'Invalid phases'
  if (roadmap.phases.length > MAX_ROADMAP_PHASES) return 'Too many phases'
  const size = new TextEncoder().encode(JSON.stringify(roadmap)).length
  if (size > MAX_ROADMAP_BYTES) return 'Roadmap too large'
  for (const p of roadmap.phases) {
    if (typeof p.id !== 'string' || p.id.length > 60) return 'Invalid phase id'
    if (typeof p.number !== 'number' || p.number < 0 || p.number > 99) return 'Invalid phase number'
    if (typeof p.emoji !== 'string' || p.emoji.length > 8) return 'Invalid emoji'
    if (typeof p.label !== 'string' || p.label.length > MAX_PHASE_LABEL) return 'Invalid label'
    if (typeof p.description !== 'string' || p.description.length > MAX_PHASE_DESC) return 'Invalid description'
    if (typeof p.weekStart !== 'number' || p.weekStart < 0 || p.weekStart > 520) return 'Invalid weekStart'
    if (typeof p.weekEnd   !== 'number' || p.weekEnd   < 0 || p.weekEnd   > 520) return 'Invalid weekEnd'
    if (p.startedAt   !== undefined && (typeof p.startedAt   !== 'string' || p.startedAt.length   > 40)) return 'Invalid startedAt'
    if (p.completedAt !== undefined && (typeof p.completedAt !== 'string' || p.completedAt.length > 40)) return 'Invalid completedAt'
  }
  if (roadmap.title !== undefined && (typeof roadmap.title !== 'string' || roadmap.title.length > 120)) return 'Invalid title'
  if (roadmap.currentWeekOverride !== undefined &&
      (typeof roadmap.currentWeekOverride !== 'number' || roadmap.currentWeekOverride < 0 || roadmap.currentWeekOverride > 520)) {
    return 'Invalid currentWeekOverride'
  }
  return null
}

export async function getMyRoadmap(): Promise<Roadmap | null> {
  const user = await getSessionUser()
  if (!user) return null
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('roadmap')
    .eq('user_id', user.id)
    .single()
  return (data?.roadmap as Roadmap) ?? null
}

export async function adminGetRoadmap(userId: string): Promise<Roadmap | null> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) throw new Error('Invalid user ID')

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('roadmap')
    .eq('user_id', userId)
    .single()
  return (data?.roadmap as Roadmap) ?? null
}

export async function adminSetRoadmap(userId: string, roadmap: Roadmap | null): Promise<{ error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) return { error: 'Invalid user ID' }

  if (roadmap !== null) {
    const err = validateRoadmap(roadmap)
    if (err) return { error: err }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('user_profiles')
    .update({ roadmap })
    .eq('user_id', userId)

  if (error) return { error: error.message }
  return {}
}

export async function getProfileCheckIns(userId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')
  if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) throw new Error('Invalid user ID')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(30)

  if (error) throw new Error(error.message)
  return data ?? []
}
