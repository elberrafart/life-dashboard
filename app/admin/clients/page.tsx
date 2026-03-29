'use client'
import { useState, useEffect } from 'react'
import { getAllProfiles, getProfileCheckIns, type UserProfile } from '@/app/actions/profiles'
import { getLevelInfo } from '@/lib/types'
import CheckInCalendar from '@/components/CheckInCalendar'

type CheckIn = {
  id: string; date: string; mood: string | null; note: string | null
  xp_today: number; habits_completed: number; created_at: string
}

export default function ClientsPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [selected, setSelected] = useState<UserProfile | null>(null)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllProfiles()
      .then(setProfiles)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function selectClient(profile: UserProfile) {
    setSelected(profile)
    setCheckIns([])
    try {
      const data = await getProfileCheckIns(profile.user_id)
      setCheckIns(data as CheckIn[])
    } catch { /* ignore */ }
  }

  if (selected) {
    const level = getLevelInfo(selected.xp_total, selected.streak)
    return (
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => setSelected(null)}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 600 }}
          >
            ← Clients
          </button>
          <div>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 26, letterSpacing: 4, color: 'var(--text)' }}>
              {selected.display_name || selected.user_email}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>{selected.user_email}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            { label: 'Level', value: `${level.emoji} ${level.level}` },
            { label: 'Rank', value: level.name },
            { label: 'Total XP', value: selected.xp_total.toLocaleString() },
            { label: 'Streak', value: `${selected.streak} days` },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontFamily: 'var(--font-bebas)', letterSpacing: 2, color: 'var(--gold)' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Goals */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
              Goals ({selected.goals?.length ?? 0})
            </div>
            {(selected.goals ?? []).length === 0 && (
              <div style={{ padding: '20px', fontSize: 12, color: 'var(--text3)' }}>No goals yet</div>
            )}
            {(selected.goals ?? []).map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: i < selected.goals.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 18 }}>{g.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5 }}>{g.category} · {g.taskCount} tasks</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>{g.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>

          {/* Habits */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
              Habits ({selected.habits?.length ?? 0}) · {selected.kanban_done} tasks done
            </div>
            {(selected.habits ?? []).length === 0 && (
              <div style={{ padding: '20px', fontSize: 12, color: 'var(--text3)' }}>No habits yet</div>
            )}
            {(selected.habits ?? []).map((h, i) => (
              <div key={h.id} style={{ padding: '10px 20px', borderBottom: i < selected.habits.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12, color: 'var(--text2)' }}>
                {h.label}
              </div>
            ))}
            {selected.journal_dates?.length > 0 && (
              <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5 }}>
                {selected.journal_dates.length} journal entries
              </div>
            )}
          </div>
        </div>

        {/* Check-ins */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
            Check-In History ({checkIns.length})
          </div>
          {checkIns.length === 0 && (
            <div style={{ padding: '28px 20px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No check-ins submitted yet</div>
          )}
          {checkIns.length > 0 && (
            <div style={{ padding: '20px 24px 24px' }}>
              <CheckInCalendar checkIns={checkIns} />
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, fontSize: 10, color: 'var(--text3)', textAlign: 'right', letterSpacing: 1 }}>
          Last synced {new Date(selected.updated_at).toLocaleString()}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 5, color: 'var(--text)', marginBottom: 4 }}>CLIENTS</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>Coaching Dashboard</div>
        </div>
        <a
          href="/admin"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600 }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
        >
          ← Admin
        </a>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{error}</div>
      )}

      {loading && (
        <div style={{ padding: '40px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
      )}

      {!loading && profiles.length === 0 && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.8 }}>
            No client data yet.<br />
            <span style={{ fontSize: 11 }}>Data appears here once users log in and use the app.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {profiles.map(p => {
          const level = getLevelInfo(p.xp_total, p.streak)
          return (
            <div
              key={p.user_id}
              onClick={() => selectClient(p)}
              className="card"
              style={{ padding: '18px 24px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16, transition: 'border-color 150ms' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>
                    {p.display_name || p.user_email}
                  </span>
                  <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                    {level.emoji} {level.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.xp_total.toLocaleString()} XP</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.streak}d streak</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.goals?.length ?? 0} goals</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.kanban_done} tasks done</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                  {new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 1 }}>View →</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
