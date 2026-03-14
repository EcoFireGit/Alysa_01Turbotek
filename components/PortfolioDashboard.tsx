'use client'

import { accounts, portfolioStats } from '@/lib/accounts'
import { AccountCard } from './AccountCard'
import { Account } from '@/lib/types'
import { InfoTooltip } from './InfoTooltip'
import { RedFlagBriefing } from './RedFlagBriefing'

interface PortfolioDashboardProps {
  onAccountClick: (account: Account) => void
  onAskAbout: (prompt: string) => void
}

function StatCard({ label, value, sub, color, tooltip }: {
  label: string; value: string; sub?: string; color?: string
  tooltip?: { title: string; definition: string; sources?: string[] }
}) {
  return (
    <div
      className="rounded-xl p-4 relative"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
    >
      {tooltip && (
        <div className="absolute top-3 right-3">
          <InfoTooltip title={tooltip.title} definition={tooltip.definition} sources={tooltip.sources} />
        </div>
      )}
      <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-xl font-bold" style={{ color: color || 'var(--text-hover)' }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
  )
}

export function PortfolioDashboard({ onAccountClick, onAskAbout }: PortfolioDashboardProps) {
  const p0Accounts = accounts.filter(a => a.priority === 'P0')
  const expandAccounts = accounts.filter(a => a.priority === 'expand')
  const otherAccounts = accounts.filter(a => a.priority !== 'P0' && a.priority !== 'expand')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-hover)' }}>Client Alignment Portfolio</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>8 accounts · $24M MRR · March 2026</p>
      </div>

      {/* Daily Red Flag Briefing */}
      <RedFlagBriefing onAskAbout={onAskAbout} />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total MRR"
          value="$24M"
          sub="8 accounts"
          tooltip={{
            title: 'Total MRR',
            definition: 'Total Monthly Recurring Revenue across all managed accounts. Simulated demo data.',
            sources: ['Autotask', 'Kaseya RMM'],
          }}
        />
        <StatCard
          label="Churn Risk"
          value="$9.4M"
          sub="3 accounts · act now"
          color="#f87171"
          tooltip={{
            title: 'Churn Risk',
            definition: 'MRR at risk due to active engagement failures — silent accounts, compliance gaps, or unresolved infrastructure issues. Requires immediate principal intervention.',
            sources: ['Autotask', 'Kaseya RMM', 'IT Glue', 'Thread'],
          }}
        />
        <StatCard
          label="Near-Term Expansion"
          value="$1.2–2.0M"
          sub="2 accounts · 60 days"
          color="#4ade80"
          tooltip={{
            title: 'Near-Term Expansion',
            definition: 'Additional MRR achievable within 60 days by converting active client goals and documented IT gaps into project or service expansions.',
            sources: ['Autotask', 'Fathom', 'IT Glue', 'Forrester'],
          }}
        />
        <StatCard
          label="Expansion Whitespace"
          value="$2.3–3.7M"
          sub="Full portfolio"
          color="var(--accent)"
          tooltip={{
            title: 'Expansion Whitespace',
            definition: 'Total upsell opportunity across all accounts based on undocumented client goals, technology gaps, and industry benchmarks for similar-sized firms.',
            sources: ['Autotask', 'IT Glue', 'Forrester', 'IDC'],
          }}
        />
      </div>

      {/* Health distribution */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-xs font-medium mb-3 inline-flex items-center" style={{ color: 'var(--text-secondary)' }}>
          CLIENT HEALTH
          <InfoTooltip
            title="Client Health"
            definition="Distribution of accounts and MRR across alignment tiers. Calculated from composite Risk, Sentiment, and Data Health scores derived from Autotask, Kaseya RMM, IT Glue, and Fathom."
            sources={['Autotask', 'Kaseya RMM', 'IT Glue', 'Fathom']}
          />
        </div>
        <div className="flex gap-2 mb-3">
          {[
            { label: 'At Risk', count: 3, arr: '$9.4M', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
            { label: 'Stabilise', count: 2, arr: '$5.4M', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
            { label: 'Expand', count: 2, arr: '$7.0M', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
            { label: 'Stable', count: 1, arr: '$2.2M', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
          ].map(item => (
            <div
              key={item.label}
              className="flex-1 rounded-lg p-2 text-center"
              style={{ background: item.bg }}
            >
              <div className="text-lg font-bold" style={{ color: item.color }}>{item.count}</div>
              <div className="text-xs" style={{ color: item.color, opacity: 0.8 }}>{item.arr}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* MRR bar */}
        <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
          <div className="h-full rounded-sm" style={{ width: '39%', background: '#f87171' }} title="At Risk: $9.4M" />
          <div className="h-full rounded-sm" style={{ width: '22%', background: '#facc15' }} title="Stabilise: $5.4M" />
          <div className="h-full rounded-sm" style={{ width: '29%', background: '#4ade80' }} title="Expand: $7.0M" />
          <div className="h-full rounded-sm" style={{ width: '9%', background: '#94a3b8' }} title="Stable: $2.2M" />
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>QUICK ACTIONS</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: '🚨 Churn Risk Briefing',        prompt: 'Show churn risk action plans for all at-risk accounts' },
            { label: '📋 QBR Prep — All Accounts',   prompt: 'Prepare a QBR briefing for each account — key goals, gaps, and recommended talking points' },
            { label: '🎯 Goals Alignment Report',     prompt: 'Which accounts have undocumented or misaligned business goals? What should I ask them?' },
            { label: '🚀 Expansion Opportunities',    prompt: 'Show strategic expansion opportunities across all accounts with client business case' },
            { label: '⚠️ Scope Drift & SOW Risk',    prompt: 'Which accounts have requests outside their current SOW? What is the margin exposure?' },
            { label: '🔒 Stickiness Assessment',      prompt: 'Which accounts are most at risk of churning and what would make them stickier?' },
          ].map(action => (
            <button
              key={action.label}
              className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{
                background: 'var(--accent-bg-soft)',
                color: 'var(--accent-light)',
                border: '1px solid var(--accent-border-medium)',
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.background = 'var(--accent-bg-hover)'
                ;(e.target as HTMLElement).style.borderColor = 'var(--accent-border-max)'
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.background = 'var(--accent-bg-soft)'
                ;(e.target as HTMLElement).style.borderColor = 'var(--accent-border-medium)'
              }}
              onClick={() => onAskAbout(action.prompt)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* P0 accounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" style={{ boxShadow: '0 0 6px #f87171' }} />
          <div className="text-xs font-medium" style={{ color: '#f87171' }}>CHURN RISK — IMMEDIATE ACTION</div>
        </div>
        <div className="space-y-2">
          {p0Accounts.map(account => (
            <AccountCard key={account.id} account={account} onClick={onAccountClick} />
          ))}
        </div>
      </div>

      {/* Expand accounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
          <div className="text-xs font-medium" style={{ color: '#4ade80' }}>EXPANSION READY</div>
        </div>
        <div className="space-y-2">
          {expandAccounts.map(account => (
            <AccountCard key={account.id} account={account} onClick={onAccountClick} />
          ))}
        </div>
      </div>

      {/* Other accounts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#facc15' }} />
          <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>STABILISE</div>
        </div>
        <div className="space-y-2">
          {otherAccounts.map(account => (
            <AccountCard key={account.id} account={account} onClick={onAccountClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
