'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo } from '@/lib/types'

export default function ProfileCard() {
  const { state, dispatch, totalXP } = useApp()
  const [editing, setEditing] = useState(!state.firstName && !state.lastName)
  const [firstName, setFirstName] = useState(state.firstName)
  const [lastName, setLastName]   = useState(state.lastName)
  const [year, setYear]           = useState(state.profileYear)
  const [tagline, setTagline]     = useState(state.tagline)

  const levelInfo = getLevelInfo(totalXP, state.streak ?? 0)

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
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="First"
                autoFocus
              />
            </div>
            <div>
              <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Last"
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Year</label>
            <input
              type="text"
              value={year}
              onChange={e => setYear(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. 2026"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Your Tagline / Personal Quote</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="What drives you?"
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1, background: 'var(--gold)', color: 'var(--bg)',
                border: 'none', borderRadius: 8, padding: '12px',
                fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'var(--font-dm)',
              }}
            >Save Profile</button>
            {(state.firstName || state.lastName) && (
              <button
                onClick={() => setEditing(false)}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 8,
                  color: 'var(--text3)', padding: '12px 18px', cursor: 'pointer',
                  fontSize: 12, fontFamily: 'var(--font-dm)',
                }}
              >Cancel</button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const displayName = [state.firstName, state.lastName].filter(Boolean).join(' ')

  return (
    <div style={{ padding: '20px 20px 0' }}>
      <div
        className="card"
        style={{
          padding: '22px 28px',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        {/* Name + year */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <div style={{
              fontFamily: 'var(--font-bebas)', fontSize: 36, letterSpacing: 2,
              background: 'linear-gradient(135deg, var(--text) 0%, var(--silver) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', lineHeight: 1,
            }}>
              {displayName || 'Your Name'}
            </div>
            {state.profileYear && (
              <div style={{
                fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 3,
                color: 'var(--gold)', opacity: 0.8,
              }}>
                {state.profileYear}
              </div>
            )}
          </div>

          {state.tagline && (
            <div style={{
              fontSize: 13, color: 'var(--text3)', fontStyle: 'italic',
              marginTop: 6, letterSpacing: 0.3,
            }}>
              &ldquo;{state.tagline}&rdquo;
            </div>
          )}
        </div>

        {/* Rank badge */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.5))' }}>
            {levelInfo.emoji}
          </div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginTop: 4 }}>
            {levelInfo.name}
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={() => {
            setFirstName(state.firstName)
            setLastName(state.lastName)
            setYear(state.profileYear)
            setTagline(state.tagline)
            setEditing(true)
          }}
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
