'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import Header from '@/components/Header'
import TodayBar from '@/components/TodayBar'
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

export type Tab = 'vision' | 'goals' | 'habits' | 'board' | 'journal'

function SectionHeading({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 4,
      color: 'var(--text3)', textTransform: 'uppercase',
      marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {children}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function ResetButton() {
  const { dispatch } = useApp()
  const [confirm, setConfirm] = useState(false)

  function handleReset() {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return }
    dispatch({ type: 'RESET_XP' })
    setConfirm(false)
  }

  return (
    <div style={{ padding: '12px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
      <button
        onClick={handleReset}
        style={{
          background: confirm ? 'rgba(220,53,69,0.15)' : 'transparent',
          border: `1px solid ${confirm ? 'var(--red)' : 'var(--border2)'}`,
          borderRadius: 8,
          color: confirm ? 'var(--red)' : 'var(--text3)',
          padding: '8px 18px',
          fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
          cursor: 'pointer', fontFamily: 'var(--font-dm)',
          transition: 'all 200ms',
          display: 'flex', alignItems: 'center', gap: 7,
        }}
      >
        <span style={{ fontSize: 14 }}>↺</span>
        {confirm ? 'Click again to confirm' : 'Reset XP & Checkboxes'}
      </button>
    </div>
  )
}

export default function Page() {
  const [feedOpen, setFeedOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{ minHeight: '100dvh' }}>
      <FloatingXPLayer />
      <LevelUpModal />

      <Header onFeedOpen={() => setFeedOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />

      <main style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'max(env(safe-area-inset-bottom), 40px)' }}>
        <ResetButton />
        <ProfileCard />
        <MotivationalQuote />

        {/* Vision Board */}
        <section style={{ marginTop: 40, padding: '0 20px' }}>
          <SectionHeading>Vision Board</SectionHeading>
          <VisionBoard />
        </section>

        <div style={{ padding: '0 20px' }}>
          <TodayBar />
        </div>

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
        </div>

        {/* Goals */}
        <section style={{ marginTop: 40, padding: '0 20px' }}>
          <SectionHeading>Goals</SectionHeading>
          <GoalsGrid />
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
