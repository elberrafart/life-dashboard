'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import KanbanBoard from '@/components/KanbanBoard'
import { KanbanCard } from '@/lib/types'

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--red)', medium: 'var(--gold)', low: 'var(--green)',
}

function KanbanArchiveSection({ cards, onRestore }: { cards: KanbanCard[]; onRestore: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  if (cards.length === 0) return null
  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
          fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', display: 'flex',
          alignItems: 'center', gap: 8, padding: 0, fontFamily: 'var(--font-dm)',
        }}
      >
        <span>{open ? '▾' : '▸'}</span>
        Archive ({cards.length})
      </button>
      {open && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {cards.map(card => (
            <div key={card.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 12px', border: '1px solid var(--border)',
              borderLeft: `3px solid ${PRIORITY_COLOR[card.priority] ?? 'var(--border)'}`,
              borderRadius: 8, background: 'var(--surface)', opacity: 0.7,
            }}>
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text2)', textDecoration: 'line-through' }}>{card.name}</span>
              {card.completedAt && (
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                  {new Date(card.completedAt).toLocaleDateString()}
                </span>
              )}
              <button
                onClick={() => onRestore(card.id)}
                style={{
                  background: 'none', border: '1px solid var(--border2)', borderRadius: 6,
                  color: 'var(--text3)', fontSize: 10, padding: '3px 8px',
                  cursor: 'pointer', letterSpacing: 1, fontFamily: 'var(--font-dm)',
                }}
              >Restore</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function KanbanPage() {
  const { state, dispatch } = useApp()

  function restoreKanban(id: string) {
    dispatch({ type: 'RESTORE_KANBAN', payload: id })
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <KanbanBoard />
      <KanbanArchiveSection
        cards={state.kanbanArchive ?? []}
        onRestore={restoreKanban}
      />
    </div>
  )
}
