'use client'
import { useEffect, useState } from 'react'
import CheckIn from '@/components/CheckIn'
import CheckInCalendar from '@/components/CheckInCalendar'
import { getUserCheckIns, type CheckIn as CheckInRow } from '@/app/actions/checkins'
import { fetchCached } from '@/lib/dataCache'

export default function CheckInsPage() {
  const [history, setHistory] = useState<CheckInRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCached('userCheckIns', getUserCheckIns, 30_000)
      .then(d => setHistory(d))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Today's check-in */}
      <section style={{ marginBottom: 36 }}>
        <div style={{
          fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 4,
          color: 'var(--text3)', textTransform: 'uppercase',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          Today&rsquo;s Check-In
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <CheckIn />
      </section>

      {/* History */}
      <section>
        <div style={{
          fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 4,
          color: 'var(--text3)', textTransform: 'uppercase',
          marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          History · Last 90 days
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c', marginBottom: 16 }}>{error}</div>
        )}

        {loading ? (
          <div style={{ padding: '40px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
        ) : history.length === 0 ? (
          <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 13, color: 'var(--silver)', lineHeight: 1.6 }}>
              No check-ins yet. Log today&rsquo;s above to start the streak.
            </div>
          </div>
        ) : (
          <>
            {/* Calendar */}
            <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
              <CheckInCalendar checkIns={history} />
            </div>

            {/* Detailed list */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
                Entries ({history.length})
              </div>
              {history.map((c, i) => {
                const label = new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
                })
                return (
                  <div key={c.id} style={{
                    padding: '14px 20px',
                    borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: c.note ? 6 : 0, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>
                        {label}
                      </div>
                      {c.mood && (
                        <div style={{ fontSize: 10, color: 'var(--silver)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px' }}>
                          {c.mood}
                        </div>
                      )}
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)' }}>
                        <span>+{c.xp_today} XP</span>
                        <span>{c.habits_completed} habits</span>
                      </div>
                    </div>
                    {c.note && (
                      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {c.note}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
