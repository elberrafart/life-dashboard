'use client'
import { useState, useRef } from 'react'
import { useApp } from '@/lib/context'
import { KanbanCard } from '@/lib/types'

function generateId() { return `k-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

const COLUMNS: { id: 'todo' | 'inprogress' | 'done'; label: string; color: string; icon: string }[] = [
  { id: 'todo',       label: 'To Do',       color: 'var(--silver2)', icon: '○' },
  { id: 'inprogress', label: 'In Progress', color: 'var(--gold)',    icon: '◐' },
  { id: 'done',       label: 'Done',        color: 'var(--green)',   icon: '●' },
]

const PRIORITY_COLOR: Record<string, string> = {
  high:   'var(--red)',
  medium: 'var(--gold)',
  low:    'var(--green)',
}

const DONE_XP = 50

export default function KanbanBoard() {
  const { state, dispatch, awardGoalXP, awardHabitXP } = useApp()

  // Desktop drag state
  const [dragId,  setDragId]  = useState<string | null>(null)
  const [dropCol, setDropCol] = useState<string | null>(null)

  // Touch drag state
  const touchCardRef  = useRef<KanbanCard | null>(null)
  const ghostRef      = useRef<HTMLDivElement | null>(null)
  const touchOverCol  = useRef<string | null>(null)
  const [touchDragId, setTouchDragId] = useState<string | null>(null)

  // Add-card form state
  const [addingTo,       setAddingTo]       = useState<string | null>(null)
  const [newCardName,    setNewCardName]     = useState('')
  const [newCardPriority,setNewCardPriority] = useState<'high'|'medium'|'low'>('medium')
  const [newCardGoal,    setNewCardGoal]     = useState('')

  // ── move logic ───────────────────────────────────────────────
  function moveCard(card: KanbanCard, col: 'todo'|'inprogress'|'done', x?: number, y?: number) {
    if (card.column === col) return
    const movingToDone = col === 'done' && !card.xpAwarded
    const updated: KanbanCard = { ...card, column: col, xpAwarded: movingToDone ? true : card.xpAwarded }
    dispatch({ type: 'UPDATE_KANBAN', payload: updated })
    if (movingToDone) {
      if (card.linkedGoalId) {
        const goal = state.goals.find(g => g.id === card.linkedGoalId)
        if (goal) { awardGoalXP(card.linkedGoalId, DONE_XP, '✅', `Completed: ${card.name}`, x, y); return }
      }
      awardHabitXP('kanban', DONE_XP, `Done: ${card.name}`, x, y)
    }
  }

  // ── Desktop drag handlers ────────────────────────────────────
  function handleDragStart(card: KanbanCard) { setDragId(card.id) }
  function handleDragOver(e: React.DragEvent, col: string) { e.preventDefault(); setDropCol(col) }
  function handleDrop(col: 'todo'|'inprogress'|'done') {
    if (!dragId) return
    const card = state.kanban.find(k => k.id === dragId)
    if (card) moveCard(card, col)
    setDragId(null); setDropCol(null)
  }

  // ── Touch drag handlers ──────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent, card: KanbanCard) {
    touchCardRef.current = card
    setTouchDragId(card.id)

    const touch = e.touches[0]
    const ghost = document.createElement('div')
    ghost.textContent = card.name
    ghost.style.cssText = [
      'position:fixed', 'z-index:9999', 'pointer-events:none',
      `left:${touch.clientX - 80}px`, `top:${touch.clientY - 20}px`,
      'width:160px', 'padding:8px 12px',
      'background:var(--surface2)', 'border:1px solid var(--gold)',
      'border-radius:8px', 'color:var(--text)', 'font-size:12px',
      'opacity:0.9', 'box-shadow:0 8px 24px rgba(0,0,0,0.5)',
      'white-space:nowrap', 'overflow:hidden', 'text-overflow:ellipsis',
    ].join(';')
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 80}px`
      ghostRef.current.style.top  = `${touch.clientY - 20}px`
    }
    // Find which column the finger is over
    const els = document.elementsFromPoint(touch.clientX, touch.clientY)
    const colEl = els.find(el => (el as HTMLElement).dataset?.col)
    touchOverCol.current = (colEl as HTMLElement)?.dataset?.col ?? null

    // Visual highlight
    document.querySelectorAll('[data-col]').forEach(el => {
      (el as HTMLElement).style.outline = (el as HTMLElement).dataset.col === touchOverCol.current
        ? '2px solid var(--gold)' : 'none'
    })
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null }
    document.querySelectorAll('[data-col]').forEach(el => { (el as HTMLElement).style.outline = 'none' })

    const card = touchCardRef.current
    const col  = touchOverCol.current as 'todo'|'inprogress'|'done'|null
    if (card && col && col !== card.column) {
      const touch = e.changedTouches[0]
      moveCard(card, col, touch.clientX, touch.clientY)
    }
    touchCardRef.current = null
    touchOverCol.current = null
    setTouchDragId(null)
  }

  // ── add card ─────────────────────────────────────────────────
  function handleAddCard(col: 'todo'|'inprogress'|'done') {
    if (!newCardName.trim()) return
    const card: KanbanCard = {
      id: generateId(),
      name: newCardName.trim(),
      column: col,
      priority: newCardPriority,
      linkedGoalId: newCardGoal || undefined,
      createdAt: new Date().toISOString(),
      xpAwarded: col === 'done',
    }
    dispatch({ type: 'ADD_KANBAN', payload: card })
    setNewCardName(''); setAddingTo(null); setNewCardGoal('')
  }

  // ── render ────────────────────────────────────────────────────
  return (
    <div
      style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as never, paddingBottom: 8 }}
      onTouchMove={touchDragId ? handleTouchMove : undefined}
      onTouchEnd={touchDragId ? handleTouchEnd : undefined}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))',
        gap: 12,
      }}>
      {COLUMNS.map(col => {
        const cards  = state.kanban.filter(k => k.column === col.id)
        const isOver = dropCol === col.id

        return (
          <div
            key={col.id}
            data-col={col.id}
            style={{
              padding: '16px 14px',
              borderTop: `3px solid ${col.color}`,
              background: isOver ? 'var(--surface2)' : 'var(--surface)',
              border: `1px solid var(--border)`,
              borderRadius: 12,
              transition: 'background 150ms',
              display: 'flex', flexDirection: 'column', gap: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch' as never,
              overscrollBehavior: 'contain',
            }}
            onDragOver={e => handleDragOver(e, col.id)}
            onDrop={() => handleDrop(col.id)}
            onDragLeave={() => setDropCol(null)}
          >
            {/* Column header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: col.color, fontSize: 14 }}>{col.icon}</span>
                <span style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: col.color, fontFamily: 'var(--font-bebas)' }}>
                  {col.label}
                </span>
              </div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 99, padding: '1px 8px', fontSize: 10, color: 'var(--text3)' }}>
                {cards.length}
              </div>
            </div>

            {/* Drop hint */}
            {isOver && dragId && (
              <div style={{ height: 48, marginBottom: 6, border: '2px dashed var(--gold)', borderRadius: 8, background: 'rgba(201,168,76,0.06)', transition: 'all 150ms' }} />
            )}

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              {cards.map(card => {
                const linkedGoal  = card.linkedGoalId ? state.goals.find(g => g.id === card.linkedGoalId) : null
                const isDragging  = dragId === card.id || touchDragId === card.id
                const isDone      = card.column === 'done'

                return (
                  <div
                    key={card.id}
                    draggable
                    onDragStart={() => handleDragStart(card)}
                    onDragEnd={() => { setDragId(null); setDropCol(null) }}
                    onTouchStart={e => handleTouchStart(e, card)}
                    style={{
                      background: isDone ? 'rgba(39,174,96,0.07)' : 'var(--surface2)',
                      border: `1px solid ${isDragging ? 'var(--gold)' : 'var(--border)'}`,
                      borderLeft: `3px solid ${PRIORITY_COLOR[card.priority] ?? 'var(--border)'}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                      cursor: 'grab',
                      opacity: isDragging ? 0.35 : 1,
                      transition: 'opacity 150ms, border-color 150ms, box-shadow 150ms',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                    }}
                    onMouseEnter={e => { if (!isDragging) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                  >
                    {/* Card name */}
                    <div style={{
                      fontSize: 13, fontWeight: 500, color: isDone ? 'var(--text2)' : 'var(--text)',
                      textDecoration: isDone ? 'line-through' : 'none',
                      lineHeight: 1.4, marginBottom: 8,
                    }}>
                      {isDone && <span style={{ color: 'var(--green)', marginRight: 4 }}>✓</span>}
                      {card.name}
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* Priority badge */}
                        <span style={{
                          fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                          color: PRIORITY_COLOR[card.priority],
                          border: `1px solid ${PRIORITY_COLOR[card.priority]}`,
                          borderRadius: 4, padding: '1px 5px',
                        }}>
                          {card.priority}
                        </span>

                        {linkedGoal && (
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                            {linkedGoal.emoji}
                          </span>
                        )}

                        {card.xpAwarded && (
                          <span style={{ fontSize: 9, color: 'var(--green)', letterSpacing: 0.5 }}>+{DONE_XP}xp</span>
                        )}
                      </div>

                      {/* Move buttons */}
                      <div style={{ display: 'flex', gap: 3 }}>
                        {(['todo','inprogress','done'] as const).filter(c => c !== card.column).map(c => (
                          <button
                            key={c}
                            onClick={e => { e.stopPropagation(); moveCard(card, c, e.clientX, e.clientY) }}
                            title={c === 'done' ? 'Mark done (+50 XP)' : c === 'inprogress' ? 'Move to In Progress' : 'Move to To Do'}
                            style={{
                              background: c === 'done' ? 'rgba(39,174,96,0.15)' : 'none',
                              border: `1px solid ${c === 'done' ? 'var(--green)' : 'var(--border)'}`,
                              borderRadius: 4,
                              color: c === 'done' ? 'var(--green)' : 'var(--text3)',
                              padding: '2px 7px', fontSize: 11, cursor: 'pointer',
                              minHeight: 24, fontFamily: 'var(--font-dm)',
                              transition: 'all 120ms',
                            }}
                          >
                            {c === 'done' ? '✓' : c === 'inprogress' ? '▶' : '←'}
                          </button>
                        ))}
                        <button
                          onClick={() => dispatch({ type: 'DELETE_KANBAN', payload: card.id })}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text3)',
                            cursor: 'pointer', fontSize: 12, padding: '2px 4px', minHeight: 24,
                          }}
                          title="Delete"
                        >✕</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Add card button / form */}
            {addingTo === col.id ? (
              <div style={{ marginTop: 10 }}>
                <input
                  type="text"
                  value={newCardName}
                  onChange={e => setNewCardName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCard(col.id); if (e.key === 'Escape') setAddingTo(null) }}
                  placeholder="Card name..."
                  autoFocus
                  style={{ marginBottom: 6 }}
                />
                <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                  {(['high','medium','low'] as const).map(p => (
                    <button key={p} onClick={() => setNewCardPriority(p)} style={{
                      padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                      fontFamily: 'var(--font-dm)', minHeight: 32, background: 'none',
                      border: `1px solid ${newCardPriority === p ? PRIORITY_COLOR[p] : 'var(--border)'}`,
                      color: newCardPriority === p ? PRIORITY_COLOR[p] : 'var(--text3)',
                    }}>{p}</button>
                  ))}
                  <select value={newCardGoal} onChange={e => setNewCardGoal(e.target.value)}
                    style={{ flex: 1, padding: '4px 8px', fontSize: 12, minWidth: 80 }}>
                    <option value="">No goal</option>
                    {state.goals.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleAddCard(col.id)} style={{
                    flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)',
                    borderRadius: 6, color: 'var(--text)', padding: '8px', fontSize: 12,
                    cursor: 'pointer', fontFamily: 'var(--font-dm)', minHeight: 40,
                  }}>Add</button>
                  <button onClick={() => setAddingTo(null)} style={{
                    background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                    color: 'var(--text3)', padding: '8px 12px', fontSize: 12, cursor: 'pointer', minHeight: 40,
                  }}>✕</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTo(col.id)}
                style={{
                  marginTop: 10, width: '100%', background: 'transparent',
                  border: '1px dashed var(--border2)', borderRadius: 6,
                  color: 'var(--text3)', padding: '10px', fontSize: 11, letterSpacing: 1,
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms',
                  fontFamily: 'var(--font-dm)', minHeight: 40,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--silver2)'; e.currentTarget.style.color = 'var(--silver)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border2)'; e.currentTarget.style.color = 'var(--text3)' }}
              >
                + Add Card
              </button>
            )}
          </div>
        )
      })}
      </div>
    </div>
  )
}
