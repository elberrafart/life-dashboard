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

  const [dragId,     setDragId]     = useState<string | null>(null)
  const [dropCol,    setDropCol]    = useState<string | null>(null)
  const [addingTo,   setAddingTo]   = useState<string | null>(null)
  const [newName,    setNewName]    = useState('')
  const [newPri,     setNewPri]     = useState<'high'|'medium'|'low'>('medium')
  const [newGoal,    setNewGoal]    = useState('')
  const [touchDragId,setTouchDragId] = useState<string | null>(null)

  const touchCardRef = useRef<KanbanCard | null>(null)
  const ghostRef     = useRef<HTMLDivElement | null>(null)
  const touchOverCol = useRef<string | null>(null)

  // ── move card + XP ───────────────────────────────────────────
  function moveCard(card: KanbanCard, col: 'todo'|'inprogress'|'done', x?: number, y?: number) {
    if (card.column === col) return
    const movingToDone = col === 'done' && !card.xpAwarded
    dispatch({ type: 'UPDATE_KANBAN', payload: { ...card, column: col, xpAwarded: movingToDone ? true : card.xpAwarded } })
    if (movingToDone) {
      const cx = x ?? window.innerWidth / 2
      const cy = y ?? window.innerHeight / 2
      if (card.linkedGoalId && state.goals.find(g => g.id === card.linkedGoalId)) {
        awardGoalXP(card.linkedGoalId, DONE_XP, '✅', `Completed: ${card.name}`, cx, cy)
      } else {
        awardHabitXP('kanban', DONE_XP, `Done: ${card.name}`, cx, cy)
      }
    }
  }

  // ── Desktop drag ─────────────────────────────────────────────
  function handleDragStart(card: KanbanCard) { setDragId(card.id) }
  function handleDragOver(e: React.DragEvent, col: string) { e.preventDefault(); setDropCol(col) }
  function handleDrop(col: 'todo'|'inprogress'|'done', e: React.DragEvent) {
    e.preventDefault()
    const card = state.kanban.find(k => k.id === dragId)
    if (card) moveCard(card, col, e.clientX, e.clientY)
    setDragId(null); setDropCol(null)
  }

  // ── Touch drag ───────────────────────────────────────────────
  function handleTouchStart(e: React.TouchEvent, card: KanbanCard) {
    touchCardRef.current = card
    setTouchDragId(card.id)
    const t = e.touches[0]
    const ghost = document.createElement('div')
    ghost.textContent = card.name
    ghost.style.cssText = `position:fixed;z-index:9999;pointer-events:none;left:${t.clientX - 80}px;top:${t.clientY - 20}px;width:160px;padding:8px 12px;background:#181816;border:1px solid var(--gold);border-radius:8px;color:#ede9e0;font-size:12px;opacity:0.9;box-shadow:0 8px 24px rgba(0,0,0,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`
    document.body.appendChild(ghost)
    ghostRef.current = ghost
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    const t = e.touches[0]
    if (ghostRef.current) {
      ghostRef.current.style.left = `${t.clientX - 80}px`
      ghostRef.current.style.top  = `${t.clientY - 20}px`
    }
    const el = document.elementsFromPoint(t.clientX, t.clientY).find(el => (el as HTMLElement).dataset?.col)
    touchOverCol.current = el ? (el as HTMLElement).dataset.col! : null
    document.querySelectorAll('[data-col]').forEach(el => {
      (el as HTMLElement).style.outline = (el as HTMLElement).dataset.col === touchOverCol.current ? '2px solid var(--gold)' : 'none'
    })
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null }
    document.querySelectorAll('[data-col]').forEach(el => { (el as HTMLElement).style.outline = 'none' })
    const card = touchCardRef.current
    const col  = touchOverCol.current as 'todo'|'inprogress'|'done'|null
    if (card && col && col !== card.column) {
      const t = e.changedTouches[0]
      moveCard(card, col, t.clientX, t.clientY)
    }
    touchCardRef.current = null; touchOverCol.current = null; setTouchDragId(null)
  }

  // ── add card ─────────────────────────────────────────────────
  function handleAddCard(col: 'todo'|'inprogress'|'done') {
    if (!newName.trim()) return
    dispatch({ type: 'ADD_KANBAN', payload: {
      id: generateId(), name: newName.trim(), column: col,
      priority: newPri, linkedGoalId: newGoal || undefined,
      createdAt: new Date().toISOString(), xpAwarded: col === 'done',
    }})
    setNewName(''); setAddingTo(null); setNewGoal('')
  }

  return (
    <div
      style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as never, paddingBottom: 4 }}
      onTouchMove={touchDragId ? handleTouchMove : undefined}
      onTouchEnd={touchDragId ? handleTouchEnd : undefined}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(270px, 1fr))', gap: 12, minWidth: 600 }}>
        {COLUMNS.map(col => {
          const cards  = state.kanban.filter(k => k.column === col.id)
          const isOver = dropCol === col.id

          return (
            <div
              key={col.id}
              data-col={col.id}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={e => handleDrop(col.id, e)}
              onDragLeave={() => setDropCol(null)}
              style={{
                border: `1px solid ${isOver ? 'var(--gold)' : 'var(--border)'}`,
                borderTop: `3px solid ${col.color}`,
                borderRadius: 12,
                padding: '14px 12px',
                background: isOver ? 'rgba(201,168,76,0.04)' : 'var(--surface)',
                transition: 'border-color 150ms, background 150ms',
                display: 'flex', flexDirection: 'column',
                minHeight: 220,
              }}
            >
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: col.color, fontSize: 13 }}>{col.icon}</span>
                  <span style={{ fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', color: col.color, fontFamily: 'var(--font-bebas)' }}>
                    {col.label}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text3)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 99, padding: '1px 8px' }}>
                  {cards.length}
                </span>
              </div>

              {/* Drop zone hint */}
              {isOver && dragId && (
                <div style={{ height: 44, marginBottom: 8, border: '2px dashed var(--gold)', borderRadius: 8, background: 'rgba(201,168,76,0.06)' }} />
              )}

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {cards.map(card => {
                  const linked    = card.linkedGoalId ? state.goals.find(g => g.id === card.linkedGoalId) : null
                  const isDragging = dragId === card.id || touchDragId === card.id
                  const isDone    = card.column === 'done'

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card)}
                      onDragEnd={() => { setDragId(null); setDropCol(null) }}
                      onTouchStart={e => handleTouchStart(e, card)}
                      style={{
                        border: `1px solid var(--border)`,
                        borderLeft: `3px solid ${PRIORITY_COLOR[card.priority] ?? 'var(--border)'}`,
                        borderRadius: 8,
                        padding: '10px 12px',
                        background: isDone ? 'rgba(39,174,96,0.06)' : 'var(--surface2)',
                        opacity: isDragging ? 0.3 : 1,
                        cursor: 'grab',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        transition: 'opacity 150ms, box-shadow 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                    >
                      {/* Name */}
                      <div style={{
                        fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 10,
                        color: isDone ? 'var(--text2)' : 'var(--text)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}>
                        {isDone && <span style={{ color: 'var(--green)', marginRight: 4 }}>✓</span>}
                        {card.name}
                      </div>

                      {/* Footer row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                            color: PRIORITY_COLOR[card.priority],
                            border: `1px solid ${PRIORITY_COLOR[card.priority]}`,
                            borderRadius: 4, padding: '1px 5px',
                          }}>{card.priority}</span>
                          {linked && <span style={{ fontSize: 11 }}>{linked.emoji}</span>}
                          {card.xpAwarded && <span style={{ fontSize: 9, color: 'var(--green)' }}>+{DONE_XP}xp</span>}
                        </div>

                        {/* Move buttons — bigger on mobile */}
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          {(['todo','inprogress','done'] as const).filter(c => c !== card.column).map(c => (
                            <button
                              key={c}
                              onClick={e => { e.stopPropagation(); moveCard(card, c, e.clientX, e.clientY) }}
                              title={c === 'done' ? `Mark done (+${DONE_XP} XP)` : c === 'inprogress' ? 'Move to In Progress' : 'Move back'}
                              style={{
                                minWidth: 32, minHeight: 32,
                                background: c === 'done' ? 'rgba(39,174,96,0.15)' : 'none',
                                border: `1px solid ${c === 'done' ? 'var(--green)' : 'var(--border)'}`,
                                borderRadius: 6,
                                color: c === 'done' ? 'var(--green)' : 'var(--text3)',
                                fontSize: 12, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 120ms',
                              }}
                            >
                              {c === 'done' ? '✓' : c === 'inprogress' ? '▶' : '←'}
                            </button>
                          ))}
                          <button
                            onClick={() => dispatch({ type: 'DELETE_KANBAN', payload: card.id })}
                            style={{
                              minWidth: 32, minHeight: 32,
                              background: 'none', border: 'none',
                              color: 'var(--text3)', cursor: 'pointer', fontSize: 13,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >✕</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Add card */}
              {addingTo === col.id ? (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text" value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCard(col.id); if (e.key === 'Escape') setAddingTo(null) }}
                    placeholder="Card name…" autoFocus style={{ marginBottom: 6 }}
                  />
                  <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                    {(['high','medium','low'] as const).map(p => (
                      <button key={p} onClick={() => setNewPri(p)} style={{
                        padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer',
                        fontFamily: 'var(--font-dm)', minHeight: 32, background: 'none',
                        border: `1px solid ${newPri === p ? PRIORITY_COLOR[p] : 'var(--border)'}`,
                        color: newPri === p ? PRIORITY_COLOR[p] : 'var(--text3)',
                      }}>{p}</button>
                    ))}
                    <select value={newGoal} onChange={e => setNewGoal(e.target.value)}
                      style={{ flex: 1, padding: '4px 8px', fontSize: 12, minWidth: 80 }}>
                      <option value="">No goal</option>
                      {state.goals.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleAddCard(col.id)} style={{
                      flex: 1, background: 'var(--surface)', border: '1px solid var(--border2)',
                      borderRadius: 6, color: 'var(--text)', padding: '10px', fontSize: 12,
                      cursor: 'pointer', fontFamily: 'var(--font-dm)', minHeight: 44,
                    }}>Add</button>
                    <button onClick={() => setAddingTo(null)} style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                      color: 'var(--text3)', padding: '10px 14px', fontSize: 12,
                      cursor: 'pointer', minHeight: 44,
                    }}>✕</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(col.id)} style={{
                  marginTop: 10, width: '100%', minHeight: 44,
                  background: 'transparent', border: '1px dashed var(--border2)',
                  borderRadius: 6, color: 'var(--text3)', padding: '10px',
                  fontSize: 11, letterSpacing: 1, textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'var(--font-dm)',
                }}>+ Add Card</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
