'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'
import { checkIsAdmin } from './admin'

export type CheckIn = {
  id: string
  user_id: string
  user_email: string
  date: string
  mood: string | null
  note: string | null
  xp_today: number
  habits_completed: number
  created_at: string
}

export async function submitCheckIn(data: {
  mood: string
  note: string
  xpToday: number
  habitsCompleted: number
}) {
  const user = await getSessionUser()
  if (!user) throw new Error('Not authenticated')

  if (data.note && data.note.length > 1000) throw new Error('Note too long')
  if (typeof data.xpToday !== 'number' || data.xpToday < 0 || data.xpToday > 1_000_000) throw new Error('Invalid XP value')
  if (typeof data.habitsCompleted !== 'number' || data.habitsCompleted < 0 || data.habitsCompleted > 1000) throw new Error('Invalid habits count')

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('check_ins').upsert(
    {
      user_id: user.id,
      user_email: user.email,
      date: today,
      mood: data.mood,
      note: data.note,
      xp_today: data.xpToday,
      habits_completed: data.habitsCompleted,
    },
    { onConflict: 'user_id,date' }
  )

  if (error) throw new Error(error.message)
}

export async function getTodayCheckIn(): Promise<CheckIn | null> {
  const user = await getSessionUser()
  if (!user) return null

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return data ?? null
}

export async function getUserCheckIns(): Promise<CheckIn[]> {
  const user = await getSessionUser()
  if (!user) return []

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(90)

  return data ?? []
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new Error(error.message)
  return data ?? []
}
