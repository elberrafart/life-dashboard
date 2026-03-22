'use client'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/lib/context'
import { getTodayKey } from '@/lib/store'

const PROMPTS = [
  "What's your #1 priority today?",
  'What would make today a win?',
  'What are you grateful for right now?',
  'What challenge will you push through today?',
  'What one action will move you closer to your goals?',
  'How are you showing up for yourself today?',
  'What did you accomplish yesterday that you can build on?',
]

function getDailyPrompt(): string {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  return PROMPTS[dayOfYear % PROMPTS.length]
}

export default function DailyJournal() {
  const { state, dispatch } = useApp()
  const todayKey = getTodayKey()
  const [text, setText] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [saved, setSaved] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load today's entry on mount
  useEffect(() => {
    const entry = state.journalEntries?.[todayKey] ?? ''
    setText(entry)
  }, [todayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave with debounce
  function handleChange(val: string) {
    setText(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      dispatch({ type: 'SAVE_JOURNAL', payload: { date: todayKey, text: val } })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 600)
  }

  const prompt = getDailyPrompt()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // Past entries (sorted newest first, excluding today)
  const pastEntries = Object.entries(state.journalEntries ?? {})
    .filter(([date, text]) => date !== todayKey && text.trim().length > 0)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Today's entry */}
      <div className="card" style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 2 }}>
              📓 Daily Journal
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{today}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {saved && (
              <span style={{ fontSize: 10, color: 'var(--green)', letterSpacing: 1, textTransform: 'uppercase' }}>
                ✓ Saved
              </span>
            )}
            {pastEntries.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                  color: 'var(--text3)', padding: '4px 10px', fontSize: 10, letterSpacing: 1,
                  textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-dm)',
                }}
              >
                {showHistory ? 'Hide' : 'History'}
              </button>
            )}
          </div>
        </div>

        {/* Daily prompt */}
        <div style={{
          padding: '10px 14px',
          background: 'var(--surface2)',
          borderRadius: 8,
          borderLeft: '2px solid var(--gold)',
          marginBottom: 12,
          fontSize: 12,
          color: 'var(--text2)',
          fontStyle: 'italic',
        }}>
          💭 {prompt}
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={e => handleChange(e.target.value)}
          placeholder="Write your thoughts for today..."
          style={{
            width: '100%',
            minHeight: 160,
            resize: 'vertical',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '12px 14px',
            fontSize: 14,
            color: 'var(--text)',
            lineHeight: 1.7,
            outline: 'none',
            fontFamily: 'var(--font-dm)',
            transition: 'border-color 150ms',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--silver2)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 8, fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
        }}>
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span>Auto-saves as you type</span>
        </div>
      </div>

      {/* Past entries */}
      {showHistory && pastEntries.length > 0 && (
        <div className="card" style={{ padding: '20px 22px' }}>
          <div style={{ fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
            Past Entries
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pastEntries.map(([date, entryText]) => {
              const d = new Date(date + 'T00:00:00')
              const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
              const preview = entryText.trim().slice(0, 120) + (entryText.length > 120 ? '…' : '')
              return (
                <div
                  key={date}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{preview}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
