'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { getUserCheckIns } from '@/app/actions/checkins'
import Link from 'next/link'

type CheckIn = {
  id: string; date: string; mood: string | null; note: string | null
  xp_today: number; habits_completed: number; created_at: string
}

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const JOURNAL_MOODS: Record<string, { emoji: string; label: string }> = {
  motivated:  { emoji: '🔥', label: 'Motivated' },
  strong:     { emoji: '💪', label: 'Strong' },
  encouraged: { emoji: '✨', label: 'Encouraged' },
  focused:    { emoji: '🎯', label: 'Focused' },
  grateful:   { emoji: '🙏', label: 'Grateful' },
  calm:       { emoji: '🌊', label: 'Calm' },
  sad:        { emoji: '😔', label: 'Sad' },
  mad:        { emoji: '😤', label: 'Mad' },
  drained:    { emoji: '😞', label: 'Drained' },
  anxious:    { emoji: '😰', label: 'Anxious' },
}

function today() { return new Date().toISOString().split('T')[0] }

export default function JournalPage() {
  const { state } = useApp()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth())
  const [selected, setSelected] = useState<string | null>(today())

  useEffect(() => {
    getUserCheckIns().then(setCheckIns).catch(() => {})
  }, [])

  const todayStr = today()
  const checkInByDate = Object.fromEntries(checkIns.map(ci => [ci.date, ci]))
  const journalEntries = state.journalEntries ?? {}
  const moodLog = state.moodLog ?? {}

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    const now = new Date()
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())) return
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isNextDisabled = year === new Date().getFullYear() && month >= new Date().getMonth()

  // Detail panel data
  const selJournal = selected ? (journalEntries[selected] ?? '') : ''
  const selMoodKey = selected ? (moodLog[selected] ?? '') : ''
  const selMood = selMoodKey ? JOURNAL_MOODS[selMoodKey] : null
  const selCheckIn = selected ? (checkInByDate[selected] ?? null) : null
  const hasAnything = selJournal.trim().length > 0 || !!selCheckIn

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 60px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link
          href="/"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 16px', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600, textDecoration: 'none' }}
        >
          ← Dashboard
        </Link>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 24, letterSpacing: 4, color: 'var(--text)' }}>JOURNAL HISTORY</div>
          <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 }}>
            {Object.keys(journalEntries).filter(d => journalEntries[d]?.trim()).length} entries · {checkIns.length} check-ins
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="journal-grid" style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px', display: 'grid', gridTemplateColumns: 'minmax(280px, 380px) 1fr', gap: 28, alignItems: 'start' }}>

        {/* ── Calendar ── */}
        <div className="card" style={{ padding: '20px 18px', position: 'sticky', top: 20 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
              Journal
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4cc96e', display: 'inline-block' }} />
              Check-in
            </span>
          </div>

          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button onClick={prevMonth} style={navBtn}>‹</button>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 3, color: 'var(--text)' }}>
              {MONTHS[month]} {year}
            </div>
            <button onClick={nextMonth} disabled={isNextDisabled} style={{ ...navBtn, opacity: isNextDisabled ? 0.3 : 1 }}>›</button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {DOW.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 9, letterSpacing: 1, color: 'var(--text3)', padding: '4px 0', fontFamily: 'var(--font-dm)' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasJournal = !!(journalEntries[dateStr]?.trim())
              const hasCheckIn = !!checkInByDate[dateStr]
              const isSelected = selected === dateStr
              const isToday = dateStr === todayStr
              const isFuture = dateStr > todayStr
              const hasContent = hasJournal || hasCheckIn

              return (
                <button
                  key={i}
                  onClick={() => !isFuture && setSelected(isSelected ? null : dateStr)}
                  disabled={isFuture}
                  style={{
                    aspectRatio: '1',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                    borderRadius: 8,
                    background: isSelected ? 'rgba(201,168,76,0.18)' : 'transparent',
                    border: isSelected ? '1px solid var(--gold)' : isToday ? '1px solid var(--border2)' : '1px solid transparent',
                    cursor: isFuture ? 'default' : hasContent ? 'pointer' : 'pointer',
                    padding: 0,
                    transition: 'all 120ms',
                  }}
                >
                  <span style={{
                    fontSize: 12, fontFamily: 'var(--font-dm)',
                    color: isSelected ? 'var(--gold)' : isToday ? 'var(--text)' : isFuture ? 'var(--border2)' : hasContent ? 'var(--text2)' : 'var(--text3)',
                    fontWeight: isToday ? 700 : 400,
                  }}>
                    {day}
                  </span>
                  {/* Dots row */}
                  {(hasJournal || hasCheckIn) && (
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {hasJournal && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', opacity: isSelected ? 1 : 0.7 }} />}
                      {hasCheckIn && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4cc96e', opacity: isSelected ? 1 : 0.7 }} />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div>
          {!selected && (
            <div className="card" style={{ padding: '40px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.8 }}>Select a day to view your entry</div>
            </div>
          )}

          {selected && !hasAnything && (
            <div className="card" style={{ padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>—</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                No journal entry or check-in on {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
          )}

          {selected && hasAnything && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Date header */}
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 4, color: 'var(--gold)', paddingLeft: 2 }}>
                {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Journal entry */}
              {selJournal.trim().length > 0 && (
                <div className="card" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)' }}>📓 Journal Entry</div>
                    {selMood && (
                      <span style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{selMood.emoji}</span>
                        {selMood.label}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                    {selJournal}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5 }}>
                    {selJournal.trim().split(/\s+/).filter(Boolean).length} words
                  </div>
                </div>
              )}

              {/* Check-in */}
              {selCheckIn && (
                <div className="card" style={{ padding: '22px 24px' }}>
                  <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>✅ Daily Check-In</div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ fontSize: 36, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>
                      {selCheckIn.mood?.split(' ')[0] ?? '•'}
                    </div>
                    <div style={{ flex: 1 }}>
                      {selCheckIn.mood && (
                        <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>
                          {selCheckIn.mood.split(' ').slice(1).join(' ')}
                        </div>
                      )}
                      {selCheckIn.note && (
                        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>
                          "{selCheckIn.note}"
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={statPill}>{selCheckIn.habits_completed} habits completed</span>
                        <span style={statPill}>{selCheckIn.xp_today.toLocaleString()} XP earned</span>
                        <span style={statPill}>{new Date(selCheckIn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: stack calendar below detail on small screens via CSS */}
      <style>{`
        @media (max-width: 640px) {
          .journal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 6,
  color: 'var(--text2)', fontSize: 18, width: 32, height: 32,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontFamily: 'var(--font-dm)', lineHeight: 1, padding: 0,
}

const statPill: React.CSSProperties = {
  fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
  background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '4px 10px',
}
