'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'
import { checkIsAdmin } from './admin'
import { AppState } from '@/lib/types'

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
}) {
  const user = await getSessionUser()
  if (!user) return

  const supabase = createAdminClient()
  await supabase.from('user_profiles').upsert(
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
      vision_images: data.visionImages ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
}

export async function loadUserState(): Promise<{ state?: AppState; images?: Record<string, string> }> {
  const user = await getSessionUser()
  if (!user) return {}

  const supabase = createAdminClient()
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

export async function getLeaderboard(): Promise<Pick<UserProfile, 'user_id' | 'user_email' | 'display_name' | 'xp_total' | 'streak' | 'kanban_done' | 'updated_at'>[]> {
  const user = await getSessionUser()
  if (!user) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, user_email, display_name, xp_total, streak, kanban_done, updated_at')
    .order('xp_total', { ascending: false })
    .limit(100)

  if (error) throw new Error(error.message)
  return data ?? []
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

export async function getProfileCheckIns(userId: string) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

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
