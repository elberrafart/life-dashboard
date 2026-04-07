import { NextResponse, type NextRequest } from 'next/server'

const PROJECT_REF = 'ecpldhnaocwaiefcxzvx'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/login'
  const isPublicPage = isLoginPage || pathname.startsWith('/auth/') || pathname === '/update-password'

  // Check for the Supabase session cookie directly — no SDK, no network call.
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith(`sb-${PROJECT_REF}-auth-token`) && c.value
  )

  if (!hasSession && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
