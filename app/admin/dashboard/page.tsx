'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAdminDashboard, type AdminDashboard, type TodayPulseEntry, type JournalFeedEntry } from '@/app/actions/adminMetrics'
import { fetchCached, invalidate } from '@/lib/dataCache'

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  async function load(force = false) {
    try {
      if (force) invalidate('adminDashboard')
      setRefreshing(true)
      const d = await fetchCached('adminDashboard', getAdminDashboard, 30_000)
      setData(d)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .ad-home-btn:hover { border-color: var(--gold) !important; color: var(--gold) !important; }
        .ad-refresh:hover  { border-color: var(--gold) !important; color: var(--gold) !important; }
        .ad-stat-card {
          padding: 18px 20px;
          display: flex; flex-direction: column; gap: 6px;
        }
        .ad-stat-label {
          font-size: 10px; letter-spacing: 2px; color: var(--text3);
          text-transform: uppercase; font-family: var(--font-dm); font-weight: 700;
        }
        .ad-stat-value {
          font-family: var(--font-bebas); font-size: 30px; letter-spacing: 2px;
          color: var(--gold); line-height: 1;
        }
        .ad-stat-sub { font-size: 10px; color: var(--text3); letter-spacing: 1px; text-transform: uppercase; }
        .ad-pulse-row {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
        }
        .ad-pulse-row:last-child { border-bottom: none; }
        .ad-pulse-row:hover { background: rgba(255,255,255,0.02); }
        .ad-missing { opacity: 0.5; }
        .ad-section-head {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px; border-bottom: 1px solid var(--border);
          font-size: 11px; letter-spacing: 2px; color: var(--silver);
          text-transform: uppercase; font-family: var(--font-dm); font-weight: 700;
        }
        .ad-journal-card {
          padding: 14px 18px;
          border-bottom: 1px solid var(--border);
        }
        .ad-journal-card:last-child { border-bottom: none; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 5, color: 'var(--text)', lineHeight: 1 }}>
            COACH DASHBOARD
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>
            Roster pulse · this week · recent journals
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="ad-refresh"
            style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 14px',
              color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5,
              textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600,
              cursor: refreshing ? 'default' : 'pointer', transition: 'all 150ms',
              opacity: refreshing ? 0.5 : 1,
            }}
          >{refreshing ? 'Refreshing…' : '↻ Refresh'}</button>
          <Link
            href="/admin"
            className="ad-home-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '8px 16px', textDecoration: 'none',
              color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5,
              textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600,
              transition: 'all 150ms',
            }}
          >← Admin</Link>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{error}</div>
      )}

      {!data && !error && (
        <div style={{ padding: '60px 20px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
      )}

      {data && (
        <>
          {/* ── Roster Stats ───────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 12, marginBottom: 28,
          }}>
            <div className="card ad-stat-card">
              <div className="ad-stat-label">Active clients</div>
              <div className="ad-stat-value">
                {data.stats.activeClients}
                <span style={{ fontSize: 16, color: 'var(--text3)', marginLeft: 6 }}>/ {data.stats.totalClients}</span>
              </div>
              <div className="ad-stat-sub">Checked in this week</div>
            </div>
            <div className="card ad-stat-card">
              <div className="ad-stat-label">Avg streak</div>
              <div className="ad-stat-value">{data.stats.avgStreak}</div>
              <div className="ad-stat-sub">Days, roster average</div>
            </div>
            <div className="card ad-stat-card">
              <div className="ad-stat-label">Check-ins</div>
              <div className="ad-stat-value">{data.stats.checkInsThisWeek}</div>
              <div className="ad-stat-sub">This week (Mon→today)</div>
            </div>
            <div className="card ad-stat-card">
              <div className="ad-stat-label">XP logged</div>
              <div className="ad-stat-value">{data.stats.xpThisWeek.toLocaleString()}</div>
              <div className="ad-stat-sub">This week · across roster</div>
            </div>
          </div>

          {/* ── Today's Pulse ──────────────────────────────────────── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
            <div className="ad-section-head">
              <span>📅 Today&rsquo;s Pulse</span>
              <span style={{ marginLeft: 'auto', color: 'var(--gold)', letterSpacing: 1 }}>
                {data.todayPulse.filter(p => p.checkedIn).length} / {data.todayPulse.length} checked in
              </span>
            </div>
            {data.todayPulse.length === 0 ? (
              <div style={{ padding: '24px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No clients yet</div>
            ) : (
              data.todayPulse.map(p => <PulseRow key={p.userId} entry={p} />)
            )}
          </div>

          {/* ── Recent Journal Feed ────────────────────────────────── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="ad-section-head">
              <span>📔 Recent Journal</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text3)', letterSpacing: 1 }}>
                Last 30 days · {data.recentJournal.length}
              </span>
            </div>
            {data.recentJournal.length === 0 ? (
              <div style={{ padding: '24px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No journal entries yet</div>
            ) : (
              data.recentJournal.map((e, i) => <JournalCard key={`${e.userId}-${e.date}-${i}`} entry={e} />)
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Pulse row ─────────────────────────────────────────────────────

function PulseRow({ entry }: { entry: TodayPulseEntry }) {
  const name = entry.displayName || entry.email
  const moodEmoji = entry.mood?.split(' ')[0] ?? null
  const moodLabel = entry.mood?.split(' ').slice(1).join(' ') ?? ''

  return (
    <div className={`ad-pulse-row ${!entry.checkedIn ? 'ad-missing' : ''}`}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: entry.checkedIn ? 'rgba(76,175,125,0.14)' : 'var(--surface2)',
        border: `1px solid ${entry.checkedIn ? 'rgba(76,175,125,0.4)' : 'var(--border)'}`,
        fontSize: 18, flexShrink: 0,
      }}>
        {entry.checkedIn ? (moodEmoji ?? '✓') : '○'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{name}</span>
          {entry.checkedIn && moodLabel && (
            <span style={{ fontSize: 9, color: 'var(--silver)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase' }}>
              {moodLabel}
            </span>
          )}
          {!entry.checkedIn && (
            <span style={{ fontSize: 9, color: '#f4b8ad', letterSpacing: 1, background: 'rgba(224,92,92,0.06)', border: '1px solid rgba(224,92,92,0.25)', borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase' }}>
              No check-in
            </span>
          )}
        </div>
        {entry.note && (
          <div style={{ fontSize: 11, color: 'var(--silver)', marginTop: 4, lineHeight: 1.4, wordBreak: 'break-word' }}>
            &ldquo;{entry.note.length > 140 ? entry.note.slice(0, 140) + '…' : entry.note}&rdquo;
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', lineHeight: 1.6 }}>
        {entry.checkedIn ? (
          <>
            <div style={{ color: 'var(--gold)' }}>+{entry.xpToday} XP</div>
            <div>{entry.habitsCompleted} habits</div>
          </>
        ) : (
          <div>{entry.xpTotal.toLocaleString()} total</div>
        )}
        <div>🔥 {entry.streak}d</div>
      </div>
    </div>
  )
}

// ── Journal card ──────────────────────────────────────────────────

function JournalCard({ entry }: { entry: JournalFeedEntry }) {
  const [expanded, setExpanded] = useState(false)
  const name = entry.displayName || entry.email
  const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
  const truncate = 220
  const shouldClip = entry.text.length > truncate
  const shown = expanded || !shouldClip ? entry.text : entry.text.slice(0, truncate) + '…'

  return (
    <div className="ad-journal-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>
          {dateLabel}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{name}</span>
        {entry.mood && (
          <span style={{ fontSize: 10, color: 'var(--silver)', letterSpacing: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>
            {entry.mood}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--silver)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {shown}
      </div>
      {shouldClip && (
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'none', border: 'none', color: 'var(--gold)',
            fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase',
            fontFamily: 'var(--font-dm)', fontWeight: 700, cursor: 'pointer',
            padding: 0, marginTop: 6,
          }}
        >{expanded ? 'Show less' : 'Show more'}</button>
      )}
    </div>
  )
}
