'use client'

import { accounts } from '@/lib/accounts'
import { InfoTooltip } from './InfoTooltip'

interface RedFlagBriefingProps {
  onAskAbout: (prompt: string) => void
}

const typeConfig = {
  silent:   { icon: '🔇', color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', label: 'Silent' },
  cold:     { icon: '🧊', color: '#93c5fd', bg: 'rgba(147,197,253,0.08)', border: 'rgba(147,197,253,0.2)', label: 'Cold Comms' },
  critical: { icon: '🚨', color: '#fb923c', bg: 'rgba(251,146,60,0.08)',  border: 'rgba(251,146,60,0.2)',  label: 'Critical' },
}

export function RedFlagBriefing({ onAskAbout }: RedFlagBriefingProps) {
  const flagged = accounts
    .filter(a => a.redFlagSignal)
    .sort((a, b) => (b.redFlagSignal!.daysSinceContact) - (a.redFlagSignal!.daysSinceContact))
    .slice(0, 3)

  if (flagged.length === 0) return null

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--surface)', border: '1px solid rgba(248,113,113,0.2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full pulse-red"
            style={{ background: '#f87171', boxShadow: '0 0 6px #f87171' }}
          />
          <span className="text-xs font-semibold" style={{ color: '#f87171' }}>
            TODAY'S DELIVERY RED FLAGS
          </span>
          <InfoTooltip
            title="Delivery Red-Flag Summary"
            definition="Daily briefing of accounts where delivery communications have turned cold, silent, or critical. Inferred from email tone analysis, MS Teams activity, and Salesforce engagement signals."
            sources={['Email', 'MS Teams', 'Salesforce']}
          />
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Flag rows */}
      <div className="space-y-2">
        {flagged.map((account, i) => {
          const signal = account.redFlagSignal!
          const cfg = typeConfig[signal.type]
          return (
            <div
              key={account.id}
              className="flex items-start justify-between gap-3 rounded-lg px-3 py-2.5"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-sm flex-shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-hover)' }}>
                      {account.name}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {signal.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Last tone: <span style={{ color: cfg.color }}>{signal.lastTone}</span>
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {signal.daysSinceContact}d no contact
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: 'var(--accent-bg)',
                  color: 'var(--accent-light)',
                  border: '1px solid var(--accent-border)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  (e.currentTarget).style.background = 'var(--accent-bg-hover)'
                  ;(e.currentTarget).style.borderColor = 'var(--accent-border-hover)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget).style.background = 'var(--accent-bg)'
                  ;(e.currentTarget).style.borderColor = 'var(--accent-border)'
                }}
                onClick={() => onAskAbout(
                  `Draft a re-engagement plan for ${account.name}. Their comms have gone ${signal.type} for ${signal.daysSinceContact} days and the last tone was ${signal.lastTone}. What should I do in the next 48 hours?`
                )}
              >
                Take action →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
