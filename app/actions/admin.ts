'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'

const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL

async function assertAdmin() {
  const user = await getSessionUser()
  if (!user) throw new Error('Unauthorized')

  if (user.email && user.email === SUPER_ADMIN_EMAIL) return

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('app_admins')
    .select('email')
    .eq('email', user.email)
    .single()

  if (!data) throw new Error('Unauthorized')
}

function getSiteUrl() {
  // Use explicit env var — never trust request headers for security-sensitive redirects
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
}

export async function checkIsAdmin(): Promise<boolean> {
  try {
    const user = await getSessionUser()
    if (!user) return false
    if (user.email && user.email === SUPER_ADMIN_EMAIL) return true
    const supabase = createAdminClient()
    const { data } = await supabase.from('app_admins').select('email').eq('email', user.email).single()
    return !!data
  } catch {
    return false
  }
}

// ── User management ──────────────────────────────────────────────────────────

export async function listUsers() {
  try {
    await assertAdmin()
    const supabase = createAdminClient()
    const { data, error } = await supabase.auth.admin.listUsers()
    if (error) return { error: error.message, users: [] }
    return {
      users: data.users.map(u => ({
        id: u.id,
        email: u.email ?? '',
        createdAt: u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
        confirmed: !!u.email_confirmed_at,
      })),
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to load users', users: [] }
  }
}

export async function inviteUser(email: string): Promise<{ error?: string }> {
  try {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) || trimmed.length > 254) {
      return { error: 'Please enter a valid email address.' }
    }
    await assertAdmin()
    const supabase = createAdminClient()
    const siteUrl = getSiteUrl()
    const { error } = await supabase.auth.admin.inviteUserByEmail(trimmed, {
      redirectTo: `${siteUrl}/auth/callback`,
    })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to invite user' }
  }
}

export async function sendPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
    const supabase = createAdminClient()
    const siteUrl = getSiteUrl()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`,
    })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to send reset' }
  }
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
    const supabase = createAdminClient()

    // Delete dependent rows before removing the auth user
    for (const table of ['check_ins', 'profiles', 'onboarding'] as const) {
      const { error } = await supabase.from(table).delete().eq('user_id', userId)
      if (error) return { error: `Failed to clean up ${table}: ${error.message}` }
    }

    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to delete user' }
  }
}

// ── Admin management ─────────────────────────────────────────────────────────

export async function listAdmins(): Promise<{ email: string }[]> {
  try {
    await assertAdmin()
    const supabase = createAdminClient()
    const { data } = await supabase.from('app_admins').select('email').order('email')
    return data ?? []
  } catch {
    return []
  }
}

export async function addAdmin(email: string): Promise<{ error?: string }> {
  try {
    await assertAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.from('app_admins').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to add admin' }
  }
}

export async function removeAdmin(email: string): Promise<{ error?: string }> {
  try {
    const user = await getSessionUser()
    await assertAdmin()
    if (email === SUPER_ADMIN_EMAIL) return { error: 'Cannot remove the primary admin.' }
    if (email === user?.email) return { error: 'Cannot remove yourself.' }
    const supabase = createAdminClient()
    const { error } = await supabase.from('app_admins').delete().eq('email', email)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to remove admin' }
  }
}
