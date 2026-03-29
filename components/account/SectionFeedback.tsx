'use client'

import { useState } from 'react'
import { StickyNote, X } from 'lucide-react'

const REACTIONS = ['👍', '👎', '💡', '⚠️', '🎯']

export function SectionFeedback({ compact = false }: { compact?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [noteOpen, setNoteOpen] = useState(false)
  const [note, setNote] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  function saveNote() {
    if (!note.trim()) return
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  return (
    <div
      className={`flex flex-col gap-1 ${compact ? 'mt-1' : 'mt-3 pt-2'}`}
      style={{ borderTop: compact ? 'none' : '1px solid var(--border-faint)' }}
    >
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs mr-1" style={{ color: 'var(--text-faint)' }}>Feedback:</span>
        {REACTIONS.map(r => (
          <button
            key={r}
            onClick={() => setSelected(r === selected ? null : r)}
            className="text-xs rounded px-1.5 py-0.5 transition-all"
            style={{
              background: selected === r ? 'var(--accent-bg-medium, rgba(87,94,207,0.15))' : 'transparent',
              opacity: selected && selected !== r ? 0.4 : 1,
            }}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() => setNoteOpen(o => !o)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg ml-1 transition-all"
          style={{
            background: noteOpen ? 'rgba(250,204,21,0.12)' : 'var(--surface)',
            color: noteOpen ? '#facc15' : 'var(--text-muted)',
            border: `1px solid ${noteOpen ? 'rgba(250,204,21,0.3)' : 'var(--border-subtle)'}`,
          }}
          title="Add a note"
        >
          <StickyNote className="w-3 h-3" />
          Note
        </button>
      </div>

      {noteOpen && (
        <div
          className="mt-1 rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(250,204,21,0.25)', background: 'var(--bg)' }}
        >
          <div
            className="flex items-center justify-between px-3 py-1.5"
            style={{ borderBottom: '1px solid rgba(250,204,21,0.15)', background: 'rgba(250,204,21,0.05)' }}
          >
            <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#facc15' }}>
              <StickyNote className="w-3 h-3" /> Add Note
            </span>
            <button onClick={() => setNoteOpen(false)} style={{ color: 'var(--text-muted)' }}>
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="p-2.5">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full text-xs rounded-lg px-2.5 py-1.5 outline-none resize-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                minHeight: '60px',
              }}
              placeholder="Add a note…"
            />
            <div className="flex justify-end mt-1.5">
              <button
                onClick={saveNote}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: noteSaved ? 'rgba(74,222,128,0.15)' : 'var(--accent)',
                  color: noteSaved ? '#4ade80' : '#fff',
                  border: `1px solid ${noteSaved ? 'rgba(74,222,128,0.3)' : 'transparent'}`,
                }}
              >
                {noteSaved ? 'Saved ✓' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
