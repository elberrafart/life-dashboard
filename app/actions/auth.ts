'use server'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export type LoginState = { error?: string } | undefined

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return { error: `Env vars missing: URL=${!!process.env.SUPABASE_URL} KEY=${!!process.env.SUPABASE_KEY}` }
  }
  if (!process.env.SUPABASE_URL.includes('supabase.co')) {
    return { error: `Bad URL: "${process.env.SUPABASE_URL}"` }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
