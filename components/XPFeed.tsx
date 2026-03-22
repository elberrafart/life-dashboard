'use client'
import { useApp } from '@/lib/context'

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function XPFeed({ onClose, embedded }: { onClose?: () => void; embedded?: boolean }) {
  const { state } = useApp()

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, letterSpacing: 3, color: 'var(--text)' }}>XP FEED</div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', color: 'var(--text3)', fontSize: 12 }}
          >✕</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {state.xpFeed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 12, letterSpacing: 1 }}>No XP earned yet.</div>
            <div style={{ fontSize: 11, marginTop: 4, color: 'var(--text3)' }}>Complete tasks and habits to see your XP feed.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {state.xpFeed.map((event, i) => (
              <div
                key={event.id}
                className={i === 0 ? 'event-flash' : ''}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{event.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.3 }}>{event.description}</div>
                  {event.goalName && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{event.goalName}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, color: 'var(--gold)', letterSpacing: 1 }}>+{event.xpAmount}</div>
                  <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 0.5 }}>{timeAgo(event.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  if (embedded) return <div>{content}</div>

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300 }} />
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 400,
          width: 320,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
        }}
        className="slide-in-right"
      >
        {content}
      </div>
    </>
  )
}
