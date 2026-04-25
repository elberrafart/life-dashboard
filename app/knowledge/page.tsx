import KnowledgeHub from '@/components/KnowledgeHub'
import { getKnowledgeHub } from '@/app/actions/knowledge'

export default async function KnowledgePage() {
  // Server-side fetch: avoids the client-side round-trip + loading flash.
  const content = await getKnowledgeHub()
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px' }}>
      <KnowledgeHub content={content} />
    </div>
  )
}
