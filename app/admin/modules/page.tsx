'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  adminListModules, adminSaveModule, adminDeleteModule, adminReorderModules,
} from '@/app/actions/modules'
import { invalidate } from '@/lib/dataCache'
import {
  AppModule, ModuleInput, ModuleBlock, BlockType, ModulePlacement, ModuleBook,
  BLOCK_TYPES, PLACEMENTS, emptyBlock, slugify, parseVideoUrl, validateModule,
} from '@/lib/modules'
import ModuleBlocks from '@/components/modules/ModuleBlocks'

const ICON_CHOICES = ['📄', '🎯', '🔥', '💪', '🥗', '🧠', '📈', '🏋️', '🧘', '💤', '💰', '🗓️', '🎥', '📚', '🚀', '⭐']

const NEW_MODULE: ModuleInput = {
  slug: '', title: '', subtitle: '', icon: '📄',
  status: 'draft', placements: ['sidebar'], blocks: [],
}

// ── Shared styles (match /admin/knowledge) ──────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
  padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
  fontFamily: 'var(--font-dm)', width: '100%',
}
const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: 110, resize: 'vertical', lineHeight: 1.5 }
const fieldLabel: React.CSSProperties = {
  display: 'block', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
  color: 'var(--text3)', marginBottom: 4, fontFamily: 'var(--font-dm)', fontWeight: 600,
}
const goldBtn: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 6,
  padding: '10px 18px', fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap',
}
const ghostBtn: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
  padding: '10px 16px', fontSize: 11, fontWeight: 600, letterSpacing: 1.5,
  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)',
  color: 'var(--text2)', whiteSpace: 'nowrap', textDecoration: 'none',
}
const removeBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 4,
  padding: '4px 10px', fontSize: 9, color: '#e05c5c', cursor: 'pointer',
  letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)',
}
const iconBtn: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 4,
  padding: '4px 8px', fontSize: 11, color: 'var(--text3)', cursor: 'pointer',
  fontFamily: 'var(--font-dm)', minWidth: 26,
}
const chip = (on: boolean): React.CSSProperties => ({
  fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700,
  padding: '3px 8px', borderRadius: 999, fontFamily: 'var(--font-dm)',
  border: `1px solid ${on ? 'rgba(245,197,24,0.4)' : 'var(--border)'}`,
  color: on ? 'var(--gold)' : 'var(--text3)',
  background: on ? 'rgba(245,197,24,0.06)' : 'transparent',
})

function moveItem<T>(arr: T[], idx: number, dir: -1 | 1): T[] {
  const tgt = idx + dir
  if (tgt < 0 || tgt >= arr.length) return arr
  const next = [...arr]
  ;[next[idx], next[tgt]] = [next[tgt], next[idx]]
  return next
}

