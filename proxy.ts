import { NextResponse, type NextRequest } from 'next/server'

const PROJECT_REF = 'ecpldhnaocwaiefcxzvx'

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Check for the Supabase session cookie directly — no SDK, no network call.
  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith(`sb-${PROJECT_REF}-auth-token`) && c.value
  )

  if (!hasSession && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasSession && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
