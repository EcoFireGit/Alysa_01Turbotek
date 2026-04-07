'use client'

import { ArrowRight, CheckCircle2, Circle, Clock, Zap, Target, TrendingUp, AlertTriangle, BookOpen, ShieldCheck, BarChart3 } from 'lucide-react'
import { AccountData } from '@/lib/types'
import { SectionChat } from './SectionChat'
import { InfoTooltip } from '@/components/InfoTooltip'

const OUTCOME_ICON: Record<string, React.ReactNode> = {
  'Risk Reduction':      <ShieldCheck className="w-3 h-3" />,
  'Productivity Gain':   <Zap className="w-3 h-3" />,
  'Strategic Alignment': <Target className="w-3 h-3" />,
  'Compliance':          <BarChart3 className="w-3 h-3" />,
}

const OUTCOME_COLOR: Record<string, string> = {
  'Risk Reduction':      '#f87171',
  'Productivity Gain':   '#4ade80',
  'Strategic Alignment': '#a5b4fc',
  'Compliance':          '#facc15',
}

const CONFIDENCE_STYLE = {
  High:   { color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  border: 'rgba(74,222,128,0.25)' },
  Medium: { color: '#facc15', bg: 'rgba(250,204,21,0.10)',  border: 'rgba(250,204,21,0.25)' },
  Low:    { color: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)' },
}

const TIMING_STYLE = {
  'Quick Win':    { color: '#4ade80', icon: <Zap className="w-3 h-3" /> },
  'Next Quarter': { color: '#a5b4fc', icon: <Clock className="w-3 h-3" /> },
  'Long-term':    { color: '#94a3b8', icon: <TrendingUp className="w-3 h-3" /> },
}

const STATUS_STYLE = {
  'Done':        { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)' },
  'In Progress': { color: '#a5b4fc', bg: 'rgba(165,180,252,0.12)', border: 'rgba(165,180,252,0.3)' },
  'Not Started': { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.3)' },
}

