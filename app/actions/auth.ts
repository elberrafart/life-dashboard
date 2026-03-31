'use server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export type LoginState = { error?: string } | undefined
export type UpdatePasswordState = { error?: string; success?: string } | undefined
export type ResetPasswordState = { error?: string; success?: string } | undefined

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect('/')
}

export async function resetPassword(_state: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  })

  if (error) return { error: error.message }
  return { success: 'Check your email for a reset link.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
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
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect('/setup')
}
