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

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px 60px' }}>
        <MotivationalQuote />
        <TodayBar />

        {/* Kanban — first section, always visible */}
        <section style={{ marginTop: 32 }}>
          <SectionHeading>Kanban Board</SectionHeading>
          <KanbanBoard />
        </section>

        {/* Goals */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading>Goals</SectionHeading>
          <GoalsGrid />
        </section>

        {/* Habits + Journal side by side on wide screens, stacked on mobile */}
        <div style={{ marginTop: 40, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <section style={{ flex: '1 1 300px', minWidth: 0 }}>
            <SectionHeading>Habits</SectionHeading>
            <HabitsTracker />
          </section>
          <section style={{ flex: '1 1 300px', minWidth: 0 }}>
            <SectionHeading>Journal</SectionHeading>
            <DailyJournal />
          </section>
        </div>

        {/* Vision Board */}
        <section style={{ marginTop: 40 }}>
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
