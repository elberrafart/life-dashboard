'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo } from '@/lib/types'
import { getTodayKey } from '@/lib/store'

export default function ProfileCard() {
  const { state, dispatch, totalXP, todayXP } = useApp()
  const [editing, setEditing] = useState(!state.firstName && !state.lastName)
  const [firstName, setFirstName] = useState(state.firstName)
  const [lastName, setLastName]   = useState(state.lastName)
  const [year, setYear]           = useState(state.profileYear)
  const [tagline, setTagline]     = useState(state.tagline)

  const levelInfo = getLevelInfo(totalXP, state.streak ?? 0)

  const todayKey = getTodayKey()
  const totalHabits = state.habits.length
  const completedHabits = state.habits.filter(h => state.checked[`${todayKey}_h_${h.id}`]).length
  const habitProgress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
  const streakDays = state.streak || 0

  function handleSave() {
    dispatch({ type: 'SET_PROFILE', payload: { firstName: firstName.trim(), lastName: lastName.trim(), profileYear: year.trim(), tagline: tagline.trim() } })
    setEditing(false)
  }

  if (editing) {
    return (
      <div style={{ padding: '20px 20px 0' }}>
        <div className="card" style={{ padding: '24px 28px' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20 }}>
            Set Up Your Profile
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="First" autoFocus />
            </div>
            <div>
              <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="Last" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Year</label>
            <input type="text" value={year} onChange={e => setYear(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="e.g. 2026" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Your Tagline / Personal Quote</label>
            <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="What drives you?" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} style={{ flex: 1, background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '12px', fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}>Save Profile</button>
            {(state.firstName || state.lastName) && (
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text3)', padding: '12px 18px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-dm)' }}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const displayName = [state.firstName, state.lastName].filter(Boolean).join(' ')

  return (
    <div style={{ padding: '20px 20px 0' }}>
      <style>{`
        .profile-card-box { padding: 22px 28px; }
        .profile-layout { display: flex; gap: 20px; align-items: flex-start; }
        .profile-stats { flex-shrink: 0; min-width: 180px; max-width: 260px; }
        @media (max-width: 640px) {
          .profile-card-box { padding: 16px 18px !important; }
          .profile-layout { flex-direction: column; gap: 14px; }
          .profile-stats { min-width: 0; max-width: none; width: 100%; }
        }
      `}</style>
      <div className="card profile-card-box" style={{ position: 'relative' }}>
        <div className="profile-layout">

          {/* Left: name + tagline + level */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: 36, letterSpacing: 2,
                background: 'linear-gradient(135deg, var(--text) 0%, var(--silver) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text', lineHeight: 1,
              }}>
                {displayName || 'Your Name'}
              </div>
              {state.profileYear && (
                <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 3, color: 'var(--gold)', opacity: 0.8 }}>
                  {state.profileYear}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{levelInfo.emoji}</span>
              <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600 }}>
                Lvl {levelInfo.level} — {levelInfo.name}
              </span>
            </div>
            {state.tagline && (
              <div style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic', marginTop: 6, letterSpacing: 0.3 }}>
                &ldquo;{state.tagline}&rdquo;
              </div>
            )}
          </div>

          {/* Right: date + habits bar + streak */}
          <div className="profile-stats">
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>
              {today}
            </div>

            {/* Habits progress bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ position: 'relative', height: 5, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
                <div className="xp-bar-fill xp-bar-shimmer" style={{ width: `${habitProgress}%`, height: '100%', borderRadius: 99 }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 0.3 }}>
                {completedHabits} of {totalHabits} habits complete
              </div>
            </div>

            {/* Streak + daily XP row */}
            <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
              {streakDays > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 13 }}>{streakDays > 3 ? '🔥' : '📅'}</span>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 1, color: streakDays > 3 ? 'var(--gold)' : 'var(--silver)' }}>
                    {streakDays}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>day streak</span>
                </div>
              )}
              {todayXP > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 1, color: 'var(--accent)' }}>+{todayXP}</span>
                  <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>XP today</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={() => { setFirstName(state.firstName); setLastName(state.lastName); setYear(state.profileYear); setTagline(state.tagline); setEditing(true) }}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text3)', padding: '4px 10px', fontSize: 10,
            letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'var(--font-dm)', transition: 'all 150ms',
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--silver2)'; e.currentTarget.style.color = 'var(--silver)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
        >Edit</button>
      </div>
    </div>
  )
}
