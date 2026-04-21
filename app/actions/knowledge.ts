'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient, getSessionUser } from '@/lib/supabase-server'
import { checkIsAdmin } from './admin'
import { KnowledgeHubContent, DEFAULT_KNOWLEDGE_HUB } from '@/lib/types'

const MAX_BYTES  = 128 * 1024
const MAX_VIDEOS = 100
const MAX_BOOKS  = 200
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{6,20}$/

function validate(c: KnowledgeHubContent): string | null {
  if (!c || typeof c !== 'object') return 'Invalid content'
  const size = new TextEncoder().encode(JSON.stringify(c)).length
  if (size > MAX_BYTES) return 'Content too large'

  if (!Array.isArray(c.videos) || c.videos.length > MAX_VIDEOS) return 'Invalid videos'
  for (const v of c.videos) {
    if (!v || typeof v !== 'object') return 'Invalid video'
    if (typeof v.id !== 'string' || !YOUTUBE_ID_RE.test(v.id)) return `Invalid video ID: ${v.id}`
    if (typeof v.title !== 'string' || v.title.length === 0 || v.title.length > 140) return 'Invalid video title'
  }

  if (typeof c.intro !== 'string' || c.intro.length > 2000) return 'Invalid intro'

  if (!Array.isArray(c.books) || c.books.length > MAX_BOOKS) return 'Invalid books'
  for (const b of c.books) {
    if (!b || typeof b !== 'object') return 'Invalid book'
    if (typeof b.title !== 'string' || b.title.length === 0 || b.title.length > 200) return 'Invalid book title'
    if (typeof b.author !== 'string' || b.author.length > 200) return 'Invalid book author'
    if (b.year !== undefined && (typeof b.year !== 'number' || b.year < 0 || b.year > 3000)) return 'Invalid book year'
  }

  if (!Array.isArray(c.podcasts) || c.podcasts.length > 50) return 'Invalid podcasts'
  for (const p of c.podcasts) {
    if (!p || typeof p !== 'object') return 'Invalid podcast'
    if (typeof p.name !== 'string' || p.name.length > 100) return 'Invalid podcast name'
    if (typeof p.description !== 'string' || p.description.length > 1000) return 'Invalid podcast description'
  }

  return null
}

// Merge stored content with defaults so missing fields never break the UI.
// Also auto-migrates legacy DB rows that stored a single `podcast` object
// into the new `podcasts: []` shape — first admin save rewrites them cleanly.
function withDefaults(content: Partial<KnowledgeHubContent> | null | undefined): KnowledgeHubContent {
  if (!content) return DEFAULT_KNOWLEDGE_HUB

  // Legacy pre-migration shape: { podcast: { name, description } }
  const legacyPodcast = (content as unknown as { podcast?: { name?: string; description?: string } }).podcast
  const podcasts = Array.isArray(content.podcasts) && content.podcasts.length > 0
    ? content.podcasts
    : legacyPodcast && typeof legacyPodcast === 'object'
      ? [{ name: legacyPodcast.name ?? '', description: legacyPodcast.description ?? '' }]
      : DEFAULT_KNOWLEDGE_HUB.podcasts

  return {
    videos:   Array.isArray(content.videos) ? content.videos : DEFAULT_KNOWLEDGE_HUB.videos,
    intro:    typeof content.intro === 'string' ? content.intro : DEFAULT_KNOWLEDGE_HUB.intro,
    books:    Array.isArray(content.books) ? content.books : DEFAULT_KNOWLEDGE_HUB.books,
    podcasts,
  }
}

export async function getKnowledgeHub(): Promise<KnowledgeHubContent> {
  const user = await getSessionUser()
  if (!user) return DEFAULT_KNOWLEDGE_HUB

  const supabase = await createClient()
  const { data } = await supabase
    .from('knowledge_hub')
    .select('content')
    .eq('id', 'main')
    .maybeSingle()

  return withDefaults(data?.content as KnowledgeHubContent | null)
}

export async function adminGetKnowledgeHub(): Promise<KnowledgeHubContent> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('knowledge_hub')
    .select('content')
    .eq('id', 'main')
    .maybeSingle()

  return withDefaults(data?.content as KnowledgeHubContent | null)
}

export async function adminSetKnowledgeHub(content: KnowledgeHubContent): Promise<{ error?: string }> {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) throw new Error('Unauthorized')

  const err = validate(content)
  if (err) return { error: err }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('knowledge_hub')
    .upsert(
      { id: 'main', content, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )

  if (error) return { error: error.message }
  return {}
}
