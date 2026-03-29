export default function BackgroundFog() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div className="fog-blob fog-blob-1" />
      <div className="fog-blob fog-blob-2" />
      <div className="fog-blob fog-blob-3" />
      <div className="fog-blob fog-blob-4" />
    </div>
  )
}
