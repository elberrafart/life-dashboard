'use client'
import { useState, useRef } from 'react'
import { useApp } from '@/lib/context'
import GoalModal from './GoalModal'

function generateGoalId() { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

export default function VisionBoard() {
  const { state, dispatch } = useApp()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [creatingGoal, setCreatingGoal] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftCategory, setDraftCategory] = useState('')
  const [draftEmoji, setDraftEmoji] = useState('🎯')
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [editingQuote, setEditingQuote] = useState(false)
  const [quoteText, setQuoteText] = useState(state.vision.quoteText)
  const [quoteSub, setQuoteSub] = useState(state.vision.quoteSub)

  function handleImageUpload(goalId: string, file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const goal = state.goals.find(g => g.id === goalId)
      if (!goal) return
      dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, visionImageBase64: e.target?.result as string } })
    }
    reader.readAsDataURL(file)
  }

  function saveQuote() {
    dispatch({ type: 'SET_VISION', payload: { quoteText, quoteSub } })
    setEditingQuote(false)
  }

  function openCreateForm() {
    setDraftName('')
    setDraftCategory('')
    setDraftEmoji('🎯')
    setCreatingGoal(true)
  }

  function confirmCreateGoal() {
    if (!draftName.trim()) return
    const id = generateGoalId()
    dispatch({
      type: 'ADD_GOAL',
      payload: { id, emoji: draftEmoji, name: draftName.trim(), category: draftCategory.trim() || 'Personal', xp: 0, tasks: [] },
    })
    setCreatingGoal(false)
    setSelectedGoalId(id)
  }

  const goals = state.goals

  return (
    <>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}
        className="vision-grid"
      >
        <style>{`
          @media (max-width: 640px) { .vision-grid { grid-template-columns: repeat(2,1fr) !important; } }
          .vision-card-overlay { opacity: 0; transition: opacity 200ms; }
          .vision-card:hover .vision-card-overlay { opacity: 1; }
          .vision-card:hover .vision-card-img { opacity: 1 !important; }
        `}</style>

        {/* Goal cards */}
        {goals.map(goal => {
          const taskCount = goal.tasks.length
          return (
            <div
              key={goal.id}
              className="vision-card"
              onClick={() => setSelectedGoalId(goal.id)}
              style={{
                position: 'relative',
                minHeight: 200,
                borderRadius: 10,
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                transition: 'border-color 200ms, transform 200ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Image or placeholder */}
              {goal.visionImageBase64 ? (
                <img
                  className="vision-card-img"
                  src={goal.visionImageBase64}
                  alt={goal.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 200ms' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text3)', padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 36 }}>{goal.emoji}</div>
                  <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{goal.name}</div>
                </div>
              )}

              {/* Bottom gradient + info */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(6,6,5,0.9))', padding: '28px 10px 10px' }}>
                <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--silver)' }}>
                  {goal.emoji} {goal.name}
                </div>
                {taskCount > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, letterSpacing: 0.5 }}>
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Category tag */}
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(6,6,5,0.8)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)' }}>
                {goal.category}
              </div>

              {/* Hover overlay */}
              <div
                className="vision-card-overlay"
                style={{
                  position: 'absolute', inset: 0, background: 'rgba(6,6,5,0.88)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16,
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ fontSize: 13, fontFamily: 'var(--font-bebas)', letterSpacing: 2, color: 'var(--text)', marginBottom: 4 }}>
                  {goal.emoji} {goal.name}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setSelectedGoalId(goal.id) }}
                  style={{ background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 700, width: '100%' }}
                >
                  ✏️ Tasks &amp; Edit
                </button>
                <button
                  onClick={e => { e.stopPropagation(); fileInputRefs.current[goal.id]?.click() }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', padding: '7px 14px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', width: '100%' }}
                >
                  📷 Change Image
                </button>
                {taskCount > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5 }}>
                    {taskCount} task{taskCount !== 1 ? 's' : ''} · {goal.xp.toLocaleString()} XP earned
                  </div>
                )}
                <input
                  ref={el => { fileInputRefs.current[goal.id] = el }}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(goal.id, f) }}
                />
              </div>
            </div>
          )
        })}

        {/* Add Goal card */}
        <div
          onClick={openCreateForm}
          style={{
            position: 'relative',
            minHeight: 200,
            borderRadius: 10,
            overflow: 'hidden',
            cursor: 'pointer',
            border: '1px dashed var(--border2)',
            background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--text3)',
            transition: 'border-color 200ms, color 200ms',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)' }}
        >
          <div style={{ fontSize: 28 }}>＋</div>
          <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600 }}>Add Goal</div>
        </div>

        {/* Quote card — spans 2 cols */}
        <div
          style={{
            gridColumn: 'span 2',
            position: 'relative',
            minHeight: 200,
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderLeft: '3px solid var(--gold)',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
          className="noise-bg"
        >
          {editingQuote ? (
            <>
              <textarea
                value={quoteText}
                onChange={e => setQuoteText(e.target.value)}
                style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 1, color: 'var(--text)', background: 'transparent', border: 'none', outline: 'none', resize: 'none', width: '100%', marginBottom: 8, lineHeight: 1.3 }}
                rows={3}
              />
              <input
                value={quoteSub}
                onChange={e => setQuoteSub(e.target.value)}
                style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase', background: 'transparent', border: 'none', outline: 'none', width: '100%', marginBottom: 12 }}
                placeholder="— Author"
              />
              <button
                onClick={saveQuote}
                style={{ alignSelf: 'flex-start', background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--silver)', padding: '6px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
              >Save</button>
            </>
          ) : (
            <div onClick={() => setEditingQuote(true)} style={{ cursor: 'text' }}>
              <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 1, color: 'var(--text)', lineHeight: 1.3, marginBottom: 10 }}>"{state.vision.quoteText}"</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>{state.vision.quoteSub}</div>
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 8, letterSpacing: 1 }}>CLICK TO EDIT</div>
            </div>
          )}
        </div>
      </div>

      {/* Create goal form */}
      {creatingGoal && (
        <div
          onClick={() => setCreatingGoal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: 400, padding: '28px 28px 24px' }}
          >
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 3, color: 'var(--text)', marginBottom: 22 }}>
              NEW GOAL
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {/* Emoji quick-picks */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                {['🎯','💪','📚','💰','🏋️','🚀','❤️','🧠','🌱','🏆','⚔️','💎'].map(e => (
                  <button
                    key={e}
                    onClick={() => setDraftEmoji(e)}
                    style={{
                      fontSize: 20, padding: 6, borderRadius: 6, cursor: 'pointer',
                      background: draftEmoji === e ? 'rgba(201,168,76,0.2)' : 'var(--surface2)',
                      border: `1px solid ${draftEmoji === e ? 'var(--gold)' : 'var(--border)'}`,
                      transition: 'all 150ms', lineHeight: 1,
                    }}
                  >{e}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <input
                autoFocus
                type="text"
                placeholder="Goal name *"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmCreateGoal()}
                style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 1.5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', outline: 'none', width: '100%' }}
              />
              <input
                type="text"
                placeholder="Category  (e.g. Health, Finance…)"
                value={draftCategory}
                onChange={e => setDraftCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmCreateGoal()}
                style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', outline: 'none', width: '100%', fontSize: 13, fontFamily: 'var(--font-dm)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={confirmCreateGoal}
                disabled={!draftName.trim()}
                style={{
                  flex: 1, background: draftName.trim() ? 'var(--gold)' : 'var(--surface2)',
                  color: draftName.trim() ? 'var(--bg)' : 'var(--text3)',
                  border: 'none', borderRadius: 8, padding: '12px', fontSize: 12,
                  fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                  cursor: draftName.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms', fontFamily: 'var(--font-dm)',
                }}
              >
                {draftEmoji} Create Goal
              </button>
              <button
                onClick={() => setCreatingGoal(false)}
                style={{
                  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '12px 18px', fontSize: 12, color: 'var(--text3)', cursor: 'pointer',
                  letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)',
                }}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedGoalId && (
        <GoalModal goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />
      )}
    </>
  )
}
