'use client'
import { useState } from 'react'
import Phase1 from '@/components/identity/Phase1'
import Phase2 from '@/components/identity/Phase2'
import Phase3 from '@/components/identity/Phase3'
import Phase4 from '@/components/identity/Phase4'

type Tab = 1 | 2 | 3 | 4

export default function IdentityPage() {
  const [tab, setTab] = useState<Tab>(1)

  return (
    <div className="id-page" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        /* Worksheet contrast — brighter placeholders + input text on surface2 bg */
        .id-page input::placeholder,
        .id-page textarea::placeholder {
          color: var(--silver2) !important;
          opacity: 1;
        }
        .id-page input, .id-page textarea { color: var(--text) !important; }
        .id-page input:focus, .id-page textarea:focus {
          border-color: var(--gold) !important;
          background: var(--surface3) !important;
        }
        .id-tab {
          flex: 1; min-width: 0;
          background: none; border: none; cursor: pointer;
          padding: 14px 12px;
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          font-family: var(--font-dm); font-weight: 700;
          color: var(--text3);
          border-bottom: 2px solid transparent;
          transition: color 150ms, border-color 150ms;
        }
        .id-tab:hover { color: var(--silver); }
        .id-tab.active {
          color: var(--gold);
          border-bottom-color: var(--gold);
        }
        .id-tab-phase { display: block; font-size: 9px; color: inherit; opacity: 0.6; margin-bottom: 3px; }
        .id-tab-label { display: block; font-family: var(--font-bebas); font-size: 14px; letter-spacing: 2px; }
      `}</style>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 32 }}>
        {([
          { n: 1 as Tab, weeks: '0–4',   label: 'Blueprint'   },
          { n: 2 as Tab, weeks: '4–8',   label: 'Integration' },
          { n: 3 as Tab, weeks: '8–16',  label: 'Anchors'     },
          { n: 4 as Tab, weeks: '16+',   label: 'Sovereignty' },
        ]).map(t => (
          <button
            key={t.n}
            className={`id-tab ${tab === t.n ? 'active' : ''}`}
            onClick={() => setTab(t.n)}
          >
            <span className="id-tab-phase">Phase {t.n} · Wks {t.weeks}</span>
            <span className="id-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 1 && <Phase1 />}
      {tab === 2 && <Phase2 />}
      {tab === 3 && <Phase3 />}
      {tab === 4 && <Phase4 />}
    </div>
  )
}
