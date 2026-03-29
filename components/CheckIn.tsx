'use client'
import { useState, useEffect, useTransition } from 'react'
import { useApp } from '@/lib/context'
import { submitCheckIn, getTodayCheckIn, getUserCheckIns, type CheckIn } from '@/app/actions/checkins'

const MOODS = [
  { emoji: '🔥', label: 'On Fire' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Down' },
  { emoji: '😤', label: 'Struggling' },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<CheckIn[] | null>(null)

  useEffect(() => {
    getUserCheckIns().then(setEntries)
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 600, margin: '0 auto',
          background: 'var(--surface)', borderRadius: '16px 16px 0 0',
          maxHeight: '80vh', display: 'flex', flexDirection: 'column',
          border: '1px solid var(--border)', borderBottom: 'none',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 3, color: 'var(--text)' }}>
              CHECK-IN HISTORY
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
              {entries ? `${entries.length} entries` : 'Loading…'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>

        {/* List */}
        <div style={{ overflowY: 'auto', padding: '12px 24px 32px', flex: 1 }}>
          {!entries && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>Loading…</div>
          )}
          {entries && entries.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No check-ins yet.</div>
          )}
          {entries && entries.map((ci, i) => (
            <div key={ci.id} style={{
              padding: '16px 0',
              borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', gap: 14,
            }}>
              {/* Mood emoji */}
              <div style={{ fontSize: 26, lineHeight: 1, paddingTop: 2, flexShrink: 0 }}>
                {ci.mood?.split(' ')[0] ?? '—'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 14, letterSpacing: 2, color: 'var(--text)' }}>
                    {formatDate(ci.date)}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, flexShrink: 0 }}>
                    {ci.mood?.split(' ').slice(1).join(' ')}
                  </div>
                </div>
                {ci.note && (
                  <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 6 }}>
                    {ci.note}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px' }}>
                    {ci.habits_completed} habits
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '3px 8px' }}>
                    {ci.xp_today.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CheckIn() {
  const { state, totalXP } = useApp()
  const [existing, setExisting] = useState<CheckIn | null | undefined>(undefined)
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    getTodayCheckIn().then(setExisting)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const todayHabits = state.habitHistory?.[today] ?? {}
  const habitsCompleted = Object.values(todayHabits).filter(Boolean).length

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

  if (existing === undefined) return null

  if (existing || done) {
    const ci = existing
    return (
      <>
        <div className="card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>
                {ci ? new Date(ci.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </div>
              <button
                onClick={() => setHistoryOpen(true)}
                style={{
                  background: 'none', border: '1px solid var(--border2)', borderRadius: 6,
                  color: 'var(--text3)', fontSize: 10, letterSpacing: 1.5,
                  textTransform: 'uppercase', padding: '5px 10px', cursor: 'pointer',
                  fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap',
                  transition: 'all 150ms',
                }}
              >
                View History
              </button>
            </div>
          </div>
        </div>
        {historyOpen && <HistoryPanel onClose={() => setHistoryOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <div className="card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--silver)' }}>
            Daily Check-In
          </div>
          <button
            onClick={() => setHistoryOpen(true)}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text3)', fontSize: 10, letterSpacing: 1.5,
              textTransform: 'uppercase', padding: '4px 9px', cursor: 'pointer',
              fontFamily: 'var(--font-dm)', transition: 'all 150ms',
            }}
          >
            History
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 18, letterSpacing: 0.5 }}>
          How are you showing up today? Your coach will see this.
        </div>

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

        <textarea
          placeholder="Anything you want your coach to know? (optional)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          style={{
            width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 13,
            outline: 'none', resize: 'none', fontFamily: 'var(--font-dm)', lineHeight: 1.6,
            marginBottom: 14, boxSizing: 'border-box',
          }}
        />

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
      {historyOpen && <HistoryPanel onClose={() => setHistoryOpen(false)} />}
    </>
  )
}
