'use client'
import { useEffect, useState } from 'react'
import { getDailyQuote } from '@/lib/animations'

export default function MotivationalQuote() {
  const [visible, setVisible] = useState(false)
  const quote = getDailyQuote()

  // Flip to visible on mount (not during SSR) so getDailyQuote's client-local
  // day-of-year doesn't produce a hydration mismatch against the server's UTC.
  useEffect(() => { setVisible(true) }, [])

  return (
    <div style={{
      textAlign: 'center',
      padding: '14px 24px 0',
      opacity: visible ? 1 : 0,
      transition: 'opacity 800ms ease',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', letterSpacing: 0.3 }}>
        "{quote.text}"
      </span>
      <span style={{ fontSize: 10, color: 'var(--text3)', opacity: 0.6, marginLeft: 6 }}>
        {quote.sub}
      </span>
    </div>
  )
}
