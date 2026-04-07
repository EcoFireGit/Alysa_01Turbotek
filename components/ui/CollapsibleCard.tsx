'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown, Pencil, Check, X } from 'lucide-react'
import { InfoTooltip } from '@/components/InfoTooltip'

interface CollapsibleCardProps {
  title: string
  onTitleChange?: (title: string) => void
  icon?: ReactNode
  badge?: ReactNode
  subtitle?: string
  defaultOpen?: boolean
  headerExtra?: ReactNode
  className?: string
  infoSources?: string[]
  infoDefinition?: string
  children: ReactNode
}

export function CollapsibleCard({
  title,
  onTitleChange,
  icon,
  badge,
  subtitle,
  defaultOpen = false,
  headerExtra,
  className = '',
  infoSources,
  infoDefinition,
  children,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(title)

  function saveTitle() {
    if (titleDraft.trim()) onTitleChange?.(titleDraft.trim())
    setEditingTitle(false)
  }

  function cancelTitle() {
    setTitleDraft(title)
    setEditingTitle(false)
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="w-full flex items-center justify-between px-4 py-3 group/header">
        {/* Title area — click chevron/icon to toggle, title itself is editable */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 min-w-0 flex-1 text-left">
            {icon && <span className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{icon}</span>}
          </button>

          {editingTitle && onTitleChange ? (
            <div className="flex items-center gap-1.5 flex-1" onClick={e => e.stopPropagation()}>
              <input
                autoFocus
                className="flex-1 text-sm font-semibold rounded px-2 py-0.5"
                style={{ background: 'var(--bg)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.3))', color: 'var(--text-hover)', outline: 'none' }}
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') cancelTitle() }}
              />
              <button onClick={saveTitle} style={{ color: '#4ade80' }}><Check className="w-3.5 h-3.5" /></button>
              <button onClick={cancelTitle} style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <button onClick={() => setOpen(o => !o)} className="text-sm font-semibold text-left" style={{ color: 'var(--text-hover)' }}>
                {title}
              </button>
              {onTitleChange && (
                <button
                  onClick={e => { e.stopPropagation(); setTitleDraft(title); setEditingTitle(true) }}
                  className="opacity-0 group-hover/header:opacity-60 transition-opacity flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              {(infoSources || infoDefinition) && (
                <span onClick={e => e.stopPropagation()}>
                  <InfoTooltip
                    title={title}
                    definition={infoDefinition ?? 'Data pulled from these integrated sources.'}
                    sources={infoSources}
                  />
                </span>
              )}
              {badge}
              {subtitle && (
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {headerExtra}
          <button onClick={() => setOpen(o => !o)}>
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{
                color: 'var(--text-muted)',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border-faint)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
