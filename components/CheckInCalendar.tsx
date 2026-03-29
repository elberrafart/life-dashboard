'use client'
import { useState } from 'react'

type CheckIn = {
  id: string; date: string; mood: string | null; note: string | null
  xp_today: number; habits_completed: number; created_at: string
}

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function isoToday() { return new Date().toISOString().split('T')[0] }

export default function CheckInCalendar({ checkIns }: { checkIns: CheckIn[] }) {
  const today = isoToday()
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [month, setMonth] = useState(() => new Date().getMonth()) // 0-indexed
  const [selected, setSelected] = useState<string | null>(today)

  const byDate = Object.fromEntries(checkIns.map(ci => [ci.date, ci]))

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

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedCi = selected ? byDate[selected] : null
  const isNextDisabled = year === new Date().getFullYear() && month >= new Date().getMonth()

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={prevMonth} style={navBtn}>‹</button>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 3, color: 'var(--text)' }}>
          {MONTHS[month]} {year}
        </div>
        <button onClick={nextMonth} disabled={isNextDisabled} style={{ ...navBtn, opacity: isNextDisabled ? 0.3 : 1 }}>›</button>
      </div>

      {/* Day-of-week headers */}
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
          const hasEntry = !!byDate[dateStr]
          const isSelected = selected === dateStr
          const isToday = dateStr === today
          const isFuture = dateStr > today

          return (
            <button
              key={i}
              onClick={() => !isFuture && setSelected(isSelected ? null : dateStr)}
              disabled={isFuture}
              style={{
                position: 'relative',
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                borderRadius: 8,
                background: isSelected ? 'rgba(201,168,76,0.2)' : 'transparent',
                border: isSelected ? '1px solid var(--gold)' : isToday ? '1px solid var(--border2)' : '1px solid transparent',
                cursor: isFuture ? 'default' : hasEntry ? 'pointer' : 'default',
                transition: 'all 120ms',
                padding: 0,
              }}
            >
              <span style={{
                fontSize: 12, fontFamily: 'var(--font-dm)',
                color: isSelected ? 'var(--gold)' : isToday ? 'var(--text)' : isFuture ? 'var(--border2)' : hasEntry ? 'var(--text2)' : 'var(--text3)',
                fontWeight: isToday ? 700 : 400,
              }}>
                {day}
              </span>
              {hasEntry && (
                <div style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: isSelected ? 'var(--gold)' : 'var(--gold)',
                  opacity: isSelected ? 1 : 0.6,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day detail */}
      <div style={{ marginTop: 16, minHeight: 80 }}>
        {selected && selectedCi && (
          <div style={{ padding: '16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{selectedCi.mood?.split(' ')[0] ?? '•'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 2, color: 'var(--gold)' }}>
                    {new Date(selected + 'T00:00:00').toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5, flexShrink: 0 }}>
                    {new Date(selectedCi.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
                  {selectedCi.mood?.split(' ').slice(1).join(' ')}
                </div>
                {selectedCi.note && (
                  <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 10 }}>
                    "{selectedCi.note}"
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={statPill}>{selectedCi.habits_completed} habits</span>
                  <span style={statPill}>{selectedCi.xp_today.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {selected && !selectedCi && selected <= today && (
          <div style={{ padding: '16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              No check-in on {new Date(selected + 'T00:00:00').toLocaleDateString([], { month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 6,
  color: 'var(--text2)', fontSize: 18, width: 32, height: 32,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontFamily: 'var(--font-dm)', lineHeight: 1,
}

const statPill: React.CSSProperties = {
  fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 5, padding: '3px 8px',
}
