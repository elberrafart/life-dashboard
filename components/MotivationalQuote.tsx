'use client'
import { useEffect, useState } from 'react'
import { getDailyQuote } from '@/lib/animations'

export default function MotivationalQuote() {
  const [visible, setVisible] = useState(false)
  const quote = getDailyQuote()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ padding: '16px 40px 0', opacity: visible ? 1 : 0, transition: 'opacity 600ms ease' }} className="sm:px-10 px-4">
      <div style={{
        padding: '12px 16px',
        borderLeft: '3px solid var(--gold)',
        background: 'var(--surface)',
        borderRadius: '0 8px 8px 0',
        border: '1px solid var(--border)',
        borderLeftColor: 'var(--gold)',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', fontStyle: 'italic', lineHeight: 1.5 }}>"{quote.text}"</div>
        <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1, marginTop: 4 }}>{quote.sub}</div>
      </div>
    </div>
  )
}
