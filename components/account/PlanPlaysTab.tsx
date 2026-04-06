'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, MessageSquare, Target, User, Copy, ChevronDown, ChevronRight } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionFeedback } from './SectionFeedback'
import { AccountData } from '@/lib/types'

const STATUS_STYLE = (s: string) =>
  s === 'Done' ? { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' }
  : s === 'In Progress' ? { color: '#a5b4fc', bg: 'rgba(165,180,252,0.12)', border: 'rgba(165,180,252,0.3)' }
  : { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' }

export function PlanPlaysTab({ account }: { account: AccountData }) {
  const [expandedPlay, setExpandedPlay] = useState<number | null>(null)

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2 space-y-4">
        <CollapsibleCard title="Active Plays" badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>{account.plays.length}</span>}>
          <div className="space-y-4">
            {account.plays.map((play, i) => {
              const sty = STATUS_STYLE(play.status)
              return (
                <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>{play.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium" style={{ background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}>
                      {play.status}
                    </span>
                  </div>
                  {/* Owner + Outcome */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{play.owner}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <Target className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{play.targetOutcome}</span>
                    </div>
                  </div>
                  {/* Steps */}
                  <div className="space-y-1.5 mb-3">
                    {play.steps.map((step, j) => {
                      const done = play.status === 'Done' || (play.status === 'In Progress' && j === 0)
                      return (
                        <div key={j} className="flex items-start gap-2 text-xs">
                          {done
                            ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                            : <Circle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--border-subtle)' }} />
                          }
                          <span style={{ color: done ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: done && play.status === 'Done' ? 'line-through' : 'none', opacity: done && play.status === 'Done' ? 0.6 : 1 }}>
                            {step}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Next touchpoint */}
                  <div className="flex items-center gap-1.5 text-xs pt-2" style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
                    <MessageSquare className="w-3 h-3" />
                    <span>Next: {play.nextTouchpoint}</span>
                  </div>
                  <SectionFeedback compact />
                </div>
              )
            })}
          </div>
        </CollapsibleCard>
      </div>

      {/* Right 1/3 */}
      <div>
        <CollapsibleCard title="Discovery Plays" badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>{account.discoveryPlays.length}</span>}>
          <div className="space-y-2">
            {account.discoveryPlays.map((dp, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-faint)' }}>
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium"
                  style={{ background: 'var(--bg)', color: 'var(--text-hover)' }}
                  onClick={() => setExpandedPlay(expandedPlay === i ? null : i)}
                >
                  {dp.title}
                  {expandedPlay === i ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                </button>
                {expandedPlay === i && (
                  <div className="px-3 py-2" style={{ borderTop: '1px solid var(--border-faint)', background: 'var(--surface)' }}>
                    <p className="text-xs italic leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{dp.template}</p>
                    <button
                      onClick={() => navigator.clipboard?.writeText(dp.template)}
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all"
                      style={{ background: 'var(--accent-bg-soft, rgba(87,94,207,0.08))', color: 'var(--accent)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.2))' }}
                    >
                      <Copy className="w-3 h-3" /> Copy Template
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      </div>
    </div>
  )
}
