'use client'
import { Tab } from '@/app/page'

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: 'vision', icon: '🏆', label: 'Vision' },
  { id: 'goals', icon: '🎯', label: 'Goals' },
  { id: 'habits', icon: '⚡', label: 'Habits' },
  { id: 'board', icon: '📋', label: 'Board' },
  { id: 'journal', icon: '📓', label: 'Journal' },
]

export default function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab
  onTabChange: (t: Tab) => void
}) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: 'rgba(10,10,8,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              paddingTop: 10,
              paddingBottom: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--gold)' : 'var(--text3)',
              position: 'relative',
              transition: 'color 200ms',
              minHeight: 56,
              fontFamily: 'var(--font-dm)',
            }}
          >
            {active && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 2,
                  background: 'var(--gold)',
                  boxShadow: '0 0 8px var(--glow-gold)',
                  borderRadius: '0 0 2px 2px',
                }}
              />
            )}
            <span style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
