'use client'

import { useState } from 'react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionFeedback } from './SectionFeedback'
import { AccountData, GapRow } from '@/lib/types'

const CONFIDENCE_STYLE = (c: string) =>
  c === 'High' ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' }
  : c === 'Medium' ? { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.25)' }
  : { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' }

const TIMING_STYLE = (t: string) =>
  t === 'Quick Win' ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
  : t === 'Next Quarter' ? { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)' }
  : { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }

const REVENUE_STYLE = (r: string) =>
  r === 'New Service' ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
  : r === 'Upsell' ? { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)' }
  : { color: '#facc15', bg: 'rgba(250,204,21,0.1)' }

function formatValue(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}

export function GapAnalysisTab({ account }: { account: AccountData }) {
  const [exposedMap, setExposedMap] = useState<Record<number, boolean>>(
    Object.fromEntries(account.gapRows.map((g, i) => [i, g.exposeToClient]))
  )

  const toggleExpose = (i: number) => setExposedMap(prev => ({ ...prev, [i]: !prev[i] }))

  const exposedGaps = account.gapRows.filter((_, i) => exposedMap[i])

  const narrative = exposedGaps.length === 0
    ? 'Toggle gaps above to expose them to the client narrative.'
    : exposedGaps.map((g, i) =>
        i === 0
          ? `You told us "${g.goal}" is a top priority. Right now, ${g.currentReality.toLowerCase()}. ${g.recommendation}.`
          : `You also flagged "${g.goal}". ${g.currentReality}. ${g.recommendation}.`
      ).join('\n\n')

  const totalPipeline = account.gapRows.reduce((s, g) => s + g.estimatedValue, 0)
  const weightedPipeline = account.gapRows.reduce((s, g) => {
    const w = g.confidence === 'High' ? 0.8 : g.confidence === 'Medium' ? 0.5 : 0.2
    return s + g.estimatedValue * w
  }, 0)

  const byType = account.gapRows.reduce<Record<string, number>>((acc, g) => {
    acc[g.revenueType] = (acc[g.revenueType] || 0) + g.estimatedValue
    return acc
  }, {})

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2 space-y-4">

        {/* Customer Voice */}
        <CollapsibleCard title="Customer Voice">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>THEY SAID…</div>
              <div className="space-y-2">
                {account.customerSaid.map((s, i) => (
                  <div key={i} className="italic p-2 rounded-lg" style={{ background: 'rgba(87,94,207,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.15))' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WE OBSERVED…</div>
              <div className="space-y-2">
                {account.weObserved.map((s, i) => (
                  <div key={i} className="p-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(250,204,21,0.2)' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WE INFER…</div>
              <div className="space-y-2">
                {account.weInfer.map((s, i) => (
                  <div key={i} className="p-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Gap Analysis */}
        <CollapsibleCard
          title="Gap Analysis — Internal View"
          badge={
            <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>
              {Object.values(exposedMap).filter(Boolean).length} exposed
            </span>
          }
        >
          <div className="space-y-3">
            {account.gapRows.map((gap, i) => {
              const conf = CONFIDENCE_STYLE(gap.confidence)
              const tim = TIMING_STYLE(gap.whyTiming)
              const rev = REVENUE_STYLE(gap.revenueType)
              const isExposed = exposedMap[i]
              return (
                <div key={i} className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bg)', border: `1px solid ${isExposed ? 'var(--accent-border-medium, rgba(87,94,207,0.3))' : 'var(--border-faint)'}` }}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>{gap.goal}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ background: conf.bg, color: conf.color, border: `1px solid ${conf.border}` }}>{gap.confidence}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: tim.bg, color: tim.color }}>{gap.whyTiming}</span>
                    </div>
                    <button
                      onClick={() => toggleExpose(i)}
                      className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0 transition-all"
                      style={{
                        background: isExposed ? 'rgba(74,222,128,0.15)' : 'var(--surface)',
                        color: isExposed ? '#4ade80' : 'var(--text-muted)',
                        border: `1px solid ${isExposed ? 'rgba(74,222,128,0.35)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {isExposed ? 'Exposed ✓' : 'Hidden'}
                    </button>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Current reality: </span>{gap.currentReality}
                  </div>
                  {/* 3-col detail */}
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[['GAP', gap.gap], ['IMPACT', gap.impact], ['RECOMMENDATION', gap.recommendation]].map(([label, val]) => (
                      <div key={label}>
                        <div className="font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{label}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>{val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Footer */}
                  <div className="flex items-center gap-3 pt-1" style={{ borderTop: '1px solid var(--border-faint)' }}>
                    <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>{formatValue(gap.estimatedValue)}/yr estimated</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: rev.bg, color: rev.color }}>{gap.revenueType}</span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>Internal only</span>
                  </div>
                </div>
              )
            })}
          </div>
          <SectionFeedback />
        </CollapsibleCard>
      </div>

      {/* Right 1/3 */}
      <div className="space-y-4">

        {/* Expansion Pipeline */}
        <CollapsibleCard title="Expansion Pipeline" badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>Internal</span>}>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Pipeline</div>
                <div className="text-xl font-bold" style={{ color: '#4ade80' }}>{formatValue(totalPipeline)}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Weighted Pipeline</div>
                <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{formatValue(weightedPipeline)}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BY TYPE</div>
              {Object.entries(byType).map(([type, val]) => {
                const sty = REVENUE_STYLE(type)
                return (
                  <div key={type} className="flex justify-between text-xs py-1">
                    <span style={{ color: sty.color }}>{type}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatValue(val)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CollapsibleCard>

        {/* Client-Ready Narrative */}
        <CollapsibleCard title="Client-Ready Narrative">
          <div className="space-y-3">
            {exposedGaps.length === 0 ? (
              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Toggle gaps above to expose them to the client narrative.</p>
            ) : (
              <div className="text-xs leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
                {narrative.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border-faint)' }}>
              {['Regenerate Simpler', 'Shorten to 60s', 'Turn into Slide'].map(label => (
                <button key={label} className="text-xs px-2.5 py-1 rounded-lg transition-all" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CollapsibleCard>
      </div>
    </div>
  )
}
