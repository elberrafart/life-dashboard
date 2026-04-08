'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient, getSessionUser } from '@/lib/supabase-server'
import { checkIsAdmin } from './admin'
import { AppState } from '@/lib/types'

// Payload limits to prevent storage abuse
const MAX_DISPLAY_NAME = 100
const MAX_GOALS = 50
const MAX_HABITS = 100
const MAX_JOURNAL_DATES = 400
const MAX_VISION_IMAGES = 20
const MAX_VISION_IMAGE_BYTES = 2 * 1024 * 1024 // 2 MB per image
const MAX_APP_STATE_BYTES = 5 * 1024 * 1024 // 5 MB total app state

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

  // Reject oversized app state payloads
  if (data.appState) {
    const stateSize = new TextEncoder().encode(JSON.stringify(data.appState)).length
    if (stateSize > MAX_APP_STATE_BYTES) return { error: 'App state too large' }
  }

  // Validate vision images: count, size, and MIME type (SVG excluded — XSS vector)
  const ALLOWED_IMAGE_PREFIXES = [
    'data:image/jpeg;base64,', 'data:image/png;base64,',
    'data:image/gif;base64,', 'data:image/webp;base64,',
  ]
  if (data.visionImages) {
    const keys = Object.keys(data.visionImages)
    if (keys.length > MAX_VISION_IMAGES) return { error: 'Too many vision images' }
    for (const key of keys) {
      const img = data.visionImages[key]
      if (typeof img !== 'string') return { error: 'Invalid image data' }
      if (img.length > MAX_VISION_IMAGE_BYTES) return { error: 'Image too large (max 2 MB)' }
      if (!ALLOWED_IMAGE_PREFIXES.some(p => img.startsWith(p))) return { error: 'Unsupported image type' }
    }
  }

  const supabase = await createClient()

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
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (profileError) return { error: profileError.message }

  // Save vision images in a separate update — may be large, allowed to fail independently
  if (data.visionImages && Object.keys(data.visionImages).length > 0) {
    const { error: imgError } = await supabase
      .from('user_profiles')
      .update({ vision_images: data.visionImages })
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
    .select('app_state, vision_images')
    .eq('user_id', user.id)
    .single()

  if (!data?.app_state) return {}
  return {
    state: data.app_state as AppState,
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

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
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
