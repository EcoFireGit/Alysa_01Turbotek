'use client'

import { useState } from 'react'

interface SourcesPanelProps {
  sources?: string[]
  confidence?: 'high' | 'moderate' | 'low'
  dataGaps?: string[]
}

const sourceIcons: Record<string, string> = {
  Salesforce: '☁️',
  ServiceNow: '🎫',
  'MS Teams': '💬',
  Email: '📧',
  Jira: '🔧',
  Forrester: '📊',
  IDC: '📈',
}

const confidenceConfig = {
  high:     { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',     label: '🟢 High Confidence' },
  moderate: { color: '#facc15', bg: 'rgba(250,204,21,0.1)',    label: '🟡 Moderate Confidence' },
  low:      { color: '#f87171', bg: 'rgba(248,113,113,0.1)',   label: '🔴 Low Confidence' },
}

export function SourcesPanel({ sources, confidence = 'moderate', dataGaps }: SourcesPanelProps) {
  const [open, setOpen] = useState(false)
  const conf = confidenceConfig[confidence]

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-subtle)' }}
    >
      {/* Collapsed header — always visible */}
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 transition-all"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">ℹ️</span>
          <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            SOURCES & EVIDENCE
          </span>
          {/* Confidence pill — visible even when collapsed */}
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: conf.bg, color: conf.color }}
          >
            {conf.label}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border-faint)' }}>
          {sources && sources.length > 0 && (
            <div className="pt-3">
              <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Data Sources</div>
              <div className="flex flex-wrap gap-1.5">
                {sources.map(source => (
                  <span
                    key={source}
                    className="text-xs px-2 py-1 rounded-md flex items-center gap-1"
                    style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}
                  >
                    <span>{sourceIcons[source] || '📁'}</span>
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {dataGaps && dataGaps.length > 0 && (
            <div>
              <div className="text-xs mb-2" style={{ color: '#facc15' }}>⚠️ Data Gaps</div>
              <div className="space-y-1">
                {dataGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="text-xs px-2 py-1 rounded-md"
                    style={{ background: 'rgba(250,204,21,0.06)', color: '#a89a60', border: '1px solid rgba(250,204,21,0.15)' }}
                  >
                    {gap}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="text-xs px-2 py-1.5 rounded-md"
            style={{ background: 'var(--surface-faint)', color: 'var(--text-muted)', border: '1px solid var(--border-faint)' }}
          >
            ⚠️ Client-side Jira unavailable — delivery risk signals may be incomplete
          </div>
        </div>
      )}
    </div>
  )
}
