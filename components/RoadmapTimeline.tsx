'use client'
import { useEffect, useState } from 'react'
import { getMyRoadmap } from '@/app/actions/profiles'
import { Roadmap, RoadmapPhase, DEFAULT_ROADMAP_TITLE, getCurrentRoadmapWeek } from '@/lib/types'
import { fetchCached } from '@/lib/dataCache'

type PhaseState = 'completed' | 'active' | 'upcoming'

function phaseState(phase: RoadmapPhase, currentWeek: number | null): PhaseState {
  if (phase.completedAt) return 'completed'
  if (currentWeek == null) return 'upcoming'
  if (currentWeek > phase.weekEnd) return 'completed'
  if (currentWeek >= phase.weekStart && currentWeek <= phase.weekEnd) return 'active'
  return 'upcoming'
}

export default function RoadmapTimeline({ roadmap: roadmapProp }: { roadmap?: Roadmap | null }) {
  // If a roadmap is passed in (admin preview), use it; otherwise fetch the
  // current user's roadmap from the DB. Roadmap data lives in its own column,
  // outside the local-wins AppState sync, so we always read from the server.
  const [roadmap, setRoadmap] = useState<Roadmap | null | undefined>(roadmapProp)
  const [loading, setLoading] = useState(roadmapProp === undefined)

  useEffect(() => {
    if (roadmapProp !== undefined) { setRoadmap(roadmapProp); return }
    let cancelled = false
    fetchCached('myRoadmap', getMyRoadmap, 60_000)
      .then(r => { if (!cancelled) { setRoadmap(r); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [roadmapProp])

  if (loading) return null
  if (!roadmap || !roadmap.phases || roadmap.phases.length === 0) {
    return (
      <div style={{ padding: '12px 20px 0' }}>
        <div className="card" style={{ padding: '18px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
            Roadmap
          </div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>
            Your coach will set this up for you.
          </div>
        </div>
      </div>
    )
  }

  const phases = [...roadmap.phases].sort((a, b) => a.number - b.number)
  const currentWeek = getCurrentRoadmapWeek(roadmap)
  const title = (roadmap.title?.trim() || DEFAULT_ROADMAP_TITLE).toUpperCase()

  return (
    <div style={{ padding: '16px 20px 0' }}>
      <style>{`
        .roadmap-card { padding: 22px 24px 24px; }
        .roadmap-grid {
          display: grid; gap: 14px;
          grid-template-columns: repeat(${phases.length}, minmax(0, 1fr));
        }
        .roadmap-connector { position: absolute; top: 18px; height: 2px; background: var(--border); z-index: 0; }
        .roadmap-dot {
          position: relative; z-index: 1;
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--surface2); border: 2px solid var(--border);
          font-size: 11px; color: var(--text3); letter-spacing: 1px;
          font-family: var(--font-dm); font-weight: 700;
          transition: all 200ms;
        }
        .roadmap-dot.active {
          background: var(--gold);
          border-color: var(--gold);
          color: #0a0a08;
          box-shadow: 0 0 16px rgba(245,197,24,0.55), 0 0 0 6px rgba(245,197,24,0.12);
        }
        .roadmap-dot.completed {
          background: #a3d977;
          border-color: #a3d977;
          color: #0a0a08;
        }
        .roadmap-phase-card {
          padding: 14px 14px 12px; border-radius: 10px;
          background: var(--surface2); border: 1px solid var(--border);
          transition: all 200ms;
          min-height: 140px;
          display: flex; flex-direction: column;
        }
        .roadmap-phase-card.active {
          border-color: var(--gold);
          background: rgba(245,197,24,0.06);
          box-shadow: 0 0 12px rgba(245,197,24,0.12) inset;
        }
        .roadmap-phase-card.completed {
          opacity: 0.7;
        }
        @media (max-width: 768px) {
          .roadmap-card { padding: 18px 16px 20px; }
          .roadmap-grid { grid-template-columns: 1fr; }
          .roadmap-connector { display: none; }
        }
      `}</style>

      <div className="card roadmap-card">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 4, color: 'var(--text)' }}>
            {title}
          </div>
          {currentWeek != null && (
            <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
              Currently: <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Week {currentWeek}</span>
            </div>
          )}
        </div>

        {/* Timeline dots row with connector line */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <div
            className="roadmap-connector"
            style={{ left: `calc(${100 / (phases.length * 2)}%)`, right: `calc(${100 / (phases.length * 2)}%)` }}
          />
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${phases.length}, minmax(0, 1fr))`,
            gap: 14,
          }}>
            {phases.map(p => {
              const st = phaseState(p, currentWeek)
              const label = String(p.number).padStart(2, '0')
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'center' }}>
                  <div className={`roadmap-dot ${st}`} title={p.label}>
                    {st === 'completed' ? '✓' : st === 'active' ? <span style={{ fontSize: 14 }}>{p.emoji}</span> : label}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Phase cards */}
        <div className="roadmap-grid">
          {phases.map(p => {
            const st = phaseState(p, currentWeek)
            return (
              <div key={p.id} className={`roadmap-phase-card ${st}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 10, letterSpacing: 1.5, color: st === 'active' ? 'var(--gold)' : 'var(--text3)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>
                    Phase {String(p.number).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 13, marginLeft: 'auto' }}>{p.emoji}</span>
                </div>
                <div style={{
                  fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2,
                  color: st === 'upcoming' ? 'var(--text3)' : 'var(--text)',
                  marginBottom: 6, lineHeight: 1.1,
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontSize: 11, color: 'var(--text3)',
                  lineHeight: 1.5, flex: 1,
                }}>
                  {p.description}
                </div>
                <div style={{ fontSize: 10, color: st === 'active' ? 'var(--gold)' : 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 10, fontFamily: 'var(--font-dm)', fontWeight: 600 }}>
                  Weeks {p.weekStart}{p.weekEnd !== p.weekStart ? `\u2013${p.weekEnd}` : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
