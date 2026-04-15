'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'
import { env } from '@/lib/env'

const SUPER_ADMIN_EMAIL = env.ADMIN_EMAIL

// Normalize and validate an email coming in from a server-action argument.
// Every admin action that touches Supabase auth or the app_admins table runs
// the input through this — never pass an unvalidated client string into the
// database or into Supabase's email-bearing APIs.
function normalizeEmail(email: unknown): { ok: true; email: string } | { ok: false; error: string } {
  if (typeof email !== 'string') return { ok: false, error: 'Invalid email' }
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || trimmed.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }
  return { ok: true, email: trimmed }
}

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

function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const special = '@#$!'
  const all = upper + lower + digits
  let pass = ''
  pass += upper[Math.floor(Math.random() * upper.length)]
  pass += digits[Math.floor(Math.random() * digits.length)]
  pass += special[Math.floor(Math.random() * special.length)]
  for (let i = 0; i < 7; i++) pass += all[Math.floor(Math.random() * all.length)]
  return pass.split('').sort(() => Math.random() - 0.5).join('')
}

export async function createUser(email: string): Promise<{ error?: string; tempPassword?: string }> {
  try {
    const normalized = normalizeEmail(email)
    if (!normalized.ok) return { error: normalized.error }
    await assertAdmin()
    const supabase = createAdminClient()
    const tempPassword = generateTempPassword()
    const { error } = await supabase.auth.admin.createUser({
      email: normalized.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { force_password_change: true },
    })
    if (error) return { error: error.message }
    return { tempPassword }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create user' }
  }
}

export async function sendPasswordReset(email: string): Promise<{ error?: string }> {
  try {
    const normalized = normalizeEmail(email)
    if (!normalized.ok) return { error: normalized.error }
    await assertAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase.auth.resetPasswordForEmail(normalized.email, {
      redirectTo: `${env.SITE_URL}/auth/callback`,
    })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to send reset' }
  }
}

export async function deleteUser(userId: string): Promise<{ error?: string }> {
  try {
    if (typeof userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(userId)) {
      return { error: 'Invalid user ID' }
    }
    await assertAdmin()
    const supabase = createAdminClient()

    // Delete dependent rows before removing the auth user
    for (const table of ['check_ins', 'user_profiles'] as const) {
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
    const normalized = normalizeEmail(email)
    if (!normalized.ok) return { error: normalized.error }
    await assertAdmin()
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('app_admins')
      .upsert({ email: normalized.email }, { onConflict: 'email', ignoreDuplicates: true })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to add admin' }
  }
}

export async function removeAdmin(email: string): Promise<{ error?: string }> {
  try {
    const normalized = normalizeEmail(email)
    if (!normalized.ok) return { error: normalized.error }
    const user = await getSessionUser()
    await assertAdmin()
    if (normalized.email === SUPER_ADMIN_EMAIL) return { error: 'Cannot remove the primary admin.' }
    if (normalized.email === user?.email?.toLowerCase()) return { error: 'Cannot remove yourself.' }
    const supabase = createAdminClient()
    const { error } = await supabase.from('app_admins').delete().eq('email', normalized.email)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to remove admin' }
  }
}
