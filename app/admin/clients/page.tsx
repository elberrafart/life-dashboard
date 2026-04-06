'use client'
import { useState, useEffect } from 'react'
import {
  getAllProfiles, getProfileCheckIns, adminGetUserAppState, adminSetUserLists, type UserProfile,
} from '@/app/actions/profiles'
import { getLevelInfo } from '@/lib/types'
import CheckInCalendar from '@/components/CheckInCalendar'
import type { AppState, Habit, Goal, KanbanCard } from '@/lib/types'

type CheckIn = {
  id: string; date: string; mood: string | null; note: string | null
  xp_today: number; habits_completed: number; created_at: string
}
type EditSection = 'habits' | 'goals' | 'kanban' | null

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }

// ── Section header with Edit / Save / Cancel ─────────────────────────────────
function SectionBar({
  title, editing, saving, onEdit, onSave, onCancel,
}: {
  title: string; editing: boolean; saving: boolean
  onEdit: () => void; onSave: () => void; onCancel: () => void
}) {
  const btn = (label: string, onClick: () => void, accent?: boolean) => (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        background: accent ? 'var(--gold)' : 'var(--surface2)',
        color: accent ? 'var(--bg)' : 'var(--text3)',
        border: `1px solid ${accent ? 'var(--gold)' : 'var(--border2)'}`,
        borderRadius: 6, padding: '4px 12px', fontSize: 10, fontWeight: 700,
        letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer',
        fontFamily: 'var(--font-dm)', opacity: saving ? 0.5 : 1,
      }}
    >{label}</button>
  )
  return (
    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>{title}</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {!editing && btn('Edit', onEdit)}
        {editing && btn('Cancel', onCancel)}
        {editing && btn(saving ? 'Saving…' : 'Save', onSave, true)}
      </div>
    </div>
  )
}

