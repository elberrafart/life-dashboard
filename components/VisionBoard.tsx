'use client'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context'
import GoalModal from './GoalModal'
import { Goal } from '@/lib/types'

function generateGoalId() { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }

export default function VisionBoard() {
  const { state, dispatch } = useApp()
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [creatingGoal, setCreatingGoal] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftCategory, setDraftCategory] = useState('')
  const [draftEmoji, setDraftEmoji] = useState('🎯')
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const imageRefs = useRef<Record<string, HTMLImageElement | null>>({})
  const [editingQuote, setEditingQuote] = useState(false)
  const [quoteText, setQuoteText] = useState(state.vision.quoteText)
  const [quoteSub, setQuoteSub] = useState(state.vision.quoteSub)

  const dragState = useRef<{
    goalId: string
    startX: number; startY: number
    startOffsetX: number; startOffsetY: number
    moved: boolean
  } | null>(null)
  const wasDragging = useRef(false)

  // Close active card when clicking outside vision board
  useEffect(() => {
    if (!activeCardId) return
    function onDoc(e: MouseEvent | TouchEvent) {
      if (!(e.target as Element).closest('.vision-card')) setActiveCardId(null)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [activeCardId])

  function handleImageUpload(goalId: string, file: File) {
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
    if (!ALLOWED_TYPES.includes(file.type)) return
    if (file.size > MAX_SIZE) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Validate data URI prefix matches an image MIME type
      if (!result || !/^data:image\/(jpeg|png|gif|webp|svg\+xml);base64,/.test(result)) return
      const goal = state.goals.find(g => g.id === goalId)
      if (!goal) return
      dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, visionImageBase64: result } })
    }
    reader.readAsDataURL(file)
  }

  function saveQuote() {
    dispatch({ type: 'SET_VISION', payload: { quoteText, quoteSub } })
    setEditingQuote(false)
  }

  function openCreateForm() {
    setDraftName(''); setDraftCategory(''); setDraftEmoji('🎯')
    setCreatingGoal(true)
  }

  function confirmCreateGoal() {
    if (!draftName.trim()) return
    const id = generateGoalId()
    dispatch({ type: 'ADD_GOAL', payload: { id, emoji: draftEmoji, name: draftName.trim(), category: draftCategory.trim() || 'Personal', xp: 0, tasks: [] } })
    setCreatingGoal(false)
    setSelectedGoalId(id)
  }

  function zoomGoal(goal: Goal, delta: number) {
    const newScale = Math.max(0.5, Math.min(5, (goal.imageScale ?? 1) + delta))
    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, imageScale: newScale } })
  }

  function cycleAspect(goal: Goal) {
    const order: Array<'portrait' | 'landscape' | undefined> = [undefined, 'portrait', 'landscape']
    const next = order[(order.indexOf(goal.imageAspect) + 1) % order.length]
    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, imageAspect: next } })
  }

  function handleImagePointerDown(e: React.PointerEvent<HTMLImageElement>, goal: Goal) {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    wasDragging.current = false
    dragState.current = {
      goalId: goal.id,
      startX: e.clientX, startY: e.clientY,
      startOffsetX: goal.imageOffset?.x ?? 0,
      startOffsetY: goal.imageOffset?.y ?? 0,
      moved: false,
    }
  }

  function handleImagePointerMove(e: React.PointerEvent<HTMLImageElement>, goal: Goal) {
    if (!dragState.current || dragState.current.goalId !== goal.id) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) { dragState.current.moved = true; wasDragging.current = true }
    if (!dragState.current.moved) return
    const newX = dragState.current.startOffsetX + dx
    const newY = dragState.current.startOffsetY + dy
    const img = imageRefs.current[goal.id]
    if (img) img.style.transform = `translate(${newX}px, ${newY}px) scale(${goal.imageScale ?? 1})`
  }

  function handleImagePointerUp(e: React.PointerEvent<HTMLImageElement>, goal: Goal) {
    if (!dragState.current || dragState.current.goalId !== goal.id) return
    if (dragState.current.moved) {
      const newX = dragState.current.startOffsetX + (e.clientX - dragState.current.startX)
      const newY = dragState.current.startOffsetY + (e.clientY - dragState.current.startY)
      dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, imageOffset: { x: newX, y: newY } } })
    }
    dragState.current = null
  }

  const goals = state.goals

  return (
    <>
      <style>{`
        .vision-card-overlay { opacity: 0; transition: opacity 200ms; pointer-events: none; }
        .vision-card:hover .vision-card-overlay,
        .vision-card.vc-active .vision-card-overlay { opacity: 1; pointer-events: auto; }
        .vision-card:hover .vision-card-img { opacity: 1 !important; }
        .vision-img-controls { opacity: 0; transition: opacity 200ms; }
        .vision-card:hover .vision-img-controls,
        .vision-card.vc-active .vision-img-controls { opacity: 1; }
        @media (max-width: 640px) {
          .vision-grid { grid-template-columns: 1fr !important; }
          .vision-grid > * { grid-column: auto !important; }
          .vision-card { aspect-ratio: auto !important; min-height: 180px !important; max-height: 260px !important; }
          .vision-img-controls { opacity: 1 !important; }
          .vision-card-overlay { justify-content: flex-start !important; }
          .vision-overlay-imgcontrols { display: none !important; }
        }
      `}</style>

      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, alignItems: 'start' }}
        className="vision-grid"
      >
        {goals.map(goal => {
          const taskCount = goal.tasks.length
          const offsetX = goal.imageOffset?.x ?? 0
          const offsetY = goal.imageOffset?.y ?? 0
          const scale = goal.imageScale ?? 1
          const isActive = activeCardId === goal.id

          const aspectStyle: React.CSSProperties = goal.imageAspect === 'portrait'
            ? { aspectRatio: '9/16' }
            : goal.imageAspect === 'landscape'
            ? { aspectRatio: '16/9', gridColumn: 'span 2' }
            : { minHeight: 200 }

          const aspectLabel = goal.imageAspect === 'portrait' ? '📱 Portrait'
            : goal.imageAspect === 'landscape' ? '🖥 Landscape' : '⬜ Square'

          return (
            <div
              key={goal.id}
              className={`vision-card${isActive ? ' vc-active' : ''}`}
              onClick={() => {
                if (wasDragging.current) { wasDragging.current = false; return }
                if (isActive) {
                  // Second tap opens modal
                  setSelectedGoalId(goal.id)
                  setActiveCardId(null)
                } else {
                  setActiveCardId(goal.id)
                }
              }}
              style={{
                position: 'relative',
                borderRadius: 10,
                overflow: 'hidden',
                cursor: 'pointer',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                background: 'var(--surface)',
                transition: 'border-color 200ms, transform 200ms',
                ...aspectStyle,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
              onWheel={e => {
                if (!goal.visionImageBase64) return
                e.stopPropagation()
                const delta = e.deltaY > 0 ? -0.1 : 0.1
                const newScale = Math.max(0.5, Math.min(5, (goal.imageScale ?? 1) + delta))
                const img = imageRefs.current[goal.id]
                if (img) img.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${newScale})`
                dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, imageScale: newScale } })
              }}
            >
              {/* Image */}
              {goal.visionImageBase64 ? (
                <img
                  ref={el => { imageRefs.current[goal.id] = el }}
                  className="vision-card-img"
                  src={goal.visionImageBase64}
                  alt={goal.name}
                  draggable={false}
                  style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%',
                    objectFit: 'cover', opacity: 0.85,
                    transformOrigin: 'center center',
                    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                    cursor: isActive ? 'grab' : 'pointer',
                    userSelect: 'none', touchAction: 'none',
                  }}
                  onPointerDown={e => { if (isActive) handleImagePointerDown(e, goal) }}
                  onPointerMove={e => handleImagePointerMove(e, goal)}
                  onPointerUp={e => handleImagePointerUp(e, goal)}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text3)', padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 36 }}>{goal.emoji}</div>
                  <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{goal.name}</div>
                </div>
              )}

              {/* Bottom gradient label */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(6,6,5,0.92))', padding: '28px 10px 10px', pointerEvents: 'none' }}>
                <div style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--silver)' }}>
                  {goal.emoji} {goal.name}
                </div>
                {taskCount > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, letterSpacing: 0.5 }}>
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Category tag */}
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(6,6,5,0.8)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 7px', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', pointerEvents: 'none' }}>
                {goal.category}
              </div>

              {/* Always-visible mini image controls (bottom-right) — show on hover/active, always on mobile */}
              {goal.visionImageBase64 && (
                <div
                  className="vision-img-controls"
                  style={{ position: 'absolute', bottom: 38, right: 8, display: 'flex', gap: 4 }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={e => { e.stopPropagation(); zoomGoal(goal, 0.2) }}
                    title="Zoom in"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(10,10,8,0.75)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--silver)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm)', fontWeight: 600, lineHeight: 1 }}
                  >+</button>
                  <button
                    onClick={e => { e.stopPropagation(); zoomGoal(goal, -0.2) }}
                    title="Zoom out"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(10,10,8,0.75)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--silver)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm)', fontWeight: 600, lineHeight: 1 }}
                  >−</button>
                  <button
                    onClick={e => { e.stopPropagation(); dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, imageOffset: { x: 0, y: 0 }, imageScale: 1 } }) }}
                    title="Reset position"
                    style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(10,10,8,0.75)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--silver)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >↺</button>
                </div>
              )}

              {/* Hover / tap overlay */}
              <div
                className="vision-card-overlay"
                style={{
                  position: 'absolute', inset: 0, background: 'rgba(6,6,5,0.9)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, padding: 14,
                  overflowY: 'auto',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ fontSize: 13, fontFamily: 'var(--font-bebas)', letterSpacing: 2, color: 'var(--text)', marginBottom: 2 }}>
                  {goal.emoji} {goal.name}
                </div>

                <button
                  onClick={e => { e.stopPropagation(); setSelectedGoalId(goal.id); setActiveCardId(null) }}
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

                {/* Orientation */}
                <button
                  onClick={e => { e.stopPropagation(); cycleAspect(goal) }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', padding: '7px 14px', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', width: '100%' }}
                >
                  {aspectLabel} · Change Orientation
                </button>

                {/* Image controls when image exists */}
                {goal.visionImageBase64 && (
                  <div className="vision-overlay-imgcontrols" style={{ display: 'contents' }}>
                    <div style={{ display: 'flex', gap: 5, width: '100%' }}>
                      <button
                        onClick={e => { e.stopPropagation(); zoomGoal(goal, 0.25) }}
                        style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', padding: '7px 0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm)', fontWeight: 700 }}
                        title="Zoom in"
                      >+</button>
                      <button
                        onClick={e => { e.stopPropagation(); zoomGoal(goal, -0.25) }}
                        style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', padding: '7px 0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-dm)', fontWeight: 700 }}
                        title="Zoom out"
                      >−</button>
                      <button
                        onClick={e => { e.stopPropagation(); dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, imageOffset: { x: 0, y: 0 }, imageScale: 1 } }) }}
                        style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: 6, color: 'var(--text2)', padding: '7px 0', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Reset image"
                      >↺</button>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textAlign: 'center', textTransform: 'uppercase', lineHeight: 1.6 }}>
                      Tap outside to pan &amp; drag image<br />
                      Use +/− to zoom · ↺ to reset
                    </div>
                  </div>
                )}

                {taskCount > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 0.5 }}>
                    {taskCount} task{taskCount !== 1 ? 's' : ''} · {goal.xp.toLocaleString()} XP
                  </div>
                )}

                <input
                  ref={el => { fileInputRefs.current[goal.id] = el }}
                  type="file" accept="image/*" style={{ display: 'none' }}
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
            position: 'relative', minHeight: 200, borderRadius: 10, overflow: 'hidden',
            cursor: 'pointer', border: '1px dashed var(--border2)', background: 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            color: 'var(--text3)', transition: 'border-color 200ms, color 200ms',
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
            gridColumn: 'span 2', position: 'relative', minHeight: 200, borderRadius: 10, overflow: 'hidden',
            background: 'var(--surface2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--gold)',
            padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
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
              <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 8, letterSpacing: 1 }}>TAP TO EDIT</div>
            </div>
          )}
        </div>
      </div>

      {/* Create goal modal */}
      {creatingGoal && (
        <div
          onClick={() => setCreatingGoal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 400, padding: '28px 28px 24px' }}>
            <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 3, color: 'var(--text)', marginBottom: 22 }}>NEW GOAL</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {['🎯','💪','📚','💰','🏋️','🚀','❤️','🧠','🌱','🏆','⚔️','💎'].map(e => (
                <button key={e} onClick={() => setDraftEmoji(e)} style={{ fontSize: 20, padding: 6, borderRadius: 6, cursor: 'pointer', background: draftEmoji === e ? 'rgba(201,168,76,0.2)' : 'var(--surface2)', border: `1px solid ${draftEmoji === e ? 'var(--gold)' : 'var(--border)'}`, transition: 'all 150ms', lineHeight: 1 }}>{e}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <input autoFocus type="text" placeholder="Goal name *" value={draftName} onChange={e => setDraftName(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmCreateGoal()} style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 1.5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', outline: 'none', width: '100%' }} />
              <input type="text" placeholder="Category (e.g. Health, Finance…)" value={draftCategory} onChange={e => setDraftCategory(e.target.value)} onKeyDown={e => e.key === 'Enter' && confirmCreateGoal()} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', outline: 'none', width: '100%', fontSize: 13, fontFamily: 'var(--font-dm)' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={confirmCreateGoal} disabled={!draftName.trim()} style={{ flex: 1, background: draftName.trim() ? 'var(--gold)' : 'var(--surface2)', color: draftName.trim() ? 'var(--bg)' : 'var(--text3)', border: 'none', borderRadius: 8, padding: '12px', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', cursor: draftName.trim() ? 'pointer' : 'not-allowed', transition: 'all 150ms', fontFamily: 'var(--font-dm)' }}>
                {draftEmoji} Create Goal
              </button>
              <button onClick={() => setCreatingGoal(false)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 18px', fontSize: 12, color: 'var(--text3)', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedGoalId && <GoalModal goalId={selectedGoalId} onClose={() => setSelectedGoalId(null)} />}
    </>
  )
}
