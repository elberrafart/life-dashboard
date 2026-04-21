'use client'
import { PhaseHeader, Callout } from './primitives'

export default function PhaseStub({ phase, weeks, title, anchor, anchorSub }: {
  phase: 2 | 3 | 4
  weeks: string
  title: string
  anchor: string
  anchorSub: string
}) {
  return (
    <div>
      <PhaseHeader
        eyebrow={`Phase ${phase} · Weeks ${weeks}`}
        title={title}
        anchor={anchor}
        anchorSub={anchorSub}
      />
      <div className="card" style={{ padding: '36px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 16 }}>🚧</div>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 22, letterSpacing: 3, color: 'var(--text)', marginBottom: 10 }}>
          Coming Next
        </div>
        <div style={{ fontSize: 13, color: 'var(--silver)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
          Phase 1 is live. Once you&rsquo;ve reviewed the style and layout,
          Phases 2&ndash;4 will be built with the same worksheet pattern:
          requirements checklists, weekly identity check-ins, the
          &ldquo;I No Longer&hellip;&rdquo; &amp; &ldquo;I Now&hellip;&rdquo; lists,
          evidence tracking, and the quarterly sovereignty audit.
        </div>
        <Callout kind="gold">
          <span style={{ color: 'var(--text)' }}>
            Tell your coach you&rsquo;re ready for Phase {phase} and the rest will be unlocked.
          </span>
        </Callout>
      </div>
    </div>
  )
}
