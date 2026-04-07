'use client'

import { useState } from 'react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { AccountData } from '@/lib/types'
import { ShieldCheck, Zap, Target, BarChart3, BookOpen } from 'lucide-react'
import { SectionChat } from './SectionChat'

const CONFIDENCE_STYLE = (c: string) =>
  c === 'High' ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' }
  : c === 'Medium' ? { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.25)' }
  : { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)' }

const TIMING_STYLE = (t: string) =>
  t === 'Quick Win' ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' }
  : t === 'Next Quarter' ? { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)' }
  : { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }

const OUTCOME_STYLE = (o: string) =>
  o === 'Risk Reduction'     ? { color: '#f87171', bg: 'rgba(248,113,113,0.1)',  icon: <ShieldCheck className="w-3 h-3" /> }
  : o === 'Productivity Gain'  ? { color: '#4ade80', bg: 'rgba(74,222,128,0.1)',   icon: <Zap className="w-3 h-3" /> }
  : o === 'Strategic Alignment'? { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)', icon: <Target className="w-3 h-3" /> }
  : /* Compliance */             { color: '#facc15', bg: 'rgba(250,204,21,0.1)',   icon: <BarChart3 className="w-3 h-3" /> }

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

  // Count by outcome type
  const byOutcome = account.gapRows.reduce<Record<string, number>>((acc, g) => {
    acc[g.outcomeType] = (acc[g.outcomeType] || 0) + 1
    return acc
  }, {})

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left 2/3 */}
      <div className="col-span-2 space-y-4">

        {/* Customer Voice */}
        <CollapsibleCard title="Customer Voice" infoSources={['Fathom', 'CRM']} infoDefinition="Direct quotes from meeting recordings and CRM call notes. Observations and inferences are AI-synthesized from those same sources.">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>THEY SAID…</div>
              <div className="space-y-2">
                {account.customerSaid.map((s, i) => {
                  const meta = account.customerSaidMeta?.[i]
                  return (
                    <div key={i} className="relative group italic p-2 rounded-lg cursor-default" style={{ background: 'rgba(87,94,207,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.15))' }}>
                      {s}
                      {meta && (
                        <div className="pointer-events-none absolute bottom-full left-0 mb-2 z-20 w-max max-w-[200px] rounded-lg px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg"
                          style={{ background: 'var(--surface)', border: '1px solid var(--accent-border-strong, rgba(87,94,207,0.4))', color: 'var(--text-primary)' }}>
                          <div className="font-semibold mb-0.5" style={{ color: 'var(--accent-light)' }}>{meta.source}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{meta.timestamp}</div>
                          <div className="absolute left-3 top-full w-0 h-0" style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--accent-border-strong, rgba(87,94,207,0.4))' }} />
                        </div>
                      )}
                    </div>
                  )
                })}
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
          <SectionChat
            sectionTitle="Customer Voice"
            accountName={account.name}
            context={`They said:\n${account.customerSaid.join('\n')}\n\nWe observed:\n${account.weObserved.join('\n')}\n\nWe infer:\n${account.weInfer.join('\n')}`}
            compact
          />
        </CollapsibleCard>

        {/* Gap Analysis */}
        <CollapsibleCard
          title="Alignment Gaps — Internal View"
          badge={
            <span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>
              {Object.values(exposedMap).filter(Boolean).length} exposed
            </span>
          }
          infoSources={['Gap Analysis Engine', 'Fathom', 'IT Glue']}
          infoDefinition="Gaps are AI-derived by comparing stated client goals against observed environment data and industry benchmarks."
        >
          <div className="space-y-3">
            {account.gapRows.map((gap, i) => {
              const conf = CONFIDENCE_STYLE(gap.confidence)
              const tim = TIMING_STYLE(gap.whyTiming)
              const out = OUTCOME_STYLE(gap.outcomeType)
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
                  {/* Footer — outcome type only, no dollar hero */}
                  <div className="flex items-center gap-3 pt-1" style={{ borderTop: '1px solid var(--border-faint)' }}>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: out.bg, color: out.color }}>
                      {out.icon} {gap.outcomeType}
                    </span>
                    <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>Internal only</span>
                  </div>
                </div>
              )
            })}
          </div>
          <SectionChat
            sectionTitle="Alignment Gaps"
            accountName={account.name}
            context={account.gapRows.map(g => `Goal: ${g.goal}\nGap: ${g.gap}\nRecommendation: ${g.recommendation}\nOutcome: ${g.outcomeType}`).join('\n\n')}
            compact
          />
        </CollapsibleCard>

        {/* Industry Research */}
        {account.industryResearch && account.industryResearch.length > 0 && (
          <CollapsibleCard
            title="Industry Research"
            badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>{account.industryResearch.length} citations</span>}
            infoSources={['Forrester', 'IDC', 'Gartner']}
            infoDefinition="Objective third-party research — no vendor affiliation. Used to support strategic recommendations with independent data."
          >
            <div className="space-y-3">
              {account.industryResearch.map((r, i) => (
                <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                  <div className="flex items-start gap-2 mb-2">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    <span className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>{r.finding}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs pl-5">
                    <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>{r.source}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{r.year}</span>
                  </div>
                  <div className="text-xs mt-2 pl-5 italic" style={{ color: 'var(--text-secondary)' }}>
                    Why it matters here: {r.relevance}
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}
      </div>

      {/* Right 1/3 */}
      <div className="space-y-4">

        {/* Alignment Summary — replaces Expansion Pipeline */}
        <CollapsibleCard title="Alignment Summary" badge={<span className="text-xs px-1.5 py-0.5 rounded ml-1" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>Internal</span>} infoSources={['Gap Analysis Engine']} infoDefinition="Aggregated gap counts and quick-win flags derived from the gap analysis. Internal use only — not shown to clients.">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Gaps</div>
                <div className="text-xl font-bold" style={{ color: 'var(--text-hover)' }}>{account.gapRows.length}</div>
              </div>
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Exposed to Client</div>
                <div className="text-xl font-bold" style={{ color: '#4ade80' }}>{Object.values(exposedMap).filter(Boolean).length}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>BY OUTCOME</div>
              {Object.entries(byOutcome).map(([type, count]) => {
                const sty = OUTCOME_STYLE(type)
                return (
                  <div key={type} className="flex items-center justify-between text-xs py-1">
                    <span className="flex items-center gap-1.5" style={{ color: sty.color }}>{sty.icon} {type}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{count} gap{count > 1 ? 's' : ''}</span>
                  </div>
                )
              })}
            </div>
            {/* High-confidence quick wins */}
            <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>QUICK WINS</div>
              {account.gapRows.filter(g => g.whyTiming === 'Quick Win' && g.confidence === 'High').map((g, i) => (
                <div key={i} className="text-xs py-1 flex items-start gap-1.5">
                  <Zap className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#4ade80' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{g.goal}</span>
                </div>
              ))}
              {account.gapRows.filter(g => g.whyTiming === 'Quick Win' && g.confidence === 'High').length === 0 && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No high-confidence quick wins</span>
              )}
            </div>
          </div>
        </CollapsibleCard>

        {/* Client-Ready Narrative */}
        <CollapsibleCard title="Client-Ready Narrative" infoSources={['Gap Analysis Engine', 'Fathom']} infoDefinition="AI-generated narrative from exposed gaps and client goals. Review before sharing — verify accuracy against your last call notes.">
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
