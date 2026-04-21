'use client'
import { useState } from 'react'
import Link from 'next/link'
import Phase1 from '@/components/identity/Phase1'
import PhaseStub from '@/components/identity/PhaseStub'

type Tab = 1 | 2 | 3 | 4

export default function IdentityPage() {
  const [tab, setTab] = useState<Tab>(1)

  return (
    <div className="id-page" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .id-home-btn:hover { border-color: var(--gold) !important; color: var(--gold) !important; }

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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 36, letterSpacing: 5, color: 'var(--text)', lineHeight: 1 }}>
            IDENTITY
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>
            Your workbook · auto-saves as you type
          </div>
        </div>
        <Link
          href="/"
          className="id-home-btn"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 16px', textDecoration: 'none',
            color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5,
            textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600,
            transition: 'all 150ms',
          }}
        >
          ← Home
        </Link>
      </div>

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
      {tab === 2 && (
        <PhaseStub
          phase={2}
          weeks="4–8"
          title="Identity Integration"
          anchor="The Man Who Commits"
          anchorSub="You are no longer testing the waters. You are all in."
        />
      )}
      {tab === 3 && (
        <PhaseStub
          phase={3}
          weeks="8–16"
          title="Identity Anchors"
          anchor="The Man Who Executes"
          anchorSub="Phase 2 proved you can commit. Phase 3 is where you build unstoppable momentum and visible transformation."
        />
      )}
      {tab === 4 && (
        <PhaseStub
          phase={4}
          weeks="16+"
          title="Long-Term Sovereignty"
          anchor="The Man Who Leads"
          anchorSub="You're no longer 'becoming.' You are. This is where your identity becomes permanent and you step into leadership."
        />
      )}
    </div>
  )
}
