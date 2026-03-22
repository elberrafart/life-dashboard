'use client'
import { useEffect, useRef, useState } from 'react'

type Ripple = { id: number; x: number; y: number }

export default function MouseEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleId = useRef(0)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (spotlightRef.current) {
        spotlightRef.current.style.background =
          `radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, rgba(201,168,76,0.06) 0%, rgba(201,168,76,0.02) 35%, transparent 70%)`
      }
    }

    function onClick(e: MouseEvent) {
      const id = ++rippleId.current
      setRipples(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <>
      {/* Spotlight */}
      <div
        ref={spotlightRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'background 80ms linear',
        }}
      />

      {/* Ripples */}
      {ripples.map(r => (
        <div
          key={r.id}
          style={{
            position: 'fixed',
            left: r.x,
            top: r.y,
            width: 0,
            height: 0,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            width: 200,
            height: 200,
            borderRadius: '50%',
            border: '1.5px solid rgba(201,168,76,0.5)',
            animation: 'rippleExpand 650ms cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
          }} />
        </div>
      ))}

      <style>{`
        @keyframes rippleExpand {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1);   opacity: 0; }
        }
      `}</style>
    </>
  )
}
