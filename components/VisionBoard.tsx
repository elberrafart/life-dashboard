'use client'
import { useState, useRef } from 'react'
import { useApp } from '@/lib/context'
import GoalModal from './GoalModal'

export default function VisionBoard() {
  const { state, dispatch } = useApp()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
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

  const goals = state.goals.slice(0, 6)

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}
        className="vision-grid"
      >
        <style>{`
          @media (max-width: 640px) { .vision-grid { grid-template-columns: repeat(2,1fr) !important; } }
        `}</style>

        {/* Goal cards */}
        {goals.map(goal => (
          <div
            key={goal.id}
            style={{
              position: 'relative',
              minHeight: 200,
              borderRadius: 10,
              overflow: 'hidden',
              cursor: 'pointer',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              transition: 'border-color 200ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {/* Image or placeholder */}
            {goal.visionImageBase64 ? (
              <img
                src={goal.visionImageBase64}
                alt={goal.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85, transition: 'opacity 200ms' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                onMouseOut={e => (e.currentTarget.style.opacity = '0.85')}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text3)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32 }}>{goal.emoji}</div>
                <div style={{ fontSize: 11 }}>{goal.name}</div>
                <div style={{ width: 32, height: 32, border: '1px solid var(--border2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>+</div>
                <div style={{ fontSize: 9 }}>Add image</div>
              </div>
            )}

            {/* Gradient overlay */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(10,10,8,0.85))', padding: '24px 12px 10px' }}>
              <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--silver)' }}>{goal.emoji} {goal.name}</div>
            </div>

            {/* Category tag */}
            <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(10,10,8,0.75)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)' }}>
              {goal.category}
            </div>

            {/* Hover overlay */}
            <div
              className="vision-hover-overlay"
              style={{
                position: 'absolute', inset: 0, background: 'rgba(10,10,8,0.92)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16,
                opacity: 0, transition: 'opacity 200ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            >
              <button
                onClick={() => fileInputRefs.current[goal.id]?.click()}
                style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', padding: '8px 16px', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
              >
                📷 Upload Image
              </button>
              <button
                onClick={() => setSelectedGoalId(goal.id)}
                style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text3)', padding: '6px 12px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)' }}
              >
                ✏️ Edit Goal
              </button>
              <input
                ref={el => { fileInputRefs.current[goal.id] = el }}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(goal.id, f) }}
              />
            </div>
          </div>
        ))}

        {/* Quote card - spans 2 cols */}
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

      {selectedGoalId && (
        <GoalModal goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />
      )}
    </>
  )
}
