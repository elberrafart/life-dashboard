'use client'
import { useState, useActionState, useEffect } from 'react'
import { login, resetPassword } from '@/app/actions/auth'

export default function LoginPage() {
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [state, action, pending] = useActionState(login, undefined)
  const [resetState, resetAction, resetPending] = useActionState(resetPassword, undefined)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('reset') === 'success') {
      setResetSuccess(true)
    }
  }, [])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: 420,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 48,
            letterSpacing: 6,
            color: 'var(--text)',
            lineHeight: 1,
          }}>
            ELITE <span style={{ color: 'var(--silver)' }}>ACTION</span>
          </div>
          <div style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            margin: '10px auto 0',
          }} />
          <div style={{
            fontSize: 11,
            letterSpacing: 3,
            color: 'var(--text3)',
            textTransform: 'uppercase',
            marginTop: 12,
          }}>
            Your Gamified Life OS
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '40px 36px' }}>
          <div style={{
            fontFamily: 'var(--font-bebas)',
            fontSize: 20,
            letterSpacing: 3,
            color: 'var(--text)',
            marginBottom: 28,
          }}>
            {forgotMode ? 'RESET PASSWORD' : 'SIGN IN'}
          </div>

          {resetSuccess && !forgotMode && (
            <div style={{
              fontSize: 13, color: '#4caf7d',
              background: 'rgba(76,175,125,0.08)',
              border: '1px solid rgba(76,175,125,0.2)',
              borderRadius: 6, padding: '12px 14px',
              letterSpacing: 0.3, marginBottom: 18,
            }}>
              Password updated. Sign in with your new password.
            </div>
          )}

          {forgotMode ? (
            resetState?.success ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  fontSize: 13,
                  color: '#4caf7d',
                  background: 'rgba(76,175,125,0.08)',
                  border: '1px solid rgba(76,175,125,0.2)',
                  borderRadius: 6,
                  padding: '12px 14px',
                  letterSpacing: 0.3,
                }}>
                  {resetState.success}
                </div>
                <button
                  onClick={() => setForgotMode(false)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text3)',
                    fontSize: 12, letterSpacing: 1, cursor: 'pointer',
                    textDecoration: 'underline', fontFamily: 'var(--font-dm)',
                  }}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form action={resetAction} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{
                    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                    color: 'var(--text3)', fontWeight: 600,
                  }}>
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: '12px 16px', color: 'var(--text)',
                      fontSize: 14, outline: 'none', transition: 'border-color 150ms',
                      width: '100%', fontFamily: 'var(--font-dm)',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--border2)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>

                {resetState?.error && (
                  <div style={{
                    fontSize: 12, color: 'var(--red)', background: 'rgba(192,57,43,0.1)',
                    border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6,
                    padding: '10px 14px', letterSpacing: 0.3,
                  }}>
                    {resetState.error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetPending}
                  style={{
                    marginTop: 8, background: resetPending ? 'var(--surface2)' : 'var(--gold)',
                    color: resetPending ? 'var(--text3)' : '#0a0a08', border: 'none',
                    borderRadius: 8, padding: '14px 24px', fontSize: 12, letterSpacing: 2,
                    fontWeight: 700, textTransform: 'uppercase',
                    cursor: resetPending ? 'not-allowed' : 'pointer',
                    transition: 'background 150ms, opacity 150ms',
                    fontFamily: 'var(--font-dm)', opacity: resetPending ? 0.6 : 1,
                  }}
                >
                  {resetPending ? 'Sending…' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotMode(false)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text3)',
                    fontSize: 12, letterSpacing: 1, cursor: 'pointer',
                    textDecoration: 'underline', fontFamily: 'var(--font-dm)',
                  }}
                >
                  Back to sign in
                </button>
              </form>
            )
          ) : (
            <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{
                  fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                  color: 'var(--text3)', fontWeight: 600,
                }}>
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '12px 16px', color: 'var(--text)',
                    fontSize: 14, outline: 'none', transition: 'border-color 150ms',
                    width: '100%', fontFamily: 'var(--font-dm)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--border2)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{
                    fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
                    color: 'var(--text3)', fontWeight: 600,
                  }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    style={{
                      background: 'none', border: 'none', color: 'var(--text3)',
                      fontSize: 10, letterSpacing: 1, cursor: 'pointer',
                      textDecoration: 'underline', fontFamily: 'var(--font-dm)',
                      padding: 0,
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  style={{
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '12px 16px', color: 'var(--text)',
                    fontSize: 14, outline: 'none', transition: 'border-color 150ms',
                    width: '100%', fontFamily: 'var(--font-dm)',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--border2)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {/* Error */}
              {state?.error && (
                <div style={{
                  fontSize: 12, color: 'var(--red)', background: 'rgba(192,57,43,0.1)',
                  border: '1px solid rgba(192,57,43,0.2)', borderRadius: 6,
                  padding: '10px 14px', letterSpacing: 0.3,
                }}>
                  {state.error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={pending}
                style={{
                  marginTop: 8, background: pending ? 'var(--surface2)' : 'var(--gold)',
                  color: pending ? 'var(--text3)' : '#0a0a08', border: 'none',
                  borderRadius: 8, padding: '14px 24px', fontSize: 12, letterSpacing: 2,
                  fontWeight: 700, textTransform: 'uppercase',
                  cursor: pending ? 'not-allowed' : 'pointer',
                  transition: 'background 150ms, opacity 150ms',
                  fontFamily: 'var(--font-dm)', opacity: pending ? 0.6 : 1,
                }}
              >
                {pending ? 'Signing in…' : 'Enter'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 32,
          fontSize: 11,
          color: 'var(--text3)',
          letterSpacing: 1,
        }}>
          Rank up. Stay consistent. Win.
        </div>
      </div>
    </div>
  )
}
