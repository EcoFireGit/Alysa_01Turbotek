'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface CollapsibleCardProps {
  title: string
  icon?: ReactNode
  badge?: ReactNode
  subtitle?: string
  defaultOpen?: boolean
  headerExtra?: ReactNode
  className?: string
  children: ReactNode
}

export function CollapsibleCard({
  title,
  icon,
  badge,
  subtitle,
  defaultOpen = false,
  headerExtra,
  className = '',
  children,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={`rounded-xl overflow-hidden ${className}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {icon && <span className="flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>{icon}</span>}
          <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>{title}</span>
          {badge}
          {subtitle && (
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {headerExtra}
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{
              color: 'var(--text-muted)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border-faint)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
