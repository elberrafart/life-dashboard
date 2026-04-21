'use client'
import { useEffect, useState } from 'react'
import { getKnowledgeHub } from '@/app/actions/knowledge'
import { KnowledgeHubContent, DEFAULT_KNOWLEDGE_HUB } from '@/lib/types'

export default function KnowledgeHub({ content: contentProp }: { content?: KnowledgeHubContent } = {}) {
  const [content, setContent] = useState<KnowledgeHubContent | null>(contentProp ?? null)

  useEffect(() => {
    if (contentProp) { setContent(contentProp); return }
    let cancelled = false
    getKnowledgeHub()
      .then(c => { if (!cancelled) setContent(c) })
      .catch(() => { if (!cancelled) setContent(DEFAULT_KNOWLEDGE_HUB) })
    return () => { cancelled = true }
  }, [contentProp])

  const { videos, intro, books, podcasts } = content ?? DEFAULT_KNOWLEDGE_HUB

  return (
    <div>
      <style>{`
        /* ── Sub-headings ─────────────────────────────────────────── */
        .kh-subhead {
          font-family: var(--font-bebas);
          font-size: 16px; letter-spacing: 4px;
          color: var(--silver);
          text-transform: uppercase;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .kh-subhead:after {
          content: ''; flex: 1; height: 1px;
          background: var(--border);
        }
        .kh-subhead-icon { font-size: 18px; line-height: 1; }

        /* ── Video grid ───────────────────────────────────────────── */
        .kh-videos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }
        .kh-video-card {
          display: block; text-decoration: none;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
          transition: all 180ms cubic-bezier(0.4,0,0.2,1);
          color: inherit;
        }
        .kh-video-card:hover {
          border-color: var(--gold);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 0 16px rgba(245,197,24,0.08);
        }
        .kh-video-thumb {
          position: relative;
          aspect-ratio: 16/9;
          background: var(--surface2);
          overflow: hidden;
        }
        .kh-video-thumb img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 260ms ease-out;
          display: block;
        }
        .kh-video-card:hover .kh-video-thumb img { transform: scale(1.05); }
        .kh-video-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%);
          pointer-events: none;
        }
        .kh-video-play {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 46px; height: 46px;
          border-radius: 50%;
          background: rgba(245,197,24,0.94);
          color: #0a0a08;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; padding-left: 3px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.45);
          transition: transform 200ms, box-shadow 200ms;
        }
        .kh-video-card:hover .kh-video-play {
          transform: translate(-50%, -50%) scale(1.1);
          box-shadow: 0 8px 22px rgba(245,197,24,0.35);
        }
        .kh-video-title {
          padding: 12px 14px 13px;
          font-family: var(--font-dm);
          font-size: 12px; font-weight: 600;
          color: var(--text); letter-spacing: 0.5px;
          line-height: 1.3;
        }

        /* ── Reading intro ────────────────────────────────────────── */
        .kh-intro {
          position: relative;
          padding: 16px 20px 16px 22px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-left: 3px solid var(--gold);
          border-radius: 8px;
          font-size: 13px;
          color: var(--text2);
          line-height: 1.7;
          margin-bottom: 16px;
        }
        .kh-intro em {
          font-style: normal;
          color: var(--gold);
          font-weight: 600;
        }

        /* ── Books ────────────────────────────────────────────────── */
        .kh-books {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 10px;
        }
        .kh-book {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 8px;
          transition: all 180ms;
        }
        .kh-book:hover {
          border-color: var(--gold);
          background: linear-gradient(135deg, var(--surface) 0%, rgba(245,197,24,0.03) 100%);
        }
        .kh-book-num {
          font-family: var(--font-bebas);
          font-size: 22px;
          color: var(--gold);
          letter-spacing: 1px;
          min-width: 32px;
          opacity: 0.75;
        }
        .kh-book-body { flex: 1; min-width: 0; }
        .kh-book-title {
          font-size: 13px; font-weight: 600;
          color: var(--text);
          line-height: 1.3;
          margin-bottom: 3px;
        }
        .kh-book-author {
          font-size: 10px;
          color: var(--text3);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-family: var(--font-dm);
          font-weight: 600;
        }

        /* ── Podcast ──────────────────────────────────────────────── */
        .kh-podcast {
          position: relative;
          padding: 18px 22px;
          background:
            linear-gradient(135deg, rgba(245,197,24,0.06) 0%, transparent 60%),
            var(--surface);
          border: 1px solid var(--border2);
          border-radius: 10px;
          margin-top: 16px;
          overflow: hidden;
        }
        .kh-podcast:before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity: 0.6;
        }
        .kh-podcast-label {
          font-size: 9px; letter-spacing: 2.5px;
          color: var(--gold); text-transform: uppercase;
          font-family: var(--font-dm); font-weight: 700;
          margin-bottom: 8px;
          display: flex; align-items: center; gap: 8px;
        }
        .kh-podcast-label:before {
          content: '';
          width: 16px; height: 1px;
          background: var(--gold);
          display: inline-block;
        }
        .kh-podcast-name {
          font-family: var(--font-bebas);
          font-size: 28px; letter-spacing: 4px;
          color: var(--text);
          margin-bottom: 8px;
          line-height: 1;
        }
        .kh-podcast-desc {
          font-size: 12px; color: var(--text3);
          line-height: 1.6;
          max-width: 680px;
        }

        @media (max-width: 640px) {
          .kh-subhead { font-size: 14px; letter-spacing: 3px; }
          .kh-podcast-name { font-size: 24px; }
        }
      `}</style>

      {/* ── VIDEOS ───────────────────────────────────────────────── */}
      <div className="kh-subhead">
        <span className="kh-subhead-icon">🎥</span> Videos
      </div>
      <div className="kh-videos-grid">
        {videos.map(v => (
          <a
            key={v.id}
            href={`https://youtu.be/${v.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="kh-video-card"
          >
            <div className="kh-video-thumb">
              <img
                src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                alt={v.title}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="kh-video-overlay" />
              <div className="kh-video-play">▶</div>
            </div>
            <div className="kh-video-title">{v.title}</div>
          </a>
        ))}
      </div>

      {/* ── CORE READING ─────────────────────────────────────────── */}
      <div className="kh-subhead" style={{ marginTop: 32 }}>
        <span className="kh-subhead-icon">📚</span> Core Reading
      </div>

      <div className="kh-intro" style={{ whiteSpace: 'pre-wrap' }}>
        {intro}
      </div>

      <div className="kh-books">
        {books.map((b, i) => (
          <div key={i} className="kh-book">
            <div className="kh-book-num">{String(i + 1).padStart(2, '0')}</div>
            <div className="kh-book-body">
              <div className="kh-book-title">{b.title}</div>
              <div className="kh-book-author">
                {b.author}{b.year ? ` \u00b7 ${b.year}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PODCASTS ─────────────────────────────────────────────── */}
      {podcasts.length > 0 && (
        <>
          <div className="kh-subhead" style={{ marginTop: 32 }}>
            <span className="kh-subhead-icon">🎙</span>
            {podcasts.length > 1 ? 'Recommended Podcasts' : 'Recommended Podcast'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {podcasts.map((p, i) => (
              (p.name || p.description) && (
                <div key={i} className="kh-podcast" style={{ marginTop: 0 }}>
                  {p.name && <div className="kh-podcast-name">{p.name}</div>}
                  {p.description && (
                    <div className="kh-podcast-desc" style={{ whiteSpace: 'pre-wrap' }}>
                      {p.description}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        </>
      )}
    </div>
  )
}
