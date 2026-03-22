'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo } from '@/lib/types'

export default function Header({ onFeedOpen, onSettingsOpen }: { onFeedOpen: () => void; onSettingsOpen: () => void }) {
  const { state, dispatch, totalXP, saveStatus } = useApp()
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState(state.playerName)
  const levelInfo = getLevelInfo(totalXP, state.streak ?? 0)

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()

  function handleNameSave() {
    dispatch({ type: 'SET_PLAYER_NAME', payload: nameVal })
    setEditingName(false)
  }

  const xpProgress = levelInfo.progress

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(10,10,8,0.97)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      padding: '16px 40px',
      display: 'flex', alignItems: 'center', gap: 24,
    }}>
      {/* Logo */}
      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 3, color: 'var(--text)', flexShrink: 0 }}>
        LIFE <span style={{ color: 'var(--silver)' }}>OS</span>
        <div style={{ width: '30%', height: 2, background: 'linear-gradient(90deg, var(--gold), transparent)', marginTop: 2 }} />
      </div>

      {/* Center: player + XP */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
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
          <button onClick={() => { setEditingName(true); setNameVal(state.playerName) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2, color: 'var(--text)', padding: 0 }} title="Click to edit name">
            {state.playerName}
          </button>
        )}

        {/* Level pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 99, padding: '4px 12px',
          fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--silver)', flexShrink: 0,
        }}>
          <span>{levelInfo.emoji}</span>
          <span>Lvl {levelInfo.level} — {levelInfo.name}</span>
        </div>

        {/* XP bar */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
            <div className="xp-bar-fill" style={{ width: `${xpProgress}%`, height: '100%', borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginTop: 3 }}>
            {totalXP.toLocaleString()} XP TOTAL
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase' }}>{today}</div>
        <button
          onClick={onFeedOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, padding: 8, borderRadius: 8, transition: 'color 150ms' }}
          title="XP Feed"
          onMouseOver={e => (e.currentTarget.style.color = 'var(--silver)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text3)')}
        >🔔</button>
        <button
          onClick={onSettingsOpen}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, padding: 8, borderRadius: 8, transition: 'color 150ms' }}
          title="Settings"
          onMouseOver={e => (e.currentTarget.style.color = 'var(--silver)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text3)')}
        >⚙</button>
        {/* Autosave indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: saveStatus === 'saved' ? 'rgba(39,174,96,0.12)' : saveStatus === 'saving' ? 'var(--surface)' : 'var(--surface)',
          border: `1px solid ${saveStatus === 'saved' ? 'var(--green)' : 'var(--border2)'}`,
          color: saveStatus === 'saved' ? 'var(--green)' : saveStatus === 'saving' ? 'var(--text3)' : 'var(--silver2)',
          borderRadius: 8, padding: '8px 16px',
          fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
          transition: 'all 400ms',
          fontFamily: 'var(--font-dm)',
          minWidth: 90, justifyContent: 'center',
        }}>
          {saveStatus === 'saving' && <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text3)', display: 'inline-block' }} />}
          {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? 'Saving…' : 'Auto-save'}
        </div>
      </div>
    </header>
  )
}
