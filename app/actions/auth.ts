'use server'
import { createClient, getSessionUser } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { rateLimit } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'

export type LoginState = { error?: string } | undefined
export type UpdatePasswordState = { error?: string; success?: string } | undefined
export type ResetPasswordState = { error?: string; success?: string } | undefined

// Rate limit: 5 login attempts per email per 15 minutes
const LOGIN_LIMIT = { maxAttempts: 5, windowMs: 15 * 60 * 1000 }
// Rate limit: 3 password reset requests per email per 15 minutes
const RESET_LIMIT = { maxAttempts: 3, windowMs: 15 * 60 * 1000 }

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { allowed } = rateLimit(`login:${email.toLowerCase().trim()}`, LOGIN_LIMIT)
  if (!allowed) {
    return { error: 'Too many login attempts. Please try again later.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  if (data.user?.user_metadata?.force_password_change) {
    redirect('/update-password')
  }

  redirect('/')
}

export async function resetPassword(_state: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const { allowed } = rateLimit(`reset:${email}`, RESET_LIMIT)
  if (!allowed) {
    return { error: 'Too many reset requests. Please try again later.' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
  const supabase = createAdminClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?type=recovery`,
  })

  if (error) return { error: error.message }
  return { success: 'Check your email for a reset link.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function sendSelfPasswordReset(): Promise<{ error?: string; success?: string }> {
  const user = await getSessionUser()
  if (!user?.email) return { error: 'Not authenticated' }

  const { allowed } = rateLimit(`self-reset:${user.email}`, RESET_LIMIT)
  if (!allowed) {
    return { error: 'Too many reset requests. Please try again later.' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
  const supabase = createAdminClient()
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${siteUrl}/auth/callback?type=recovery`,
  })
  if (error) return { error: error.message }
  return { success: `Reset link sent to ${user.email}` }
}

export async function updatePassword(_state: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (!/[A-Z]/.test(password)) {
    return { error: 'Password must contain at least one uppercase letter.' }
  }
  if (!/[0-9]/.test(password)) {
    return { error: 'Password must contain at least one number.' }
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { error: 'Password must contain at least one special character.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password,
    data: { force_password_change: false },
  })

  if (error) {
    return { error: error.message }
  }

  // Sign out so the recovery JWT (which carries amr=otp) is fully cleared.
  // The proxy treats amr=otp sessions as "must update password", so leaving
  // the recovery session alive after a successful update would trap the user
  // in a redirect loop. Forcing a fresh login guarantees a clean session.
  await supabase.auth.signOut()
  redirect('/login?reset=success')
}
