'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getModulesFor } from '@/app/actions/modules'
import { fetchCached } from '@/lib/dataCache'
import type { AppModule } from '@/lib/modules'
import ModuleBlocks from './ModuleBlocks'

/** Published modules with the "dashboard" placement, rendered as sections. */
export default function DashboardModules() {
  const [modules, setModules] = useState<AppModule[]>([])

  useEffect(() => {
    let cancelled = false
    fetchCached('dashboardModules', () => getModulesFor('dashboard'), 60_000)
      .then(m => { if (!cancelled) setModules(m) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  if (modules.length === 0) return null

  return (
    <>
      {modules.map(mod => (
        <section key={mod.id} style={{ marginTop: 32, padding: '0 20px' }}>
          <div style={{
            fontFamily: 'var(--font-bebas)', fontSize: 13, letterSpacing: 4,
            color: 'var(--text3)', textTransform: 'uppercase',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 14 }}>{mod.icon}</span> {mod.title}
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            {mod.placements.includes('sidebar') && (
              <Link href={`/m/${mod.slug}`} style={{ fontFamily: 'var(--font-dm)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text3)', textDecoration: 'none' }}>
                Open →
              </Link>
            )}
          </div>
          <div className="card" style={{ padding: '20px 22px' }}>
            <ModuleBlocks blocks={mod.blocks} />
          </div>
        </section>
      ))}
    </>
  )
}