export default function AdminModulesPage() {
  const [modules, setModules] = useState<AppModule[] | null>(null)
  const [editing, setEditing] = useState<ModuleInput | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function flash(msg: string) {
    setMessage(msg)
    setTimeout(() => setMessage(null), 3000)
  }
  function fail(e: unknown) {
    setError(e instanceof Error ? e.message : String(e))
    setTimeout(() => setError(null), 5000)
  }
  function invalidateClientCaches() {
    invalidate('navModules')
    invalidate('dashboardModules')
  }

  useEffect(() => {
    adminListModules()
      .then(list => {
        setModules(list)
        // Deep link from the draft preview banner: /admin/modules?edit=<id>
        const editId = new URLSearchParams(window.location.search).get('edit')
        const target = editId && list.find(m => m.id === editId)
        if (target) openEditor(target)
      })
      .catch(fail)
  }, [])

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])

  function openEditor(mod: AppModule | null) {
    if (mod) {
      const { sortOrder: _s, updatedAt: _u, ...rest } = mod
      setEditing(structuredClone(rest))
      setSlugTouched(true)
    } else {
      setEditing(structuredClone(NEW_MODULE))
      setSlugTouched(false)
    }
    setDirty(false)
    setPreview(false)
    setError(null)
  }

  function closeEditor() {
    if (dirty && !window.confirm('Discard unsaved changes?')) return
    setEditing(null)
    setDirty(false)
    window.history.replaceState(null, '', '/admin/modules')
  }

  function patch(p: Partial<ModuleInput>) {
    setEditing(prev => prev ? { ...prev, ...p } : prev)
    setDirty(true)
  }

  function setTitle(title: string) {
    patch(slugTouched ? { title } : { title, slug: slugify(title) })
  }

  function togglePlacement(p: ModulePlacement) {
    if (!editing) return
    const has = editing.placements.includes(p)
    patch({ placements: has ? editing.placements.filter(x => x !== p) : [...editing.placements, p] })
  }

  // ── Blocks ──
  function addBlock(type: BlockType) {
    if (!editing) return
    patch({ blocks: [...editing.blocks, emptyBlock(type)] })
  }
  function updateBlock(idx: number, next: ModuleBlock) {
    if (!editing) return
    patch({ blocks: editing.blocks.map((b, i) => i === idx ? next : b) })
  }
  function removeBlock(idx: number) {
    if (!editing) return
    patch({ blocks: editing.blocks.filter((_, i) => i !== idx) })
  }
  function moveBlock(idx: number, dir: -1 | 1) {
    if (!editing) return
    patch({ blocks: moveItem(editing.blocks, idx, dir) })
  }

  async function save(status?: 'draft' | 'published') {
    if (!editing) return
    const toSave = status ? { ...editing, status } : editing
    const localErr = validateModule(toSave)
    if (localErr) { fail(localErr); return }
    setSaving(true)
    try {
      const res = await adminSaveModule(toSave)
      if (res.error || !res.module) { fail(res.error ?? 'Save failed'); return }
      const saved = res.module
      setModules(prev => {
        const list = prev ?? []
        return list.some(m => m.id === saved.id) ? list.map(m => m.id === saved.id ? saved : m) : [...list, saved]
      })
      const { sortOrder: _s, updatedAt: _u, ...rest } = saved
      setEditing(rest)
      setSlugTouched(true)
      setDirty(false)
      invalidateClientCaches()
      flash(saved.status === 'published' ? '✓ Saved & published' : '✓ Draft saved')
    } catch (e) { fail(e) } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null)
    const prev = modules
    setModules(m => m?.filter(x => x.id !== id) ?? null)
    try {
      const res = await adminDeleteModule(id)
      if (res.error) { setModules(prev); fail(res.error); return }
      invalidateClientCaches()
      if (editing?.id === id) { setEditing(null); setDirty(false) }
      flash('Module deleted')
    } catch (e) { setModules(prev); fail(e) }
  }

  async function handleReorder(idx: number, dir: -1 | 1) {
    if (!modules) return
    const prev = modules
    const next = moveItem(modules, idx, dir)
    if (next === modules) return
    setModules(next)
    try {
      const res = await adminReorderModules(next.map(m => m.id))
      if (res.error) { setModules(prev); fail(res.error); return }
      invalidateClientCaches()
    } catch (e) { setModules(prev); fail(e) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {editing
          ? <button onClick={closeEditor} style={{ ...ghostBtn, padding: '8px 16px', color: 'var(--text3)' }}>← Modules</button>
          : <Link href="/admin" style={{ ...ghostBtn, padding: '8px 16px', color: 'var(--text3)' }}>← Admin</Link>}
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 5, color: 'var(--text)' }}>
            {editing ? (editing.id ? 'EDIT MODULE' : 'NEW MODULE') : 'MODULES'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Custom sections · shown to all users once published
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!editing && <button style={goldBtn} onClick={() => openEditor(null)}>+ New Module</button>}
          {editing && (
            <>
              <button style={ghostBtn} onClick={() => setPreview(p => !p)}>{preview ? '✎ Edit' : '👁 Preview'}</button>
              {editing.status === 'published' ? (
                <>
                  <button style={ghostBtn} disabled={saving} onClick={() => save('draft')}>Unpublish</button>
                  <button style={{ ...goldBtn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={() => save()}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button style={ghostBtn} disabled={saving} onClick={() => save('draft')}>{saving ? 'Saving…' : 'Save Draft'}</button>
                  <button style={{ ...goldBtn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={() => save('published')}>Publish</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{error}</div>
      )}
      {message && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: 8, fontSize: 12, color: 'var(--green)' }}>{message}</div>
      )}

      {!editing && <ModuleList
        modules={modules}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        onEdit={openEditor}
        onDelete={handleDelete}
        onMove={handleReorder}
      />}

      {editing && preview && (
        <div className="card" style={{ padding: '28px 24px' }}>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 4, color: 'var(--text)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>{editing.icon}</span> {editing.title || 'Untitled'}
          </div>
          {editing.subtitle && <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6, marginBottom: 24 }}>{editing.subtitle}</div>}
          <div style={{ marginTop: editing.subtitle ? 0 : 24 }}>
            {editing.blocks.length === 0
              ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No blocks yet.</div>
              : <ModuleBlocks blocks={editing.blocks} />}
          </div>
        </div>
      )}

      {editing && !preview && (
        <>
          {/* ── Settings ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10 }}>
              ⚙️ Settings
              <span style={{ ...chip(editing.status === 'published'), marginLeft: 'auto' }}>
                {editing.status === 'published' ? '● Published' : '○ Draft'}
              </span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: '2 1 240px' }}>
                  <label style={fieldLabel}>Title</label>
                  <input style={inputStyle} value={editing.title} placeholder="e.g. Nutrition Basics" maxLength={80} onChange={e => setTitle(e.target.value)} />
                </div>
                <div style={{ flex: '1 1 180px' }}>
                  <label style={fieldLabel}>URL · /m/…</label>
                  <input
                    style={inputStyle}
                    value={editing.slug}
                    placeholder="nutrition-basics"
                    maxLength={60}
                    onChange={e => { setSlugTouched(true); patch({ slug: slugify(e.target.value) }) }}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabel}>Subtitle (optional)</label>
                <input style={inputStyle} value={editing.subtitle} placeholder="Short line under the title" maxLength={200} onChange={e => patch({ subtitle: e.target.value })} />
              </div>
              <div>
                <label style={fieldLabel}>Icon</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {ICON_CHOICES.map(ic => (
                    <button
                      key={ic}
                      onClick={() => patch({ icon: ic })}
                      style={{
                        ...iconBtn, fontSize: 16, padding: '4px 6px',
                        borderColor: editing.icon === ic ? 'var(--gold)' : 'var(--border2)',
                        background: editing.icon === ic ? 'rgba(245,197,24,0.1)' : 'var(--surface2)',
                      }}
                    >{ic}</button>
                  ))}
                  <input
                    style={{ ...inputStyle, width: 70, textAlign: 'center', fontSize: 16, padding: '4px 8px' }}
                    value={editing.icon}
                    maxLength={8}
                    title="Or type/paste any emoji"
                    onChange={e => patch({ icon: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label style={fieldLabel}>Where it appears</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {PLACEMENTS.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text2)' }}>
                      <input
                        type="checkbox"
                        checked={editing.placements.includes(p.id)}
                        onChange={() => togglePlacement(p.id)}
                        style={{ marginTop: 3, accentColor: 'var(--gold)' }}
                      />
                      <span>
                        <strong style={{ color: 'var(--text)' }}>{p.label}</strong>
                        <span style={{ display: 'block', fontSize: 11, color: 'var(--text3)' }}>{p.hint}</span>
                      </span>
                    </label>
                  ))}
                  {editing.placements.length === 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                      No placement ticked — the page is still reachable at /m/{editing.slug || '…'} by direct link.
                    </div>
                  )}
                </div>
              </div>
              {editing.id && editing.slug && (
                <div>
                  <Link href={`/m/${editing.slug}`} target="_blank" style={{ fontSize: 11, color: 'var(--gold)' }}>
                    Open /m/{editing.slug} in new tab ↗
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Blocks ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
              🧱 Content blocks ({editing.blocks.length})
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {editing.blocks.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Add your first block below.</div>
              )}
              {editing.blocks.map((b, i) => {
                const meta = BLOCK_TYPES.find(t => t.type === b.type)
                return (
                  <div key={b.id} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text3)', fontWeight: 700 }}>
                        {meta?.icon} {meta?.label}
                      </span>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        <button style={iconBtn} title="Move up" onClick={() => moveBlock(i, -1)}>↑</button>
                        <button style={iconBtn} title="Move down" onClick={() => moveBlock(i, 1)}>↓</button>
                        <button style={removeBtn} onClick={() => removeBlock(i)}>Remove</button>
                      </div>
                    </div>
                    <BlockEditor block={b} onChange={nb => updateBlock(i, nb)} />
                  </div>
                )
              })}

              <div style={{ paddingTop: 12, borderTop: '1px dashed var(--border)' }}>
                <label style={fieldLabel}>Add block</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {BLOCK_TYPES.map(t => (
                    <button key={t.type} style={{ ...ghostBtn, padding: '7px 12px', fontSize: 10 }} onClick={() => addBlock(t.type)}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {editing.id && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {confirmDelete === editing.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Delete permanently?</span>
                  <button style={{ ...removeBtn, padding: '8px 14px', background: '#c0392b', color: '#fff', border: 'none' }} onClick={() => handleDelete(editing.id!)}>Yes, delete</button>
                  <button style={{ ...ghostBtn, padding: '8px 14px' }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                </div>
              ) : (
                <button style={{ ...removeBtn, padding: '8px 14px' }} onClick={() => setConfirmDelete(editing.id!)}>Delete module</button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Module list ─────────────────────────────────────────────────────────────

function ModuleList({
  modules, confirmDelete, setConfirmDelete, onEdit, onDelete, onMove,
}: {
  modules: AppModule[] | null
  confirmDelete: string | null
  setConfirmDelete: (id: string | null) => void
  onEdit: (m: AppModule) => void
  onDelete: (id: string) => void
  onMove: (idx: number, dir: -1 | 1) => void
}) {
  if (modules === null) {
    return <div style={{ padding: 40, color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
  }
  if (modules.length === 0) {
    return (
      <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🧩</div>
        <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 6 }}>No modules yet</div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Create a module to add a new page, dashboard section, or Start Here section for your clients.
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>Order here = order in the sidebar, dashboard and Start Here.</div>
      {modules.map((m, i) => (
        <div key={m.id} className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 24 }}>{m.icon}</span>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600 }}>{m.title}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, alignItems: 'center' }}>
              <span style={chip(m.status === 'published')}>{m.status === 'published' ? '● Published' : '○ Draft'}</span>
              {m.placements.map(p => (
                <span key={p} style={chip(false)}>{PLACEMENTS.find(x => x.id === p)?.label ?? p}</span>
              ))}
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>/m/{m.slug} · {m.blocks.length} block{m.blocks.length === 1 ? '' : 's'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <button style={iconBtn} title="Move up" onClick={() => onMove(i, -1)}>↑</button>
            <button style={iconBtn} title="Move down" onClick={() => onMove(i, 1)}>↓</button>
            <Link href={`/m/${m.slug}`} style={{ ...iconBtn, textDecoration: 'none', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '5px 10px' }}>View</Link>
            <button style={{ ...iconBtn, fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', padding: '5px 10px', color: 'var(--gold)' }} onClick={() => onEdit(m)}>Edit</button>
            {confirmDelete === m.id ? (
              <>
                <button style={{ ...removeBtn, background: '#c0392b', color: '#fff', border: 'none' }} onClick={() => onDelete(m.id)}>Confirm</button>
                <button style={iconBtn} onClick={() => setConfirmDelete(null)}>✕</button>
              </>
            ) : (
              <button style={removeBtn} onClick={() => setConfirmDelete(m.id)}>Delete</button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Per-block editors ───────────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: ModuleBlock; onChange: (b: ModuleBlock) => void }) {
  switch (block.type) {
    case 'heading':
      return <input style={inputStyle} value={block.text} placeholder="Section heading" maxLength={120} onChange={e => onChange({ ...block, text: e.target.value })} />

    case 'text':
      return (
        <div>
          <textarea style={textareaStyle} value={block.markdown} maxLength={10000} placeholder="Write here…" onChange={e => onChange({ ...block, markdown: e.target.value })} />
          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>
            **bold** · *italic* · [link text](https://…) · start lines with “- ” for bullets or “1. ” for numbers · blank line = new paragraph
          </div>
        </div>
      )

    case 'video':
      return <VideoEditor block={block} onChange={onChange} />

    case 'image':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <label style={fieldLabel}>Image URL (https://…)</label>
            <input style={inputStyle} value={block.url} placeholder="https://…/photo.jpg" onChange={e => onChange({ ...block, url: e.target.value.trim() })} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={fieldLabel}>Caption (optional)</label>
              <input style={inputStyle} value={block.caption} maxLength={300} onChange={e => onChange({ ...block, caption: e.target.value })} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={fieldLabel}>Alt text (for accessibility)</label>
              <input style={inputStyle} value={block.alt} maxLength={200} onChange={e => onChange({ ...block, alt: e.target.value })} />
            </div>
          </div>
          {block.url.startsWith('https://') && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt="" referrerPolicy="no-referrer" style={{ maxWidth: 200, maxHeight: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
          )}
        </div>
      )

    case 'link':
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={fieldLabel}>Label</label>
            <input style={inputStyle} value={block.label} maxLength={80} placeholder="Book a call" onChange={e => onChange({ ...block, label: e.target.value })} />
          </div>
          <div style={{ flex: '2 1 220px' }}>
            <label style={fieldLabel}>URL</label>
            <input style={inputStyle} value={block.url} placeholder="https://… or /knowledge" onChange={e => onChange({ ...block, url: e.target.value.trim() })} />
          </div>
          <div>
            <label style={fieldLabel}>Style</label>
            <select style={{ ...inputStyle, width: 'auto' }} value={block.style} onChange={e => onChange({ ...block, style: e.target.value as 'button' | 'link' })}>
              <option value="button">Gold button</option>
              <option value="link">Text link</option>
            </select>
          </div>
        </div>
      )

    case 'callout':
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inputStyle, width: 56, textAlign: 'center', fontSize: 16 }} value={block.icon} maxLength={8} onChange={e => onChange({ ...block, icon: e.target.value })} />
          <textarea style={{ ...textareaStyle, minHeight: 70 }} value={block.text} maxLength={2000} placeholder="Important note…" onChange={e => onChange({ ...block, text: e.target.value })} />
        </div>
      )

    case 'books':
      return <BooksEditor block={block} onChange={onChange} />
  }
}

function VideoEditor({ block, onChange }: { block: Extract<ModuleBlock, { type: 'video' }>; onChange: (b: ModuleBlock) => void }) {
  const [raw, setRaw] = useState(() =>
    block.videoId
      ? block.provider === 'loom' ? `https://www.loom.com/share/${block.videoId}` : `https://youtu.be/${block.videoId}`
      : '',
  )
  const parsed = parseVideoUrl(raw)
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <div style={{ flex: '2 1 240px' }}>
        <label style={fieldLabel}>YouTube or Loom link</label>
        <input
          style={inputStyle}
          value={raw}
          placeholder="https://youtu.be/… or https://www.loom.com/share/…"
          onChange={e => {
            setRaw(e.target.value)
            const p = parseVideoUrl(e.target.value)
            onChange({ ...block, provider: p?.provider ?? block.provider, videoId: p?.videoId ?? '' })
          }}
        />
        <div style={{ fontSize: 10, marginTop: 4, color: raw && !parsed ? '#e05c5c' : 'var(--text3)' }}>
          {raw ? (parsed ? `✓ ${parsed.provider === 'loom' ? 'Loom' : 'YouTube'} video detected` : 'Not a recognised YouTube/Loom link') : ' '}
        </div>
      </div>
      <div style={{ flex: '1 1 180px' }}>
        <label style={fieldLabel}>Caption (optional)</label>
        <input style={inputStyle} value={block.title} maxLength={140} onChange={e => onChange({ ...block, title: e.target.value })} />
      </div>
    </div>
  )
}

function BooksEditor({ block, onChange }: { block: Extract<ModuleBlock, { type: 'books' }>; onChange: (b: ModuleBlock) => void }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [year, setYear] = useState('')
  const setItems = (items: ModuleBook[]) => onChange({ ...block, items })

  function add() {
    const t = title.trim()
    if (!t) return
    const y = year.trim() ? Number(year) : undefined
    setItems([...block.items, { title: t, author: author.trim(), ...(y && !Number.isNaN(y) ? { year: y } : {}) }])
    setTitle(''); setAuthor(''); setYear('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {block.items.map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <input style={{ ...inputStyle, flex: '2 1 160px', width: 'auto', padding: '6px 10px' }} value={b.title} onChange={e => setItems(block.items.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
          <input style={{ ...inputStyle, flex: '1 1 120px', width: 'auto', padding: '6px 10px' }} value={b.author} placeholder="Author" onChange={e => setItems(block.items.map((x, j) => j === i ? { ...x, author: e.target.value } : x))} />
          <button style={iconBtn} onClick={() => setItems(moveItem(block.items, i, -1))}>↑</button>
          <button style={iconBtn} onClick={() => setItems(moveItem(block.items, i, 1))}>↓</button>
          <button style={removeBtn} onClick={() => setItems(block.items.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <input style={{ ...inputStyle, flex: '2 1 160px', width: 'auto' }} placeholder="Book title" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...inputStyle, flex: '1 1 120px', width: 'auto' }} placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
        <input style={{ ...inputStyle, width: 70 }} placeholder="Year" inputMode="numeric" value={year} onChange={e => setYear(e.target.value.replace(/\D/g, ''))} onKeyDown={e => e.key === 'Enter' && add()} />
        <button style={{ ...goldBtn, padding: '8px 14px', fontSize: 10 }} onClick={add}>Add</button>
      </div>
    </div>
  )
}
