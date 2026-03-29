'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo } from '@/lib/types'
import { logout } from '@/app/actions/auth'
import { checkIsAdmin } from '@/app/actions/admin'
import RanksModal from './RanksModal'

export default function Header({ onFeedOpen, onSettingsOpen }: { onFeedOpen: () => void; onSettingsOpen: () => void }) {
  const { state, dispatch, totalXP, saveStatus } = useApp()
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(state.playerName)
  const [ranksOpen, setRanksOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const levelInfo = getLevelInfo(totalXP, state.streak ?? 0)

  useEffect(() => { checkIsAdmin().then(setIsAdmin) }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()

  function handleNameSave() {
    dispatch({ type: 'SET_PLAYER_NAME', payload: nameVal })
    setEditingName(false)
  }

  const xpProgress = levelInfo.progress

  const drawerLinkStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 0', fontSize: 13, color: 'var(--text2)',
    fontFamily: 'var(--font-dm)', fontWeight: 600, letterSpacing: 0.5,
    cursor: 'pointer', background: 'none', border: 'none',
    borderBottom: '1px solid var(--border)', width: '100%', textAlign: 'left',
    textDecoration: 'none',
  }

  return (
    <>
      <style>{`
        .header-hide-mobile { display: flex; }
        .header-show-mobile { display: none; }
        @media (max-width: 768px) {
          .header-hide-mobile { display: none !important; }
          .header-show-mobile { display: flex !important; }
          .header-padding { padding: 12px 16px !important; }
        }
        .nav-drawer {
          transform: translateX(100%);
          transition: transform 280ms cubic-bezier(0.4,0,0.2,1);
        }
        .nav-drawer.open {
          transform: translateX(0);
        }
      `}</style>

      {ranksOpen && <RanksModal onClose={() => setRanksOpen(false)} currentLevel={levelInfo.level} />}

      {/* Drawer backdrop */}
      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`nav-drawer${drawerOpen ? ' open' : ''}`}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
          width: 280, background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '20px 24px',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 3, color: 'var(--text)' }}>
            LIFE <span style={{ color: 'var(--silver)' }}>OS</span>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Player name */}
        <div style={{ marginBottom: 20 }}>
          {editingName ? (
            <input
              type="text"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={() => { handleNameSave(); setDrawerOpen(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { handleNameSave(); setDrawerOpen(false) } }}
              autoFocus
              style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 2, background: 'transparent', border: 'none', borderBottom: '1px solid var(--silver2)', color: 'var(--text)', outline: 'none', width: '100%', padding: '2px 0' }}
            />
          ) : (
            <button
              onClick={() => { setEditingName(true); setNameVal(state.playerName) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 2, color: 'var(--text)', padding: 0, textAlign: 'left' }}
            >
              {state.playerName}
            </button>
          )}
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginTop: 2 }}>Tap name to edit</div>
        </div>

        {/* Level + XP */}
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: 'var(--silver)', letterSpacing: 1 }}>
              {levelInfo.emoji} Lvl {levelInfo.level} — {levelInfo.name}
            </div>
            <button
              onClick={() => { setRanksOpen(true); setDrawerOpen(false) }}
              style={{ background: 'none', border: 'none', fontSize: 10, color: 'var(--gold)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, padding: 0 }}
            >
              🏆 Ranks
            </button>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%`, height: '100%', borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>{totalXP.toLocaleString()} XP TOTAL</div>
        </div>

        {/* Date */}
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{today}</div>

        {/* Actions */}
        <button style={drawerLinkStyle} onClick={() => { onFeedOpen(); setDrawerOpen(false) }}>
          <span style={{ fontSize: 18 }}>🔔</span> XP Feed
        </button>
        <button style={drawerLinkStyle} onClick={() => { onSettingsOpen(); setDrawerOpen(false) }}>
          <span style={{ fontSize: 18 }}>⚙️</span> Settings
        </button>

        {isAdmin && (
          <a href="/admin/clients" style={drawerLinkStyle}>
            <span style={{ fontSize: 18 }}>👥</span> Clients
          </a>
        )}
        {isAdmin && (
          <a href="/admin" style={drawerLinkStyle}>
            <span style={{ fontSize: 18 }}>⚡</span> Admin Panel
          </a>
        )}

        {/* Autosave status */}
        <div style={{ marginTop: 4, marginBottom: 4, padding: '10px 0', fontSize: 11, color: saveStatus === 'saved' ? 'var(--green)' : 'var(--text3)', letterSpacing: 1, borderBottom: '1px solid var(--border)' }}>
          {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? '⏳ Saving…' : '● Auto-save on'}
        </div>

        {/* Sign out at bottom */}
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <form action={logout}>
            <button
              type="submit"
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: 'transparent', border: '1px solid rgba(224,92,92,0.3)',
                borderRadius: 8, padding: '12px', cursor: 'pointer',
                color: '#e05c5c', fontSize: 12, fontWeight: 700,
                letterSpacing: 1.5, textTransform: 'uppercase',
                fontFamily: 'var(--font-dm)',
              }}
            >
              <span style={{ fontSize: 14 }}>⏻</span> Sign Out
            </button>
          </form>
        </div>
      </div>

      {/* ── HEADER BAR ── */}
      <header
        className="header-padding"
        style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: 'rgba(10,10,8,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 40px',
          display: 'flex', alignItems: 'center', gap: 24,
        }}
      >
        {/* Logo */}
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 3, color: 'var(--text)', flexShrink: 0 }}>
          LIFE <span style={{ color: 'var(--silver)' }}>OS</span>
          <div style={{ width: '30%', height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', marginTop: 2 }} />
        </div>

        {/* ── DESKTOP CENTER ── */}
        <div className="header-hide-mobile" style={{ flex: 1, alignItems: 'center', gap: 16 }}>
          {editingName ? (
            <input
              type="text"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={e => e.key === 'Enter' && handleNameSave()}
              autoFocus
              style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2, background: 'transparent', border: 'none', borderBottom: '1px solid var(--silver2)', color: 'var(--text)', outline: 'none', width: 160, padding: '2px 4px' }}
            />
          ) : (
            <button onClick={() => { setEditingName(true); setNameVal(state.playerName) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2, color: 'var(--text)', padding: 0 }}>
              {state.playerName}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 12px', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--silver)' }}>
              <span>{levelInfo.emoji}</span>
              <span>Lvl {levelInfo.level} — {levelInfo.name}</span>
            </div>
            <button
              onClick={() => setRanksOpen(true)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', flexShrink: 0, cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-dm)', fontWeight: 600 }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
            >🏆 Ranks</button>
          </div>

          <div style={{ width: 180, flexShrink: 0 }}>
            <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
              <div className="xp-bar-fill" style={{ width: `${xpProgress}%`, height: '100%', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginTop: 3 }}>{totalXP.toLocaleString()} XP TOTAL</div>
          </div>
        </div>

        {/* ── MOBILE CENTER: compact level pill ── */}
        <div className="header-show-mobile" style={{ flex: 1, alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 99, padding: '4px 10px', fontSize: 11, color: 'var(--silver)', flexShrink: 0 }}>
            <span>{levelInfo.emoji}</span>
            <span style={{ letterSpacing: 1 }}>Lvl {levelInfo.level}</span>
          </div>
          <div style={{ flex: 1, maxWidth: 100 }}>
            <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
              <div className="xp-bar-fill" style={{ width: `${xpProgress}%`, height: '100%', borderRadius: 99 }} />
            </div>
          </div>
        </div>

        {/* ── DESKTOP RIGHT ── */}
        <div className="header-hide-mobile" style={{ alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>{today}</div>
          <button onClick={onFeedOpen} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, padding: 8, borderRadius: 8, transition: 'color 150ms' }} title="XP Feed" onMouseOver={e => (e.currentTarget.style.color = 'var(--silver)')} onMouseOut={e => (e.currentTarget.style.color = 'var(--text3)')}>🔔</button>
          <button onClick={onSettingsOpen} style={{ background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--silver2)', fontSize: 20, padding: '7px 10px', borderRadius: 8, transition: 'all 150ms', lineHeight: 1 }} title="Settings" onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--silver2)' }}>⚙</button>
          {isAdmin && (
            <a href="/admin/clients" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--silver2)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', transition: 'all 150ms', fontFamily: 'var(--font-dm)', textDecoration: 'none' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--silver2)' }}>
              👥 Clients
            </a>
          )}
          {isAdmin && (
            <a href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', color: 'var(--silver2)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', transition: 'all 150ms', fontFamily: 'var(--font-dm)', textDecoration: 'none' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--silver2)' }}>
              ⚡ Admin
            </a>
          )}
          <form action={logout}>
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', color: 'var(--silver2)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', transition: 'all 150ms', fontFamily: 'var(--font-dm)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--silver2)' }}>
              <span style={{ fontSize: 14, lineHeight: 1 }}>⏻</span> Sign Out
            </button>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: saveStatus === 'saved' ? 'rgba(39,174,96,0.12)' : 'var(--surface)', border: `1px solid ${saveStatus === 'saved' ? 'var(--green)' : 'var(--border2)'}`, color: saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'saving' ? 'var(--text3)' : 'var(--silver2)', borderRadius: 8, padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', transition: 'all 400ms', fontFamily: 'var(--font-dm)', minWidth: 90, justifyContent: 'center' }}>
            {saveStatus === 'saving' && <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block' }} />}
            {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving…' : 'Auto-save'}
          </div>
        </div>

        {/* ── MOBILE: hamburger ── */}
        <button
          className="header-show-mobile"
          onClick={() => setDrawerOpen(true)}
          style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', cursor: 'pointer', color: 'var(--text2)', flexShrink: 0, alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 18 }}>
            <span style={{ display: 'block', height: 2, background: 'var(--silver)', borderRadius: 1 }} />
            <span style={{ display: 'block', height: 2, background: 'var(--silver)', borderRadius: 1, width: '70%' }} />
            <span style={{ display: 'block', height: 2, background: 'var(--silver)', borderRadius: 1 }} />
          </div>
        </button>
      </header>
    </>
  )
}
