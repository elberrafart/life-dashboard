import Link from 'next/link'
import KnowledgeHub from '@/components/KnowledgeHub'
import { getKnowledgeHub } from '@/app/actions/knowledge'

export default async function KnowledgePage() {
  // Server-side fetch: avoids the client-side round-trip + loading flash.
  const content = await getKnowledgeHub()
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <style>{`
        .kh-home-btn:hover { border-color: var(--gold) !important; color: var(--gold) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 36, letterSpacing: 5, color: 'var(--text)', lineHeight: 1 }}>
            KNOWLEDGE HUB
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>
            Core videos · reading · podcasts
          </div>
        </div>
        <Link
          href="/"
          className="kh-home-btn"
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

      <KnowledgeHub content={content} />
    </div>
  )
}
