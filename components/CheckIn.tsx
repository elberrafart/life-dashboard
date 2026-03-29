'use client'
import { useState, useEffect, useTransition } from 'react'
import { useApp } from '@/lib/context'
import { submitCheckIn, getTodayCheckIn, type CheckIn } from '@/app/actions/checkins'

const MOODS = [
  { emoji: '🔥', label: 'On Fire' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😤', label: 'Struggling' },
]

export default function CheckIn() {
  const { state, totalXP } = useApp()
  const [existing, setExisting] = useState<CheckIn | null | undefined>(undefined)
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTodayCheckIn().then(setExisting)
  }, [])

  // Count habits completed today
  const today = new Date().toISOString().split('T')[0]
  const habitsCompleted = state.habits.filter(h => h.completedDates?.includes(today)).length

  function handleSubmit() {
    if (!mood) return
    startTransition(async () => {
      try {
        await submitCheckIn({ mood, note, xpToday: totalXP, habitsCompleted })
        setDone(true)
        getTodayCheckIn().then(setExisting)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to submit')
      }
    })
  }

  // Loading
  if (existing === undefined) return null

  // Already checked in (or just submitted)
  if (existing || done) {
    const ci = existing
    return (
      <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 28 }}>{ci?.mood?.split(' ')[0] ?? '✓'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 4 }}>
            Today's Check-In Submitted
          </div>
          {ci?.note && (
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{ci.note}</div>
          )}
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginTop: 6 }}>
            {ci?.habits_completed ?? habitsCompleted} habits · {(ci?.xp_today ?? totalXP).toLocaleString()} XP
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>
          {ci ? new Date(ci.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: '22px 24px' }}>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--silver)', marginBottom: 4 }}>
        Daily Check-In
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 18, letterSpacing: 0.5 }}>
        How are you showing up today? Your coach will see this.
      </div>

      {/* Mood picker */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {MOODS.map(m => (
          <button
            key={m.emoji}
            onClick={() => setMood(`${m.emoji} ${m.label}`)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
              background: mood === `${m.emoji} ${m.label}` ? 'rgba(201,168,76,0.15)' : 'var(--surface2)',
              border: `1px solid ${mood === `${m.emoji} ${m.label}` ? 'var(--gold)' : 'var(--border)'}`,
              transition: 'all 150ms',
            }}
          >
            <span style={{ fontSize: 22 }}>{m.emoji}</span>
            <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: mood === `${m.emoji} ${m.label}` ? 'var(--gold)' : 'var(--text3)', fontFamily: 'var(--font-dm)' }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Note */}
      <textarea
        placeholder="Anything you want your coach to know? (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        style={{
          width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13,
          outline: 'none', resize: 'none', fontFamily: 'var(--font-dm)', lineHeight: 1.6,
          marginBottom: 14,
        }}
      />

      {/* Auto-captured stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px' }}>
          {habitsCompleted} habits today
        </div>
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px' }}>
          {totalXP.toLocaleString()} XP total
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 12, fontSize: 12, color: '#e05c5c' }}>{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!mood || isPending}
        style={{
          background: mood ? 'var(--gold)' : 'var(--surface2)',
          color: mood ? 'var(--bg)' : 'var(--text3)',
          border: 'none', borderRadius: 8, padding: '11px 24px',
          fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
          cursor: mood ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-dm)',
          transition: 'all 150ms', opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Submitting…' : 'Submit Check-In'}
      </button>
    </div>
  )
}
