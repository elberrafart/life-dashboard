'use client'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import XPFeed from './XPFeed'
import SettingsPanel from './SettingsPanel'
import LevelUpModal from './LevelUpModal'
import FloatingXPLayer from './FloatingXPLayer'

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const [feedOpen, setFeedOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const hideChrome = pathname.startsWith('/admin')

  if (hideChrome) {
    return <>{children}</>
  }

  return (
    <>
      <style>{`
        .app-shell { min-height: 100dvh; }
        .app-main-offset { }
        @media (min-width: 769px) {
          .app-main-offset { padding-left: 200px; }
        }
      `}</style>

      <FloatingXPLayer />
      <LevelUpModal />

      <Header onFeedOpen={() => setFeedOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} />

      <div className="app-main-offset">{children}</div>

      {feedOpen && <XPFeed onClose={() => setFeedOpen(false)} />}
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}
    </>
  )
}
