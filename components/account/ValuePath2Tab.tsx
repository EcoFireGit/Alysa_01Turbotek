'use client'

import { useState } from 'react'
import { AlertTriangle, ArrowRight, BarChart2, CheckCircle2, ChevronRight, Database, GitMerge, Layers, RefreshCw, ShieldCheck, Target, Zap, BarChart3 } from 'lucide-react'
import { AccountData } from '@/lib/types'
import { InfoTooltip } from '@/components/InfoTooltip'
import { SectionChat } from './SectionChat'

// ── Source helpers (shared with ValuePath) ─────────────────────────────────

const SOURCE_KEYWORDS: { keyword: string; label: string; color: string }[] = [
  { keyword: 'linkedin',      label: 'LinkedIn',       color: '#0a66c2' },
  { keyword: 'fathom',        label: 'Fathom',         color: '#7c3aed' },
  { keyword: 'it glue',       label: 'IT Glue',        color: '#f59e0b' },
  { keyword: 'thread',        label: 'Thread AI',      color: '#0ea5e9' },
  { keyword: 'kaseya',        label: 'Kaseya RMM',     color: '#16a34a' },
  { keyword: 'rmm',           label: 'Kaseya RMM',     color: '#16a34a' },
  { keyword: 'autotask',      label: 'Autotask PSA',   color: '#f97316' },
  { keyword: 'connectwise',   label: 'ConnectWise',    color: '#e11d48' },
  { keyword: 'crowdstrike',   label: 'CrowdStrike',    color: '#ef4444' },
  { keyword: 'intune',        label: 'Intune',         color: '#0078d4' },
  { keyword: 'azure',         label: 'Azure AD',       color: '#0078d4' },
  { keyword: 'datto',         label: 'Datto BCDR',     color: '#059669' },
  { keyword: 'veeam',         label: 'Veeam',          color: '#16a34a' },
  { keyword: 'microsoft',     label: 'M365',           color: '#0078d4' },
  { keyword: 'cisco',         label: 'Cisco Meraki',   color: '#1d4ed8' },
  { keyword: 'meraki',        label: 'Cisco Meraki',   color: '#1d4ed8' },
  { keyword: 'sd-wan',        label: 'SD-WAN',         color: '#2563eb' },
]

function parseSources(text: string): { label: string; color: string }[] {
  const lower = text.toLowerCase()
  const found: { label: string; color: string }[] = []
  const seen = new Set<string>()
  for (const s of SOURCE_KEYWORDS) {
    if (lower.includes(s.keyword) && !seen.has(s.label)) {
      found.push({ label: s.label, color: s.color })
      seen.add(s.label)
    }
  }
  return found
}

function SourceTag({ label, color }: { label: string; color: string }) {
  return (
    <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ background: color + '18', color, border: `1px solid ${color}33`, fontSize: '10px' }}>
      {label}
    </span>
  )
}

// ── TruMethods goal-project taxonomy ─────────────────────────────────────

