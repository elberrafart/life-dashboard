'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { getLevelInfo, Goal, Task } from '@/lib/types'
import GoalModal from './GoalModal'
import { getTodayKey } from '@/lib/store'

function generateId() { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

export default function GoalsGrid() {
  const { state, dispatch, totalXP, awardGoalXP, removeGoalXP } = useApp()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const playerLevel = getLevelInfo(totalXP, state.streak ?? 0)
  const todayKey = getTodayKey()

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

  function handleToggleTask(goal: Goal, task: Task, e: React.MouseEvent) {
    const key = `${todayKey}_t_${task.id}`
    const wasChecked = !!state.checked[key]
    dispatch({ type: 'TOGGLE_CHECKED', payload: { key, xp: task.xp } })
    if (!wasChecked) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      awardGoalXP(goal.id, task.xp, goal.emoji, `Completed: ${task.name}`, rect.left + rect.width / 2, rect.top)
    } else {
      removeGoalXP(goal.id, task.xp)
    }
  }

  return (
    <>
      <div className="goals-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state.goals.map(goal => {
          const completedTasks = goal.tasks.filter(t => !!state.checked[`${todayKey}_t_${t.id}`]).length
          const totalTasks = goal.tasks.length

          return (
            <div key={goal.id} className="card" style={{ padding: '18px 20px' }}>

              {/* Goal header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: totalTasks > 0 ? 14 : 0 }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{goal.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{goal.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>
                    {totalTasks > 0 ? `${completedTasks}/${totalTasks} tasks today` : 'No tasks yet'} · {playerLevel.emoji} {playerLevel.name}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGoalId(goal.id)}
                  style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                    color: 'var(--text3)', padding: '5px 12px', fontSize: 10, letterSpacing: 1,
                    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)',
                    transition: 'all 150ms', whiteSpace: 'nowrap', minHeight: 32,
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--silver2)'; e.currentTarget.style.color = 'var(--silver)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
                >
                  ✏ Edit
                </button>
              </div>

              {/* Inline task list with checkboxes */}
              {goal.tasks.map(task => {
                const key = `${todayKey}_t_${task.id}`
                const checked = !!state.checked[key]
                return (
                  <div
                    key={task.id}
                    className="task-row"
                    onClick={e => handleToggleTask(goal, task, e)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', marginBottom: 6,
                      background: checked ? 'var(--surface2)' : 'transparent',
                      border: `1px solid ${checked ? 'var(--border)' : 'var(--border)'}`,
                      borderRadius: 8,
                      opacity: checked ? 0.55 : 1,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      minHeight: 44,
                      userSelect: 'none',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${checked ? 'var(--gold)' : 'var(--border2)'}`,
                      background: checked ? 'var(--gold)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 200ms',
                    }}>
                      {checked && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L4 7L9 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="check-mark" />
                        </svg>
                      )}
                    </div>

                    <span style={{ flex: 1, fontSize: 13, color: checked ? 'var(--text3)' : 'var(--text)', textDecoration: checked ? 'line-through' : 'none' }}>
                      {task.name}
                    </span>
                    {task.repeatable && <span style={{ fontSize: 11, color: 'var(--text3)' }} title="Repeatable daily">🔄</span>}
                    <span style={{
                      fontSize: 9, letterSpacing: 1, color: checked ? 'var(--text3)' : 'var(--gold)',
                      border: `1px solid ${checked ? 'var(--border)' : 'var(--gold)'}`,
                      borderRadius: 4, padding: '1px 5px', whiteSpace: 'nowrap',
                    }}>{task.xp} XP</span>
                  </div>
                )
              })}

              {goal.tasks.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text3)', padding: '8px 0' }}>
                  No tasks — click Edit to add some
                </div>
              )}

              {/* XP bar */}
              <div style={{ marginTop: 12, height: 3, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden' }}>
                <div className="xp-bar-fill" style={{ width: `${playerLevel.progress}%`, height: '100%', borderRadius: 99 }} />
              </div>
            </div>
          )
        })}

        {/* Add goal */}
        <div
          onClick={handleAddGoal}
          style={{
            border: '1px dashed var(--border2)', borderRadius: 14,
            padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, cursor: 'pointer', transition: 'all 200ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--silver2)'; e.currentTarget.style.background = 'var(--surface)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.background = 'transparent' }}
        >
          <span style={{ fontSize: 18, color: 'var(--text3)' }}>+</span>
          <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)' }}>Add Goal</span>
        </div>
      </div>

      {selectedGoalId && (
        <GoalModal goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />
      )}
    </>
  )
}
