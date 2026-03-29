'use client'
import { useActionState, useEffect } from 'react'
import { saveOnboarding, getOnboardingStatus } from '@/app/actions/onboarding'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [state, action, pending] = useActionState(saveOnboarding, undefined)
  const router = useRouter()

  // If already onboarded, skip straight to app
  useEffect(() => {
    getOnboardingStatus().then(complete => {
      if (complete) router.replace('/')
    })
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: '36px 32px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 11, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>
            Welcome to Life OS
          </div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 30, letterSpacing: 3, color: 'var(--text)', marginBottom: 8 }}>
            SET UP YOUR PROFILE
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.7 }}>
            Your coach will see this information. You can update it anytime from your dashboard.
          </div>
        </div>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                First Name *
              </label>
              <input
                name="firstName"
                type="text"
                placeholder="Alex"
                required
                autoFocus
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                placeholder="Johnson"
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
              Year / Cohort
            </label>
            <input
              name="profileYear"
              type="text"
              placeholder="e.g. 2025, Senior, Cohort 3"
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
              Personal Motto / Tagline
            </label>
            <input
              name="tagline"
              type="text"
              placeholder="e.g. Outwork everyone"
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '11px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)' }}
            />
          </div>

          {state?.error && (
            <div style={{ fontSize: 12, color: '#e05c5c', padding: '8px 12px', background: 'rgba(224,92,92,0.08)', borderRadius: 6, border: '1px solid rgba(224,92,92,0.2)' }}>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              marginTop: 6,
              background: 'var(--gold)', color: 'var(--bg)',
              border: 'none', borderRadius: 8, padding: '13px',
              fontSize: 12, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.7 : 1, fontFamily: 'var(--font-dm)',
              transition: 'opacity 150ms',
            }}
          >
            {pending ? 'Saving…' : 'Enter the Arena →'}
          </button>
        </form>
      </div>
    </div>
  )
}
