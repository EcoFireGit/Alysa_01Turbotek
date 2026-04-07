'use client'

import { AccountData } from '@/lib/types'
import { CalendarDays, Target, AlertTriangle, MessageSquare, TrendingUp, Zap, ShieldCheck, BarChart3, HelpCircle, Anchor } from 'lucide-react'
import { InfoTooltip } from '@/components/InfoTooltip'
import { SectionChat } from './SectionChat'

const OUTCOME_COLOR: Record<string, string> = {
  'Risk Reduction':      '#f87171',
  'Productivity Gain':   '#4ade80',
  'Strategic Alignment': '#a5b4fc',
  'Compliance':          '#facc15',
}

const STICKINESS_LABEL = (signal: string) => {
  const lower = signal.toLowerCase()
  if (lower.includes('risk') || lower.includes('churn') || lower.includes('at risk') || lower.includes('evaluating')) return 'risk'
  if (lower.includes('champion') || lower.includes('refers') || lower.includes('trust') || lower.includes('zero incidents') || lower.includes('attends')) return 'positive'
  return 'neutral'
}

export function MeetingPrepTab({ account }: { account: AccountData }) {
  const quickWins = account.gapRows.filter(g => g.whyTiming === 'Quick Win' && g.confidence === 'High')
  const openPlays = account.plays.filter(p => p.status !== 'Done')
  const exposedGaps = account.gapRows.filter(g => g.exposeToClient)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="rounded-xl p-5" style={{ background: 'var(--accent-bg-hover, rgba(87,94,207,0.18))', border: '1px solid var(--accent-border-strong, rgba(87,94,207,0.4))' }}>
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="w-4 h-4" style={{ color: 'var(--accent-light)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)', letterSpacing: '0.06em' }}>MEETING PREP BRIEF</span>
        </div>
        <h2 className="text-lg font-bold mb-0.5" style={{ color: 'var(--text-hover)' }}>{account.name}</h2>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Prepared {today} · {account.industry} · {account.stage}</p>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>{account.nextBestConversation}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Left column */}
        <div className="space-y-5">

          {/* Their goals — what they care about */}
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Their Goals</span>
              <InfoTooltip title="Their Goals" definition="Business goals captured from discovery calls and CRM notes." sources={['Fathom', 'CRM']} />
            </div>
            <div className="space-y-2">
              {account.businessGoals.map((goal, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center font-bold mt-0.5" style={{ background: 'rgba(87,94,207,0.15)', color: 'var(--accent)', fontSize: '9px' }}>{i + 1}</span>
                  <span style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Open flags — what needs to come up */}
          {account.topPriorities.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4" style={{ color: '#facc15' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Open Flags — Must Address</span>
                <InfoTooltip title="Open Flags" definition="High-priority issues flagged in ConnectWise PSA tickets and account health alerts." sources={['ConnectWise PSA', 'Kaseya RMM']} />
              </div>
              <div className="space-y-2">
                {account.topPriorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: '#facc15' }} />
                    <span style={{ color: 'var(--text-primary)' }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions to ask */}
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Questions to Ask This Meeting</span>
              <InfoTooltip title="Questions to Ask" definition="Discovery questions generated from gaps you've chosen to expose to the client. Toggle gaps in Gap Analysis to update these." sources={['Gap Analysis Engine']} />
            </div>
            <div className="space-y-2">
              {exposedGaps.map((g, i) => (
                <div key={i} className="text-xs p-2 rounded-lg" style={{ background: 'rgba(87,94,207,0.06)', border: '1px solid rgba(87,94,207,0.15)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent)' }}>Re: {g.goal.split(' ').slice(0, 5).join(' ')}… — </span>
                  {g.currentReality}. How are you thinking about this?
                </div>
              ))}
              {exposedGaps.length === 0 && (
                <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No gaps exposed yet — go to Gap Analysis to select talking points.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Stickiness signals */}
          {account.stickinessSignals && account.stickinessSignals.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Anchor className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Stickiness Signals</span>
                <InfoTooltip title="Stickiness Signals" definition="Engagement and churn risk indicators derived from meeting frequency, sentiment trends, and support ticket patterns." sources={['Fathom', 'ConnectWise PSA', 'CRM']} />
              </div>
              <div className="space-y-2">
                {account.stickinessSignals.map((s, i) => {
                  const type = STICKINESS_LABEL(s)
                  const color = type === 'risk' ? '#f87171' : type === 'positive' ? '#4ade80' : 'var(--text-muted)'
                  const bg = type === 'risk' ? 'rgba(248,113,113,0.06)' : type === 'positive' ? 'rgba(74,222,128,0.06)' : 'var(--bg)'
                  const border = type === 'risk' ? 'rgba(248,113,113,0.2)' : type === 'positive' ? 'rgba(74,222,128,0.2)' : 'var(--border-faint)'
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ background: bg, border: `1px solid ${border}` }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
                      <span style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>{s}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quick wins to surface */}
          {quickWins.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4" style={{ color: '#4ade80' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Quick Wins to Surface</span>
                <InfoTooltip title="Quick Wins" definition="High-confidence, near-term gaps where a recommendation can be acted on this quarter." sources={['Gap Analysis Engine']} />
              </div>
              <div className="space-y-2">
                {quickWins.map((g, i) => {
                  const color = OUTCOME_COLOR[g.outcomeType]
                  return (
                    <div key={i} className="text-xs p-2 rounded-lg" style={{ background: color + '0D', border: `1px solid ${color}30` }}>
                      <div className="font-semibold mb-0.5" style={{ color }}>{g.outcomeType}</div>
                      <div style={{ color: 'var(--text-primary)' }}>{g.recommendation}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Active plays status */}
          {openPlays.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Active Plays</span>
              </div>
              <div className="space-y-2">
                {openPlays.map((play, i) => {
                  const statusColor = play.status === 'In Progress' ? '#a5b4fc' : '#94a3b8'
                  return (
                    <div key={i} className="text-xs p-2 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{play.title}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: statusColor + '22', color: statusColor }}>{play.status}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>Next: {play.nextTouchpoint}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recent intel */}
          <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Recent Intel</span>
              <InfoTooltip title="Recent Intel" definition="Latest signals from meeting transcripts, CRM activity, and support ticket history." sources={['Fathom', 'CRM', 'ConnectWise PSA']} />
            </div>
            <div className="space-y-2">
              {account.recentIntel.map((item, i) => (
                <div key={i} className="text-xs p-2 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section-level AI chat for the full brief */}
      <SectionChat
        sectionTitle="Meeting Prep Brief"
        accountName={account.name}
        context={`Account: ${account.name}\nIndustry: ${account.industry}\nStage: ${account.stage}\n\nGoals:\n${account.businessGoals.join('\n')}\n\nOpen Flags:\n${account.topPriorities.join('\n')}\n\nStickiness Signals:\n${(account.stickinessSignals ?? []).join('\n')}\n\nRecent Intel:\n${account.recentIntel.join('\n')}`}
      />
    </div>
  )
}
