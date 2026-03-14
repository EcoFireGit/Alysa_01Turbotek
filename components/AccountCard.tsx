'use client'

import { useState } from 'react'
import { Account } from '@/lib/types'
import { RiskBadge, SentimentBadge, DataHealthBadge, PriorityBadge } from './ScoreBadge'
import { InfoTooltip } from './InfoTooltip'

interface AccountCardProps {
  account: Account
  onClick?: (account: Account) => void
  compact?: boolean
}

function formatArr(arr: number) {
  if (arr >= 1000000) return `$${(arr / 1000000).toFixed(1)}M`
  return `$${Math.round(arr / 1000)}K`
}

function getHealthDot(health: string) {
  const colors = { red: '#f87171', yellow: '#facc15', green: '#4ade80' }
  return colors[health as keyof typeof colors] || '#8a8680'
}

const confidenceConfig = {
  high:     { label: '🟢 High',     color: '#4ade80' },
  moderate: { label: '🟡 Moderate', color: '#facc15' },
  low:      { label: '🔴 Low',      color: '#f87171' },
}

const categoryConfig = {
  'Risk Mitigation': { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
  'Revenue Impact':  { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  'Efficiency Gain': { color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)' },
  'Compliance':      { color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  'Operational':     { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
}

export function AccountCard({ account, onClick, compact = false }: AccountCardProps) {
  const [showValue, setShowValue] = useState(false)
  const [showBlocker, setShowBlocker] = useState(false)
  const dotColor = getHealthDot(account.health)

  return (
    <div
      className="rounded-xl cursor-pointer transition-all duration-200"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--accent-border-hover)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--surface-hover)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--border-subtle)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--surface)'
      }}
      onClick={() => onClick?.(account)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
              style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }}
            />
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>
                {account.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {account.industry} · {formatArr(account.arr)} ARR · {formatArr(Math.round(account.arr / 12))} MRR
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Scope drift warning */}
            {account.scopeDrift && (
              <span
                className="text-xs px-1.5 py-0.5 rounded font-medium inline-flex items-center gap-1"
                style={{ background: 'rgba(251,146,60,0.12)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }}
                title="Scope drift detected"
                onClick={e => e.stopPropagation()}
              >
                ⚠️ Scope
                <InfoTooltip
                  title="Scope Drift Detected"
                  definition={`${account.scopeDrift.description} — ${account.scopeDrift.sowReference}. Source: ${account.scopeDrift.source}.`}
                  sources={['MS Teams', 'Email', 'Internal Jira']}
                />
              </span>
            )}
            <PriorityBadge priority={account.priority} />
          </div>
        </div>

        {/* Scores row */}
        <div className="flex gap-2 mb-3">
          <RiskBadge score={account.riskScore} size="sm" />
          <SentimentBadge score={account.sentimentScore} size="sm" />
          <DataHealthBadge score={account.dataHealthScore} size="sm" />
        </div>

        {/* Profile completeness bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="inline-flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              Profile
              <InfoTooltip
                title="Profile Completeness"
                definition="How complete this client's profile is — business goals, key stakeholders, tech stack, and renewal details. Lower scores limit Alysa's analysis and signal gaps in strategic alignment."
                sources={['Autotask', 'IT Glue']}
              />
            </span>
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{account.profileCompleteness}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
            <div
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: `${account.profileCompleteness}%`,
                background: account.profileCompleteness >= 70
                  ? '#4ade80'
                  : account.profileCompleteness >= 40
                  ? '#facc15'
                  : '#f87171',
              }}
            />
          </div>
        </div>

        {/* MSP Turning Point */}
        {account.mspTurningPoint && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="inline-flex items-center text-xs" style={{ color: 'var(--text-secondary)' }}>
                MSP Turning Point
                <InfoTooltip
                  title="MSP Turning Point"
                  definition={`The point at which this account's MRR (monthly recurring revenue) covers its monthly cost-to-serve and every dollar beyond is pure profit. ARR ÷ 12 = MRR. Margin contribution is estimated from Autotask ticket volume, support hours, and account complexity. ${account.mspTurningPoint.note}`}
                  sources={['Autotask', 'Kaseya RMM']}
                />
              </span>
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  color: account.mspTurningPoint.status === 'above' ? '#4ade80' : account.mspTurningPoint.status === 'at' ? '#facc15' : '#f87171',
                  background: account.mspTurningPoint.status === 'above' ? 'rgba(74,222,128,0.1)' : account.mspTurningPoint.status === 'at' ? 'rgba(250,204,21,0.1)' : 'rgba(248,113,113,0.1)',
                }}
              >
                {account.mspTurningPoint.status === 'above' ? '⬆' : account.mspTurningPoint.status === 'at' ? '≈' : '⬇'} {account.mspTurningPoint.marginContribution}% margin
              </span>
            </div>
            <div className="h-1 rounded-full" style={{ background: 'var(--border)' }}>
              <div
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${account.mspTurningPoint.marginContribution}%`,
                  background: account.mspTurningPoint.status === 'above' ? '#4ade80' : account.mspTurningPoint.status === 'at' ? '#facc15' : '#f87171',
                }}
              />
            </div>
          </div>
        )}

        {/* Key signals */}
        {!compact && (
          <div className="flex flex-wrap gap-1">
            {account.keySignals.slice(0, 2).map((signal, i) => (
              <span
                key={i}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
              >
                {signal}
              </span>
            ))}
          </div>
        )}

        {/* Renewal tag */}
        {account.renewalMonths && (
          <div
            className="mt-2 text-xs px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{
              background: account.renewalMonths <= 3 ? 'rgba(248,113,113,0.1)' : 'rgba(250,204,21,0.1)',
              color: account.renewalMonths <= 3 ? '#f87171' : '#facc15',
            }}
          >
            🔔 Renewal in {account.renewalMonths}mo
            <InfoTooltip
              title="Renewal Window"
              definition="Months until contract renewal date. Accounts within 3 months are marked critical — churn risk spikes without active CSM engagement. Source: contract close date + term length."
              sources={['Salesforce']}
            />
          </div>
        )}

        {/* Expansion potential */}
        {account.expansionPotential && (
          <div
            className="mt-2 text-xs px-2 py-0.5 rounded inline-flex items-center gap-1"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
          >
            💰 +{formatArr(account.expansionPotential.low)}–{formatArr(account.expansionPotential.high)} potential
            <InfoTooltip
              title="Expansion Potential"
              definition="Estimated additional ARR range from upsell, cross-sell, or new module adoption. Modeled from current usage gaps, company headcount, and industry benchmarks."
              sources={['Salesforce', 'Forrester', 'IDC']}
            />
          </div>
        )}
      </div>

      {/* Value Snapshot toggle */}
      {account.valueSnapshot && (
        <div
          style={{ borderTop: '1px solid var(--border-subtle)' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowValue(v => !v)}
          >
            <span className="flex items-center gap-1.5">
              📊 Value Snapshot
              <InfoTooltip
                title="Technical-to-Business Translator"
                definition="Automatically infers business outcomes from technical signals across ServiceNow, Salesforce, MS Teams, and industry benchmarks — no manual input required."
                sources={account.valueSnapshot.sources}
              />
            </span>
            <span>{showValue ? '▲' : '▼'}</span>
          </button>

          {showValue && (
            <div className="px-4 pb-4 space-y-3">
              {/* Technical signal */}
              <div
                className="rounded-lg p-3"
                style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  TECHNICAL SIGNAL
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {account.valueSnapshot.technicalSignal}
                </p>
              </div>

              {/* Business outcome */}
              <div
                className="rounded-lg p-3"
                style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    BUSINESS OUTCOME
                  </div>
                  {(() => {
                    const cat = categoryConfig[account.valueSnapshot!.outcomeCategory]
                    return (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ background: cat.bg, color: cat.color }}
                      >
                        {account.valueSnapshot!.outcomeCategory}
                      </span>
                    )
                  })()}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {account.valueSnapshot.businessOutcome}
                </p>
                {account.valueSnapshot.dollarValue && (
                  <div className="mt-2 text-sm font-bold" style={{ color: '#4ade80' }}>
                    {account.valueSnapshot.dollarValue}
                  </div>
                )}
              </div>

              {/* Footer: sources + confidence */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                  {account.valueSnapshot.sources.map(s => (
                    <span
                      key={s}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <span className="text-xs" style={{ color: confidenceConfig[account.valueSnapshot.confidence].color }}>
                  {confidenceConfig[account.valueSnapshot.confidence].label}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blocker Match toggle */}
      {account.blockerMatch && (
        <div
          style={{ borderTop: '1px solid var(--border-subtle)' }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs transition-all"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onClick={() => setShowBlocker(b => !b)}
          >
            <span className="flex items-center gap-1.5">
              🔗 Matched Solution
              <InfoTooltip
                title="Global Pod Knowledge Match"
                definition="Surfaces solutions from other regional delivery teams that resolved a similar blocker. Matched from Internal Jira, MS Teams delivery channels, and ServiceNow resolution notes."
                sources={['Internal Jira', 'MS Teams', 'ServiceNow']}
              />
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
            >
              {account.blockerMatch.matchConfidence}% match
            </span>
          </button>

          {showBlocker && (
            <div className="px-4 pb-4 space-y-3">
              <div
                className="rounded-lg p-3"
                style={{ background: 'var(--surface-deep)', border: '1px solid var(--border-faint)' }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  CURRENT BLOCKER
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {account.blockerMatch.blocker}
                </p>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)' }}
              >
                <div className="text-xs font-semibold mb-1" style={{ color: '#4ade80', letterSpacing: '0.06em' }}>
                  SUGGESTED SOLUTION
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {account.blockerMatch.solution}
                </p>
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  — {account.blockerMatch.resolvedBy}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
