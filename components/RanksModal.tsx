'use client'
import { LEVELS, IMMORTAL_LEVEL, IMMORTAL_XP_THRESHOLD, IMMORTAL_STREAK_DAYS } from '@/lib/types'

export default function RanksModal({ onClose, currentLevel }: { onClose: () => void; currentLevel: number }) {
  const allRanks = [...LEVELS, IMMORTAL_LEVEL]
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="card"
        style={{
          padding: '28px 32px', maxWidth: 480, width: '100%',
          maxHeight: '80vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 3, color: 'var(--text)' }}>
            RANKING SYSTEM
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
          >×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {allRanks.map((rank) => {
            const isCurrent = rank.level === currentLevel
            const isImmortal = rank.level === 11
            return (
              <div
                key={rank.level}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 10,
                  background: isCurrent ? 'rgba(201,168,76,0.12)' : 'var(--surface2)',
                  border: `1px solid ${isCurrent ? 'var(--gold)' : 'var(--border)'}`,
                }}
              >
                <div style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{rank.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: isCurrent ? 'var(--gold)' : 'var(--silver)', fontWeight: 600 }}>
                      Lvl {rank.level} — {rank.name}
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(201,168,76,0.15)', borderRadius: 4, padding: '2px 6px' }}>
                        You are here
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                    {isImmortal
                      ? `${IMMORTAL_XP_THRESHOLD.toLocaleString()} XP + ${IMMORTAL_STREAK_DAYS}-day streak`
                      : rank.maxXp === Infinity
                        ? `${rank.minXp.toLocaleString()}+ XP`
                        : `${rank.minXp.toLocaleString()} – ${rank.maxXp.toLocaleString()} XP`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text3)', letterSpacing: 0.5, lineHeight: 1.6, padding: '14px 16px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <strong style={{ color: 'var(--silver)' }}>🐐 Immortal</strong> is the highest rank — unlock it by reaching {IMMORTAL_XP_THRESHOLD.toLocaleString()} XP <em>and</em> maintaining a {IMMORTAL_STREAK_DAYS}-day unbroken streak.
        </div>
      </div>
    </div>
  )
}
