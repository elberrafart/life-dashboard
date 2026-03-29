'use server'
import { createClient } from '@/lib/supabase-server'

export async function setSessionFromTokens(
  accessToken: string,
  refreshToken: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Session error' }
  }
}

export async function exchangeCode(code: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Code exchange error' }
  }
}

export async function verifyOtp(
  tokenHash: string,
  type: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'invite' | 'magiclink' | 'recovery' | 'email',
    })
    if (error) return { error: error.message }
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Token verification error' }
  }
}
