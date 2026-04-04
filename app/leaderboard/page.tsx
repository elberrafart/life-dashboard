import Link from 'next/link'
import { getLeaderboard } from '@/app/actions/profiles'
import { getLevelInfo } from '@/lib/types'

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default async function LeaderboardPage() {
  let entries: Awaited<ReturnType<typeof getLeaderboard>> = []
  let error: string | null = null

  try {
    entries = await getLeaderboard()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load leaderboard'
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .lb-home-btn:hover { border-color: var(--gold) !important; color: var(--gold) !important; }
        .lb-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 36, letterSpacing: 5, color: 'var(--text)', lineHeight: 1 }}>
            LEADERBOARD
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>
            Community Rankings · Sorted by XP
          </div>
        </div>
        <Link
          href="/"
          className="lb-home-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 16px', textDecoration: 'none',
            color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600,
            transition: 'all 150ms', flexShrink: 0,
          }}
        >
          ← Home
        </Link>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 13, color: '#e05c5c', marginBottom: 24 }}>
          {error}
        </div>
      )}

      {entries.length === 0 && !error ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text3)', fontSize: 13, lineHeight: 1.8 }}>
          No users yet.<br />
          <span style={{ fontSize: 11 }}>Check-in from your dashboard to appear here.</span>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto auto', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--border)', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'var(--font-dm)' }}>
            <div style={{ textAlign: 'center' }}>#</div>
            <div>Player</div>
            <div style={{ textAlign: 'right' }}>Streak</div>
            <div style={{ textAlign: 'right', minWidth: 80 }}>XP</div>
          </div>

          {entries.map((entry, i) => {
            const rank = i + 1
            const level = getLevelInfo(entry.xp_total, entry.streak)
            const name = entry.display_name || 'Player'
            const medal = MEDAL[rank]
            const isTop3 = rank <= 3

            return (
              <div
                key={entry.user_id}
                className="lb-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr auto auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isTop3 ? `rgba(201,168,76,${0.04 - i * 0.01})` : 'transparent',
                  transition: 'background 150ms',
                }}
              >
                {/* Rank */}
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-bebas)', fontSize: medal ? 22 : 16, color: isTop3 ? 'var(--gold)' : 'var(--text3)', letterSpacing: 1 }}>
                  {medal ?? rank}
                </div>

                {/* Player info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, color: isTop3 ? 'var(--text)' : 'var(--text2)', fontFamily: 'var(--font-dm)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </span>
                    <span style={{ fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', padding: '2px 7px', borderRadius: 4, background: isTop3 ? 'rgba(201,168,76,0.15)' : 'var(--surface2)', color: isTop3 ? 'var(--gold)' : 'var(--text3)', border: `1px solid ${isTop3 ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`, flexShrink: 0 }}>
                      {level.emoji} Lvl {level.level} {level.name}
                    </span>
                  </div>
                  {entry.kanban_done > 0 && (
                    <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, letterSpacing: 0.5 }}>
                      {entry.kanban_done} tasks done
                    </div>
                  )}
                </div>

                {/* Streak */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {entry.streak > 0 && (
                    <div style={{ fontSize: 12, color: entry.streak >= 7 ? '#f0a500' : 'var(--text3)', fontFamily: 'var(--font-dm)', fontWeight: 600, letterSpacing: 0.5 }}>
                      🔥 {entry.streak}d
                    </div>
                  )}
                </div>

                {/* XP */}
                <div style={{ textAlign: 'right', minWidth: 80, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 1, color: isTop3 ? 'var(--gold)' : 'var(--silver)' }}>
                    {entry.xp_total.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>XP</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
