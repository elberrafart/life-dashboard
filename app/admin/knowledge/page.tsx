'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminGetKnowledgeHub, adminSetKnowledgeHub } from '@/app/actions/knowledge'
import { KnowledgeHubContent, KnowledgeVideo, KnowledgeBook, KnowledgePodcast, extractYoutubeId, DEFAULT_KNOWLEDGE_HUB } from '@/lib/types'

export default function AdminKnowledgePage() {
  const [content, setContent] = useState<KnowledgeHubContent | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // New-video form
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [newVideoTitle, setNewVideoTitle] = useState('')

  // New-book form
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookAuthor, setNewBookAuthor] = useState('')
  const [newBookYear, setNewBookYear] = useState('')

  useEffect(() => {
    adminGetKnowledgeHub()
      .then(setContent)
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  async function handleSave() {
    if (!content) return
    setSaving(true); setSaveError(null); setSaved(false)
    const result = await adminSetKnowledgeHub(content)
    setSaving(false)
    if (result.error) { setSaveError(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function updateContent(patch: Partial<KnowledgeHubContent>) {
    if (!content) return
    setContent({ ...content, ...patch })
  }

  function addVideo() {
    if (!content) return
    const id = extractYoutubeId(newVideoUrl)
    const title = newVideoTitle.trim()
    if (!id || !title) return
    const newVid: KnowledgeVideo = { id, title }
    updateContent({ videos: [...content.videos, newVid] })
    setNewVideoUrl(''); setNewVideoTitle('')
  }

  function updateVideo(idx: number, patch: Partial<KnowledgeVideo>) {
    if (!content) return
    updateContent({ videos: content.videos.map((v, i) => i === idx ? { ...v, ...patch } : v) })
  }

  function removeVideo(idx: number) {
    if (!content) return
    updateContent({ videos: content.videos.filter((_, i) => i !== idx) })
  }

  function moveVideo(idx: number, dir: -1 | 1) {
    if (!content) return
    const next = [...content.videos]
    const tgt = idx + dir
    if (tgt < 0 || tgt >= next.length) return
    ;[next[idx], next[tgt]] = [next[tgt], next[idx]]
    updateContent({ videos: next })
  }

  function addBook() {
    if (!content) return
    const title = newBookTitle.trim()
    const author = newBookAuthor.trim()
    if (!title) return
    const year = newBookYear.trim() ? Number(newBookYear) : undefined
    const book: KnowledgeBook = { title, author, ...(year ? { year } : {}) }
    updateContent({ books: [...content.books, book] })
    setNewBookTitle(''); setNewBookAuthor(''); setNewBookYear('')
  }

  function updateBook(idx: number, patch: Partial<KnowledgeBook>) {
    if (!content) return
    updateContent({
      books: content.books.map((b, i) => {
        if (i !== idx) return b
        const merged = { ...b, ...patch }
        // strip undefined year so JSON stays clean
        if (merged.year === undefined) { delete (merged as Partial<KnowledgeBook>).year }
        return merged
      })
    })
  }

  function removeBook(idx: number) {
    if (!content) return
    updateContent({ books: content.books.filter((_, i) => i !== idx) })
  }

  function moveBook(idx: number, dir: -1 | 1) {
    if (!content) return
    const next = [...content.books]
    const tgt = idx + dir
    if (tgt < 0 || tgt >= next.length) return
    ;[next[idx], next[tgt]] = [next[tgt], next[idx]]
    updateContent({ books: next })
  }

  function addPodcast() {
    if (!content) return
    const newPod: KnowledgePodcast = { name: '', description: '' }
    updateContent({ podcasts: [...content.podcasts, newPod] })
  }

  function updatePodcast(idx: number, patch: Partial<KnowledgePodcast>) {
    if (!content) return
    updateContent({
      podcasts: content.podcasts.map((p, i) => i === idx ? { ...p, ...patch } : p),
    })
  }

  function removePodcast(idx: number) {
    if (!content) return
    updateContent({ podcasts: content.podcasts.filter((_, i) => i !== idx) })
  }

  function movePodcast(idx: number, dir: -1 | 1) {
    if (!content) return
    const next = [...content.podcasts]
    const tgt = idx + dir
    if (tgt < 0 || tgt >= next.length) return
    ;[next[idx], next[tgt]] = [next[tgt], next[idx]]
    updateContent({ podcasts: next })
  }

  function resetToDefaults() {
    if (!confirm('Reset all Knowledge Hub content to the program defaults? This will overwrite your edits.')) return
    setContent(DEFAULT_KNOWLEDGE_HUB)
  }

  // ── Shared styles ────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '8px 12px', color: 'var(--text)', fontSize: 13, outline: 'none',
    fontFamily: 'var(--font-dm)', width: '100%',
  }
  const textareaStyle: React.CSSProperties = {
    ...inputStyle, minHeight: 90, resize: 'vertical', lineHeight: 1.5,
  }
  const fieldLabel: React.CSSProperties = {
    display: 'block', fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
    color: 'var(--text3)', marginBottom: 4, fontFamily: 'var(--font-dm)', fontWeight: 600,
  }
  const addBtn: React.CSSProperties = {
    background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 6,
    padding: '8px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap',
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
  const cardStyle: React.CSSProperties = { padding: 0, overflow: 'hidden', marginBottom: 20 }
  const sectionHeader: React.CSSProperties = {
    padding: '14px 20px', borderBottom: '1px solid var(--border)',
    fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase',
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <Link
          href="/admin"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 600, textDecoration: 'none' }}
        >← Admin</Link>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 28, letterSpacing: 5, color: 'var(--text)' }}>KNOWLEDGE HUB</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>Global content · shown to all users</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={resetToDefaults}
            disabled={!content || saving}
            style={{ ...removeBtn, padding: '8px 14px', fontSize: 10, opacity: !content || saving ? 0.5 : 1 }}
          >Reset to defaults</button>
          <button
            onClick={handleSave}
            disabled={!content || saving}
            style={{ ...addBtn, padding: '10px 18px', fontSize: 11, opacity: !content || saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save All'}
          </button>
        </div>
      </div>

      {loadError && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{loadError}</div>
      )}
      {saveError && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{saveError}</div>
      )}

      {!content && !loadError && (
        <div style={{ padding: '40px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>
      )}

      {content && (
        <>
          {/* ── VIDEOS ─────────────────────────────────────────────── */}
          <div className="card" style={cardStyle}>
            <div style={sectionHeader}>🎥 Videos ({content.videos.length})</div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {content.videos.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'var(--surface2)', borderRadius: 6, flexWrap: 'wrap' }}>
                  {/* Thumbnail preview */}
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/default.jpg`}
                    alt={v.title}
                    referrerPolicy="no-referrer"
                    style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 4, flexShrink: 0, background: 'var(--bg)' }}
                  />
                  <div style={{ flex: '1 1 240px', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <input
                      style={{ ...inputStyle, padding: '6px 10px' }}
                      value={v.title}
                      placeholder="Title"
                      onChange={e => updateVideo(i, { title: e.target.value })}
                    />
                    <input
                      style={{ ...inputStyle, padding: '6px 10px', fontSize: 11, color: 'var(--text3)' }}
                      value={v.id}
                      placeholder="YouTube ID"
                      onChange={e => updateVideo(i, { id: extractYoutubeId(e.target.value) })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button style={iconBtn} title="Move up"   onClick={() => moveVideo(i, -1)}>↑</button>
                    <button style={iconBtn} title="Move down" onClick={() => moveVideo(i,  1)}>↓</button>
                    <button style={removeBtn} onClick={() => removeVideo(i)}>Remove</button>
                  </div>
                </div>
              ))}

              {/* Add video form */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px dashed var(--border)' }}>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabel}>YouTube URL or ID</label>
                  <input
                    style={inputStyle}
                    placeholder="https://youtu.be/…"
                    value={newVideoUrl}
                    onChange={e => setNewVideoUrl(e.target.value)}
                  />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabel}>Title</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. Discipline"
                    value={newVideoTitle}
                    onChange={e => setNewVideoTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addVideo()}
                  />
                </div>
                <div style={{ alignSelf: 'flex-end' }}>
                  <button style={addBtn} onClick={addVideo}>Add Video</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── INTRO ──────────────────────────────────────────────── */}
          <div className="card" style={cardStyle}>
            <div style={sectionHeader}>📝 Core Reading · Intro</div>
            <div style={{ padding: '16px 20px' }}>
              <textarea
                style={textareaStyle}
                value={content.intro}
                placeholder="Intro paragraph shown above the book list…"
                maxLength={2000}
                onChange={e => updateContent({ intro: e.target.value })}
              />
              <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6, textAlign: 'right' }}>
                {content.intro.length} / 2000
              </div>
            </div>
          </div>

          {/* ── BOOKS ──────────────────────────────────────────────── */}
          <div className="card" style={cardStyle}>
            <div style={sectionHeader}>📚 Books ({content.books.length})</div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {content.books.map((b, i) => (
                <div key={i} style={{ padding: 10, background: 'var(--surface2)', borderRadius: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 0 }}>
                    <div style={{ flex: '2 1 240px' }}>
                      <label style={fieldLabel}>Title</label>
                      <input style={{ ...inputStyle, padding: '6px 10px' }}
                        value={b.title} placeholder="Book title"
                        onChange={e => updateBook(i, { title: e.target.value })} />
                    </div>
                    <div style={{ flex: '1 1 160px' }}>
                      <label style={fieldLabel}>Author</label>
                      <input style={{ ...inputStyle, padding: '6px 10px' }}
                        value={b.author} placeholder="Author"
                        onChange={e => updateBook(i, { author: e.target.value })} />
                    </div>
                    <div style={{ width: 78 }}>
                      <label style={fieldLabel}>Year</label>
                      <input style={{ ...inputStyle, padding: '6px 10px' }}
                        type="number" min={0} max={3000}
                        value={b.year ?? ''} placeholder="—"
                        onChange={e => updateBook(i, { year: e.target.value === '' ? undefined : Number(e.target.value) })} />
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button style={iconBtn} title="Move up"   onClick={() => moveBook(i, -1)}>↑</button>
                      <button style={iconBtn} title="Move down" onClick={() => moveBook(i,  1)}>↓</button>
                      <button style={removeBtn} onClick={() => removeBook(i)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add book form */}
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px dashed var(--border)', alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <label style={fieldLabel}>Title</label>
                  <input
                    style={inputStyle}
                    placeholder="Book title"
                    value={newBookTitle}
                    onChange={e => setNewBookTitle(e.target.value)}
                  />
                </div>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={fieldLabel}>Author</label>
                  <input
                    style={inputStyle}
                    placeholder="Author"
                    value={newBookAuthor}
                    onChange={e => setNewBookAuthor(e.target.value)}
                  />
                </div>
                <div style={{ width: 86 }}>
                  <label style={fieldLabel}>Year</label>
                  <input
                    style={inputStyle}
                    type="number" min={0} max={3000}
                    placeholder="opt."
                    value={newBookYear}
                    onChange={e => setNewBookYear(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addBook()}
                  />
                </div>
                <button style={addBtn} onClick={addBook}>Add Book</button>
              </div>
            </div>
          </div>

          {/* ── PODCASTS ───────────────────────────────────────────── */}
          <div className="card" style={cardStyle}>
            <div style={sectionHeader}>🎙 Recommended Podcasts ({content.podcasts.length})</div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {content.podcasts.map((p, i) => (
                <div key={i} style={{ padding: 12, background: 'var(--surface2)', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px', minWidth: 160 }}>
                      <label style={fieldLabel}>Name</label>
                      <input
                        style={{ ...inputStyle, padding: '6px 10px' }}
                        value={p.name}
                        placeholder="Podcast name"
                        maxLength={100}
                        onChange={e => updatePodcast(i, { name: e.target.value })}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button style={iconBtn} title="Move up"   onClick={() => movePodcast(i, -1)}>↑</button>
                      <button style={iconBtn} title="Move down" onClick={() => movePodcast(i,  1)}>↓</button>
                      <button style={removeBtn} onClick={() => removePodcast(i)}>Remove</button>
                    </div>
                  </div>
                  <div>
                    <label style={fieldLabel}>Description</label>
                    <textarea
                      style={{ ...textareaStyle, minHeight: 70 }}
                      value={p.description}
                      placeholder="One or two sentences."
                      maxLength={1000}
                      onChange={e => updatePodcast(i, { description: e.target.value })}
                    />
                    <div style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4, textAlign: 'right' }}>
                      {p.description.length} / 1000
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ paddingTop: content.podcasts.length > 0 ? 6 : 0, borderTop: content.podcasts.length > 0 ? '1px dashed var(--border)' : 'none' }}>
                <button style={addBtn} onClick={addPodcast}>Add Podcast</button>
              </div>
            </div>
          </div>

          {/* Sticky-ish footer save */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ ...addBtn, padding: '12px 22px', fontSize: 12, opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save All'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
