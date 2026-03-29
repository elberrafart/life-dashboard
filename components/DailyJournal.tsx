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

const MOODS = [
  { key: 'motivated',  emoji: '🔥', label: 'Motivated' },
  { key: 'strong',     emoji: '💪', label: 'Strong' },
  { key: 'encouraged', emoji: '✨', label: 'Encouraged' },
  { key: 'focused',    emoji: '🎯', label: 'Focused' },
  { key: 'grateful',   emoji: '🙏', label: 'Grateful' },
  { key: 'calm',       emoji: '🌊', label: 'Calm' },
  { key: 'sad',        emoji: '😔', label: 'Sad' },
  { key: 'mad',        emoji: '😤', label: 'Mad' },
  { key: 'drained',    emoji: '😞', label: 'Drained' },
  { key: 'anxious',    emoji: '😰', label: 'Anxious' },
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

  const todayMood = state.moodLog?.[todayKey] ?? ''

  useEffect(() => {
    const entry = state.journalEntries?.[todayKey] ?? ''
    setText(entry)
  }, [todayKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleChange(val: string) {
    setText(val)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      dispatch({ type: 'SAVE_JOURNAL', payload: { date: todayKey, text: val } })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 600)
  }

  function handleMood(key: string) {
    dispatch({ type: 'SAVE_MOOD', payload: { date: todayKey, mood: key } })
  }

  const prompt = getDailyPrompt()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const pastEntries = Object.entries(state.journalEntries ?? {})
    .filter(([date, t]) => date !== todayKey && t.trim().length > 0)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7)

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="card" style={{ padding: '20px 22px' }}>
        {/* Header */}
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

        {/* Textarea */}
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
          marginTop: 8, marginBottom: 20, fontSize: 10, color: 'var(--text3)', letterSpacing: 1,
        }}>
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span>Auto-saves as you type</span>
        </div>

        {/* Mood picker */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
            How do you feel today?
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map(({ key, emoji, label }) => {
              const selected = todayMood === key
              return (
                <button
                  key={key}
                  onClick={() => handleMood(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px',
                    borderRadius: 99,
                    border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
                    background: selected ? 'rgba(201,168,76,0.12)' : 'var(--surface2)',
                    color: selected ? 'var(--gold)' : 'var(--text2)',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-dm)',
                    fontWeight: selected ? 600 : 400,
                    transition: 'all 150ms',
                    letterSpacing: 0.3,
                  }}
                >
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{emoji}</span>
                  {label}
                </button>
              )
            })}
          </div>
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
              const mood = state.moodLog?.[date]
              const moodData = mood ? MOODS.find(m => m.key === mood) : null
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase' }}>
                      {label}
                    </div>
                    {moodData && (
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {moodData.emoji} {moodData.label}
                      </span>
                    )}
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
