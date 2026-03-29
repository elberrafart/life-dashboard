'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { setSessionFromTokens, exchangeCode, verifyOtp } from '@/app/actions/auth-callback'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const hash = window.location.hash.slice(1)
      const query = new URLSearchParams(window.location.search)

      // 1. Hash fragment — implicit flow (invite, magic link)
      if (hash) {
        const params = new URLSearchParams(hash)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type') // 'invite' | 'recovery' | 'magiclink'

        if (accessToken && refreshToken) {
          const result = await setSessionFromTokens(accessToken, refreshToken)
          if (result.error) { setError(result.error); return }

          if (type === 'recovery' || type === 'invite') {
            router.replace('/update-password')
          } else {
            router.replace('/')
          }
          return
        }
      }

      // 2. PKCE code flow
      const code = query.get('code')
      if (code) {
        const result = await exchangeCode(code)
        if (result.error) { setError(result.error); return }
        router.replace('/')
        return
      }

      // 3. Token hash flow (email OTP)
      const tokenHash = query.get('token_hash')
      const type = query.get('type')
      if (tokenHash && type) {
        const result = await verifyOtp(tokenHash, type)
        if (result.error) { setError(result.error); return }

        if (type === 'recovery' || type === 'invite') {
          router.replace('/update-password')
        } else {
          router.replace('/')
        }
        return
      }

      // Nothing matched
      router.replace('/login?error=invalid_link')
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card" style={{ maxWidth: 400, width: '100%', padding: '32px 28px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2, color: 'var(--text)', marginBottom: 10 }}>
            Link Expired or Invalid
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.6 }}>
            {error}
          </div>
          <a href="/login" style={{
            display: 'inline-block',
            background: 'var(--gold)', color: 'var(--bg)',
            borderRadius: 8, padding: '11px 24px',
            fontSize: 12, fontWeight: 700, letterSpacing: 2,
            textTransform: 'uppercase', textDecoration: 'none',
            fontFamily: 'var(--font-dm)',
          }}>
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid var(--border2)',
          borderTopColor: 'var(--gold)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 14, letterSpacing: 3, color: 'var(--text3)' }}>
          Activating your account...
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
