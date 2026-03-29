'use client'
import { useState, useEffect, useTransition } from 'react'
import { listUsers, inviteUser, sendPasswordReset, deleteUser, listAdmins, addAdmin, removeAdmin } from '@/app/actions/admin'

type User = { id: string; email: string; createdAt: string; lastSignIn: string | null; confirmed: boolean }
type Admin = { email: string }
type Tab = 'users' | 'admins'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteAsAdmin, setInviteAsAdmin] = useState(false)
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  function flash(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3500)
  }

  function err(e: unknown) {
    setError(e instanceof Error ? e.message : 'Something went wrong')
    setTimeout(() => setError(null), 4000)
  }

  async function loadUsers() {
    try { setUsers(await listUsers()) } catch (e) { err(e) }
  }

  async function loadAdmins() {
    try { setAdmins(await listAdmins()) } catch (e) { err(e) }
  }

  useEffect(() => { loadUsers(); loadAdmins() }, [])

  function handleInvite() {
    if (!inviteEmail.trim()) return
    startTransition(async () => {
      try {
        await inviteUser(inviteEmail.trim())
        if (inviteAsAdmin) await addAdmin(inviteEmail.trim())
        flash(`Invite sent to ${inviteEmail.trim()}${inviteAsAdmin ? ' (admin)' : ''}`)
        setInviteEmail('')
        setInviteAsAdmin(false)
        loadUsers()
        loadAdmins()
      } catch (e) { err(e) }
    })
  }

  function handleReset(email: string) {
    startTransition(async () => {
      try { await sendPasswordReset(email); flash(`Password reset sent to ${email}`) }
      catch (e) { err(e) }
    })
  }

  function handleDelete(userId: string) {
    startTransition(async () => {
      try { await deleteUser(userId); setDeleteConfirm(null); flash('User deleted.'); loadUsers() }
      catch (e) { err(e) }
    })
  }

  function handleAddAdmin() {
    if (!newAdminEmail.trim()) return
    startTransition(async () => {
      try {
        await addAdmin(newAdminEmail.trim())
        flash(`${newAdminEmail.trim()} is now an admin`)
        setNewAdminEmail('')
        loadAdmins()
      } catch (e) { err(e) }
    })
  }

  function handleRemoveAdmin(email: string) {
    startTransition(async () => {
      try { await removeAdmin(email); flash(`Removed admin: ${email}`); loadAdmins() }
      catch (e) { err(e) }
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
      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 5, color: 'var(--text)', marginBottom: 4 }}>
        ADMIN PANEL
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
        <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>Users</button>
        <button style={tabStyle(tab === 'admins')} onClick={() => setTab('admins')}>Admins</button>
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
              Invite New User
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="email"
                placeholder="user@email.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-dm)' }}
              />
              <button
                onClick={handleInvite}
                disabled={isPending || !inviteEmail.trim()}
                style={{ background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', opacity: isPending || !inviteEmail.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}
              >
                Send Invite
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

                {deleteConfirm === u.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleDelete(u.id)} style={{ background: '#e05c5c', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: '#fff', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap' }}>
                      Confirm Delete
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: 'var(--text3)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(u.id)} style={{ background: 'transparent', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 6, padding: '6px 12px', fontSize: 10, color: '#e05c5c', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
                    Delete
                  </button>
                )}
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
    </div>
  )
}
