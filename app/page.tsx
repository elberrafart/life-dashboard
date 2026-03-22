'use client'
import { useState } from 'react'
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

export default function Page() {
  const [feedOpen, setFeedOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh' }}>
      <FloatingXPLayer />
      <LevelUpModal />

      <Header onFeedOpen={() => setFeedOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />

      <main style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 'max(env(safe-area-inset-bottom), 40px)' }}>
        <MotivationalQuote />

        <div style={{ padding: '0 20px' }}>
          <TodayBar />
        </div>

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

        {/* Vision Board */}
        <section style={{ marginTop: 40, padding: '0 20px' }}>
          <SectionHeading>Vision Board</SectionHeading>
          <VisionBoard />
        </section>
      </main>

      {/* XP feed drawer */}
      {feedOpen && <XPFeed onClose={() => setFeedOpen(false)} />}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </div>
  )
}
