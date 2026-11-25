import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getModuleBySlug } from '@/app/actions/modules'
import ModuleBlocks from '@/components/modules/ModuleBlocks'

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mod = await getModuleBySlug(slug)
  if (!mod) notFound()

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {mod.status === 'draft' && (
        <div style={{
          marginBottom: 20, padding: '10px 14px', borderRadius: 8,
          background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.3)',
          fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--font-dm)',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span>👁 Draft preview — only admins can see this page.</span>
          <Link href={`/admin/modules?edit=${mod.id}`} style={{ color: 'var(--gold)', marginLeft: 'auto' }}>Edit →</Link>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 36, lineHeight: 1, letterSpacing: 4, color: 'var(--text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 30 }}>{mod.icon}</span> {mod.title}
        </div>
        {mod.subtitle && (
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8, fontFamily: 'var(--font-dm)' }}>
            {mod.subtitle}
          </div>
        )}
      </div>

      {mod.blocks.length === 0
        ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>Nothing here yet.</div>
        : <ModuleBlocks blocks={mod.blocks} />}
    </div>
  )
}
