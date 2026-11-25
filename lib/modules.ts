// Shared types + helpers for admin-built content modules.
// Safe to import from both client and server code.

export type ModulePlacement = 'sidebar' | 'dashboard' | 'start-here'
export type ModuleStatus = 'draft' | 'published'

export const PLACEMENTS: { id: ModulePlacement; label: string; hint: string }[] = [
  { id: 'sidebar',    label: 'Sidebar link',   hint: 'Own page at /m/<slug>, linked in the left nav + mobile drawer' },
  { id: 'dashboard',  label: 'Dashboard card', hint: 'Shown as a section at the top of the home dashboard' },
  { id: 'start-here', label: 'Start Here',     hint: 'Appended as a section at the bottom of /start-here' },
]

export type ModuleBook = { title: string; author: string; year?: number }

export type ModuleBlock =
  | { id: string; type: 'heading'; text: string }
  | { id: string; type: 'text'; markdown: string }
  | { id: string; type: 'video'; provider: 'youtube' | 'loom'; videoId: string; title: string }
  | { id: string; type: 'image'; url: string; alt: string; caption: string }
  | { id: string; type: 'link'; label: string; url: string; style: 'button' | 'link' }
  | { id: string; type: 'callout'; icon: string; text: string }
  | { id: string; type: 'books'; items: ModuleBook[] }

export type BlockType = ModuleBlock['type']

export const BLOCK_TYPES: { type: BlockType; icon: string; label: string }[] = [
  { type: 'heading', icon: '🔠', label: 'Heading' },
  { type: 'text',    icon: '📝', label: 'Text' },
  { type: 'video',   icon: '🎥', label: 'Video' },
  { type: 'image',   icon: '🖼️', label: 'Image' },
  { type: 'link',    icon: '🔗', label: 'Link / Button' },
  { type: 'callout', icon: '💡', label: 'Callout' },
  { type: 'books',   icon: '📚', label: 'Book list' },
]

export type AppModule = {
  id: string
  slug: string
  title: string
  subtitle: string
  icon: string
  status: ModuleStatus
  placements: ModulePlacement[]
  sortOrder: number
  blocks: ModuleBlock[]
  updatedAt: string
}

/** Draft shape sent from the admin editor. `id` is absent for new modules. */
export type ModuleInput = Omit<AppModule, 'id' | 'sortOrder' | 'updatedAt'> & { id?: string }

export function newBlockId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function emptyBlock(type: BlockType): ModuleBlock {
  const id = newBlockId()
  switch (type) {
    case 'heading': return { id, type, text: '' }
    case 'text':    return { id, type, markdown: '' }
    case 'video':   return { id, type, provider: 'youtube', videoId: '', title: '' }
    case 'image':   return { id, type, url: '', alt: '', caption: '' }
    case 'link':    return { id, type, label: '', url: '', style: 'button' }
    case 'callout': return { id, type, icon: '💡', text: '' }
    case 'books':   return { id, type, items: [] }
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{6,20}$/
const LOOM_ID_RE = /^[a-f0-9]{20,40}$/

/** Parse a pasted YouTube/Loom URL (or bare ID) into provider + id. */
export function parseVideoUrl(input: string): { provider: 'youtube' | 'loom'; videoId: string } | null {
  const s = (input ?? '').trim()
  if (!s) return null
  let m = s.match(/loom\.com\/(?:share|embed)\/([a-f0-9]+)/i)
  if (m) return { provider: 'loom', videoId: m[1].toLowerCase() }
  m = s.match(/youtu\.be\/([A-Za-z0-9_-]+)/) ?? s.match(/[?&]v=([A-Za-z0-9_-]+)/) ?? s.match(/youtube\.com\/(?:embed|shorts|live)\/([A-Za-z0-9_-]+)/)
  if (m) return { provider: 'youtube', videoId: m[1] }
  if (LOOM_ID_RE.test(s)) return { provider: 'loom', videoId: s }
  if (YOUTUBE_ID_RE.test(s)) return { provider: 'youtube', videoId: s }
  return null
}

export function videoEmbedUrl(b: { provider: 'youtube' | 'loom'; videoId: string }): string {
  return b.provider === 'loom'
    ? `https://www.loom.com/embed/${b.videoId}`
    : `https://www.youtube-nocookie.com/embed/${b.videoId}`
}

/** Only allow http(s)/mailto/tel and same-site relative links. */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length > 2000) return false
  if (url.startsWith('/') && !url.startsWith('//')) return true
  try {
    const u = new URL(url)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(u.protocol)
  } catch {
    return false
  }
}

