'use client'

import { useState } from 'react'
import { CheckCircle2, ArrowRight, ShieldAlert, Lightbulb, FileText, Download, Minimize2, Maximize2 } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { AccountData } from '@/lib/types'

type Mode = 'standard' | 'executive'

export function QBRExecBriefTab({ account }: { account: AccountData }) {
  const [mode, setMode] = useState<Mode>('standard')

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('executive')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === 'executive' ? 'var(--accent)' : 'var(--surface)',
              color: mode === 'executive' ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === 'executive' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <Minimize2 className="w-3.5 h-3.5" /> Executive (1–2 slides)
          </button>
          <button
            onClick={() => setMode('standard')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: mode === 'standard' ? 'var(--accent)' : 'var(--surface)',
              color: mode === 'standard' ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${mode === 'standard' ? 'var(--accent)' : 'var(--border-subtle)'}`,
            }}
          >
            <Maximize2 className="w-3.5 h-3.5" /> Standard (6–8 slides)
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <FileText className="w-3.5 h-3.5" /> Export PPT
          </button>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Content grid */}
      <div className={`grid gap-4 ${mode === 'executive' ? 'grid-cols-2' : 'grid-cols-3'}`}>

        {/* What You Said Matters */}
        <CollapsibleCard title="What You Said Matters This Quarter" icon={<FileText className="w-4 h-4" />} defaultOpen>
          <ol className="space-y-2">
            {account.qbrPriorities.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)' }}>{i + 1}</span>
                <span style={{ color: 'var(--text-primary)' }}>{p}</span>
              </li>
            ))}
          </ol>
        </CollapsibleCard>

        {/* What We Delivered */}
        <CollapsibleCard title="What We Delivered" icon={<CheckCircle2 className="w-4 h-4" />} defaultOpen>
          <div className="space-y-1.5">
            {account.qbrDelivered.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                <span style={{ color: 'var(--text-primary)' }}>{d}</span>
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* Next Steps */}
        <CollapsibleCard title="Next Steps & Decisions" icon={<ArrowRight className="w-4 h-4" />} defaultOpen>
          <div className="space-y-1.5">
            {account.qbrNextSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <ArrowRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-primary)' }}>{s}</span>
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* Standard mode only */}
        {mode === 'standard' && (
          <>
            {/* Risks */}
            <CollapsibleCard title="Risks We're Managing" icon={<ShieldAlert className="w-4 h-4" />}>
              <div className="space-y-1.5">
                {account.qbrRisks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <ShieldAlert className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
                    <span style={{ color: 'var(--text-primary)' }}>{r}</span>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            {/* Opportunities */}
            <CollapsibleCard title="Opportunities to Improve Outcomes" icon={<Lightbulb className="w-4 h-4" />}>
              <div className="space-y-1.5">
                {account.qbrOpportunities.map((o, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#facc15' }} />
                    <span style={{ color: 'var(--text-primary)' }}>{o}</span>
                  </div>
                ))}
              </div>
            </CollapsibleCard>

            {/* Outcomes Delivered */}
            <CollapsibleCard title="Outcomes Delivered">
              <div className="space-y-2">
                {account.businessOutcomes.map((o, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                    <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{o.metric}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Before</div>
                        <div style={{ color: '#f87171', fontWeight: 600 }}>{o.before}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>After</div>
                        <div style={{ color: '#4ade80', fontWeight: 600 }}>{o.after}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)' }}>Impact</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{o.impact}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          </>
        )}
      </div>
    </div>
  )
}
