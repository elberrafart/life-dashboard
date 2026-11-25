'use server'
import { createAdminClient } from '@/lib/supabase-admin'
import { createClient, getSessionUser } from '@/lib/supabase-server'
import { checkIsAdmin } from './admin'
import {
  AppModule, ModuleInput, ModulePlacement, PLACEMENTS, validateModule,
} from '@/lib/modules'

type Row = {
  id: string
  slug: string
  title: string
  subtitle: string
  icon: string
  status: 'draft' | 'published'
  placements: string[]
  sort_order: number
  blocks: unknown
  updated_at: string
}

const COLUMNS = 'id, slug, title, subtitle, icon, status, placements, sort_order, blocks, updated_at'

function fromRow(r: Row): AppModule {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle ?? '',
    icon: r.icon,
    status: r.status,
    placements: (r.placements ?? []).filter((p): p is ModulePlacement => PLACEMENTS.some(x => x.id === p)),
    sortOrder: r.sort_order,
    blocks: Array.isArray(r.blocks) ? (r.blocks as AppModule['blocks']) : [],
    updatedAt: r.updated_at,
  }
}

async function assertAdmin() {
  if (!(await checkIsAdmin())) throw new Error('Unauthorized')
}

// ── Client-facing reads (RLS: published only) ───────────────────────────────

/** Published modules for a placement, in admin-defined order. */
export async function getModulesFor(placement: ModulePlacement): Promise<AppModule[]> {
  const user = await getSessionUser()
  if (!user) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modules')
    .select(COLUMNS)
    .eq('status', 'published')
    .contains('placements', [placement])
    .order('sort_order', { ascending: true })
  if (error || !data) return []
  return (data as Row[]).map(fromRow)
}

/** Lightweight list for the sidebar (no block content). */
export async function getNavModules(): Promise<{ slug: string; title: string; icon: string }[]> {
  const user = await getSessionUser()
  if (!user) return []
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('modules')
    .select('slug, title, icon')
    .eq('status', 'published')
    .contains('placements', ['sidebar'])
    .order('sort_order', { ascending: true })
  if (error || !data) return []
  return data
}

/**
 * Module for /m/[slug]. Regular users only see published modules; admins can
 * also open drafts (preview).
 */
export async function getModuleBySlug(slug: string): Promise<AppModule | null> {
  if (typeof slug !== 'string' || slug.length > 60) return null
  const user = await getSessionUser()
  if (!user) return null

  const isAdmin = await checkIsAdmin()
  const supabase = isAdmin ? createAdminClient() : await createClient()
  let q = supabase.from('modules').select(COLUMNS).eq('slug', slug)
  if (!isAdmin) q = q.eq('status', 'published')
  const { data } = await q.maybeSingle()
  return data ? fromRow(data as Row) : null
}

// ── Admin ───────────────────────────────────────────────────────────────────

export async function adminListModules(): Promise<AppModule[]> {
  await assertAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('modules')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Row[]).map(fromRow)
}

export async function adminSaveModule(input: ModuleInput): Promise<{ module?: AppModule; error?: string }> {
  await assertAdmin()

  const err = validateModule(input)
  if (err) return { error: err }

  const supabase = createAdminClient()
  const values = {
    slug: input.slug,
    title: input.title.trim(),
    subtitle: input.subtitle.trim(),
    icon: input.icon,
    status: input.status,
    placements: input.placements,
    blocks: input.blocks,
    updated_at: new Date().toISOString(),
  }

  let result
  if (input.id) {
    result = await supabase.from('modules').update(values).eq('id', input.id).select(COLUMNS).single()
  } else {
    // New modules go to the end of the list.
    const { data: last } = await supabase
      .from('modules').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle()
    result = await supabase
      .from('modules')
      .insert({ ...values, sort_order: (last?.sort_order ?? -1) + 1 })
      .select(COLUMNS)
      .single()
  }

  if (result.error) {
    if (result.error.code === '23505') return { error: `The URL /m/${input.slug} is already used by another module.` }
    return { error: result.error.message }
  }
  return { module: fromRow(result.data as Row) }
}

export async function adminDeleteModule(id: string): Promise<{ error?: string }> {
  await assertAdmin()
  if (typeof id !== 'string') return { error: 'Invalid id' }
  const supabase = createAdminClient()
  const { error } = await supabase.from('modules').delete().eq('id', id)
  return error ? { error: error.message } : {}
}

/** Persist a new order. `ids` is the full list of module ids in display order. */
export async function adminReorderModules(ids: string[]): Promise<{ error?: string }> {
  await assertAdmin()
  if (!Array.isArray(ids) || ids.length > 500 || ids.some(i => typeof i !== 'string')) return { error: 'Invalid order' }
  const supabase = createAdminClient()
  const results = await Promise.all(
    ids.map((id, idx) => supabase.from('modules').update({ sort_order: idx }).eq('id', id)),
  )
  const failed = results.find(r => r.error)
  return failed?.error ? { error: failed.error.message } : {}
}
