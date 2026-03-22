'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { Habit } from '@/lib/types'
import { getTodayKey } from '@/lib/store'

function generateId() { return `h-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

function AnimatedCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 20, height: 20, borderRadius: 5, flexShrink: 0,
        border: `1.5px solid ${checked ? 'var(--gold)' : 'var(--border2)'}`,
        background: checked ? 'var(--gold)' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 200ms', padding: 0,
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L4 7L9 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="check-mark" />
        </svg>
      )}
    </button>
  )
}

export default function HabitsTracker() {
  const { state, dispatch, awardHabitXP } = useApp()
  const [editMode, setEditMode] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newXP, setNewXP] = useState(25)

  const todayKey = getTodayKey()

  function handleToggle(habit: Habit, e: React.MouseEvent | React.TouchEvent) {
    const key = `${todayKey}_h_${habit.id}`
    const wasChecked = !!state.checked[key]
    dispatch({ type: 'TOGGLE_CHECKED', payload: { key, xp: habit.xp } })
    if (!wasChecked) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top
      awardHabitXP(habit.id, habit.xp, habit.label, x, y)
    }
  }

  function handleAddHabit() {
    if (!newLabel.trim()) return
    const habit: Habit = { id: generateId(), label: newLabel.trim(), xp: newXP }
    dispatch({ type: 'ADD_HABIT', payload: habit })
    setNewLabel('')
  }

  // Monthly dot grid for each habit
  const today = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const todayNum = today.getDate()

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)' }}>Today's Habits</div>
        <button
          onClick={() => setEditMode(!editMode)}
          style={{
            background: 'none', border: '1px solid var(--border)', borderRadius: 6,
            color: 'var(--text3)', padding: '4px 10px', fontSize: 10, letterSpacing: 1,
            textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)',
            transition: 'border-color 150ms',
          }}
        >{editMode ? 'Done' : 'Edit'}</button>
      </div>

      {/* Habit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {state.habits.map(habit => {
          const key = `${todayKey}_h_${habit.id}`
          const checked = !!state.checked[key]

          if (editMode) {
            return (
              <div key={habit.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                <input
                  type="text"
                  value={habit.label}
                  onChange={e => dispatch({ type: 'UPDATE_HABIT', payload: { ...habit, label: e.target.value } })}
                  style={{ flex: 1 }}
                />
                <select
                  value={habit.xp}
                  onChange={e => dispatch({ type: 'UPDATE_HABIT', payload: { ...habit, xp: Number(e.target.value) } })}
                  style={{ width: 70 }}
                >
                  <option value={10}>10 XP</option>
                  <option value={25}>25 XP</option>
                  <option value={50}>50 XP</option>
                  <option value={100}>100 XP</option>
                </select>
                <button
                  onClick={() => dispatch({ type: 'DELETE_HABIT', payload: habit.id })}
                  style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)',
                    width: 28, height: 28, cursor: 'pointer', fontSize: 13, transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
                >✕</button>
              </div>
            )
          }

          return (
            <div
              key={habit.id}
              onClick={e => handleToggle(habit, e)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: checked ? 'var(--surface)' : 'var(--surface2)',
                border: `1px solid ${checked ? 'var(--silver2)' : 'var(--border)'}`,
                borderRadius: 8, padding: '10px 12px',
                cursor: 'pointer', transition: 'all 150ms', userSelect: 'none',
                minHeight: 44,
              }}
            >
              <AnimatedCheckbox checked={checked} onToggle={() => {}} />
              <span style={{ flex: 1, fontSize: 13, color: checked ? 'var(--text3)' : 'var(--text2)', textDecoration: checked ? 'line-through' : 'none' }}>{habit.label}</span>
              <span style={{ fontSize: 10, letterSpacing: 1, color: 'var(--text3)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{habit.xp} XP</span>
            </div>
          )
        })}
      </div>

      {/* Add habit form in edit mode */}
      {editMode && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddHabit()}
            placeholder="New habit..."
            style={{ flex: 1 }}
          />
          <select value={newXP} onChange={e => setNewXP(Number(e.target.value))} style={{ width: 80 }}>
            <option value={10}>10 XP</option>
            <option value={25}>25 XP</option>
            <option value={50}>50 XP</option>
            <option value={100}>100 XP</option>
          </select>
          <button
            onClick={handleAddHabit}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 7,
              color: 'var(--text2)', cursor: 'pointer', padding: '0 16px', fontSize: 11,
              letterSpacing: 1.5, textTransform: 'uppercase', transition: 'all 150ms',
              whiteSpace: 'nowrap', fontFamily: 'var(--font-dm)',
            }}
          >+ Add</button>
        </div>
      )}

      {/* Monthly dot grid */}
      <div style={{ height: 1, background: 'var(--border)', margin: '12px 0' }} />
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>This Month</div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const isToday = day === todayNum
          const isPast = day < todayNum
          const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const completedCount = state.habits.filter(h => state.checked[`${dateKey}_h_${h.id}`]).length
          const totalCount = state.habits.length
          const done = completedCount === totalCount && totalCount > 0

          return (
            <div
              key={day}
              style={{
                width: isToday ? 12 : 9,
                height: isToday ? 12 : 9,
                borderRadius: 2,
                background: done ? 'var(--gold)' : completedCount > 0 ? 'var(--silver2)' : isPast ? 'var(--surface3)' : 'var(--surface3)',
                border: isToday ? '1px solid var(--silver)' : 'none',
                flexShrink: 0,
              }}
              title={`${day}: ${completedCount}/${totalCount}`}
            />
          )
        })}
      </div>

      {/* XP row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 14, marginTop: 14, borderTop: '1px solid var(--border)' }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>Streak</div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 1, color: 'var(--accent)', lineHeight: 1 }}>{state.streak || 0}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>Today</div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 1, color: 'var(--accent)', lineHeight: 1 }}>
            {state.habits.filter(h => state.checked[`${todayKey}_h_${h.id}`]).length}/{state.habits.length}
          </div>
        </div>
      </div>
    </div>
  )
}
