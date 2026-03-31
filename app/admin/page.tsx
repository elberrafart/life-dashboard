'use client'
import { useState, useEffect, useTransition } from 'react'
import { listUsers, createUser, sendPasswordReset, deleteUser, listAdmins, addAdmin, removeAdmin } from '@/app/actions/admin'
import { getAllCheckIns, type CheckIn } from '@/app/actions/checkins'

type User = { id: string; email: string; createdAt: string; lastSignIn: string | null; confirmed: boolean }
type Admin = { email: string }
type Tab = 'users' | 'admins' | 'checkins'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

  function flash(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3500)
  }

  function err(e: unknown) {
    setError(e instanceof Error ? e.message : 'Something went wrong')
    setTimeout(() => setError(null), 4000)
  }

  async function loadUsers() {
    const result = await listUsers()
    if ('error' in result && result.error) err(new Error(result.error))
    else setUsers(result.users ?? [])
  }

  async function loadAdmins() {
    setAdmins(await listAdmins())
  }

  async function loadCheckIns() {
    try { setCheckIns(await getAllCheckIns()) } catch (e) { err(e) }
  }

  useEffect(() => { loadUsers(); loadAdmins(); loadCheckIns() }, [])

  function handleCreate() {
    if (!inviteEmail.trim()) return
    startTransition(async () => {
      const email = inviteEmail.trim()
      const result = await createUser(email)
      if (result.error) { err(new Error(result.error)); return }
      if (inviteAsAdmin) {
        const r2 = await addAdmin(email)
        if (r2.error) { err(new Error(r2.error)); return }
      }
      setInviteEmail('')
      setInviteAsAdmin(false)
      setNewCredentials({ email, password: result.tempPassword! })
      loadUsers()
      loadAdmins()
    })
  }

  function handleReset(email: string) {
    startTransition(async () => {
      const result = await sendPasswordReset(email)
      if (result.error) err(new Error(result.error))
      else flash(`Password reset sent to ${email}`)
    })
  }

  function handleDelete(user: User) {
    startTransition(async () => {
      // Optimistically remove from list immediately
      setUsers(prev => prev.filter(u => u.id !== user.id))
      setDeleteTarget(null)
      const result = await deleteUser(user.id)
      if (result.error) {
        // Restore user if deletion failed
        setUsers(prev => [...prev, user].sort((a, b) => a.email.localeCompare(b.email)))
        err(new Error(result.error))
      } else {
        flash(`${user.email} has been deleted.`)
      }
    })
  }

  function handleAddAdmin() {
    if (!newAdminEmail.trim()) return
    startTransition(async () => {
      const email = newAdminEmail.trim()
      const result = await addAdmin(email)
      if (result.error) { err(new Error(result.error)); return }
      flash(`${email} is now an admin`)
      setNewAdminEmail('')
      loadAdmins()
    })
  }

  function handleRemoveAdmin(email: string) {
    startTransition(async () => {
      const result = await removeAdmin(email)
      if (result.error) { err(new Error(result.error)); return }
      flash(`Removed admin: ${email}`)
      loadAdmins()
    })
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'var(--font-dm)',
    fontWeight: 700,
    cursor: 'pointer',
    border: 'none',
    borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
    background: 'transparent',
    color: active ? 'var(--gold)' : 'var(--text3)',
    transition: 'all 150ms',
  })

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: 420, padding: '32px 28px' }}
          >
            <div style={{ fontSize: 28, marginBottom: 12, textAlign: 'center' }}>⚠️</div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 3, color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>
              DELETE USER
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', marginBottom: 6, lineHeight: 1.6 }}>
              You are about to permanently delete:
            </div>
            <div style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 700, textAlign: 'center', marginBottom: 6, fontFamily: 'var(--font-dm)', wordBreak: 'break-all' }}>
              {deleteTarget.email}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
              This cannot be undone. All their data will be lost.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={isPending}
                style={{
                  background: '#c0392b', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '13px', fontSize: 12, fontWeight: 700,
                  letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer',
                  fontFamily: 'var(--font-dm)', opacity: isPending ? 0.6 : 1,
                }}
              >
                Yes, Delete This User
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, padding: '13px', fontSize: 12, color: 'var(--text2)',
                  cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase',
                  fontFamily: 'var(--font-dm)', fontWeight: 600,
                }}
              >
                Cancel — Keep User
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── CREDENTIALS MODAL ── */}
      {newCredentials && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div className="card" style={{ width: '100%', maxWidth: 420, padding: '32px 28px' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 3, color: 'var(--text)', marginBottom: 8 }}>
              ACCOUNT CREATED
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 24, lineHeight: 1.6 }}>
              Share these credentials with the user. They'll be prompted to set a new password on first sign in.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Email</div>
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-dm)' }}>
                  {newCredentials.email}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Temporary Password</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: 'var(--gold)', fontFamily: 'monospace', letterSpacing: 2 }}>
                    {newCredentials.password}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(newCredentials.password).then(() => {
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                      })
                    }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = copied ? 'rgba(76,175,125,0.4)' : 'var(--border2)'; e.currentTarget.style.color = copied ? '#4caf7d' : 'var(--text2)' }}
                    style={{
                      background: 'var(--surface2)',
                      border: `1px solid ${copied ? 'rgba(76,175,125,0.4)' : 'var(--border2)'}`,
                      borderRadius: 8, padding: '10px 14px', fontSize: 10,
                      color: copied ? '#4caf7d' : 'var(--text2)',
                      cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase',
                      fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap',
                      transition: 'color 150ms, border-color 150ms',
                    }}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setNewCredentials(null); setCopied(false) }}
              style={{ width: '100%', background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '13px', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 5, color: 'var(--text)' }}>
          ADMIN PANEL
        </div>
        <a
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 16px', textDecoration: 'none',
            color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600,
            transition: 'all 150ms',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
        >
          ← Home
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28, marginTop: 20 }}>
        <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>Users</button>
        <button style={tabStyle(tab === 'admins')} onClick={() => setTab('admins')}>Admins</button>
        <button style={tabStyle(tab === 'checkins')} onClick={() => setTab('checkins')}>
          Check-ins {checkIns.length > 0 && <span style={{ marginLeft: 6, background: 'var(--gold)', color: 'var(--bg)', borderRadius: 99, padding: '1px 7px', fontSize: 9, fontWeight: 700 }}>{checkIns.length}</span>}
        </button>
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

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <>
          {/* Invite */}
          <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase', marginBottom: 14 }}>
              Create New User
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                placeholder="user@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-dm)' }}
              />
              <button
                onClick={handleCreate}
                disabled={isPending || !inviteEmail.trim()}
                style={{ background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', opacity: isPending || !inviteEmail.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
              >
                Create Account
              </button>
            </div>

            {/* Admin toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, cursor: 'pointer', width: 'fit-content' }}>
              <div
                onClick={() => setInviteAsAdmin(v => !v)}
                style={{
                  width: 36, height: 20, borderRadius: 99, position: 'relative', flexShrink: 0,
                  background: inviteAsAdmin ? 'var(--gold)' : 'var(--surface2)',
                  border: `1px solid ${inviteAsAdmin ? 'var(--gold)' : 'var(--border2)'}`,
                  transition: 'all 200ms', cursor: 'pointer',
                }}
              >
                <div style={{
                  position: 'absolute', top: 2, left: inviteAsAdmin ? 17 : 2,
                  width: 14, height: 14, borderRadius: '50%',
                  background: inviteAsAdmin ? 'var(--bg)' : 'var(--text3)',
                  transition: 'left 200ms',
                }} />
              </div>
              <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: inviteAsAdmin ? 'var(--gold)' : 'var(--text3)', fontFamily: 'var(--font-dm)', fontWeight: 600, transition: 'color 200ms' }}>
                Grant admin access
              </span>
            </label>
          </div>

          {/* User list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
              Users ({users.length})
            </div>
            {users.length === 0 && (
              <div style={{ padding: '32px 24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
            )}
            {users.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-dm)', fontWeight: 600 }}>
                    {u.email}
                    {admins.some(a => a.email === u.email) && (
                      <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>Admin</span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, marginTop: 3 }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                    {u.lastSignIn ? ` · Last seen ${new Date(u.lastSignIn).toLocaleDateString()}` : ' · Never signed in'}
                  </div>
                </div>

                <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, background: u.confirmed ? 'rgba(76,201,110,0.12)' : 'rgba(201,168,76,0.12)', color: u.confirmed ? '#4cc96e' : 'var(--gold)', border: `1px solid ${u.confirmed ? 'rgba(76,201,110,0.3)' : 'rgba(201,168,76,0.3)'}` }}>
                  {u.confirmed ? 'Active' : 'Invited'}
                </div>

                <button
                  onClick={() => handleReset(u.email)}
                  disabled={isPending}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: 'var(--text2)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap' }}
                >
                  Reset Password
                </button>

                <button
                  onClick={() => setDeleteTarget(u)}
                  style={{ background: 'transparent', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: '#e05c5c', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── ADMINS TAB ── */}
      {tab === 'admins' && (
        <>
          {/* Add admin */}
          <div className="card" style={{ padding: '22px 24px', marginBottom: 24 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase', marginBottom: 6 }}>
              Grant Admin Access
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 14 }}>
              The user must already have an account before being made an admin.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                placeholder="user@email.com"
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAdmin()}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-dm)' }}
              />
              <button
                onClick={handleAddAdmin}
                disabled={isPending || !newAdminEmail.trim()}
                style={{ background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', opacity: isPending || !newAdminEmail.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
              >
                Make Admin
              </button>
            </div>
          </div>

          {/* Admin list */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
              Current Admins ({admins.length})
            </div>
            {admins.length === 0 && (
              <div style={{ padding: '32px 24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>No admins in database yet — run the SQL setup first.</div>
            )}
            {admins.map((a, i) => (
              <div key={a.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', borderBottom: i < admins.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-dm)', fontWeight: 600 }}>{a.email}</div>
                <button
                  onClick={() => handleRemoveAdmin(a.email)}
                  disabled={isPending}
                  style={{ background: 'transparent', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: '#e05c5c', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CHECK-INS TAB ── */}
      {tab === 'checkins' && (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
              Recent Check-Ins ({checkIns.length})
            </div>

            {checkIns.length === 0 && (
              <div style={{ padding: '40px 24px', color: 'var(--text3)', fontSize: 13, textAlign: 'center', lineHeight: 1.8 }}>
                No check-ins yet.<br />
                <span style={{ fontSize: 11 }}>Users submit check-ins from their dashboard.</span>
              </div>
            )}

            {checkIns.map((ci, i) => (
              <div
                key={ci.id}
                style={{
                  padding: '16px 24px',
                  borderBottom: i < checkIns.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: 16,
                  alignItems: 'start',
                }}
              >
                {/* Mood */}
                <div style={{ fontSize: 28, lineHeight: 1, paddingTop: 2 }}>
                  {ci.mood?.split(' ')[0] ?? '•'}
                </div>

                {/* Main info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--font-dm)', fontWeight: 600 }}>
                      {ci.user_email}
                    </span>
                    {ci.mood && (
                      <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px' }}>
                        {ci.mood.split(' ').slice(1).join(' ')}
                      </span>
                    )}
                  </div>
                  {ci.note && (
                    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8 }}>
                      "{ci.note}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>
                      {ci.habits_completed} habits
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>
                      {ci.xp_today.toLocaleString()} XP
                    </span>
                  </div>
                </div>

                {/* Date/time */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text2)', letterSpacing: 0.5 }}>
                    {new Date(ci.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>
                    {new Date(ci.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
