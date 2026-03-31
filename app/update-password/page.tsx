'use client'
import { useState, useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'

const RULES = [
  { id: 'length',  label: '8+ characters',        test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'One uppercase letter',  test: (p: string) => /[A-Z]/.test(p) },
  { id: 'number',  label: 'One number',            test: (p: string) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

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
      <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${strengthPct}%`,
          background: strengthColor,
          transition: 'width 250ms, background 250ms',
        }} />
      </div>
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
              <span style={{ fontSize: 11, letterSpacing: 0.5, color: ok ? 'var(--text2)' : 'var(--text3)', transition: 'color 200ms' }}>
                {rule.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '12px 44px 12px 14px', color: 'var(--text)',
  fontSize: 14, outline: 'none', fontFamily: 'var(--font-dm)', width: '100%',
  boxSizing: 'border-box',
}

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasConfirm = confirm.length > 0
  const matches = hasConfirm && password === confirm
  const mismatch = hasConfirm && password !== confirm

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
          {/* New password */}
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="New password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: showPassword ? 'var(--text2)' : 'var(--text3)',
                display: 'flex', alignItems: 'center', padding: 0,
                transition: 'color 150ms',
              }}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {/* Live requirements */}
          <PasswordRules password={password} />

          {/* Confirm password */}
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirm"
              placeholder="Confirm password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{
                ...inputStyle,
                borderColor: matches ? '#4caf7d' : mismatch ? '#e05c5c' : 'var(--border)',
                transition: 'border-color 200ms',
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: showConfirm ? 'var(--text2)' : 'var(--text3)',
                display: 'flex', alignItems: 'center', padding: 0,
                transition: 'color 150ms',
              }}
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>

          {/* Match indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: hasConfirm ? 1 : 0,
            transform: hasConfirm ? 'translateY(0)' : 'translateY(-4px)',
            transition: 'opacity 200ms, transform 200ms',
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: matches ? 'rgba(76,175,125,0.15)' : 'rgba(224,92,92,0.1)',
              border: `1px solid ${matches ? '#4caf7d' : '#e05c5c'}`,
              transition: 'all 200ms',
            }}>
              <span style={{ fontSize: 9, color: matches ? '#4caf7d' : '#e05c5c', lineHeight: 1 }}>
                {matches ? '✓' : '✕'}
              </span>
            </div>
            <span style={{
              fontSize: 11, letterSpacing: 0.5,
              color: matches ? '#4caf7d' : '#e05c5c',
              transition: 'color 200ms',
            }}>
              {matches ? 'Passwords match' : 'Passwords do not match'}
            </span>
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
