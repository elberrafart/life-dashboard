'use client'
import { useApp } from '@/lib/context'
import { EMPTY_IDENTITY_WORKBOOK } from '@/lib/types'
import { useMemo } from 'react'

// ── Data hooks ──────────────────────────────────────────────────────

export function useWorkbook() {
  const { state, dispatch } = useApp()
  const wb = state.identityWorkbook ?? EMPTY_IDENTITY_WORKBOOK

  return useMemo(() => ({
    getField:  (key: string) => wb.fields[key] ?? '',
    setField:  (key: string, value: string) => dispatch({ type: 'SET_IDENTITY_FIELD', payload: { key, value } }),
    getCheck:  (key: string) => !!wb.checks[key],
    toggleCheck: (key: string) => dispatch({ type: 'TOGGLE_IDENTITY_CHECK', payload: key }),
    getList:   (key: string) => wb.lists[key] ?? [],
    setList:   (key: string, value: string[]) => dispatch({ type: 'SET_IDENTITY_LIST', payload: { key, value } }),
  }), [wb, dispatch])
}

// ── Layout ──────────────────────────────────────────────────────────

export function PhaseHeader({ eyebrow, title, anchor, anchorSub }: {
  eyebrow: string; title: string; anchor?: string; anchorSub?: string
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6 }}>
        {eyebrow}
      </div>
      <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 40, letterSpacing: 4, color: 'var(--text)', lineHeight: 1, marginBottom: 10 }}>
        {title}
      </div>
      {anchor && (
        <div style={{ padding: '14px 18px', background: 'rgba(245,197,24,0.06)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 10, marginTop: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--gold)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 4 }}>
            Identity Anchor
          </div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 2, color: 'var(--text)' }}>
            &ldquo;{anchor}&rdquo;
          </div>
          {anchorSub && (
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6, lineHeight: 1.5 }}>
              {anchorSub}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function Section({ title, emoji, children }: { title: string; emoji?: string; children: React.ReactNode }) {
  return (
    <section className="card" style={{ padding: '24px 26px', marginBottom: 20 }}>
      <div style={{
        fontFamily: 'var(--font-bebas)', fontSize: 20, letterSpacing: 3,
        color: 'var(--text)', textTransform: 'uppercase',
        marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {emoji && <span style={{ fontSize: 18 }}>{emoji}</span>}
        <span>{title}</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 6 }} />
      </div>
      {children}
    </section>
  )
}

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, color: 'var(--silver)', lineHeight: 1.7, marginBottom: 14, maxWidth: 720 }}>
      {children}
    </div>
  )
}

export function Callout({ kind = 'info', children }: { kind?: 'info' | 'warn' | 'gold'; children: React.ReactNode }) {
  const styles = kind === 'gold'
    ? { bg: 'rgba(245,197,24,0.06)', border: 'rgba(245,197,24,0.3)', color: 'var(--text2)' }
    : kind === 'warn'
    ? { bg: 'rgba(224,92,92,0.05)', border: 'rgba(224,92,92,0.25)', color: '#f4b8ad' }
    : { bg: 'var(--surface2)', border: 'var(--border)', color: 'var(--text2)' }
  return (
    <div style={{
      padding: '12px 16px', background: styles.bg, border: `1px solid ${styles.border}`,
      borderLeft: `3px solid ${kind === 'gold' ? 'var(--gold)' : kind === 'warn' ? '#e05c5c' : 'var(--silver2)'}`,
      borderRadius: 8, fontSize: 12, color: styles.color, lineHeight: 1.6, marginBottom: 14,
    }}>
      {children}
    </div>
  )
}

// ── Fillable fields ──────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: 10, letterSpacing: 1.5,
      color: 'var(--silver)', textTransform: 'uppercase',
      fontFamily: 'var(--font-dm)', fontWeight: 700, marginBottom: 6,
    }}>
      {children}
    </label>
  )
}

const inputBase: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
  padding: '9px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--font-dm)', width: '100%', transition: 'border-color 150ms',
}

export function TextField({
  fieldKey, label, placeholder, hint, width,
}: { fieldKey: string; label?: string; placeholder?: string; hint?: string; width?: number | string }) {
  const { getField, setField } = useWorkbook()
  return (
    <div style={{ marginBottom: 12, maxWidth: width }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <input
        style={inputBase}
        value={getField(fieldKey)}
        placeholder={placeholder}
        onChange={e => setField(fieldKey, e.target.value)}
      />
      {hint && <div style={{ fontSize: 11, color: 'var(--silver2)', marginTop: 5, letterSpacing: 0.5 }}>{hint}</div>}
    </div>
  )
}

export function TextArea({
  fieldKey, label, placeholder, rows = 4, hint, maxLen = 4000,
}: { fieldKey: string; label?: string; placeholder?: string; rows?: number; hint?: string; maxLen?: number }) {
  const { getField, setField } = useWorkbook()
  const val = getField(fieldKey)
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <textarea
        style={{ ...inputBase, minHeight: rows * 22, resize: 'vertical', lineHeight: 1.5 }}
        value={val}
        placeholder={placeholder}
        maxLength={maxLen}
        onChange={e => setField(fieldKey, e.target.value)}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
        {hint ? <span style={{ fontSize: 11, color: 'var(--silver2)' }}>{hint}</span> : <span />}
        <span style={{ fontSize: 10, color: 'var(--silver2)', letterSpacing: 0.5 }}>{val.length} / {maxLen}</span>
      </div>
    </div>
  )
}

export function NumberedTextRow({
  fieldKey, index, placeholder,
}: { fieldKey: string; index: number; placeholder?: string }) {
  const { getField, setField } = useWorkbook()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 16, color: 'var(--gold)', letterSpacing: 1, minWidth: 22, textAlign: 'right' }}>
        {index}.
      </span>
      <input
        style={inputBase}
        value={getField(fieldKey)}
        placeholder={placeholder}
        onChange={e => setField(fieldKey, e.target.value)}
      />
    </div>
  )
}

export function Checkbox({ fieldKey, children }: { fieldKey: string; children: React.ReactNode }) {
  const { getCheck, toggleCheck } = useWorkbook()
  const checked = getCheck(fieldKey)
  return (
    <label
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
        padding: '10px 14px', background: checked ? 'rgba(245,197,24,0.05)' : 'var(--surface2)',
        border: `1px solid ${checked ? 'rgba(245,197,24,0.3)' : 'var(--border)'}`,
        borderRadius: 8, marginBottom: 8, transition: 'all 150ms',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => toggleCheck(fieldKey)}
        style={{ marginTop: 2, accentColor: 'var(--gold)', cursor: 'pointer' }}
      />
      <span style={{ flex: 1, fontSize: 13, color: checked ? 'var(--text)' : 'var(--text2)', lineHeight: 1.5 }}>
        {children}
      </span>
    </label>
  )
}

export function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${cols === 2 ? 220 : 160}px, 1fr))`,
      gap: 14,
    }}>
      {children}
    </div>
  )
}

export function Example({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 12, color: 'var(--silver)', fontStyle: 'italic',
      marginBottom: 10, letterSpacing: 0.3, lineHeight: 1.5,
      padding: '8px 12px',
      background: 'rgba(184,180,174,0.05)',
      borderLeft: '2px solid var(--silver2)',
      borderRadius: 4,
    }}>
      <span style={{ fontStyle: 'normal', fontWeight: 700, color: 'var(--gold)', letterSpacing: 1.5, fontSize: 10 }}>EXAMPLE: </span>
      {children}
    </div>
  )
}
