'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/lib/context'
import Header from '@/components/Header'
import VisionBoard from '@/components/VisionBoard'
import GoalsGrid from '@/components/GoalsGrid'
import HabitsTracker from '@/components/HabitsTracker'
import KanbanBoard from '@/components/KanbanBoard'
import XPFeed from '@/components/XPFeed'
import MotivationalQuote from '@/components/MotivationalQuote'
import SettingsPanel from '@/components/SettingsPanel'
import LevelUpModal from '@/components/LevelUpModal'
import FloatingXPLayer from '@/components/FloatingXPLayer'
import DailyJournal from '@/components/DailyJournal'
import ProfileCard from '@/components/ProfileCard'
import CheckIn from '@/components/CheckIn'
import { getOnboardingStatus } from '@/app/actions/onboarding'
import { KanbanCard, Goal } from '@/lib/types'

export type Tab = 'vision' | 'goals' | 'habits' | 'board' | 'journal'

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--red)', medium: 'var(--gold)', low: 'var(--green)',
}

function KanbanArchiveSection({ cards, onRestore }: { cards: KanbanCard[]; onRestore: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  if (cards.length === 0) return null
  return (
    <div style={{ marginTop: 16 }}>
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
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
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

function GoalArchiveSection({ goals, onRestore }: { goals: Goal[]; onRestore: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  if (goals.length === 0) return null
  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer',
          fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', display: 'flex',
          alignItems: 'center', gap: 8, padding: 0, fontFamily: 'var(--font-dm)',
        }}
      >
        <span>{open ? '▾' : '▸'}</span>
        Archived Goals ({goals.length})
      </button>
      {open && (
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {goals.map(goal => (
            <div key={goal.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', border: '1px solid var(--border)',
              borderRadius: 8, background: 'var(--surface)', opacity: 0.7,
            }}>
              <span style={{ fontSize: 20 }}>{goal.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'line-through' }}>{goal.name}</div>
                {goal.category && <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>{goal.category}</div>}
              </div>
              {goal.archivedAt && (
                <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                  {new Date(goal.archivedAt).toLocaleDateString()}
                </span>
              )}
              <button
                onClick={() => onRestore(goal.id)}
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

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="section-heading" style={{
      fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 4,
      color: 'var(--text3)', textTransform: 'uppercase',
      marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

export default function Page() {
  const { state, dispatch } = useApp()
  const [feedOpen, setFeedOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    getOnboardingStatus().then(complete => {
      if (!complete) window.location.replace('/setup')
    })
  }, [])

  function restoreKanban(id: string) {
    dispatch({ type: 'RESTORE_KANBAN', payload: id })
  }

  function restoreGoal(id: string) {
    dispatch({ type: 'RESTORE_GOAL', payload: id })
  }

  return (
    <div style={{ minHeight: '100dvh' }}>
      <FloatingXPLayer />
      <LevelUpModal />

      <Header onFeedOpen={() => setFeedOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />

      <main style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'max(env(safe-area-inset-bottom), 40px)' }}>
        <style>{`
          @media (max-width: 640px) {
            .section-heading { margin-bottom: 12px !important; }
          }
        `}</style>
        <ProfileCard />
        <MotivationalQuote />

        {/* Vision Board */}
        <section style={{ marginTop: 40, padding: '0 20px' }}>
          <SectionHeading>Vision Board</SectionHeading>
          <VisionBoard />
        </section>

        {/* Daily Check-In */}
        <section style={{ marginTop: 24, padding: '0 20px' }}>
          <SectionHeading>Coach Check-In</SectionHeading>
          <CheckIn />
        </section>

        {/* Kanban — edge-to-edge scroll on mobile */}
        <section style={{ marginTop: 32, padding: '0 20px' }}>
          <SectionHeading>Kanban Board</SectionHeading>
        </section>
        <div style={{ padding: '0 20px' }}>
          <KanbanBoard />
          <KanbanArchiveSection
            cards={state.kanbanArchive ?? []}
            onRestore={restoreKanban}
          />
        </div>

        {/* Goals */}
        <section style={{ marginTop: 40, padding: '0 20px' }}>
          <SectionHeading>Goals</SectionHeading>
          <GoalsGrid />
          <GoalArchiveSection
            goals={state.goalArchive ?? []}
            onRestore={restoreGoal}
          />
        </section>

        {/* Habits + Journal */}
        <div style={{ marginTop: 40, padding: '0 20px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <section style={{ flex: '1 1 280px', minWidth: 0 }}>
            <SectionHeading>Habits</SectionHeading>
            <HabitsTracker />
          </section>
          <section style={{ flex: '1 1 280px', minWidth: 0 }}>
            <SectionHeading>Journal</SectionHeading>
            <DailyJournal />
          </section>
        </div>

      </main>

      {/* XP feed drawer */}
      {feedOpen && <XPFeed onClose={() => setFeedOpen(false)} />}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
