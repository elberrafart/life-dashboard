'use client'
import { useApp } from '@/lib/context'
import { getTodayKey } from '@/lib/store'

export default function TodayBar() {
  const { state, todayXP } = useApp()

  const todayKey = getTodayKey()
  const totalHabits = state.habits.length
  const completedHabits = state.habits.filter(h => state.checked[`${todayKey}_h_${h.id}`]).length
  const progress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()

  const streakDays = state.streak || 0

  return (
    <div style={{ padding: '16px 40px 0' }} className="sm:px-10 px-4">
      <div className="card" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {/* Date */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>Today</div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 18, letterSpacing: 2, color: 'var(--silver)' }}>{today}</div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ position: 'relative', height: 5, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden', marginBottom: 5 }}>
            <div className="xp-bar-fill xp-bar-shimmer" style={{ width: `${progress}%`, height: '100%', borderRadius: 99, position: 'relative' }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{completedHabits} of {totalHabits} habits complete</div>
        </div>

        {/* Streak */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>Streak</div>
          <div style={{
            fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 1,
            color: streakDays > 3 ? 'var(--gold)' : 'var(--silver)',
            lineHeight: 1,
            filter: streakDays > 3 ? 'drop-shadow(0 0 8px rgba(201,168,76,0.5))' : 'none',
          }}>
            {streakDays > 3 ? '🔥' : ''}{streakDays}
          </div>
        </div>

        {/* Daily XP */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>Daily XP</div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 36, letterSpacing: 1, color: 'var(--accent)', lineHeight: 1 }}>+{todayXP}</div>
        </div>
      </div>
    </div>
  )
}
