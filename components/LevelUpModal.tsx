'use client'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo, LEVELS, IMMORTAL_LEVEL } from '@/lib/types'
import { generateConfettiParticles } from '@/lib/animations'

const ALL_LEVELS = [...LEVELS, IMMORTAL_LEVEL]

export default function LevelUpModal() {
  const { totalXP, state } = useApp()
  const streak = state.streak ?? 0
  const prevXP = useRef(-1)
  const prevStreak = useRef(-1)
  const [levelUp, setLevelUp] = useState<{ oldLevel: number; newLevel: number } | null>(null)
  const [confetti] = useState(() => generateConfettiParticles(50))
  const [phase, setPhase] = useState<'flash' | 'modal' | 'done'>('done')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (prevXP.current === -1) {
      prevXP.current = totalXP
      prevStreak.current = streak
      return
    }
    const prevLevel = getLevelInfo(prevXP.current, prevStreak.current).level
    const newLevel  = getLevelInfo(totalXP, streak).level
    if (newLevel > prevLevel) {
      timers.current.forEach(clearTimeout)
      setLevelUp({ oldLevel: prevLevel, newLevel })
      setPhase('flash')
      timers.current = [
        setTimeout(() => setPhase('modal'), 250),
        setTimeout(() => setPhase('done'), 5000),
      ]
    }
    prevXP.current = totalXP
    prevStreak.current = streak
    return () => timers.current.forEach(clearTimeout)
  }, [totalXP, streak])

  if (phase === 'done' || !levelUp) return null

  const oldInfo = ALL_LEVELS[levelUp.oldLevel - 1]
  const newInfo = ALL_LEVELS[levelUp.newLevel - 1]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: phase === 'modal' ? 'auto' : 'none' }}>
      {/* Flash */}
      <div
        className="level-flash"
        style={{ position: 'absolute', inset: 0, background: 'rgba(201,168,76,0.15)', pointerEvents: 'none' }}
      />

      {/* Confetti burst — each particle uses CSS vars for x/y/rotation */}
      {phase === 'modal' && confetti.map(p => {
        const tx = Math.cos(p.angle) * p.velocity
        const ty = Math.sin(p.angle) * p.velocity + 60 // gravity pull down
        return (
          <div
            key={p.id}
            style={{
              position: 'fixed',
              left: '50%',
              top: '45%',
              width: 6,
              height: 10,
              background: p.color,
              borderRadius: 2,
              pointerEvents: 'none',
              '--tx': `${tx}px`,
              '--ty': `${ty}px`,
              '--r': `${p.rotation}deg`,
              animation: `confettiParticle 2000ms ${p.delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
            } as React.CSSProperties}
          />
        )
      })}

      {/* Modal */}
      {phase === 'modal' && (
        <div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setPhase('done')}
        >
          <div
            style={{
              background: 'var(--bg)',
              border: '2px solid var(--gold)',
              borderRadius: 20,
              padding: '40px 48px',
              textAlign: 'center',
              boxShadow: '0 0 80px var(--glow-gold), 0 0 160px rgba(201,168,76,0.08), 0 24px 60px rgba(0,0,0,0.8)',
              maxWidth: 360,
              width: '90%',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              fontSize: 11, letterSpacing: 5, textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 24,
            }}>
              ⚡ RANK UP ⚡
            </div>

            {/* Old rank slides out */}
            <div className="badge-slide-out" style={{ fontSize: 32, opacity: 0.4, marginBottom: -8 }}>
              {oldInfo?.emoji} {oldInfo?.name}
            </div>

            {/* New rank slams in */}
            <div
              className="badge-slam"
              style={{
                fontSize: 88,
                filter: 'drop-shadow(0 0 24px rgba(201,168,76,0.9))',
                marginBottom: 12,
                lineHeight: 1,
                display: 'block',
              }}
            >
              {newInfo?.emoji}
            </div>

            <div style={{
              fontFamily: 'var(--font-bebas)', fontSize: 40, letterSpacing: 3,
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', marginBottom: 6,
            }}>
              LEVEL {levelUp.newLevel}
            </div>

            <div style={{
              fontFamily: 'var(--font-bebas)', fontSize: 24, letterSpacing: 4,
              color: 'var(--text)', marginBottom: 4,
            }}>
              {newInfo?.name}
            </div>

            <div style={{
              fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 20,
              textTransform: 'uppercase',
            }}>
              Tap anywhere to continue
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
