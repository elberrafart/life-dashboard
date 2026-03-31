'use client'
import { useState, useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'

const RULES = [
  { id: 'length',    label: '8+ characters',         test: (p: string) => p.length >= 8 },
  { id: 'upper',     label: 'One uppercase letter',   test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',    label: 'One number',             test: (p: string) => /[0-9]/.test(p) },
  { id: 'special',   label: 'One special character',  test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function PasswordRules({ password }: { password: string }) {
  const passed = RULES.filter(r => r.test(password)).length
  const strengthPct = (passed / RULES.length) * 100
  const strengthColor =
    passed === 0 ? 'var(--border2)' :
    passed <= 1  ? '#e05c5c' :
    passed <= 2  ? '#e8a03a' :
    passed <= 3  ? '#c9a84c' :
                   '#4caf7d'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Strength bar */}
      <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${strengthPct}%`,
          background: strengthColor,
          transition: 'width 250ms, background 250ms',
        }} />
      </div>

      {/* Requirement checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {RULES.map(rule => {
          const ok = rule.test(password)
          return (
            <div key={rule.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: ok ? 'rgba(76,175,125,0.15)' : 'var(--surface2)',
                border: `1px solid ${ok ? '#4caf7d' : 'var(--border)'}`,
                transition: 'all 200ms',
              }}>
                {ok && <span style={{ fontSize: 9, color: '#4caf7d', lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{
                fontSize: 11, letterSpacing: 0.5,
                color: ok ? 'var(--text2)' : 'var(--text3)',
                transition: 'color 200ms',
              }}>
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined)
  const [password, setPassword] = useState('')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }}>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 4, color: 'var(--text)', marginBottom: 8 }}>
          SET PASSWORD
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: 1, marginBottom: 28 }}>
          Choose a strong password for your account.
        </div>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="password"
            name="password"
            placeholder="New password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px', color: 'var(--text)',
              fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)', width: '100%',
            }}
          />

          {/* Live requirements */}
          <PasswordRules password={password} />

          <input
            type="password"
            name="confirm"
            placeholder="Confirm password"
            required
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px', color: 'var(--text)',
              fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)', width: '100%',
            }}
          />

          {state?.error && (
            <div style={{ fontSize: 12, color: '#e05c5c', padding: '8px 12px', background: 'rgba(224,92,92,0.08)', borderRadius: 6, border: '1px solid rgba(224,92,92,0.2)' }}>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              background: 'var(--gold)', color: 'var(--bg)',
              border: 'none', borderRadius: 8, padding: '13px',
              fontSize: 12, fontWeight: 700, letterSpacing: 2,
              textTransform: 'uppercase', cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.7 : 1, fontFamily: 'var(--font-dm)',
              transition: 'opacity 150ms', marginTop: 4,
            }}
          >
            {pending ? 'Saving…' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