export function StrategicRoadmapTab({ account }: { account: AccountData }) {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-hover)' }}>
          Strategic Roadmap for {account.name}
        </h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Business goals → strategic gaps → recommendations → tactical plays
        </p>
      </div>

      {/* Business Goals */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
            Client Business Goals
          </span>
          <InfoTooltip title="Client Business Goals" definition="Goals documented from discovery calls and CRM notes." sources={['Fathom', 'CRM', 'IT Glue']} />
        </div>
        <div className="flex flex-wrap gap-2">
          {account.businessGoals.map((goal, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs px-3 py-2 rounded-lg"
              style={{
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--text-primary)',
                maxWidth: '320px',
              }}
            >
              <span
                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center font-bold mt-0.5"
                style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', fontSize: '9px' }}
              >
                {i + 1}
              </span>
              <span style={{ lineHeight: '1.4' }}>{goal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-3 px-1" style={{ alignItems: 'center' }}>
        <div className="col-span-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Business Goal</div>
        <div className="col-span-1" />
        <div className="col-span-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Strategic Gap</div>
        <div className="col-span-1" />
        <div className="col-span-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Strategic Recommendation
          <InfoTooltip title="Strategic Recommendation" definition="AI-generated recommendations mapped to business goals and gaps. Confidence and timing reflect data quality and recency." sources={['Gap Analysis Engine', 'Fathom', 'IT Glue']} />
        </div>
      </div>

      {/* Alignment rows */}
      <div className="space-y-3">
        {account.gapRows.map((row, i) => {
          const conf = CONFIDENCE_STYLE[row.confidence]
          const timing = TIMING_STYLE[row.whyTiming]

          return (
            <div
              key={i}
              className="grid grid-cols-12 gap-3 items-stretch rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
            >
              {/* Goal */}
              <div className="col-span-3 flex flex-col justify-center gap-1">
                <div className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-hover)' }}>
                  {row.goal}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Current: {row.currentReality}
                </div>
              </div>

              {/* Arrow */}
              <div className="col-span-1 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--accent)', opacity: 0.6 }} />
              </div>

              {/* Gap */}
              <div className="col-span-3 flex flex-col justify-center gap-2">
                <div
                  className="text-xs px-3 py-2 rounded-lg leading-relaxed"
                  style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--text-primary)' }}
                >
                  <span className="flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: '#f87171' }} />
                    <span className="font-medium text-xs" style={{ color: '#f87171' }}>Gap</span>
                  </span>
                  {row.gap}
                </div>
                {row.impact && (
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Impact: {row.impact}
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="col-span-1 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" style={{ color: 'var(--accent)', opacity: 0.6 }} />
              </div>

              {/* Recommendation */}
              <div className="col-span-4 flex flex-col justify-between gap-2">
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {row.recommendation}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Timing */}
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ color: timing.color, background: timing.color + '18', border: `1px solid ${timing.color}33` }}
                  >
                    {timing.icon}
                    {row.whyTiming}
                  </span>
                  {/* Confidence */}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ color: conf.color, background: conf.bg, border: `1px solid ${conf.border}` }}
                  >
                    {row.confidence} confidence
                  </span>
                  {/* Outcome type */}
                  <span
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                    style={{ color: OUTCOME_COLOR[row.outcomeType], background: OUTCOME_COLOR[row.outcomeType] + '18' }}
                  >
                    {OUTCOME_ICON[row.outcomeType]} {row.outcomeType}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <SectionChat
        sectionTitle="Strategic Roadmap"
        accountName={account.name}
        context={account.gapRows.map(g => `Goal: ${g.goal}\nGap: ${g.gap}\nRecommendation: ${g.recommendation}\nTiming: ${g.whyTiming}\nOutcome: ${g.outcomeType}`).join('\n\n')}
      />

      {/* Industry Research */}
      {account.industryResearch && account.industryResearch.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="w-1 h-4 rounded" style={{ background: 'var(--accent)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>Industry Research</span>
            <InfoTooltip title="Industry Research" definition="Objective third-party research — no vendor affiliation. Used to support strategic recommendations with independent data." sources={['Forrester', 'IDC', 'Gartner']} />
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}>
              {account.industryResearch.length} citations
            </span>
            <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>— objective, non-vendor research to back your recommendations</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {account.industryResearch.map((r, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-start gap-2 mb-3">
                  <BookOpen className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                  <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>{r.finding}</p>
                </div>
                <div className="flex items-center gap-2 text-xs pl-5 mb-2">
                  <span className="font-semibold" style={{ color: 'var(--accent-light)' }}>{r.source}</span>
                  <span style={{ color: 'var(--text-muted)' }}>· {r.year}</span>
                </div>
                <div className="text-xs pl-5 italic leading-relaxed" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
                  Use this when: {r.relevance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tactical Implementation */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded" style={{ background: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>Tactical Implementation</span>
          <InfoTooltip title="Tactical Implementation" definition="Action plays tracked in ConnectWise PSA. Status, steps, and touchpoints are synced from project records." sources={['ConnectWise PSA', 'IT Glue']} />
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(87,94,207,0.1)', color: 'var(--accent)' }}
          >
            {account.plays.length} active plays
          </span>
        </div>

        <div className="space-y-3">
          {account.plays.map((play, i) => {
            const sty = STATUS_STYLE[play.status]
            const totalSteps = play.steps.length
            const doneSteps = play.status === 'Done' ? totalSteps : play.status === 'In Progress' ? 1 : 0
            const pct = Math.round((doneSteps / totalSteps) * 100)

            return (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-hover)' }}>{play.title}</div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{play.targetOutcome}</div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ background: sty.bg, color: sty.color, border: `1px solid ${sty.border}` }}
                  >
                    {play.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    <span>{doneSteps}/{totalSteps} steps</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: play.status === 'Done' ? '#4ade80' : play.status === 'In Progress' ? 'var(--accent)' : '#94a3b8',
                      }}
                    />
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-1 mb-3">
                  {play.steps.map((step, j) => {
                    const done = play.status === 'Done' || (play.status === 'In Progress' && j === 0)
                    return (
                      <div key={j} className="flex items-start gap-2 text-xs">
                        {done
                          ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                          : <Circle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--border-subtle)' }} />
                        }
                        <span style={{
                          color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
                          textDecoration: done && play.status === 'Done' ? 'line-through' : 'none',
                          opacity: done && play.status === 'Done' ? 0.5 : 1,
                        }}>
                          {step}
                        </span>
                      </div>
                    )
                  })}
                </div>

                <div className="text-xs pt-2" style={{ borderTop: '1px solid var(--border-faint)', color: 'var(--text-muted)' }}>
                  Next: {play.nextTouchpoint}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
