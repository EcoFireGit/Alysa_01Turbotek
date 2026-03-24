'use client'

import { useState } from 'react'
import { accounts, portfolioStats } from '@/lib/accounts'
import { AccountCard } from './AccountCard'
import { Account } from '@/lib/types'
import { InfoTooltip } from './InfoTooltip'
import { RedFlagBriefing } from './RedFlagBriefing'
import { ChevronDown, ChevronRight, Play, Database, BookOpen } from 'lucide-react'

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

const DEMO_SCENES = [
  {
    step: 1,
    title: 'Pre-Strategy Call Brief',
    cue: 'TAM does the prep, you come in focused on key issues. Show what that looks like in 10 seconds.',
    prompt: 'What should I know before my strategy meeting with Harmon & Associates this week? Give me the key issues, open items, and what has changed since our last meeting.',
  },
  {
    step: 2,
    title: 'Business Goal Capture Framework',
    cue: '"I don\'t have a structured approach to capturing goals." Show the framework that fixes that.',
    prompt: 'Show me the business goal profile for Harmon & Associates — what goals are documented, what is missing, and what questions should I be asking to fill the gaps?',
  },
  {
    step: 3,
    title: 'Goals → Strategy → Tactics',
    cue: 'Not a sales report. Map what they said they want to the conversation I should be having this quarter.',
    prompt: 'For Harmon & Associates, map their current business goals to strategic gaps and give me the tactical recommendations I should bring to this quarter\'s strategy meeting.',
  },
  {
    step: 4,
    title: 'Industry Research to Back the Recommendation',
    cue: '"I\'ve struggled getting objective research… it comes from the vendor." Show the CFO a citation, not an opinion.',
    prompt: 'What objective industry research supports recommending a network infrastructure refresh for Valley Fabrication Inc.? They are on year 7 of their current setup and the owner is pushing back.',
  },
  {
    step: 5,
    title: 'Stickiness & Churn Signal',
    cue: 'Surface who is trending toward disengagement before it becomes a problem.',
    prompt: 'Which of my accounts show the lowest engagement and are most at risk of going silent or disengaging? What is the early warning signal for each?',
  },
  {
    step: 6,
    title: 'The Dropped-Call Moment',
    cue: '"Does he want to fire me?" Answer that question in 10 seconds.',
    prompt: 'A CFO from one of my accounts just called me and dropped the line before I could answer. What do I know about that account right now — sentiment trend, open issues, anything that changed recently?',
  },
]

export function PortfolioDashboard({ onAccountClick, onAskAbout }: PortfolioDashboardProps) {
  const [demoOpen, setDemoOpen] = useState(false)
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
          label="Goal Alignment Actions Ready"
          value="2 accounts"
          sub="Active goals mapped · gaps identified · ready to discuss"
          color="#4ade80"
          tooltip={{
            title: 'Goal Alignment Actions Ready',
            definition: 'Accounts where client business goals are documented and strategic gaps have been identified — ready for a targeted conversation this quarter. Focus here to deepen strategic partnership and stickiness.',
            sources: ['Autotask', 'Fathom', 'IT Glue', 'Forrester'],
          }}
        />
        <StatCard
          label="Undocumented Goals"
          value="5 accounts"
          sub="Goal capture incomplete · stickiness at risk"
          color="var(--accent)"
          tooltip={{
            title: 'Undocumented Goals',
            definition: 'Accounts where business goals are missing or incomplete in the client profile. Without documented goals, strategic alignment conversations are ad hoc — and stickiness depends on individuals rather than process.',
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

      {/* TurboTek Demo Script */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-bg)' }}
      >
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          onClick={() => setDemoOpen(o => !o)}
        >
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5" style={{ color: 'var(--accent-light)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>TURBOTEK DEMO SCRIPT</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)', fontSize: '10px' }}
            >
              6 scenes
            </span>
          </div>
          {demoOpen
            ? <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--accent-light)' }} />
            : <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--accent-light)' }} />
          }
        </button>

        {demoOpen && (
          <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid var(--accent-border)' }}>
            <p className="text-xs pt-3 pb-1" style={{ color: 'var(--accent-light)', opacity: 0.7 }}>
              Core use case: Goals → Strategy → Tactics · Stickiness & churn prevention
            </p>
            {DEMO_SCENES.map(scene => (
              <div
                key={scene.step}
                className="rounded-lg p-3"
                style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center font-bold mt-0.5"
                      style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)', fontSize: '10px' }}
                    >
                      {scene.step}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-hover)' }}>{scene.title}</div>
                      <div className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{scene.cue}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onAskAbout(scene.prompt)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                    style={{
                      background: 'var(--accent-bg-soft)',
                      color: 'var(--accent-light)',
                      border: '1px solid var(--accent-border-medium)',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.background = 'var(--accent-bg-hover)'
                      ;(e.currentTarget).style.borderColor = 'var(--accent-border-max)'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.background = 'var(--accent-bg-soft)'
                      ;(e.currentTarget).style.borderColor = 'var(--accent-border-medium)'
                    }}
                  >
                    <Play className="w-2.5 h-2.5" />
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
            { label: '📈 MSP Turning Point',           prompt: 'For each account, are we above or below the MSP Turning Point? Which accounts are consuming more in cost-to-serve than they return in MRR contribution?' },
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

      {/* Data Sources */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DATA SOURCES</div>

        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Database className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Connected Systems</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Autotask', desc: 'PSA · tickets · contracts' },
              { name: 'Kaseya RMM', desc: 'endpoints · alerts · health' },
              { name: 'IT Glue', desc: 'docs · assets · passwords' },
              { name: 'Thread', desc: 'AI triage · ticket routing' },
              { name: 'Fathom', desc: 'meeting notes · call recordings' },
              { name: 'MS Teams', desc: 'comms · engagement signals' },
            ].map(src => (
              <div key={src.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#4ade80', boxShadow: '0 0 4px #4ade80' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{src.name}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{src.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: '10px' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Industry Research</span>
          </div>
          <div className="space-y-1.5">
            {[
              { name: 'Forrester', desc: 'infrastructure · lifecycle' },
              { name: 'IDC', desc: 'market data · benchmarks' },
              { name: 'Gartner', desc: 'risk · downtime cost' },
            ].map(src => (
              <div key={src.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-light)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{src.name}</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{src.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
