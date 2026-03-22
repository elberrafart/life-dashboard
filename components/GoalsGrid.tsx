'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo, Goal } from '@/lib/types'
import GoalModal from './GoalModal'
import { getTodayKey } from '@/lib/store'

function generateId() { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export default function GoalsGrid() {
  const { state, dispatch, totalXP } = useApp()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [glowingGoal, setGlowingGoal] = useState<string | null>(null)
  const playerLevel = getLevelInfo(totalXP)

  function handleAddGoal() {
    const newGoal: Goal = {
      id: generateId(),
      emoji: '🎯',
      name: 'New Goal',
      category: 'General',
      xp: 0,
      tasks: [],
    }
    dispatch({ type: 'ADD_GOAL', payload: newGoal })
    setSelectedGoalId(newGoal.id)
  }

  const todayKey = getTodayKey()

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
        }}
        className="goals-responsive-grid"
      >
        <style>{`
          @media (max-width: 640px) { .goals-responsive-grid { grid-template-columns: repeat(2,1fr) !important; } }
        `}</style>

        {state.goals.map(goal => {
          const totalTasks = goal.tasks.length
          const completedTasks = goal.tasks.filter(t => state.checked[`${todayKey}_t_${t.id}`]).length
          const remainingTasks = totalTasks - completedTasks

          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`card card-interactive ${glowingGoal === goal.id ? 'goal-glow' : ''}`}
              style={{
                padding: '18px 12px 14px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer', textAlign: 'center',
                position: 'relative',
                userSelect: 'none',
                willChange: 'transform',
              }}
            >
              {/* Level badge */}
              <div style={{
                position: 'absolute', top: 6, left: 6,
                background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 4, padding: '1px 6px',
                fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)',
              }}>
                LVL {playerLevel.level}
              </div>

              {/* Edit button */}
              <div
                style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 20, height: 20, background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, cursor: 'pointer', color: 'var(--text3)', opacity: 0,
                  transition: 'opacity 150ms',
                }}
                className="goal-edit-btn"
              >
                ✏
              </div>
              <style>{`.card-interactive:hover .goal-edit-btn { opacity: 1 !important; }`}</style>

              <div style={{ fontSize: 36, lineHeight: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))', marginTop: 8 }}>{goal.emoji}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>{goal.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>{playerLevel.emoji} {playerLevel.name}</div>

              {/* XP bar — global level progress */}
              <div style={{ width: '100%', height: 4, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
                <div className="xp-bar-fill" style={{ width: `${playerLevel.progress}%`, height: '100%', borderRadius: 99 }} />
              </div>

              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>
                {remainingTasks > 0 ? `${remainingTasks} tasks left` : totalTasks > 0 ? '✓ All done!' : 'No tasks'}
              </div>
            </div>
          )
        })}

        {/* Add goal tile */}
        <div
          onClick={handleAddGoal}
          style={{
            background: 'transparent',
            border: '1px dashed var(--border2)',
            borderRadius: 14, padding: '18px 12px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, cursor: 'pointer', transition: 'all 200ms', textAlign: 'center', minHeight: 130,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--silver2)'; e.currentTarget.style.background = 'var(--surface)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{ width: 32, height: 32, border: '1px solid var(--border2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text3)' }}>+</div>
          <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)' }}>Add Goal</span>
        </div>
      </div>

      {selectedGoalId && (
        <GoalModal goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />
      )}
    </>
  )
}
