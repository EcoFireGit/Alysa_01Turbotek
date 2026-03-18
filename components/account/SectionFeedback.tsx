'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'

const REACTIONS = ['👍', '👎', '💡', '⚠️', '🎯']

export function SectionFeedback({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [showNote, setShowNote] = useState(false)

  return (
    <div
      className={`flex items-center gap-1 flex-wrap ${compact ? 'mt-1' : 'mt-3 pt-2'}`}
      style={{ borderTop: compact ? 'none' : '1px solid var(--border-faint)' }}
    >
      <span className="text-xs mr-1" style={{ color: 'var(--text-faint)' }}>Feedback:</span>
      {REACTIONS.map(r => (
        <button
          key={r}
          onClick={() => setSelected(r === selected ? null : r)}
          className="text-xs rounded px-1.5 py-0.5 transition-all"
          style={{
            background: selected === r ? 'var(--accent-bg-medium)' : 'transparent',
            opacity: selected && selected !== r ? 0.4 : 1,
          }}
        >
          {r}
        </button>
      ))}
      <button
        onClick={() => setShowNote(n => !n)}
        className="ml-1"
        style={{ color: 'var(--text-muted)' }}
        title="Add note"
      >
        <MessageSquare className="w-3 h-3" />
      </button>
      {showNote && (
        <textarea
          className="text-xs rounded px-2 py-1 w-full mt-1 outline-none resize-none"
          style={{
            background: 'var(--surface-deep)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          placeholder="Add a note..."
          rows={2}
        />
      )}
    </div>
  )
}