const TAXONOMY: { projectKeywords: string[]; goalKeywords: string[]; outcomeLabel: string }[] = [
  { projectKeywords: ['mfa', 'multi-factor', 'conditional access', 'intune', 'mam', 'identity'],       goalKeywords: ['security', 'hipaa', 'compliance', 'privilege', 'audit', 'insurance', 'liability'],        outcomeLabel: 'Security & Compliance' },
  { projectKeywords: ['backup', 'bcdr', 'recovery', 'disaster', 'datto', 'veeam', 'replication'],       goalKeywords: ['continuity', 'resilience', 'recovery', 'downtime', 'ransomware', 'data loss'],            outcomeLabel: 'Business Continuity' },
  { projectKeywords: ['sd-wan', 'network', 'vlan', 'firewall', 'meraki', 'cisco', 'site', 'office'],    goalKeywords: ['scale', 'location', 'remote', 'connectivity', 'expansion', 'branch'],                     outcomeLabel: 'Scalability & Connectivity' },
  { projectKeywords: ['copilot', 'microsoft 365', 'm365', 'teams', 'sharepoint', 'automation'],         goalKeywords: ['productivity', 'collaboration', 'efficiency', 'remote work', 'communication'],             outcomeLabel: 'Productivity & Efficiency' },
  { projectKeywords: ['crowdstrike', 'sentinel', 'edr', 'mdr', 'soc', 'threat', 'detection'],           goalKeywords: ['security', 'resilience', 'compliance', 'insurance', 'cyber', 'breach'],                   outcomeLabel: 'Threat Protection' },
  { projectKeywords: ['azure', 'cloud', 'migration', 'server', 'hosting', 'virtual'],                   goalKeywords: ['scale', 'continuity', 'productivity', 'efficiency', 'modernisation', 'agility'],          outcomeLabel: 'Cloud Modernisation' },
  { projectKeywords: ['laptop', 'refresh', 'hardware', 'endpoint', 'device', 'workstation'],            goalKeywords: ['productivity', 'efficiency', 'billable', 'performance', 'employee'],                      outcomeLabel: 'Productivity & Efficiency' },
  { projectKeywords: ['voip', 'phone', 'communication', 'ucaas', 'teams voice'],                        goalKeywords: ['cost reduction', 'communication', 'efficiency', 'collaboration', 'remote'],                outcomeLabel: 'Cost Reduction & Comms' },
  { projectKeywords: ['training', 'awareness', 'sat', 'knowbe4', 'phishing'],                           goalKeywords: ['compliance', 'insurance', 'security', 'hipaa', 'liability'],                              outcomeLabel: 'Security & Compliance' },
]

function computeConfidence(projectText: string, goalText: string): { score: number; label: 'High' | 'Medium' | 'Low'; outcomeLabel: string } {
  const pt = projectText.toLowerCase()
  const gt = goalText.toLowerCase()
  let best = 0
  let bestOutcome = 'Strategic Alignment'
  for (const t of TAXONOMY) {
    const pMatch = t.projectKeywords.filter(k => pt.includes(k)).length
    const gMatch = t.goalKeywords.filter(k => gt.includes(k)).length
    if (pMatch > 0 && gMatch > 0) {
      const score = pMatch + gMatch
      if (score > best) { best = score; bestOutcome = t.outcomeLabel }
    }
  }
  const label = best >= 4 ? 'High' : best >= 2 ? 'Medium' : 'Low'
  return { score: best, label, outcomeLabel: bestOutcome }
}

// ── Step wrapper ───────────────────────────────────────────────────────────

function Step({ number, label, subtitle, badge, children, isLast = false }: {
  number: number; label: string; subtitle: string; badge?: string; children: React.ReactNode; isLast?: boolean
}) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 40 }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10" style={{ background: 'var(--accent)', color: '#fff', boxShadow: '0 0 0 4px var(--accent-bg)' }}>
          {number}
        </div>
        {!isLast && <div className="flex-1 w-px mt-2" style={{ background: 'var(--border-subtle)', minHeight: 32 }} />}
      </div>
      <div className="flex-1 pb-10">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold" style={{ color: 'var(--text-hover)' }}>{label}</span>
          {badge && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>{badge}</span>}
        </div>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  )
}

// ── Confidence badge ───────────────────────────────────────────────────────

function ConfBadge({ label }: { label: 'High' | 'Medium' | 'Low' }) {
  const c = label === 'High' ? '#4ade80' : label === 'Medium' ? '#facc15' : '#f87171'
  return <span className="text-xs px-1.5 py-0.5 rounded-full font-medium" style={{ color: c, background: c + '18', border: `1px solid ${c}33` }}>{label}</span>
}

// ── Main ───────────────────────────────────────────────────────────────────

