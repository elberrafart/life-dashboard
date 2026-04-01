'use server'
import { createClient } from '@/lib/supabase-server'

// Decode the JWT and check Authentication Method References.
// Supabase uses amr method "otp" for password-reset & invite sessions.
// This is more reliable than depending on a `type` query param that
// can be stripped by the Supabase redirect-URL allowlist.
function isRecoveryToken(accessToken: string | undefined): boolean {
  if (!accessToken) return false
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1], 'base64').toString('utf8'),
    )
    const amr = payload.amr as { method: string }[] | undefined
    return Array.isArray(amr) && amr.some(a => a.method === 'otp')
  } catch {
    return false
  }
}

export async function setSessionFromTokens(
  accessToken: string,
  refreshToken: string,
): Promise<{ error?: string; isRecovery?: boolean }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
    if (error) return { error: error.message }
    return { isRecovery: isRecoveryToken(accessToken) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Session error' }
  }
}

export async function exchangeCode(code: string): Promise<{ error?: string; isRecovery?: boolean }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) return { error: error.message }
    return { isRecovery: isRecoveryToken(data.session?.access_token) }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Code exchange error' }
  }
}

const ALLOWED_OTP_TYPES = ['invite', 'magiclink', 'recovery', 'email'] as const
type OtpType = typeof ALLOWED_OTP_TYPES[number]

export async function verifyOtp(
  tokenHash: string,
  type: string,
): Promise<{ error?: string; isRecovery?: boolean }> {
  try {
    if (!ALLOWED_OTP_TYPES.includes(type as OtpType)) {
      return { error: 'Invalid token type.' }
    }
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as OtpType })
    if (error) return { error: error.message }
    const isRecovery = type === 'recovery' || type === 'invite' || isRecoveryToken(data.session?.access_token)
    return { isRecovery }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Token verification error' }
  }
}
