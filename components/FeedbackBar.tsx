'use client'

import { useState } from 'react'

interface FeedbackBarProps {
  onFeedback: (type: string, detail?: string) => void
}

const adjustOptions = [
  { id: 'scores-off',       label: 'Scores feel off' },
  { id: 'missing-context',  label: 'Missing context' },
  { id: 'too-detailed',     label: 'Too detailed' },
  { id: 'go-deeper',        label: 'Go deeper' },
  { id: 'wrong-priority',   label: 'Wrong priority order' },
  { id: 'add-source',       label: 'Add a data source' },
  { id: 'sharper-actions',  label: 'Sharpen the actions' },
  { id: 'exec-version',     label: 'Make it exec-ready' },
]

export function FeedbackBar({ onFeedback }: FeedbackBarProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleReaction(type: string) {
    setSelected(type)
    onFeedback('reaction', type)
    if (type === 'positive') setSubmitted(true)
  }

  function handleAdjust(id: string, label: string) {
    setSelected(id)
    onFeedback('adjust', label)
    setSubmitted(true)
  }

  if (submitted && selected === 'positive') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
      >
        <span className="text-sm">✅</span>
        <span className="text-xs" style={{ color: '#4ade80' }}>Noted — glad that landed well.</span>
      </div>
    )
  }

  if (submitted && selected !== 'positive') {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}
      >
        <span className="text-sm">🔄</span>
        <span className="text-xs" style={{ color: '#facc15' }}>Got it — tell me more in the chat to refine this.</span>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-3 space-y-2.5"
      style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Reaction row */}
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Was this useful?</span>
        <div className="flex gap-1.5 ml-auto">
          {[
            { id: 'positive', label: '👍', title: 'On track' },
            { id: 'negative', label: '👎', title: 'Needs work' },
            { id: 'refine',   label: '🔄', title: 'Refine' },
          ].map(r => (
            <button
              key={r.id}
              title={r.title}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all duration-150"
              style={{
                background: selected === r.id ? 'var(--accent-bg-hover)' : 'var(--surface-subtle)',
                border: `1px solid ${selected === r.id ? 'var(--accent-border-strong)' : 'var(--border)'}`,
              }}
              onClick={() => handleReaction(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adjust options — show when negative or refine selected */}
      {(selected === 'negative' || selected === 'refine') && (
        <div>
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            What would you like to adjust?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {adjustOptions.map(opt => (
              <button
                key={opt.id}
                className="text-xs px-2.5 py-1 rounded-lg transition-all duration-150"
                style={{
                  background: 'var(--accent-bg-soft)',
                  color: 'var(--accent-light)',
                  border: '1px solid var(--accent-border)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget).style.background = 'var(--accent-bg-hover)'
                  ;(e.currentTarget).style.borderColor = 'var(--accent-border-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget).style.background = 'var(--accent-bg-soft)'
                  ;(e.currentTarget).style.borderColor = 'var(--accent-border)'
                }}
                onClick={() => handleAdjust(opt.id, opt.label)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
