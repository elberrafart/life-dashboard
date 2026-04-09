'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export async function getOnboardingStatus(): Promise<boolean> {
  const user = await getSessionUser()
  if (!user) return true // not logged in — don't redirect to setup

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('onboarding_complete')
    .eq('user_id', user.id)
    .single()

  return data?.onboarding_complete ?? false
}

export type OnboardingState = { error?: string } | undefined

export async function saveOnboarding(
  _state: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await getSessionUser()
  if (!user) return { error: 'Not authenticated' }

  const firstName = (formData.get('firstName') as string)?.trim()
  const lastName = (formData.get('lastName') as string)?.trim()
  const profileYear = (formData.get('profileYear') as string)?.trim()
  const tagline = (formData.get('tagline') as string)?.trim()

  if (!firstName) return { error: 'First name is required.' }
  if (firstName.length > 50) return { error: 'First name must be 50 characters or less.' }
  if (lastName && lastName.length > 50) return { error: 'Last name must be 50 characters or less.' }
  if (profileYear && profileYear.length > 50) return { error: 'Year/Cohort must be 50 characters or less.' }
  if (tagline && tagline.length > 100) return { error: 'Tagline must be 100 characters or less.' }

  const supabase = createAdminClient()
  const displayName = [firstName, lastName].filter(Boolean).join(' ')

  // Initialize app_state so the dashboard has profile data immediately
  const initialAppState = {
    playerName: displayName,
    firstName,
    lastName: lastName || '',
    profileYear: profileYear || '',
    tagline: tagline || '',
    goals: [],
    habits: [],
    checked: {},
    kanban: [],
    xpFeed: [],
    vision: { quoteText: '', quoteSub: '' },
    habitHistory: {},
    streak: 0,
    lastCheckedDate: '',
    habitXP: 0,
    journalEntries: {},
    moodLog: {},
    goalArchive: [],
    kanbanArchive: [],
    hideFromLeaderboard: false,
  }

  const { error } = await supabase.from('user_profiles').upsert(
    {
      user_id: user.id,
      user_email: user.email,
      display_name: displayName,
      first_name: firstName,
      last_name: lastName || null,
      profile_year: profileYear || null,
      tagline: tagline || null,
      onboarding_complete: true,
      app_state: initialAppState,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) return { error: error.message }

  redirect('/')
}
