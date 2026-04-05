'use client'
import { useState, useRef } from 'react'
import { useApp } from '@/lib/context'
import { exportState, importState, DEFAULT_STATE } from '@/lib/store'
import { sendSelfPasswordReset } from '@/app/actions/auth'
import { ACCENT_PRESETS, setAccentPreference, setCompactPreference, getAccentPreference, getCompactPreference } from '@/lib/theme'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: enabled ? 'var(--gold)' : 'var(--surface3)',
        position: 'relative', transition: 'background 200ms', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: enabled ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: enabled ? 'var(--bg)' : 'var(--border2)',
        transition: 'left 200ms',
      }} />
    </button>
  )
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--font-dm)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2, letterSpacing: 0.2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
      <div style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', fontFamily: 'var(--font-dm)', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [resetText, setResetText] = useState('')
  const [xpConfirm, setXpConfirm] = useState(false)
  const [pwStatus, setPwStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [pwMsg, setPwMsg] = useState('')
  const [accent, setAccent] = useState(getAccentPreference)
  const [compact, setCompact] = useState(getCompactPreference)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await importState(file)
      dispatch({ type: 'SET_STATE', payload: imported })
      onClose()
    } catch {
      alert('Failed to import file. Make sure it is a valid Life Dashboard JSON.')
    }
  }

  function handleReset() {
    if (resetText !== 'RESET') { alert('Type RESET to confirm'); return }
    dispatch({ type: 'SET_STATE', payload: DEFAULT_STATE })
    onClose()
  }

  function handleXpReset() {
    if (!xpConfirm) { setXpConfirm(true); setTimeout(() => setXpConfirm(false), 3000); return }
    dispatch({ type: 'RESET_XP' })
    setXpConfirm(false)
  }

  async function handlePasswordReset() {
    setPwStatus('sending')
    const result = await sendSelfPasswordReset()
    if (result.error) { setPwStatus('error'); setPwMsg(result.error) }
    else { setPwStatus('sent'); setPwMsg(result.success ?? 'Check your email') }
  }

  function handleAccent(key: string) {
    setAccent(key)
    setAccentPreference(key)
  }

  function handleCompact(enabled: boolean) {
    setCompact(enabled)
    setCompactPreference(enabled)
  }

  function handleLeaderboard(hide: boolean) {
    dispatch({ type: 'SET_HIDE_FROM_LEADERBOARD', payload: hide })
  }

  const btnBase: React.CSSProperties = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
    borderRadius: 8, color: 'var(--silver)', padding: '10px', fontSize: 12,
    letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
    transition: 'all 150ms', fontFamily: 'var(--font-dm)',
  }

  return (
    <>
      <style>{`
        .settings-panel {
          position: fixed;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          z-index: 500;
          width: 90%; max-width: 480px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 28px 28px 24px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7);
          max-height: 90dvh;
          overflow-y: auto;
        }
        @media (max-width: 640px) {
          .settings-panel {
            top: auto !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: none !important;
            border-radius: 16px 16px 0 0 !important;
            max-height: 85dvh;
            padding-bottom: max(env(safe-area-inset-bottom), 28px) !important;
          }
        }
      `}</style>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div className="settings-panel fade-in">
        {/* Drag handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border2)', borderRadius: 99, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 3, color: 'var(--text)' }}>SETTINGS</div>
          <button
            onClick={onClose}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', color: 'var(--text3)', fontSize: 13 }}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Account ── */}
          <Divider label="Account" />

          <div>
            <label style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Player Name</label>
            <input
              type="text"
              defaultValue={state.playerName}
              onBlur={e => dispatch({ type: 'SET_PLAYER_NAME', payload: e.target.value })}
            />
          </div>

          <SettingRow label="Password" sub="Send a reset link to your email">
            <button
              onClick={handlePasswordReset}
              disabled={pwStatus === 'sending' || pwStatus === 'sent'}
              style={{
                ...btnBase, width: 'auto', flexShrink: 0,
                color: pwStatus === 'sent' ? 'var(--green)' : pwStatus === 'error' ? 'var(--red)' : 'var(--silver)',
                border: `1px solid ${pwStatus === 'sent' ? 'var(--green)' : pwStatus === 'error' ? 'var(--red)' : 'var(--border2)'}`,
                whiteSpace: 'nowrap',
              }}
            >
              {pwStatus === 'sending' ? '…' : pwStatus === 'sent' ? '✓ Sent' : pwStatus === 'error' ? 'Failed' : 'Send Link'}
            </button>
          </SettingRow>
          {pwMsg && (
            <div style={{ fontSize: 11, color: pwStatus === 'error' ? 'var(--red)' : 'var(--green)', marginTop: -8, letterSpacing: 0.2 }}>
              {pwMsg}
            </div>
          )}

          {/* ── Appearance ── */}
          <Divider label="Appearance" />

          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Accent Color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ACCENT_PRESETS.map(p => (
                <button
                  key={p.key}
                  onClick={() => handleAccent(p.key)}
                  title={p.label}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: p.gold,
                    outline: accent === p.key ? `2px solid ${p.gold}` : '2px solid transparent',
                    outlineOffset: 3,
                    boxShadow: accent === p.key ? `0 0 10px ${p.glow}` : 'none',
                    transition: 'all 150ms',
                  }}
                />
              ))}
            </div>
          </div>

          <SettingRow label="Compact Mode" sub="Tighter spacing and smaller cards">
            <Toggle enabled={compact} onChange={handleCompact} />
          </SettingRow>

          {/* ── Privacy ── */}
          <Divider label="Privacy" />

          <SettingRow label="Hide from Leaderboard" sub="Your profile won't appear in community rankings">
            <Toggle
              enabled={state.hideFromLeaderboard ?? false}
              onChange={handleLeaderboard}
            />
          </SettingRow>

          {/* ── Data ── */}
          <Divider label="Data" />

          <button onClick={() => exportState(state)} style={{ ...btnBase, marginBottom: 0 }}>📤 Export JSON</button>
          <button onClick={() => fileRef.current?.click()} style={btnBase}>📥 Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

          {/* ── Danger Zone ── */}
          <Divider label="Danger Zone" />

          <button
            onClick={handleXpReset}
            style={{
              ...btnBase,
              background: xpConfirm ? 'rgba(220,53,69,0.1)' : 'var(--surface2)',
              border: `1px solid ${xpConfirm ? 'var(--red)' : 'var(--border2)'}`,
              color: xpConfirm ? 'var(--red)' : 'var(--text3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <span>↺</span>
            {xpConfirm ? 'Tap again to confirm' : 'Reset XP & Checkboxes'}
          </button>

          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            Type <strong style={{ color: 'var(--text2)' }}>RESET</strong> to permanently delete all data
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="text" value={resetText} onChange={e => setResetText(e.target.value)} placeholder="Type RESET..." />
            <button
              onClick={handleReset}
              style={{
                background: 'transparent', border: '1px solid var(--red)', borderRadius: 8,
                color: 'var(--red)', padding: '0 16px', fontSize: 11, cursor: 'pointer',
                whiteSpace: 'nowrap', fontFamily: 'var(--font-dm)', letterSpacing: 1,
              }}
            >Reset All</button>
          </div>
        </div>
      </div>
    </>
  )
}
