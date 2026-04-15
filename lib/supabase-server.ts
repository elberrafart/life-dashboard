import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from './env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component — middleware handles session refresh
          }
        },
      },
    }
  )
}

export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

export async function createAdminClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_KEY,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component — middleware handles session refresh
          }
        },
      },
    }
  )
}
