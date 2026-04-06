'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, DollarSign, Shield, TrendingUp, Heart, Layers, PlayCircle } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { AccountData, Outcome } from '@/lib/types'

const RESULT_STYLE: Record<string, { color: string; icon: React.ReactNode }> = {
  'Saved Cost': { color: '#4ade80', icon: <DollarSign className="w-3 h-3" /> },
  'De-risked Renewal': { color: '#a5b4fc', icon: <Shield className="w-3 h-3" /> },
  'Expansion Booked': { color: '#93c5fd', icon: <TrendingUp className="w-3 h-3" /> },
  'Improved Satisfaction': { color: '#facc15', icon: <Heart className="w-3 h-3" /> },
}

export function OutcomesFeedbackTab({ account }: { account: AccountData }) {
  const [outcomes, setOutcomes] = useState<Outcome[]>(account.outcomes)

  const toggleAccuracy = (i: number, val: boolean) => {
    setOutcomes(prev => prev.map((o, j) => j === i ? { ...o, accurate: o.accurate === val ? null : val } : o))
  }

  const accurate = outcomes.filter(o => o.accurate === true).length
  const inaccurate = outcomes.filter(o => o.accurate === false).length
  const pending = outcomes.filter(o => o.accurate === null).length

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2">
        <CollapsibleCard
          title="Recommendation Accuracy"
          badge={
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs" style={{ color: '#4ade80' }}>✓ {accurate}</span>
              <span className="text-xs" style={{ color: '#f87171' }}>✗ {inaccurate}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>? {pending}</span>
            </div>
          }
          defaultOpen
        >
          <div className="space-y-3">
            {outcomes.map((o, i) => {
              const resultSty = o.result ? RESULT_STYLE[o.result] : null
              const linkedGap = o.sourceGapIndex !== undefined ? account.gapRows[o.sourceGapIndex] : null
              const linkedPlay = o.sourcePlayIndex !== undefined ? account.plays[o.sourcePlayIndex] : null

              return (
                <div key={i} className="rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-hover)' }}>{o.recommendation}</p>
                      {o.note && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{o.note}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleAccuracy(i, true)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                        style={{
                          background: o.accurate === true ? 'rgba(74,222,128,0.15)' : 'var(--surface)',
                          color: o.accurate === true ? '#4ade80' : 'var(--text-muted)',
                          border: `1px solid ${o.accurate === true ? 'rgba(74,222,128,0.35)' : 'var(--border-subtle)'}`,
                        }}
                        title="Mark as accurate"
                      >
                        <ThumbsUp className="w-3 h-3" /> Yes
                      </button>
                      <button
                        onClick={() => toggleAccuracy(i, false)}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all"
                        style={{
                          background: o.accurate === false ? 'rgba(248,113,113,0.15)' : 'var(--surface)',
                          color: o.accurate === false ? '#f87171' : 'var(--text-muted)',
                          border: `1px solid ${o.accurate === false ? 'rgba(248,113,113,0.35)' : 'var(--border-subtle)'}`,
                        }}
                        title="Mark as inaccurate"
                      >
                        <ThumbsDown className="w-3 h-3" /> No
                      </button>
                    </div>
                  </div>

                  {/* Result badge */}
                  {resultSty && o.result && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: resultSty.color + '22', color: resultSty.color }}>
                        {resultSty.icon} {o.result}
                      </span>
                    </div>
                  )}

                  {/* Traceability */}
                  <div className="flex flex-wrap gap-2">
                    {linkedGap && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" title={`Gap: ${linkedGap.goal}`} style={{ background: 'rgba(87,94,207,0.08)', color: 'var(--accent)', border: '1px solid rgba(87,94,207,0.2)' }}>
                        <Layers className="w-3 h-3" /> Gap: {linkedGap.goal.slice(0, 30)}…
                      </span>
                    )}
                    {linkedPlay && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded" title={`Play: ${linkedPlay.title}`} style={{ background: 'rgba(74,222,128,0.08)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                        <PlayCircle className="w-3 h-3" /> Play: {linkedPlay.title.slice(0, 30)}…
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CollapsibleCard>
      </div>

      {/* Right 1/3 */}
      <div className="space-y-4">
        <CollapsibleCard title="Impact Summary">
          <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <div className="text-xs">Impact analytics coming soon</div>
          </div>
        </CollapsibleCard>

        <CollapsibleCard title="Model Performance">
          <div className="text-center py-6" style={{ color: 'var(--text-muted)' }}>
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <div className="text-xs">Model performance metrics coming soon</div>
          </div>
        </CollapsibleCard>
      </div>
    </div>
  )
}
