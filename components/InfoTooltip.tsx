'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface InfoTooltipProps {
  title: string
  definition: string
  sources?: string[]
}

export function InfoTooltip({ title, definition, sources }: InfoTooltipProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => setMounted(true), [])

  function show() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.top, left: r.left + r.width / 2 })
    }
  }

  const showBelow = pos !== null && pos.top < 160
  const tooltipStyle: React.CSSProperties = pos
    ? showBelow
      ? { top: pos.top + 20, left: pos.left, transform: 'translateX(-50%)' }
      : { bottom: window.innerHeight - pos.top + 8, left: pos.left, transform: 'translateX(-50%)' }
    : {}

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        className="inline-flex items-center justify-center ml-1 cursor-help rounded-full flex-shrink-0"
        style={{
          width: 13,
          height: 13,
          background: 'var(--surface-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
          fontSize: 8,
          fontWeight: 700,
          fontStyle: 'italic',
          verticalAlign: 'middle',
          lineHeight: 1,
        }}
      >
        i
      </span>

      {mounted && pos && createPortal(
        <div
          style={{
            position: 'fixed',
            ...tooltipStyle,
            width: 224,
            zIndex: 9999,
            background: 'var(--surface-raised)',
            border: '1px solid var(--border-strong)',
            borderRadius: 10,
            padding: '10px 12px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-hover)', marginBottom: 4 }}>
            {title}
          </div>
          <div style={{ fontSize: '0.7rem', lineHeight: 1.55, color: 'var(--text-secondary)', marginBottom: sources?.length ? 8 : 0 }}>
            {definition}
          </div>
          {sources && sources.length > 0 && (
            <>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.07em', marginBottom: 4 }}>
                DATA SOURCES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {sources.map(s => (
                  <span
                    key={s}
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--accent-bg)',
                      color: 'var(--accent-light)',
                      border: '1px solid var(--accent-border)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
