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
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>8 accounts · $2.4M ARR · $200K MRR · March 2026</p>
      </div>

      {/* Daily Red Flag Briefing */}
      <RedFlagBriefing onAskAbout={onAskAbout} />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total ARR"
          value="$2.4M"
          sub="$200K MRR · 8 accounts"
          tooltip={{
            title: 'Total ARR vs MRR',
            definition: 'ARR (Annual Recurring Revenue) is the total contracted value across all accounts per year. MRR (Monthly Recurring Revenue) is ARR ÷ 12 — the amount hitting the books each month. Simulated demo data.',
            sources: ['Autotask', 'Kaseya RMM'],
          }}
        />
        <StatCard
          label="ARR at Churn Risk"
          value="$940K"
          sub="$78K MRR · 3 accounts · act now"
          color="#f87171"
          tooltip={{
            title: 'ARR at Churn Risk',
            definition: 'Annual contract value at risk due to active engagement failures — silent accounts, compliance gaps, or unresolved infrastructure issues. MRR equivalent: $78K/month. Requires immediate principal intervention.',
            sources: ['Autotask', 'Kaseya RMM', 'IT Glue', 'Thread'],
          }}
        />
        <StatCard
          label="Near-Term Expansion"
          value="$122–196K"
          sub="$10–16K MRR · 2 accounts · 60 days"
          color="#4ade80"
          tooltip={{
            title: 'Near-Term Expansion',
            definition: 'Additional ARR achievable within 60 days by converting active client goals and documented IT gaps into project or service expansions. MRR equivalent: $10–16K/month.',
            sources: ['Autotask', 'Fathom', 'IT Glue', 'Forrester'],
          }}
        />
        <StatCard
          label="Expansion Whitespace"
          value="$234–372K"
          sub="$20–31K MRR · Full portfolio"
          color="var(--accent)"
          tooltip={{
            title: 'Expansion Whitespace',
            definition: 'Total upsell ARR opportunity across all accounts based on undocumented client goals, technology gaps, and industry benchmarks. MRR equivalent: $20–31K/month.',
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
            { label: 'At Risk', count: 3, arr: '$940K', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
            { label: 'Stabilise', count: 2, arr: '$540K', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
            { label: 'Expand', count: 2, arr: '$700K', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
            { label: 'Stable', count: 1, arr: '$220K', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
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
            { label: '🎯 Goals Gap Report',           prompt: 'Which accounts have no documented business goals? For each one, what questions should I ask to uncover them?' },
            { label: '🗺️ Roadmap Alignment Check',   prompt: 'For each account, show the gap between their business goals and their current strategic IT roadmap' },
            { label: '✅ Tactical Steps Tracker',     prompt: 'Which accounts have a roadmap but missing or stalled tactical steps? What should be actioned in the next 30 days?' },
            { label: '📋 QSR Prep — All Accounts',   prompt: 'Prepare a QSR agenda for each account — goals review, roadmap status, and 90-day action items' },
            { label: '🚨 Churn Risk Briefing',        prompt: 'Which accounts are at churn risk because we lack strategic alignment? What is the immediate action plan?' },
            { label: '🔒 Stickiness Assessment',      prompt: 'Which accounts are stickiest and why? Which are most transactional and what would deepen the relationship?' },
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
