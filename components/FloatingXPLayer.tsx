'use client'
import { useApp } from '@/lib/context'

export default function FloatingXPLayer() {
  const { floatingXPs } = useApp()

  return (
    <>
      {floatingXPs.map(item => (
        <div
          key={item.id}
          className="floating-xp"
          style={{
            left: item.x,
            top: item.y,
            fontFamily: 'var(--font-bebas)',
          }}
        >
          +{item.xp} XP
        </div>
      ))}
    </>
  )
}
