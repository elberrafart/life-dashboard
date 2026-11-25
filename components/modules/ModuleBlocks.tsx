import { Fragment, type ReactNode } from 'react'
import { ModuleBlock, isSafeUrl, videoEmbedUrl } from '@/lib/modules'

// Renders module blocks. No hooks, so it works in both server and client
// components. Text is rendered through a tiny Markdown subset that produces
// React elements — never raw HTML.

const MODULE_CSS = `
  .mb-root { display: flex; flex-direction: column; gap: 22px; font-family: var(--font-dm); }
  .mb-heading {
    font-family: var(--font-bebas); font-size: 15px; letter-spacing: 4px;
    color: var(--text3); text-transform: uppercase;
    display: flex; align-items: center; gap: 12px; margin-top: 8px;
  }
  .mb-heading::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .mb-text { font-size: 14px; color: var(--text2); line-height: 1.7; }
  .mb-text p { margin: 0 0 12px; }
  .mb-text p:last-child { margin-bottom: 0; }
  .mb-text ul, .mb-text ol { margin: 0 0 12px; padding-left: 22px; display: flex; flex-direction: column; gap: 6px; }
  .mb-text strong { color: var(--text); font-weight: 600; }
  .mb-text a, .mb-link {
    color: var(--gold); text-decoration: none;
    border-bottom: 1px solid rgba(245,197,24,0.35);
  }
  .mb-text a:hover, .mb-link:hover { border-bottom-color: var(--gold); }
  .mb-video {
    position: relative; width: 100%; aspect-ratio: 16 / 9;
    border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #000;
  }
  .mb-video iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
  .mb-caption { font-size: 12px; color: var(--text3); margin-top: 8px; letter-spacing: 0.3px; }
  .mb-image { width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--border); display: block; }
  .mb-button {
    display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
    background: var(--gold, #f5c518); color: #0a0a08; text-decoration: none;
    padding: 12px 22px; border-radius: 8px;
    font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
    box-shadow: 0 0 12px rgba(245,197,24,0.25); transition: filter 150ms;
  }
  .mb-button:hover { filter: brightness(1.1); }
  .mb-callout {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 14px 16px; border-radius: 8px;
    background: rgba(245,197,24,0.06); border: 1px solid rgba(245,197,24,0.25);
    font-size: 13px; color: var(--silver); line-height: 1.6;
  }
  .mb-callout-icon { font-size: 18px; line-height: 1.3; }
  .mb-books { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
  .mb-book {
    padding: 12px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px;
  }
  .mb-book-title { font-size: 13px; color: var(--text); font-weight: 600; }
  .mb-book-meta { font-size: 11px; color: var(--text3); margin-top: 3px; }
`

// ── Mini Markdown ──────────────────────────────────────────────────────────
// Supports: paragraphs, blank-line separation, "- " / "* " bullets,
// "1. " numbered lists, **bold**, *italic*, [label](url).

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const key = `${keyPrefix}-${k++}`
    if (m[1] !== undefined) out.push(<strong key={key}>{m[1]}</strong>)
    else if (m[2] !== undefined) out.push(<em key={key}>{m[2]}</em>)
    else if (m[3] !== undefined) {
      const url = m[4]
      if (isSafeUrl(url)) {
        const external = !url.startsWith('/')
        out.push(
          <a key={key} href={url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{m[3]}</a>,
        )
      } else {
        out.push(m[0])
      }
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function withBreaks(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, i) => {
    const parts = renderInline(line, `${keyPrefix}-${i}`)
    return i === 0 ? parts : [<br key={`${keyPrefix}-br-${i}`} />, ...parts]
  })
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, '\n').split(/\n\s*\n/)
  return (
    <div className="mb-text">
      {blocks.map((chunk, bi) => {
        const lines = chunk.split('\n').filter(l => l.trim() !== '')
        if (lines.length === 0) return null
        if (lines.every(l => /^\s*[-*]\s+/.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => <li key={li}>{renderInline(l.replace(/^\s*[-*]\s+/, ''), `${bi}-${li}`)}</li>)}
            </ul>
          )
        }
        if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={bi}>
              {lines.map((l, li) => <li key={li}>{renderInline(l.replace(/^\s*\d+[.)]\s+/, ''), `${bi}-${li}`)}</li>)}
            </ol>
          )
        }
        return <p key={bi}>{withBreaks(lines, String(bi))}</p>
      })}
    </div>
  )
}

// ── Blocks ─────────────────────────────────────────────────────────────────

function Block({ block }: { block: ModuleBlock }) {
  switch (block.type) {
    case 'heading':
      return <div className="mb-heading">{block.text}</div>
    case 'text':
      return <Markdown source={block.markdown} />
    case 'video':
      if (!block.videoId) return null
      return (
        <div>
          <div className="mb-video">
            <iframe
              src={videoEmbedUrl(block)}
              title={block.title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              loading="lazy"
            />
          </div>
          {block.title && <div className="mb-caption">{block.title}</div>}
        </div>
      )
    case 'image':
      if (!block.url) return null
      return (
        <figure style={{ margin: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mb-image" src={block.url} alt={block.alt} loading="lazy" referrerPolicy="no-referrer" />
          {block.caption && <figcaption className="mb-caption">{block.caption}</figcaption>}
        </figure>
      )
    case 'link': {
      if (!block.url || !isSafeUrl(block.url)) return null
      const external = !block.url.startsWith('/')
      const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
      return block.style === 'button'
        ? <a className="mb-button" href={block.url} {...ext}>{block.label} →</a>
        : <div><a className="mb-link" href={block.url} {...ext} style={{ fontSize: 14 }}>{block.label} →</a></div>
    }
    case 'callout':
      return (
        <div className="mb-callout">
          {block.icon && <span className="mb-callout-icon">{block.icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}><Markdown source={block.text} /></div>
        </div>
      )
    case 'books':
      return (
        <div className="mb-books">
          {block.items.map((b, i) => (
            <div key={i} className="mb-book">
              <div className="mb-book-title">{b.title}</div>
              {(b.author || b.year) && (
                <div className="mb-book-meta">{[b.author, b.year].filter(Boolean).join(' · ')}</div>
              )}
            </div>
          ))}
        </div>
      )
    default:
      return null
  }
}

export default function ModuleBlocks({ blocks }: { blocks: ModuleBlock[] }) {
  return (
    <div className="mb-root">
      <style>{MODULE_CSS}</style>
      {blocks.map(b => (
        <Fragment key={b.id}><Block block={b} /></Fragment>
      ))}
    </div>
  )
}
