import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export function createAdminClient() {
  return createClient(
    env.SUPABASE_URL,
    env.SUPABASE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