function isHttpsUrl(url: string): boolean {
  try { return new URL(url).protocol === 'https:' } catch { return false }
}

const str = (v: unknown, max: number, min = 0) => typeof v === 'string' && v.length >= min && v.length <= max

/** Validate a single block. Returns an error message or null. */
export function validateBlock(b: ModuleBlock, i: number): string | null {
  const where = `Block ${i + 1}`
  if (!b || typeof b !== 'object' || !str(b.id, 40, 1)) return `${where}: invalid`
  switch (b.type) {
    case 'heading':
      return str(b.text, 120, 1) ? null : `${where}: heading needs 1–120 characters`
    case 'text':
      return str(b.markdown, 10000, 1) ? null : `${where}: text can't be empty (max 10,000 chars)`
    case 'video':
      if (b.provider === 'youtube' && YOUTUBE_ID_RE.test(b.videoId)) return str(b.title, 140) ? null : `${where}: title too long`
      if (b.provider === 'loom' && LOOM_ID_RE.test(b.videoId)) return str(b.title, 140) ? null : `${where}: title too long`
      return `${where}: paste a valid YouTube or Loom link`
    case 'image':
      if (!isHttpsUrl(b.url) || b.url.length > 2000) return `${where}: image URL must start with https://`
      return str(b.alt, 200) && str(b.caption, 300) ? null : `${where}: alt/caption too long`
    case 'link':
      if (!str(b.label, 80, 1)) return `${where}: link needs a label`
      if (!isSafeUrl(b.url)) return `${where}: link URL must be http(s), mailto, tel, or a /path`
      return b.style === 'button' || b.style === 'link' ? null : `${where}: invalid link style`
    case 'callout':
      return str(b.text, 2000, 1) && str(b.icon, 16) ? null : `${where}: callout needs text`
    case 'books':
      if (!Array.isArray(b.items) || b.items.length === 0 || b.items.length > 100) return `${where}: add at least one book`
      for (const bk of b.items) {
        if (!bk || !str(bk.title, 200, 1) || !str(bk.author, 200)) return `${where}: every book needs a title`
        if (bk.year !== undefined && (typeof bk.year !== 'number' || bk.year < 0 || bk.year > 3000)) return `${where}: invalid year`
      }
      return null
    default:
      return `${where}: unknown block type`
  }
}

export function validateModule(m: ModuleInput): string | null {
  if (!m || typeof m !== 'object') return 'Invalid module'
  if (!str(m.title, 80, 1) || !m.title.trim()) return 'Title is required (max 80 chars)'
  if (!str(m.subtitle, 200)) return 'Subtitle too long (max 200 chars)'
  if (!str(m.icon, 16, 1)) return 'Pick an icon'
  if (!str(m.slug, 60, 1) || !SLUG_RE.test(m.slug)) return 'URL slug may only contain lowercase letters, numbers and dashes'
  if (m.status !== 'draft' && m.status !== 'published') return 'Invalid status'
  if (!Array.isArray(m.placements) || m.placements.some(p => !PLACEMENTS.some(x => x.id === p))) return 'Invalid placement'
  if (!Array.isArray(m.blocks) || m.blocks.length > 100) return 'Too many blocks (max 100)'
  for (let i = 0; i < m.blocks.length; i++) {
    const err = validateBlock(m.blocks[i], i)
    if (err) return err
  }
  if (new TextEncoder().encode(JSON.stringify(m.blocks)).length > 256 * 1024) return 'Module content too large'
  return null
}