// ── Client detail view ────────────────────────────────────────────────────────
function ClientDetail({ profile, onBack }: { profile: UserProfile; onBack: () => void }) {
  const level = getLevelInfo(profile.xp_total, profile.streak)
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [fullState, setFullState] = useState<AppState | null>(null)
  const [editSection, setEditSection] = useState<EditSection>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Editable copies
  const [editHabits, setEditHabits] = useState<Habit[]>([])
  const [editGoals, setEditGoals] = useState<Goal[]>([])
  const [editKanban, setEditKanban] = useState<KanbanCard[]>([])

  // Add-form state
  const [newHabitLabel, setNewHabitLabel] = useState('')
  const [newHabitXP, setNewHabitXP] = useState<10 | 25 | 50>(25)
  const [newGoalEmoji, setNewGoalEmoji] = useState('')
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalCategory, setNewGoalCategory] = useState('')
  const [newCardName, setNewCardName] = useState('')
  const [newCardPriority, setNewCardPriority] = useState<'high' | 'medium' | 'low'>('medium')

  useEffect(() => {
    getProfileCheckIns(profile.user_id)
      .then(d => setCheckIns(d as CheckIn[]))
      .catch(() => {})
    adminGetUserAppState(profile.user_id)
      .then(s => setFullState(s))
      .catch(() => {})
  }, [profile.user_id])

  function startEdit(section: EditSection) {
    setSaveError(null)
    setEditSection(section)
    if (section === 'habits') setEditHabits(fullState?.habits ?? [])
    if (section === 'goals') setEditGoals(fullState?.goals ?? [])
    if (section === 'kanban') setEditKanban((fullState?.kanban ?? []).filter(k => k.column !== 'done'))
    setNewHabitLabel(''); setNewGoalEmoji(''); setNewGoalName(''); setNewGoalCategory(''); setNewCardName('')
  }

  function cancelEdit() { setEditSection(null); setSaveError(null) }

  async function saveSection(section: EditSection) {
    setSaving(true); setSaveError(null)
    const patch =
      section === 'habits' ? { habits: editHabits } :
      section === 'goals'  ? { goals: editGoals } :
      section === 'kanban' ? {
        kanban: [
          ...editKanban,
          ...(fullState?.kanban ?? []).filter(k => k.column === 'done'),
        ],
      } : {}

    const result = await adminSetUserLists(profile.user_id, patch)
    setSaving(false)
    if (result.error) { setSaveError(result.error); return }
    // Update local fullState to reflect saved changes
    setFullState(prev => prev ? { ...prev, ...patch } : prev)
    setEditSection(null)
  }

  const habits = fullState?.habits ?? []
  const goals  = fullState?.goals  ?? []
  const kanban = (fullState?.kanban ?? []).filter(k => k.column !== 'done')

  const inputStyle: React.CSSProperties = {
    background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '7px 10px', color: 'var(--text)', fontSize: 12, outline: 'none',
    fontFamily: 'var(--font-dm)',
  }
  const addBtnStyle: React.CSSProperties = {
    background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 6,
    padding: '7px 14px', fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
    textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', whiteSpace: 'nowrap',
  }
  const removeBtnStyle: React.CSSProperties = {
    background: 'transparent', border: '1px solid rgba(224,92,92,0.3)', borderRadius: 4,
    padding: '3px 8px', fontSize: 9, color: '#e05c5c', cursor: 'pointer',
    letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-dm)',
  }
  const priorityColor = { high: '#e05c5c', medium: 'var(--gold)', low: 'var(--text3)' }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={onBack}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)', fontWeight: 600 }}
        >← Clients</button>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 26, letterSpacing: 4, color: 'var(--text)' }}>
            {profile.display_name || profile.user_email}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>{profile.user_email}</div>
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{saveError}</div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Level', value: `${level.emoji} ${level.level}` },
          { label: 'Rank',  value: level.name },
          { label: 'Total XP', value: profile.xp_total.toLocaleString() },
          { label: 'Streak', value: `${profile.streak} days` },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontFamily: 'var(--font-bebas)', letterSpacing: 2, color: 'var(--gold)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Goals */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <SectionBar
          title={`Goals (${editSection === 'goals' ? editGoals.length : goals.length})`}
          editing={editSection === 'goals'} saving={saving}
          onEdit={() => startEdit('goals')}
          onSave={() => saveSection('goals')}
          onCancel={cancelEdit}
        />
        {editSection === 'goals' ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editGoals.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 6 }}>
                <span style={{ fontSize: 18 }}>{g.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{g.category} · {g.tasks.length} tasks</div>
                </div>
                <button style={removeBtnStyle} onClick={() => setEditGoals(prev => prev.filter(x => x.id !== g.id))}>Remove</button>
              </div>
            ))}
            {/* Add form */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <input style={{ ...inputStyle, width: 48 }} placeholder="🏆" value={newGoalEmoji} onChange={e => setNewGoalEmoji(e.target.value)} maxLength={4} />
              <input style={{ ...inputStyle, flex: 1, minWidth: 120 }} placeholder="Goal name" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} />
              <input style={{ ...inputStyle, width: 120 }} placeholder="Category" value={newGoalCategory} onChange={e => setNewGoalCategory(e.target.value)} />
              <button style={addBtnStyle} onClick={() => {
                if (!newGoalName.trim()) return
                setEditGoals(prev => [...prev, { id: `g-${uid()}`, emoji: newGoalEmoji || '🎯', name: newGoalName.trim(), category: newGoalCategory.trim() || 'General', xp: 0, tasks: [] }])
                setNewGoalEmoji(''); setNewGoalName(''); setNewGoalCategory('')
              }}>Add Goal</button>
            </div>
          </div>
        ) : (
          <>
            {goals.length === 0 && <div style={{ padding: '20px', fontSize: 12, color: 'var(--text3)' }}>No goals assigned yet</div>}
            {goals.map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: i < goals.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 18 }}>{g.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>{g.category} · {g.tasks.length} tasks</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>{g.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Habits */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <SectionBar
          title={`Habits (${editSection === 'habits' ? editHabits.length : habits.length})`}
          editing={editSection === 'habits'} saving={saving}
          onEdit={() => startEdit('habits')}
          onSave={() => saveSection('habits')}
          onCancel={cancelEdit}
        />
        {editSection === 'habits' ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editHabits.map(h => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 6 }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>{h.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gold)', marginRight: 8 }}>{h.xp} XP</div>
                <button style={removeBtnStyle} onClick={() => setEditHabits(prev => prev.filter(x => x.id !== h.id))}>Remove</button>
              </div>
            ))}
            {/* Add form */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Habit label" value={newHabitLabel} onChange={e => setNewHabitLabel(e.target.value)} />
              <select
                value={newHabitXP}
                onChange={e => setNewHabitXP(Number(e.target.value) as 10 | 25 | 50)}
                style={{ ...inputStyle, width: 80 }}
              >
                {[10, 25, 50].map(v => <option key={v} value={v}>{v} XP</option>)}
              </select>
              <button style={addBtnStyle} onClick={() => {
                if (!newHabitLabel.trim()) return
                setEditHabits(prev => [...prev, { id: `h-${uid()}`, label: newHabitLabel.trim(), xp: newHabitXP }])
                setNewHabitLabel('')
              }}>Add Habit</button>
            </div>
          </div>
        ) : (
          <>
            {habits.length === 0 && <div style={{ padding: '20px', fontSize: 12, color: 'var(--text3)' }}>No habits assigned yet</div>}
            {habits.map((h, i) => (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', borderBottom: i < habits.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>{h.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gold)' }}>{h.xp} XP</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Kanban */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <SectionBar
          title={`Tasks / Kanban (${editSection === 'kanban' ? editKanban.length : kanban.length})`}
          editing={editSection === 'kanban'} saving={saving}
          onEdit={() => startEdit('kanban')}
          onSave={() => saveSection('kanban')}
          onCancel={cancelEdit}
        />
        {editSection === 'kanban' ? (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {editKanban.map(k => (
              <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 6 }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text)' }}>{k.name}</div>
                <span style={{ fontSize: 9, color: (priorityColor as Record<string, string>)[k.priority], letterSpacing: 1, textTransform: 'uppercase' }}>{k.priority}</span>
                <button style={removeBtnStyle} onClick={() => setEditKanban(prev => prev.filter(x => x.id !== k.id))}>Remove</button>
              </div>
            ))}
            {/* Add form */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <input style={{ ...inputStyle, flex: 1, minWidth: 160 }} placeholder="Task name" value={newCardName} onChange={e => setNewCardName(e.target.value)} />
              <select
                value={newCardPriority}
                onChange={e => setNewCardPriority(e.target.value as 'high' | 'medium' | 'low')}
                style={{ ...inputStyle, width: 100 }}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button style={addBtnStyle} onClick={() => {
                if (!newCardName.trim()) return
                setEditKanban(prev => [...prev, { id: `k-${uid()}`, name: newCardName.trim(), column: 'todo', priority: newCardPriority, createdAt: new Date().toISOString() }])
                setNewCardName('')
              }}>Add Task</button>
            </div>
          </div>
        ) : (
          <>
            {kanban.length === 0 && <div style={{ padding: '20px', fontSize: 12, color: 'var(--text3)' }}>No tasks assigned yet</div>}
            {kanban.map((k, i) => (
              <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: i < kanban.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--text2)' }}>{k.name}</div>
                <span style={{ fontSize: 9, color: (priorityColor as Record<string, string>)[k.priority], letterSpacing: 1, textTransform: 'uppercase', marginRight: 8 }}>{k.priority}</span>
                <span style={{ fontSize: 9, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px' }}>{k.column}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Check-in history */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, letterSpacing: 2, color: 'var(--silver)', textTransform: 'uppercase' }}>
          Check-In History ({checkIns.length})
        </div>
        {checkIns.length === 0
          ? <div style={{ padding: '28px 20px', fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>No check-ins yet</div>
          : <div style={{ padding: '20px 24px 24px' }}><CheckInCalendar checkIns={checkIns} /></div>
        }
      </div>

      <div style={{ marginTop: 16, fontSize: 10, color: 'var(--text3)', textAlign: 'right', letterSpacing: 1 }}>
        Last synced {new Date(profile.updated_at).toLocaleString()}
      </div>
    </div>
  )
}

// ── Client list ───────────────────────────────────────────────────────────────
export default function ClientsPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [selected, setSelected] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAllProfiles()
      .then(setProfiles)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (selected) return <ClientDetail profile={selected} onBack={() => setSelected(null)} />

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-bebas)', fontSize: 32, letterSpacing: 5, color: 'var(--text)', marginBottom: 4 }}>CLIENTS</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase' }}>Coaching Dashboard</div>
        </div>
        <a
          href="/admin"
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', color: 'var(--text3)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'var(--font-dm)', fontWeight: 600 }}
          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text3)' }}
        >← Admin</a>
      </div>

      {error && <div style={{ marginBottom: 20, padding: '10px 14px', background: 'rgba(224,92,92,0.08)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 8, fontSize: 12, color: '#e05c5c' }}>{error}</div>}
      {loading && <div style={{ padding: '40px', color: 'var(--text3)', fontSize: 13, textAlign: 'center' }}>Loading…</div>}
      {!loading && profiles.length === 0 && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.8 }}>
            No client data yet.<br />
            <span style={{ fontSize: 11 }}>Data appears here once users log in and use the app.</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {profiles.map(p => {
          const level = getLevelInfo(p.xp_total, p.streak)
          return (
            <div
              key={p.user_id}
              onClick={() => setSelected(p)}
              className="card"
              style={{ padding: '18px 24px', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 16, transition: 'border-color 150ms' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-dm)', fontWeight: 700 }}>
                    {p.display_name || p.user_email}
                  </span>
                  <span style={{ fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, background: 'rgba(201,168,76,0.12)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                    {level.emoji} {level.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.xp_total.toLocaleString()} XP</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.streak}d streak</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.goals?.length ?? 0} goals</span>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{p.kanban_done} tasks done</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>
                  {new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: 1 }}>View →</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
