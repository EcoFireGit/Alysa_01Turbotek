'use client'

import { useState } from 'react'
import { Target, Users, Briefcase, Shield, Calendar, MessageSquare, DollarSign, Clock, ThumbsUp, ThumbsDown, CheckCircle2, AlertTriangle } from 'lucide-react'
import { CollapsibleCard } from '@/components/ui/CollapsibleCard'
import { SectionFeedback } from './SectionFeedback'
import { AccountData } from '@/lib/types'

const SENTIMENT_COLORS: Record<string, string> = {
  Champion: '#4ade80',
  Advocate: '#93c5fd',
  Neutral: '#94a3b8',
  Detractor: '#f87171',
}

const COMPLETION_BADGE = (pct: number) =>
  pct >= 70 ? { label: 'Ready for Exec Brief', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }
  : pct >= 50 ? { label: 'Getting There', color: '#facc15', bg: 'rgba(250,204,21,0.12)' }
  : { label: 'Needs Discovery', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }

export function ClientProfileTab({ account }: { account: AccountData }) {
  const [inferences, setInferences] = useState(account.inferences)
  const badge = COMPLETION_BADGE(account.profileCompleteness)
  const walletSharePct = account.walletShare
  const totalSpend = account.budgetBand

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left column — 2/3 */}
      <div className="col-span-2 space-y-4">

        {/* Profile Completeness */}
        <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>Profile Completeness</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
          </div>
          <div className="h-2 rounded-full mb-2" style={{ background: 'var(--border-subtle)' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${account.profileCompleteness}%`, background: badge.color }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{account.profileCompleteness}% complete</span>
            <span>1-minute win: add stakeholder sentiment for remaining contacts</span>
          </div>
        </div>

        {/* Business Goals & Constraints */}
        <CollapsibleCard title="Business Goals & Constraints" icon={<Target className="w-4 h-4" />}>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>GOALS</div>
              <div className="space-y-1">
                {account.businessGoals.map((g, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#4ade80' }} />
                    {g}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: '1px solid var(--border-faint)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CONSTRAINTS</div>
              <div className="space-y-1">
                {account.constraints.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#facc15' }} />
                    {c}
                  </div>
                ))}
              </div>
            </div>
            <SectionFeedback compact />
          </div>
        </CollapsibleCard>

        {/* Stakeholders */}
        <CollapsibleCard title="Stakeholders & Decisions" icon={<Users className="w-4 h-4" />}>
          <div className="space-y-2">
            {account.stakeholders.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--surface-deep, var(--bg))', border: '1px solid var(--border-faint)' }}>
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-hover)' }}>{s.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.role}</div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: SENTIMENT_COLORS[s.sentiment] + '22', color: SENTIMENT_COLORS[s.sentiment], border: `1px solid ${SENTIMENT_COLORS[s.sentiment]}44` }}>
                  {s.sentiment}
                </span>
              </div>
            ))}
            <SectionFeedback compact />
          </div>
        </CollapsibleCard>

        {/* Current Environment */}
        <CollapsibleCard title="Current Environment" icon={<Briefcase className="w-4 h-4" />}>
          <div className="flex flex-wrap gap-2">
            {account.currentEnvironment.map((item, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--accent-bg-soft, rgba(87,94,207,0.08))', color: 'var(--accent)', border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.2))' }}>
                {item}
              </span>
            ))}
          </div>
          <SectionFeedback compact />
        </CollapsibleCard>

        {/* Risk Posture */}
        <CollapsibleCard title="Risk Posture & Compliance" icon={<Shield className="w-4 h-4" />}>
          <div className="space-y-1.5">
            {account.riskPosture.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f87171' }} />
                {r}
              </div>
            ))}
          </div>
          <SectionFeedback compact />
        </CollapsibleCard>

        {/* Renewal Dates */}
        <CollapsibleCard title="Renewal Dates / Contracts" icon={<Calendar className="w-4 h-4" />}>
          <div className="space-y-2">
            {account.renewalDates.map((rd, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1">
                <span style={{ color: 'var(--text-primary)' }}>{rd.vendor}</span>
                <span className="font-medium" style={{ color: 'var(--accent)' }}>{rd.date}</span>
              </div>
            ))}
          </div>
          <SectionFeedback compact />
        </CollapsibleCard>

        {/* Satisfaction Signals */}
        <CollapsibleCard title="Satisfaction Signals" icon={<MessageSquare className="w-4 h-4" />}>
          <div className="space-y-1.5">
            {account.satisfactionSignals.map((s, i) => (
              <div key={i} className="text-sm italic py-1" style={{ color: 'var(--text-secondary)', borderBottom: i < account.satisfactionSignals.length - 1 ? '1px solid var(--border-faint)' : 'none' }}>
                {s}
              </div>
            ))}
          </div>
          <SectionFeedback compact />
        </CollapsibleCard>

        {/* Budget */}
        <CollapsibleCard title="Budget & Spend Bands" icon={<DollarSign className="w-4 h-4" />}>
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{account.budgetBand}</div>
          <SectionFeedback compact />
        </CollapsibleCard>

        {/* Recent Intel + Inferences */}
        <CollapsibleCard title="Recent Intel & Inferences" icon={<Clock className="w-4 h-4" />}>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>RECENT INTEL</div>
              <div className="space-y-1.5">
                {account.recentIntel.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: '1px solid var(--border-faint)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SUGGESTED INFERENCES</div>
              <div className="space-y-3">
                {inferences.map((inf, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'var(--bg)', border: '1px solid var(--border-faint)' }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{inf.category}</div>
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{inf.inference}</div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setInferences(prev => prev.map((x, j) => j === i ? { ...x, confirmed: true } : x))}
                          className="p-1 rounded"
                          style={{ background: inf.confirmed === true ? 'rgba(74,222,128,0.2)' : 'transparent', color: inf.confirmed === true ? '#4ade80' : 'var(--text-muted)' }}
                          title="Confirm"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setInferences(prev => prev.map((x, j) => j === i ? { ...x, confirmed: false } : x))}
                          className="p-1 rounded"
                          style={{ background: inf.confirmed === false ? 'rgba(248,113,113,0.2)' : 'transparent', color: inf.confirmed === false ? '#f87171' : 'var(--text-muted)' }}
                          title="Deny"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                        <div className="h-full rounded-full" style={{ width: `${inf.confidence}%`, background: inf.confidence >= 70 ? '#4ade80' : inf.confidence >= 50 ? '#facc15' : '#94a3b8' }} />
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{inf.confidence}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <SectionFeedback compact />
        </CollapsibleCard>
      </div>

      {/* Right column — 1/3 */}
      <div className="space-y-4">

        {/* Tech Stack */}
        <CollapsibleCard title="Client Tech Stack">
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold mb-2" style={{ color: '#4ade80', letterSpacing: '0.05em' }}>OUR WALLET SHARE</div>
              <div className="space-y-1.5">
                {account.techStackDetails.filter(t => t.isOurWalletShare).map((t, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded-lg text-xs" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3" style={{ color: '#4ade80' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#4ade80' }}>{t.category}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: '1px solid var(--border-faint)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>OTHER IT TOOLS</div>
              <div className="space-y-1">
                {account.techStackDetails.filter(t => !t.isOurWalletShare).map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1">
                    <span style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{
                      background: t.confidence === 'Confirmed' ? 'rgba(74,222,128,0.1)' : t.confidence === 'High' ? 'rgba(250,204,21,0.1)' : 'rgba(148,163,184,0.1)',
                      color: t.confidence === 'Confirmed' ? '#4ade80' : t.confidence === 'High' ? '#facc15' : '#94a3b8',
                    }}>
                      {t.confidence}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleCard>

        {/* Wallet Share */}
        <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>WALLET SHARE</div>
          <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>{walletSharePct}%</div>
          <div className="h-2 rounded-full mb-3" style={{ background: 'var(--border-subtle)' }}>
            <div className="h-full rounded-full" style={{ width: `${walletSharePct}%`, background: 'var(--accent)' }} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Your Share</div>
              <div className="font-semibold" style={{ color: 'var(--text-hover)' }}>{account.arr}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)' }}>Est. Total Spend</div>
              <div className="font-semibold" style={{ color: 'var(--text-hover)' }}>{totalSpend.split(' ')[0]}</div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '8px' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>EXPANSION WHITESPACE</div>
            <div className="space-y-1.5">
              {account.expansionOpps.slice(0, 3).map((opp, i) => (
                <div key={i} className="text-xs py-1" style={{ borderBottom: i < 2 ? '1px solid var(--border-faint)' : 'none' }}>
                  <div className="flex justify-between mb-0.5">
                    <span style={{ color: 'var(--text-primary)' }}>{opp.product}</span>
                    <span className="font-semibold" style={{ color: '#4ade80' }}>{opp.potential}</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>{opp.reason.slice(0, 60)}…</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
