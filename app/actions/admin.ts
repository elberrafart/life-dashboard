'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'
import { headers } from 'next/headers'

const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL

async function assertAdmin() {
  const user = await getSessionUser()
  if (!user) throw new Error('Unauthorized')

  // Super-admin env var is always valid
  if (user.email && user.email === SUPER_ADMIN_EMAIL) return

  // Check database admins table
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('app_admins')
    .select('email')
    .eq('email', user.email)
    .single()

  if (!data) throw new Error('Unauthorized')
}

async function getSiteUrl() {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
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
  await assertAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) throw new Error(error.message)
  return data.users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at ?? null,
    confirmed: !!u.email_confirmed_at,
  }))
}

export async function inviteUser(email: string) {
  await assertAdmin()
  const supabase = createAdminClient()
  const siteUrl = await getSiteUrl()
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  })
  if (error) throw new Error(error.message)
}

export async function sendPasswordReset(email: string) {
  await assertAdmin()
  const supabase = createAdminClient()
  const siteUrl = await getSiteUrl()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  })
  if (error) throw new Error(error.message)
}

export async function deleteUser(userId: string) {
  await assertAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)
}

// ── Admin management ─────────────────────────────────────────────────────────

export async function listAdmins(): Promise<{ email: string }[]> {
  await assertAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('app_admins')
    .select('email')
    .order('email')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addAdmin(email: string) {
  await assertAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('app_admins').insert({ email })
  if (error) throw new Error(error.message)
}

export async function removeAdmin(email: string) {
  const user = await getSessionUser()
  await assertAdmin()
  if (email === SUPER_ADMIN_EMAIL) throw new Error('Cannot remove the primary admin.')
  if (email === user?.email) throw new Error('Cannot remove yourself.')
  const supabase = createAdminClient()
  const { error } = await supabase.from('app_admins').delete().eq('email', email)
  if (error) throw new Error(error.message)
}
