'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { Task, getLevelInfo } from '@/lib/types'
import { getTodayKey } from '@/lib/store'

const EMOJIS = ['🎯', '💰', '🏦', '📸', '⚡', '🏆', '🚀', '💪', '🧠', '✈️', '🏡', '🚗', '⌚', '🏍️', '🏙️', '📖', '🎸', '🎨', '💻', '🌍', '❤️', '🔥', '⭐', '🌱', '🏋️', '🎓', '💎', '🛡️', '⚔️', '📚', '🔬', '🎵', '🌊', '🏄', '🤸', '🧘', '💡', '🏆', '🎮', '🍎']

function generateTaskId() { return `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

function XPBadge({ xp }: { xp: 10 | 25 | 50 | 100 }) {
  const color = xp === 10 ? 'var(--text3)' : xp === 25 ? 'var(--silver)' : xp === 50 ? 'var(--gold)' : 'var(--gold2)'
  const glow = xp === 100 ? '0 0 8px var(--glow-gold)' : 'none'
  return (
    <span style={{
      fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color,
      border: `1px solid ${color}`, borderRadius: 4, padding: '1px 5px',
      boxShadow: glow, whiteSpace: 'nowrap',
    }}>{xp} XP</span>
  )
}

function AnimatedCheckbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 20, height: 20, borderRadius: 5,
        border: `1.5px solid ${checked ? 'var(--gold)' : 'var(--border2)'}`,
        background: checked ? 'var(--gold)' : 'transparent',
        cursor: 'pointer', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 200ms', padding: 0,
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L4 7L9 1" stroke="var(--bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            className="check-mark" />
        </svg>
      )}
    </button>
  )
}

export default function GoalModal({ goalId, onClose }: { goalId: string; onClose: () => void }) {
  const { state, dispatch, awardGoalXP } = useApp()
  const goal = state.goals.find(g => g.id === goalId)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [localEmoji, setLocalEmoji] = useState(goal?.emoji ?? '🎯')
  const [localName, setLocalName] = useState(goal?.name ?? '')
  const [localCategory, setLocalCategory] = useState(goal?.category ?? '')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskXP, setNewTaskXP] = useState<10 | 25 | 50 | 100>(25)
  const [newTaskRepeatable, setNewTaskRepeatable] = useState(true)

  const todayKey = getTodayKey()

  if (!goal) return null

  const levelInfo = getLevelInfo(goal.xp)

  function handleSaveHeader() {
    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal!, emoji: localEmoji, name: localName, category: localCategory } })
  }

  function handleToggleTask(task: Task, e: React.MouseEvent) {
    const key = `${todayKey}_t_${task.id}`
    const wasChecked = state.checked[key]
    dispatch({ type: 'TOGGLE_CHECKED', payload: { key, xp: task.xp } })
    if (!wasChecked) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      awardGoalXP(goal!.id, task.xp, goal!.emoji, `Completed: ${task.name}`, rect.left + rect.width / 2, rect.top)
    }
  }

  function handleAddTask() {
    if (!newTaskName.trim()) return
    const task: Task = {
      id: generateTaskId(),
      name: newTaskName.trim(),
      xp: newTaskXP,
      repeatable: newTaskRepeatable,
    }
    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal!, tasks: [...goal!.tasks, task] } })
    setNewTaskName('')
  }

  function handleDeleteTask(taskId: string) {
    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal!, tasks: goal!.tasks.filter(t => t.id !== taskId) } })
  }

  function handleDeleteGoal() {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    dispatch({ type: 'DELETE_GOAL', payload: goal!.id })
    onClose()
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%', maxWidth: 560,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 28px 40px',
          maxHeight: '90vh', overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        }}
        className="slide-up"
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border2)', borderRadius: 99, margin: '0 auto 20px' }} />

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        {/* Emoji picker */}
        {showEmojiPicker && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 4,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 10, marginBottom: 10,
            maxHeight: 140, overflowY: 'auto',
          }}>
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => {
                  setLocalEmoji(e)
                  setShowEmojiPicker(false)
                  dispatch({ type: 'UPDATE_GOAL', payload: { ...goal!, emoji: e } })
                }}
                style={{ fontSize: 22, cursor: 'pointer', padding: 4, borderRadius: 6, background: 'none', border: 'none', transition: 'background 150ms', lineHeight: 1 }}
                onMouseOver={ev => (ev.currentTarget.style.background = 'var(--border2)')}
                onMouseOut={ev => (ev.currentTarget.style.background = 'none')}
              >{e}</button>
            ))}
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 20, alignItems: 'flex-start' }}>
          <div>
            <div
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ fontSize: 42, lineHeight: 1, cursor: 'pointer', transition: 'transform 200ms' }}
              title="Click to change emoji"
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            >{localEmoji}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 3, textAlign: 'center' }}>tap to change</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              value={localCategory}
              onChange={e => setLocalCategory(e.target.value)}
              onBlur={handleSaveHeader}
              placeholder="Category"
              style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', background: 'transparent', border: 'none', outline: 'none', width: '100%', marginBottom: 4, padding: 0 }}
            />
            <input
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onBlur={handleSaveHeader}
              placeholder="Goal name"
              style={{ fontFamily: 'var(--font-bebas)', fontSize: 26, letterSpacing: 1.5, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none', borderBottom: '1px solid var(--border)', width: '100%', paddingBottom: 2 }}
            />
          </div>
        </div>

        {/* XP Progress */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 7 }}>
            <span>{levelInfo.emoji} {levelInfo.name} — Level {levelInfo.level}</span>
            <span>{Math.round(levelInfo.progress)}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
            <div className="xp-bar-fill" style={{ width: `${levelInfo.progress}%`, height: '100%', borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'right' }}>
            {goal.xp.toLocaleString()} XP {levelInfo.maxXp !== Infinity ? `/ ${(levelInfo.minXp + levelInfo.xpToNext).toLocaleString()} XP to Level ${levelInfo.level + 1}` : '— MAX LEVEL'}
          </div>
        </div>

        {/* Tasks */}
        <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Tasks</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {goal.tasks.map(task => {
            const key = `${todayKey}_t_${task.id}`
            const checked = !!state.checked[key]
            return (
              <div
                key={task.id}
                onClick={e => !checked && handleToggleTask(task, e)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: checked ? 'var(--surface2)' : 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  transition: 'all 150ms',
                  opacity: checked ? 0.6 : 1,
                  cursor: checked ? 'default' : 'pointer',
                  minHeight: 44,
                }}
              >
                <AnimatedCheckbox checked={checked} onToggle={() => {}} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', textDecoration: checked ? 'line-through' : 'none' }}>{task.name}</span>
                {task.repeatable && <span title="Repeatable" style={{ fontSize: 12, color: 'var(--text3)' }}>🔄</span>}
                <XPBadge xp={task.xp} />
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12,
                    opacity: 0, transition: 'opacity 150ms', padding: 4,
                  }}
                  className="task-delete-btn"
                >✕</button>
              </div>
            )
          })}
          <style>{`div:hover > .task-delete-btn { opacity: 1 !important; }`}</style>

          {goal.tasks.length === 0 && (
            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', padding: '20px 0' }}>No tasks yet — add one below</div>
          )}
        </div>

        {/* Add task form */}
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
        <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Add Task</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="text"
            value={newTaskName}
            onChange={e => setNewTaskName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="Task name..."
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>XP:</span>
          {([10, 25, 50, 100] as const).map(xp => (
            <button
              key={xp}
              onClick={() => setNewTaskXP(xp)}
              style={{
                padding: '4px 10px', borderRadius: 6,
                border: `1px solid ${newTaskXP === xp ? 'var(--gold)' : 'var(--border)'}`,
                background: newTaskXP === xp ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: newTaskXP === xp ? 'var(--gold)' : 'var(--text3)',
                fontSize: 11, cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-dm)',
              }}
            >{xp}</button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)', marginLeft: 8, cursor: 'pointer' }}>
            <div
              onClick={() => setNewTaskRepeatable(!newTaskRepeatable)}
              style={{
                width: 32, height: 18, borderRadius: 99,
                background: newTaskRepeatable ? 'var(--gold)' : 'var(--surface3)',
                border: '1px solid var(--border2)',
                position: 'relative', cursor: 'pointer', transition: 'background 200ms',
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: newTaskRepeatable ? 15 : 2,
                width: 12, height: 12, borderRadius: '50%',
                background: 'white', transition: 'left 200ms',
              }} />
            </div>
            🔄 Repeat
          </label>
        </div>

        <button
          onClick={handleAddTask}
          style={{
            width: '100%', background: 'var(--accent)', color: 'var(--bg)',
            border: 'none', borderRadius: 8, padding: 12,
            fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: 'pointer', transition: 'opacity 200ms', fontFamily: 'var(--font-dm)',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >+ Add Task</button>

        {/* Delete goal */}
        <button
          onClick={handleDeleteGoal}
          style={{
            marginTop: 10, width: '100%', background: 'transparent',
            border: `1px solid ${deleteConfirm ? 'var(--red)' : 'var(--border)'}`,
            color: deleteConfirm ? 'var(--red)' : 'var(--text3)',
            borderRadius: 8, padding: 9,
            fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 200ms', fontFamily: 'var(--font-dm)',
          }}
        >
          {deleteConfirm ? '⚠ Are you sure? Click again to confirm' : 'Delete this goal'}
        </button>
      </div>
    </div>
  )
}