export function ValuePath2Tab({ account }: { account: AccountData }) {
  // Build PSA project list from expansionOpps + gapRow recommendations
  const psaProjects = [
    ...account.expansionOpps.map((o, i) => ({
      id: `opp-${i}`,
      title: o.product,
      status: 'Proposed Quote' as const,
      value: o.potential,
      confidence: o.confidence as 'High' | 'Medium' | 'Low',
      description: o.reason,
      source: 'Autotask PSA',
      sourceColor: '#f97316',
    })),
    ...account.gapRows.map((r, i) => ({
      id: `gap-${i}`,
      title: r.recommendation.split(';')[0].replace(/^(Deploy|Add|Present|Proactively present|Propose)\s/i, ''),
      status: 'Technical Recommendation' as const,
      value: `$${r.estimatedValue.toLocaleString()}`,
      confidence: r.confidence,
      description: r.gap,
      source: 'IT Glue',
      sourceColor: '#f59e0b',
    })),
  ]

  // State: goal assignment overrides (projectId → goalIndex)
  const [goalOverrides, setGoalOverrides] = useState<Record<string, number>>({})
  // State: which project is being reassigned
  const [reassigning, setReassigning] = useState<string | null>(null)

  // Auto-map each project to its best goal
  function getBestGoalIndex(proj: typeof psaProjects[0]): number {
    let best = -1; let bestScore = -1
    account.businessGoals.forEach((goal, gi) => {
      const { score } = computeConfidence(proj.title + ' ' + proj.description, goal)
      if (score > bestScore) { bestScore = score; best = gi }
    })
    return best >= 0 ? best : 0
  }

  function getGoalIndex(proj: typeof psaProjects[0]): number {
    return goalOverrides[proj.id] ?? getBestGoalIndex(proj)
  }

  // Coverage: count projects per goal
  const goalCoverage = account.businessGoals.map((_, gi) =>
    psaProjects.filter(p => getGoalIndex(p) === gi)
  )
  const underServedGoals = account.businessGoals.filter((_, gi) => goalCoverage[gi].length === 0)
  const wellServedGoals  = account.businessGoals.filter((_, gi) => goalCoverage[gi].length >= 2)

  // Whitespace: services in our standard stack not yet invoiced
  const whitespace = (account.techStackDetails ?? []).filter(t => !t.isOurWalletShare)

  // Context strings for SectionChat
  const ingestorContext = psaProjects.map(p => `${p.title} (${p.status}) — ${p.description} — ${p.value}`).join('\n')
  const bridgeContext = account.businessGoals.map((g, i) => `Goal: ${g}\nMapped projects: ${goalCoverage[i].map(p => p.title).join(', ') || 'None'}`).join('\n\n')
  const heatmapContext = account.businessGoals.map((g, i) => `${g}: ${goalCoverage[i].length} projects mapped`).join('\n')
  const whitespaceContext = whitespace.map(w => `${w.name} (${w.category})`).join('\n')

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base font-bold" style={{ color: 'var(--text-hover)' }}>Value-Path™ 2</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
            Backlog → Revenue Engine
          </span>
          <InfoTooltip title="Value-Path™ 2" definition="Re-contextualises your existing PSA backlog and stale quotes by mapping every proposed project to a client business goal — converting technical debt into a funded roadmap." sources={['Autotask PSA', 'ConnectWise', 'IT Glue', 'Prioriwise AI Engine']} />
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          PSA Ingest → Semantic Map → Goal Coverage → Whitespace → Validated Roadmap
        </p>
      </div>

      {/* ── Step 1: PSA Project Ingestor ── */}
      <Step number={1} label="PSA Project Ingestor" subtitle="All proposed projects, open quotes, and technical recommendations pulled from the PSA and service catalog." badge="REQ-B1.1 · Autotask PSA">
        <div className="space-y-2">
          {psaProjects.map(proj => {
            const srcs = parseSources(proj.title + ' ' + proj.description)
            const displaySrcs = srcs.length > 0 ? srcs : [{ label: proj.source, color: proj.sourceColor }]
            return (
              <div key={proj.id} className="rounded-xl p-3 flex items-start gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-hover)' }}>{proj.title}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(165,180,252,0.1)', color: '#a5b4fc', fontSize: '10px' }}>{proj.status}</span>
                    <ConfBadge label={proj.confidence} />
                  </div>
                  <div className="text-xs mb-2 leading-snug" style={{ color: 'var(--text-secondary)' }}>{proj.description}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold" style={{ color: '#4ade80' }}>{proj.value}</span>
                    {displaySrcs.map(s => <SourceTag key={s.label} label={s.label} color={s.color} />)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <SectionChat
          sectionTitle="PSA Project Ingestor"
          accountName={account.name}
          context={ingestorContext}
          compact
        />
      </Step>

      {/* ── Step 2: Alignment Canvas (Value Bridge) ── */}
      <Step number={2} label="Alignment Canvas — Value Bridge" subtitle="AI semantic engine maps each PSA project to the client goal it best supports. Review and reassign any connection that doesn't fit." badge="REQ-B1.2 · Semantic Mapping Engine">
        <div className="space-y-3 mb-4">
          {/* Bridge legend */}
          <div className="flex items-center gap-4 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Technical Shore (PSA)</span>
            <ArrowRight className="w-3 h-3" />
            <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Business Shore (Goals)</span>
          </div>

          {psaProjects.map(proj => {
            const goalIdx = getGoalIndex(proj)
            const goal = account.businessGoals[goalIdx]
            const conf = computeConfidence(proj.title + ' ' + proj.description, goal)
            const confColor = conf.label === 'High' ? '#4ade80' : conf.label === 'Medium' ? '#facc15' : '#f87171'
            const srcs = parseSources(proj.title + ' ' + proj.description)

            return (
              <div key={proj.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                <div className="grid grid-cols-12 items-stretch">
                  {/* Left: Project */}
                  <div className="col-span-4 p-3" style={{ background: 'var(--surface)' }}>
                    <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-hover)' }}>{proj.title}</div>
                    <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{proj.value}</div>
                    <div className="flex flex-wrap gap-1">
                      {srcs.length > 0 ? srcs.map(s => <SourceTag key={s.label} label={s.label} color={s.color} />) : <SourceTag label={proj.source} color={proj.sourceColor} />}
                    </div>
                  </div>

                  {/* Center: Bridge */}
                  <div className="col-span-4 flex flex-col items-center justify-center gap-1 py-3 px-2" style={{ background: confColor + '08', borderLeft: `1px solid ${confColor}22`, borderRight: `1px solid ${confColor}22` }}>
                    <div className="flex items-center gap-1">
                      <div className="h-px flex-1" style={{ background: confColor + '44', width: 20 }} />
                      <GitMerge className="w-3.5 h-3.5" style={{ color: confColor }} />
                      <div className="h-px flex-1" style={{ background: confColor + '44', width: 20 }} />
                    </div>
                    <ConfBadge label={conf.label} />
                    <div className="text-xs text-center" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{conf.outcomeLabel}</div>
                    <InfoTooltip title="Alignment Score" definition={`The semantic engine matched keywords in "${proj.title}" to goal language using the TruMethods goal-project taxonomy. Score: ${conf.score} keyword matches.`} sources={['Prioriwise AI Engine', 'TruMethods Taxonomy']} />

                    {/* Reassign */}
                    {reassigning === proj.id ? (
                      <div className="mt-1 w-full">
                        <select
                          className="w-full text-xs rounded px-1 py-0.5 outline-none"
                          style={{ background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', fontSize: '10px' }}
                          value={goalIdx}
                          onChange={e => { setGoalOverrides(prev => ({ ...prev, [proj.id]: parseInt(e.target.value) })); setReassigning(null) }}
                        >
                          {account.businessGoals.map((g, i) => (
                            <option key={i} value={i}>{g.slice(0, 50)}{g.length > 50 ? '…' : ''}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReassigning(proj.id)}
                        className="text-xs mt-1 px-2 py-0.5 rounded flex items-center gap-1"
                        style={{ color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border-faint)', fontSize: '10px' }}
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Reassign
                      </button>
                    )}
                  </div>

                  {/* Right: Goal */}
                  <div className="col-span-4 p-3" style={{ background: 'rgba(165,180,252,0.04)' }}>
                    <div className="flex items-center gap-1 mb-1">
                      <Target className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-light)' }}>Goal</span>
                    </div>
                    <div className="text-xs leading-snug" style={{ color: 'var(--text-secondary)' }}>{goal}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <SourceTag label="Fathom" color="#7c3aed" />
                      <SourceTag label="CRM Notes" color="#6366f1" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <SectionChat
          sectionTitle="Alignment Canvas"
          accountName={account.name}
          context={bridgeContext}
          compact
        />
      </Step>

      {/* ── Step 3: Goal Coverage Heatmap ── */}
      <Step number={3} label="Goal Coverage Heatmap" subtitle="Which business goals are well-funded by projects, and which are starved? Goals with zero mapped projects are a strategic risk." badge="REQ-B2.1">
        <div className="space-y-2 mb-4">
          {account.businessGoals.map((goal, gi) => {
            const projects = goalCoverage[gi]
            const count = projects.length
            const isStarved = count === 0
            const isWell = count >= 2
            const barColor = isStarved ? '#f87171' : isWell ? '#4ade80' : '#facc15'
            const barPct = Math.min(100, count * 25 + (count > 0 ? 15 : 0))

            return (
              <div key={gi} className="rounded-xl p-3" style={{ background: 'var(--surface)', border: `1px solid ${isStarved ? 'rgba(248,113,113,0.3)' : 'var(--border-subtle)'}` }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-hover)' }}>{goal}</span>
                      {isStarved && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                          <AlertTriangle className="w-2.5 h-2.5" /> Starved
                        </span>
                      )}
                      {isWell && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                          <CheckCircle2 className="w-2.5 h-2.5" /> Well-funded
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${barPct}%`, background: barColor }} />
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: barColor }}>{count} project{count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                {count > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {projects.map(p => (
                      <span key={p.id} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)', fontSize: '10px' }}>
                        {p.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="text-xl font-bold" style={{ color: '#4ade80' }}>{wellServedGoals.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Well-funded goals</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <div className="text-xl font-bold" style={{ color: '#facc15' }}>{account.businessGoals.length - wellServedGoals.length - underServedGoals.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Partially covered</div>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <div className="text-xl font-bold" style={{ color: '#f87171' }}>{underServedGoals.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Starved (0 projects)</div>
          </div>
        </div>
        <SectionChat
          sectionTitle="Goal Coverage Heatmap"
          accountName={account.name}
          context={heatmapContext}
          compact
        />
      </Step>

      {/* ── Step 4: Under-Served Goal Alerts ── */}
      <Step number={4} label="Under-Served Goal Alerts" subtitle="Goals with zero technical initiatives attached. These are your highest-priority conversations — the client has stated a goal but no work is being done toward it." badge="REQ-B2.1 · System Alert">
        {underServedGoals.length === 0 ? (
          <div className="rounded-xl p-4 text-center text-xs" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
            All goals have at least one mapped project. No alerts.
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {underServedGoals.map((goal, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.3)' }}>
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                  <div>
                    <div className="text-xs font-semibold mb-1" style={{ color: '#f87171' }}>Strategic Gap Alert</div>
                    <div className="text-xs leading-snug mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Goal <span className="font-medium" style={{ color: 'var(--text-primary)' }}>"{goal}"</span> has no mapped projects. You have a strategic gap here.
                    </div>
                    <div className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                      Instead of "you need better IT," say: "To achieve your goal of '{goal.slice(0, 60)}...,' we don't yet have a funded initiative in place."
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <SourceTag label="Prioriwise AI" color="#7c3aed" />
                  <SourceTag label="Fathom" color="#7c3aed" />
                  <SourceTag label="CRM Notes" color="#6366f1" />
                </div>
              </div>
            ))}
          </div>
        )}
        <SectionChat
          sectionTitle="Under-Served Goal Alerts"
          accountName={account.name}
          context={underServedGoals.map(g => `Starved goal: ${g}`).join('\n') || 'All goals have mapped projects.'}
          compact
        />
      </Step>

      {/* ── Step 5: True Whitespace ── */}
      <Step number={5} label="True Whitespace" subtitle="After mapping the existing backlog, these are the services still missing from the client's stack relative to your standard gold stack — the hidden revenue." badge="REQ-B2.2 · Service Catalog Cross-Ref">
        <div className="space-y-3 mb-4">
          {whitespace.length === 0 ? (
            <div className="rounded-xl p-4 text-center text-xs" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
              Full wallet share captured — no whitespace identified.
            </div>
          ) : (
            whitespace.map((item, i) => {
              const govGoals = account.businessGoals.filter(g => computeConfidence(item.name + ' ' + item.category, g).score > 0)
              const srcTags = (item.sources ?? []).map(s => {
                const kw = SOURCE_KEYWORDS.find(k => s.toLowerCase().includes(k.keyword))
                return { label: s, color: kw?.color ?? '#6366f1' }
              })
              return (
                <div key={i} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(250,204,21,0.3)' }}>
                  <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: 'rgba(250,204,21,0.06)', borderBottom: '1px solid rgba(250,204,21,0.15)' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: '#facc15' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-hover)' }}>{item.name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15', fontSize: '10px' }}>{item.category}</span>
                    </div>
                    <div className="flex gap-1">
                      {srcTags.map(s => <SourceTag key={s.label} label={s.label} color={s.color} />)}
                    </div>
                  </div>
                  {govGoals.length > 0 && (
                    <div className="px-4 py-2" style={{ background: 'var(--surface)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Supports goal: </span>
                      {govGoals.slice(0, 2).map((g, j) => (
                        <span key={j} className="text-xs font-medium ml-1" style={{ color: 'var(--accent-light)' }}>"{g.slice(0, 50)}{g.length > 50 ? '…' : ''}"</span>
                      ))}
                      {item.competingVendors && item.competingVendors.length > 0 && (
                        <span className="text-xs ml-2" style={{ color: '#f87171' }}>⚠ Competing: {item.competingVendors.join(', ')}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
        <SectionChat
          sectionTitle="True Whitespace"
          accountName={account.name}
          context={whitespaceContext || 'No whitespace — full wallet share captured.'}
          compact
        />
      </Step>

      {/* ── Step 6: Validated Roadmap ── */}
      <Step number={6} label="Validated Roadmap" subtitle="Your reviewed and human-validated mapping of every PSA project to a client goal. This is your meeting script — not a sales pitch." badge="Human Validated" isLast>
        <div className="space-y-3 mb-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xl font-bold" style={{ color: 'var(--text-hover)' }}>{psaProjects.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total projects</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xl font-bold" style={{ color: '#4ade80' }}>
                ${psaProjects.reduce((sum, p) => {
                  const v = p.value.replace(/[^0-9.]/g, '')
                  const isK = p.value.toLowerCase().includes('k')
                  const isMo = p.value.toLowerCase().includes('/mo')
                  const n = parseFloat(v) * (isK ? 1000 : 1) * (isMo ? 12 : 1)
                  return sum + (isNaN(n) ? 0 : n)
                }, 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total backlog value</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xl font-bold" style={{ color: '#facc15' }}>{underServedGoals.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Goals still unfunded</div>
            </div>
          </div>

          {/* Validated map */}
          {account.businessGoals.map((goal, gi) => {
            const projects = goalCoverage[gi]
            const isStarved = projects.length === 0
            return (
              <div key={gi} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: `1px solid ${isStarved ? 'rgba(248,113,113,0.3)' : 'var(--border-subtle)'}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-hover)' }}>{goal}</span>
                  {isStarved && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>No funded initiative</span>}
                </div>
                {projects.length > 0 ? (
                  <div className="space-y-1.5 pl-5">
                    {projects.map(p => {
                      const conf = computeConfidence(p.title + ' ' + p.description, goal)
                      return (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                          <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                          <span style={{ color: 'var(--text-secondary)' }}>{p.title}</span>
                          <span className="font-semibold" style={{ color: '#4ade80' }}>{p.value}</span>
                          <ConfBadge label={conf.label} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="pl-5 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                    No projects mapped — add a new initiative or reassign from the Alignment Canvas above.
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Publish */}
        <button className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-80" style={{ background: 'var(--accent)', color: '#fff' }}>
          <Layers className="w-4 h-4" /> Publish Validated Roadmap to QSR / Exec Brief
        </button>

        <SectionChat
          sectionTitle="Validated Roadmap"
          accountName={account.name}
          context={account.businessGoals.map((g, gi) => `Goal: ${g}\nProjects: ${goalCoverage[gi].map(p => p.title).join(', ') || 'None'}`).join('\n\n')}
          compact
        />
      </Step>
    </div>
  )
}
