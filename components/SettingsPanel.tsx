'use client'
import { useState, useRef } from 'react'
import { useApp } from '@/lib/context'
import { exportState, importState, DEFAULT_STATE } from '@/lib/store'

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp()
  const [resetText, setResetText] = useState('')
  const [xpConfirm, setXpConfirm] = useState(false)
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
        {/* Drag handle — mobile only visual cue */}
        <div style={{ width: 36, height: 4, background: 'var(--border2)', borderRadius: 99, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 3, color: 'var(--text)' }}>SETTINGS</div>
          <button
            onClick={onClose}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', color: 'var(--text3)', fontSize: 13 }}
          >✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Player name */}
          <div>
            <label style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', display: 'block', marginBottom: 6 }}>Player Name</label>
            <input
              type="text"
              defaultValue={state.playerName}
              onBlur={e => dispatch({ type: 'SET_PLAYER_NAME', payload: e.target.value })}
            />
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Export */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Data Management</div>
            <button
              onClick={() => exportState(state)}
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--silver)', padding: '10px', fontSize: 12,
                letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-dm)',
                marginBottom: 8,
              }}
            >📤 Export JSON</button>

            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', background: 'var(--surface2)', border: '1px solid var(--border2)',
                borderRadius: 8, color: 'var(--silver)', padding: '10px', fontSize: 12,
                letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', transition: 'all 150ms', fontFamily: 'var(--font-dm)',
              }}
            >📥 Import JSON</button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </div>

          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Danger Zone */}
          <div>
            <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12 }}>⚠ Danger Zone</div>

            {/* XP Reset */}
            <button
              onClick={handleXpReset}
              style={{
                width: '100%', marginBottom: 12,
                background: xpConfirm ? 'rgba(220,53,69,0.1)' : 'var(--surface2)',
                border: `1px solid ${xpConfirm ? 'var(--red)' : 'var(--border2)'}`,
                borderRadius: 8, color: xpConfirm ? 'var(--red)' : 'var(--text3)',
                padding: '10px', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 200ms', fontFamily: 'var(--font-dm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <span>↺</span>
              {xpConfirm ? 'Tap again to confirm' : 'Reset XP & Checkboxes'}
            </button>

            {/* Full data reset */}
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
              Type <strong style={{ color: 'var(--text2)' }}>RESET</strong> to permanently delete all data
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={resetText}
                onChange={e => setResetText(e.target.value)}
                placeholder="Type RESET..."
              />
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
      </div>
    </>
  )
}
