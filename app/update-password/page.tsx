'use client'
import { useState, useActionState } from 'react'
import { updatePassword } from '@/app/actions/auth'

export default function UpdatePasswordPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined)

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 400, padding: '36px 32px' }}>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 4, color: 'var(--text)', marginBottom: 8 }}>
          SET PASSWORD
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: 1, marginBottom: 28 }}>
          Choose a new password for your account.
        </div>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="password"
            name="password"
            placeholder="New password"
            required
            minLength={8}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 14px',
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'var(--font-dm)',
              width: '100%',
            }}
          />
          <input
            type="password"
            name="confirm"
            placeholder="Confirm password"
            required
            minLength={8}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '12px 14px',
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
              fontFamily: 'var(--font-dm)',
              width: '100%',
            }}
          />

          {state?.error && (
            <div style={{ fontSize: 12, color: '#e05c5c', letterSpacing: 0.5, padding: '8px 12px', background: 'rgba(224,92,92,0.08)', borderRadius: 6, border: '1px solid rgba(224,92,92,0.2)' }}>
              {state.error}
            </div>
          )}

          {state?.success && (
            <div style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: 0.5, padding: '8px 12px', background: 'rgba(201,168,76,0.08)', borderRadius: 6, border: '1px solid rgba(201,168,76,0.2)' }}>
              {state.success}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 8,
              padding: '13px',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              cursor: pending ? 'not-allowed' : 'pointer',
              opacity: pending ? 0.7 : 1,
              fontFamily: 'var(--font-dm)',
              transition: 'opacity 150ms',
              marginTop: 4,
            }}
          >
            {pending ? 'Saving…' : 'Save Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
