import { NextResponse, type NextRequest } from 'next/server'

const PROJECT_REF = 'ecpldhnaocwaiefcxzvx'
const AUTH_COOKIE_NAME = `sb-${PROJECT_REF}-auth-token`

/**
 * Reads the Supabase access token from the session cookie. Handles both
 * single-cookie and chunked-cookie formats, and the optional `base64-` prefix.
 * Returns null if anything goes wrong — callers must treat that as "no session".
 */
function readAccessToken(request: NextRequest): string | null {
  const all = request.cookies.getAll()
  const single = all.find(c => c.name === AUTH_COOKIE_NAME)?.value
  const chunked = all
    .filter(c => c.name.startsWith(`${AUTH_COOKIE_NAME}.`))
    .sort((a, b) => {
      const ai = parseInt(a.name.split('.').pop() || '0', 10)
      const bi = parseInt(b.name.split('.').pop() || '0', 10)
      return ai - bi
    })
    .map(c => c.value)
    .join('')

  let raw = single || chunked || null
  if (!raw) return null

  try {
    if (raw.startsWith('base64-')) raw = atob(raw.slice(7))
    const session = JSON.parse(raw)
    return typeof session?.access_token === 'string' ? session.access_token : null
  } catch {
    return null
  }
}

/**
 * Detects whether a session was minted via the recovery / invite OTP flow.
 * Supabase tags those sessions with `amr: [{ method: 'otp' }]`. We force such
 * sessions to /update-password so the user can't bypass setting a new password
 * by clicking a recovery link and landing on the dashboard already authenticated.
 */
function isRecoverySession(accessToken: string): boolean {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    const amr = payload?.amr as { method: string }[] | undefined
    return Array.isArray(amr) && amr.some(a => a?.method === 'otp')
  } catch {
    return false
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/login'
  const isUpdatePassword = pathname === '/update-password'
  const isAuthCallback = pathname.startsWith('/auth/')
  const isPublicPage = isLoginPage || isAuthCallback || isUpdatePassword

  const accessToken = readAccessToken(request)
  const hasSession = !!accessToken

  // Force recovery / invite sessions to set a new password before doing anything
  // else. This is the safety net for cases where the email link bypasses
  // /auth/callback (e.g. Supabase Site URL misconfigured) and lands the user
  // on the dashboard already authenticated.
  if (hasSession && !isUpdatePassword && !isAuthCallback && !isLoginPage) {
    if (isRecoverySession(accessToken)) {
      return NextResponse.redirect(new URL('/update-password', request.url))
    }
  }

  if (!hasSession && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && isLoginPage) {
    // Don't trap a user with a recovery session at /login — let them through
    // to /update-password instead.
    if (isRecoverySession(accessToken)) {
      return NextResponse.redirect(new URL('/update-password', request.url))
    }
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js hydration requires inline scripts
      "style-src 'self' 'unsafe-inline'",                  // App uses inline styles extensively
      "img-src 'self' data: blob:",                        // Base64 vision images use data: URIs
      "font-src 'self'",                                   // next/font self-hosts Google Fonts
      "connect-src 'self' https://*.supabase.co",          // Supabase auth (client-side token refresh)
      "frame-ancestors 'none'",                            // Prevent framing (clickjacking)
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  )

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
