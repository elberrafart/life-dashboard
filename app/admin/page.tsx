'use client'
import { useState, useEffect, useTransition } from 'react'
import { listUsers, inviteUser, sendPasswordReset, deleteUser } from '@/app/actions/admin'

type User = {
  id: string
  email: string
  createdAt: string
  lastSignIn: string | null
  confirmed: boolean
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function flash(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3500)
  }

  async function load() {
    try {
      const data = await listUsers()
      setUsers(data)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    }
  }

  useEffect(() => { load() }, [])

  function handleInvite() {
    if (!inviteEmail.trim()) return
    startTransition(async () => {
      try {
        await inviteUser(inviteEmail.trim())
        setInviteEmail('')
        flash(`Invite sent to ${inviteEmail.trim()}`)
        load()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to invite')
      }
    })
  }

  function handleReset(email: string) {
    startTransition(async () => {
      try {
        await sendPasswordReset(email)
        flash(`Password reset sent to ${email}`)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to send reset')
      }
    })
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      try {
        await deleteUser(userId)
        setDeleteConfirm(null)
        flash('User deleted.')
        load()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to delete')
      }
    })
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 5, color: 'var(--text)', marginBottom: 4 }}>
        ADMIN PANEL
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, marginBottom: 36, textTransform: 'uppercase' }}>
        User Management
      </div>

      {/* Invite */}
      <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase', marginBottom: 14 }}>
          Invite New User
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="email"
            placeholder="user@email.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            style={{
              flex: 1,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '10px 14px',
              color: 'var(--text)',
              fontSize: 13,
              outline: 'none',
              fontFamily: 'var(--font-dm)',
            }}
          />
          <button
            onClick={handleInvite}
            disabled={isPending || !inviteEmail.trim()}
            style={{
              background: 'var(--gold)',
              color: 'var(--bg)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm)',
              opacity: isPending || !inviteEmail.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            Send Invite
          </button>
        </div>
      </div>

      {/* Flash messages */}
      {message && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, fontSize: 12, color: 'var(--gold)', letterSpacing: 0.5 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c', letterSpacing: 0.5 }}>
          {error}
        </div>
      )}

      {/* User list */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
          Users ({users.length})
        </div>
        {users.length === 0 && !error && (
          <div style={{ padding: '32px 24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
        )}
        {users.map((u, i) => (
          <div
            key={u.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '14px 24px',
              borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-dm)', fontWeight: 600 }}>{u.email}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, marginTop: 3 }}>
                Joined {new Date(u.createdAt).toLocaleDateString()}
                {u.lastSignIn ? ` · Last seen ${new Date(u.lastSignIn).toLocaleDateString()}` : ' · Never signed in'}
              </div>
            </div>

            <div style={{
              fontSize: 9,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 4,
              background: u.confirmed ? 'rgba(76,201,110,0.12)' : 'rgba(201,168,76,0.12)',
              color: u.confirmed ? '#4cc96e' : 'var(--gold)',
              border: `1px solid ${u.confirmed ? 'rgba(76,201,110,0.3)' : 'rgba(201,168,76,0.3)'}`,
            }}>
              {u.confirmed ? 'Active' : 'Invited'}
            </div>

            <button
              onClick={() => handleReset(u.email)}
              disabled={isPending}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 10,
                color: 'var(--text2)',
                cursor: 'pointer',
                letterSpacing: 1,
                textTransform: 'uppercase',
                fontFamily: 'var(--font-dm)',
                whiteSpace: 'nowrap',
              }}
            >
              Reset Password
            </button>

            {deleteConfirm === u.id ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{ background: '#e05c5c', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: '#fff', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap' }}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: 'var(--text3)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(u.id)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(224,92,92,0.3)',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 10,
                  color: '#e05c5c',
                  cursor: 'pointer',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-dm)',
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
