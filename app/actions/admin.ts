'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getSessionUser } from '@/lib/supabase-server'
import { headers } from 'next/headers'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL

async function assertAdmin() {
  const user = await getSessionUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
}

async function getSiteUrl() {
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

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
