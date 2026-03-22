'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import TodayBar from '@/components/TodayBar'
import VisionBoard from '@/components/VisionBoard'
import GoalsGrid from '@/components/GoalsGrid'
import HabitsTracker from '@/components/HabitsTracker'
import KanbanBoard from '@/components/KanbanBoard'
import XPFeed from '@/components/XPFeed'
import BottomNav from '@/components/BottomNav'
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
  const [activeTab, setActiveTab] = useState<Tab>('goals')
  const [feedOpen, setFeedOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640)
    check()
    const mq = window.matchMedia('(min-width: 640px)')
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100dvh', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      <FloatingXPLayer />
      <LevelUpModal />

      {/* Header */}
      {isDesktop ? (
        <Header onFeedOpen={() => setFeedOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(10,10,8,0.97)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 24, letterSpacing: 3, color: 'var(--text)' }}>LIFE OS</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setFeedOpen(true)} style={{ color: 'var(--text3)', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', padding: 8, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔔</button>
            <button onClick={() => setSettingsOpen(true)} style={{ color: 'var(--text3)', fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', padding: 8, minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚙</button>
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        <MotivationalQuote />
        <TodayBar />

        {isDesktop ? (
          /* ── Desktop layout ── */
          <>
            <section style={{ padding: '32px 40px 0' }}>
              <SectionHeading>Vision Board</SectionHeading>
              <VisionBoard />
            </section>
            <section style={{ padding: '32px 40px 0' }}>
              <SectionHeading>Goals</SectionHeading>
              <GoalsGrid />
            </section>
            <section style={{ padding: '32px 40px 0' }}>
              <SectionHeading>Kanban Board</SectionHeading>
              <KanbanBoard />
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '32px 40px 40px' }}>
              <section>
                <SectionHeading>Habits</SectionHeading>
                <HabitsTracker />
              </section>
              <section>
                <SectionHeading>Journal</SectionHeading>
                <DailyJournal />
              </section>
            </div>
          </>
        ) : (
          /* ── Mobile tab layout ── */
          <div className="tab-content" key={activeTab} style={{ paddingBottom: 16 }}>
            {activeTab === 'vision' && <div style={{ padding: '16px' }}><VisionBoard /></div>}
            {activeTab === 'goals'  && <div style={{ padding: '16px' }}><GoalsGrid /></div>}
            {activeTab === 'habits' && <div style={{ padding: '16px' }}><HabitsTracker /></div>}
            {activeTab === 'board'  && <div style={{ padding: '8px' }}><KanbanBoard /></div>}
            {activeTab === 'journal' && <div style={{ padding: '16px' }}><DailyJournal /></div>}
          </div>
        )}
      </main>

      {/* XP feed */}
      {feedOpen && isDesktop && <XPFeed onClose={() => setFeedOpen(false)} />}
      {feedOpen && !isDesktop && (
        <>
          <div onClick={() => setFeedOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.5)' }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 400,
            height: '75dvh', background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: '20px 20px 0 0',
          }} className="slide-up ios-scroll">
            <XPFeed onClose={() => setFeedOpen(false)} embedded />
          </div>
        </>
      )}

      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}

      {/* Mobile bottom nav */}
      {!isDesktop && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  )
}
