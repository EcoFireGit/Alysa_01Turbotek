'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Plus, Trash2, AlertTriangle, CheckCircle2, ArrowRight,
  Lightbulb, ChevronDown, ChevronUp, Sparkles, Edit2, Layers,
  X, ChevronRight,
} from 'lucide-react'
import { AccountData } from '@/lib/types'
import { InfoTooltip } from '@/components/InfoTooltip'
import { SectionChat } from './SectionChat'
import { useWorkspace, WorkspaceAction } from './WorkspaceContext'
import type { ProjectChip, SourceType, SourceRef, Initiative, GoalNode, WorkspaceState } from './WorkspaceContext'

// Local Action type alias for internal use
type Action = WorkspaceAction

function reducer(state: WorkspaceState, action: Action): WorkspaceState {
  switch (action.type) {
    case 'EDIT_GOAL':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId ? { ...g, text: action.text } : g
        ),
      }

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [
          ...state.goals,
          {
            id: `goal-${Date.now()}`,
            text: 'New Business Goal',
            initiatives: [{
              id: `init-${Date.now()}`,
              text: '',
              textSources: [{ label: 'Manual Entry', color: '#64748b', type: 'manual' as SourceType }],
              textConfidence: 50,
              projectIds: [],
            }],
            expanded: true,
          },
        ],
      }

    case 'TOGGLE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId ? { ...g, expanded: !g.expanded } : g
        ),
      }

    case 'ADD_INITIATIVE':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId
            ? {
                ...g,
                initiatives: [
                  ...g.initiatives,
                  {
                    id: `init-${Date.now()}`,
                    text: '',
                    textSources: [{ label: 'Manual Entry', color: '#64748b', type: 'manual' as SourceType }],
                    textConfidence: 50,
                    projectIds: [],
                    note: 'No gap data found for this goal — this initiative was added manually. Confirm the approach directly with your client before including it in the QSR.',
                  },
                ],
              }
            : g
        ),
      }

    case 'EDIT_INITIATIVE':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId
            ? {
                ...g,
                initiatives: g.initiatives.map(i =>
                  i.id === action.initId ? { ...i, text: action.text } : i
                ),
              }
            : g
        ),
      }

    case 'EDIT_TEXT_CONFIDENCE':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId
            ? {
                ...g,
                initiatives: g.initiatives.map(i =>
                  i.id === action.initId ? { ...i, textConfidence: action.confidence } : i
                ),
              }
            : g
        ),
      }

    case 'EDIT_INITIATIVE_NOTE':
      return {
        ...state,
        goals: state.goals.map(g =>
          g.id === action.goalId
            ? {
                ...g,
                initiatives: g.initiatives.map(i =>
                  i.id === action.initId ? { ...i, note: action.note } : i
                ),
              }
            : g
        ),
      }

    case 'DELETE_INITIATIVE': {
      const releasedIds: string[] = []
      const updated = {
        ...state,
        goals: state.goals.map(g => {
          if (g.id !== action.goalId) return g
          const init = g.initiatives.find(i => i.id === action.initId)
          if (init) releasedIds.push(...init.projectIds)
          return { ...g, initiatives: g.initiatives.filter(i => i.id !== action.initId) }
        }),
      }
      return {
        ...updated,
        unmappedPool: [
          ...updated.unmappedPool,
          ...state.allChips.filter(
            c => releasedIds.includes(c.id) && !updated.unmappedPool.some(u => u.id === c.id)
          ),
        ],
      }
    }

    case 'DROP_CHIP_ON_INITIATIVE': {
      // Remove from unmapped pool and from any other initiative
      const newUnmapped = state.unmappedPool.filter(c => c.id !== action.chipId)
      const newGoals = state.goals.map(g => ({
        ...g,
        initiatives: g.initiatives.map(i => {
          if (i.id === action.initId) {
            return i.projectIds.includes(action.chipId)
              ? i
              : { ...i, projectIds: [...i.projectIds, action.chipId] }
          }
          // Remove from any other initiative
          return { ...i, projectIds: i.projectIds.filter(id => id !== action.chipId) }
        }),
      }))
      return { ...state, goals: newGoals, unmappedPool: newUnmapped }
    }

    case 'RETURN_CHIP_TO_POOL': {
      const chip = state.allChips.find(c => c.id === action.chipId)
      if (!chip) return state
      return {
        ...state,
        goals: state.goals.map(g => ({
          ...g,
          initiatives: g.initiatives.map(i => ({
            ...i,
            projectIds: i.projectIds.filter(id => id !== action.chipId),
          })),
        })),
        unmappedPool: state.unmappedPool.some(c => c.id === action.chipId)
          ? state.unmappedPool
          : [...state.unmappedPool, chip],
      }
    }

    default:
      return state
  }
}

// ── Source detection ──────────────────────────────────────────────────────────

function detectChipSource(label: string): { sourceLabel: string; sourceColor: string } {
  const t = label.toLowerCase()
  if (t.match(/kaseya|rmm|patch|endpoint|agent/)) return { sourceLabel: 'Kaseya RMM', sourceColor: '#16a34a' }
  if (t.match(/autotask|psa|ticket/)) return { sourceLabel: 'Autotask PSA', sourceColor: '#f97316' }
  if (t.match(/microsoft|m365|azure|intune|teams|sharepoint|onedrive|exchange/)) return { sourceLabel: 'M365 / Azure', sourceColor: '#0078d4' }
  if (t.match(/veeam|datto|backup|bcdr|recovery/)) return { sourceLabel: 'BCDR Platform', sourceColor: '#059669' }
  if (t.match(/cisco|meraki|firewall|switch|router|vlan|wifi/)) return { sourceLabel: 'Network Audit', sourceColor: '#6366f1' }
  if (t.match(/crowdstrike|zscaler|mfa|security|cyber|encrypt/)) return { sourceLabel: 'Security Platform', sourceColor: '#ef4444' }
  if (t.match(/\$|proposed|quote|opp/)) return { sourceLabel: 'Autotask PSA', sourceColor: '#f97316' }
  return { sourceLabel: 'IT Glue', sourceColor: '#f59e0b' }
}

// ── Win matcher ───────────────────────────────────────────────────────────────

function findWin(chipLabel: string, account: AccountData): string | undefined {
  const words = chipLabel.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  if (words.length === 0) return undefined

  // Search businessOutcomes — return the impact string on a keyword hit
  for (const o of account.businessOutcomes) {
    const haystack = `${o.metric} ${o.before} ${o.after} ${o.impact}`.toLowerCase()
    if (words.some(w => haystack.includes(w))) return o.impact
  }

  // Search qbrDelivered — strip the "QSR Q# ####:" prefix and date suffix
  for (const d of (account.qbrDelivered ?? [])) {
    const clean = d.replace(/^QSR\s+Q?\d[^:]*:\s*/i, '').replace(/\s*\([^)]*\)\s*$/, '').trim()
    const haystack = d.toLowerCase()
    if (words.some(w => haystack.includes(w))) return clean
  }

  return undefined
}

// ── Initial state builder ─────────────────────────────────────────────────────

function buildInitialState(account: AccountData): WorkspaceState {
  // Build all chips from currentEnvironment + expansionOpps
  const allChips: ProjectChip[] = [
    ...account.currentEnvironment.map((e, i) => {
      const { sourceLabel, sourceColor } = detectChipSource(e)
      return { id: `env-${i}`, label: e, sourceLabel, sourceColor, type: 'current' as const, win: findWin(e, account) }
    }),
    ...account.expansionOpps.map((o, i) => ({
      id: `opp-${i}`,
      label: `${o.product} — ${o.potential}`,
      sourceLabel: 'Autotask PSA',
      sourceColor: '#f97316',
      type: 'proposed' as const,
      win: findWin(o.product, account),
    })),
  ]

  // Source palette
  const SOURCE_PALETTE: Record<SourceType, string> = {
    internal: '#f59e0b',
    meeting:  '#7c3aed',
    industry: '#0ea5e9',
    manual:   '#64748b',
  }

  function makeSource(label: string, type: SourceType): SourceRef {
    return { label, color: SOURCE_PALETTE[type], type }
  }

  function confidenceFromGap(conf: 'High' | 'Medium' | 'Low'): number {
    return conf === 'High' ? 84 : conf === 'Medium' ? 62 : 38
  }

  // Industry sources keyed loosely by topic keyword
  const industrySourceMap: Record<string, SourceRef> = {}
  ;(account.industryResearch ?? []).forEach(r => {
    const key = r.source.toLowerCase().slice(0, 20)
    industrySourceMap[key] = makeSource(`${r.source} (${r.year})`, 'industry')
  })

  function industrySourceForGoal(goalText: string): SourceRef[] {
    const g = goalText.toLowerCase()
    const matches: SourceRef[] = []
    ;(account.industryResearch ?? []).forEach(r => {
      const rel = r.relevance.toLowerCase()
      const finding = r.finding.toLowerCase()
      if (
        g.split(' ').some(w => w.length > 4 && (rel.includes(w) || finding.includes(w)))
      ) {
        const src = makeSource(`${r.source} ${r.year}`, 'industry')
        if (!matches.some(m => m.label === src.label)) matches.push(src)
      }
    })
    return matches.slice(0, 2)
  }

  // Build goals from businessGoals, each pre-seeded with one initiative from gapRows
  const goals: GoalNode[] = account.businessGoals.map((goalText, gi) => {
    const matchingRow = account.gapRows.find(r =>
      r.goal === goalText ||
      goalText.toLowerCase().includes(r.goal.toLowerCase().slice(0, 20)) ||
      r.goal.toLowerCase().includes(goalText.toLowerCase().slice(0, 20))
    ) ?? account.gapRows[gi % Math.max(account.gapRows.length, 1)]

    const rowConf = matchingRow?.confidence ?? 'Medium'
    const textConf = confidenceFromGap(rowConf)

    // Text sources: always Gap Analysis; add meeting source if confidence is High
    const textSources: SourceRef[] = [makeSource('Gap Analysis', 'internal')]
    if (rowConf === 'High') textSources.push(makeSource('Strategy Meeting Notes', 'meeting'))
    if (account.satisfactionSignals.some(s => s.toLowerCase().includes('fathom')))
      textSources.push(makeSource('Fathom', 'meeting'))

    // Impact sources: Turbotek assessment + any matching industry research
    const impactSources: SourceRef[] = [makeSource('Turbotek Assessment', 'internal')]
    const industrySrcs = industrySourceForGoal(goalText)
    impactSources.push(...industrySrcs)

    const impactConf = industrySrcs.length > 0
      ? Math.min(textConf + 8, 96)
      : textConf

    const initiative: Initiative = {
      id: `init-${gi}-0`,
      text: matchingRow ? (matchingRow.gap.length > 120 ? matchingRow.gap.slice(0, 120) + '…' : matchingRow.gap) : '',
      textSources,
      textConfidence: textConf,
      projectIds: [],
    }

    return {
      id: `goal-${gi}`,
      text: goalText,
      initiatives: [initiative],
      expanded: true,
    }
  })

  // All chips start unmapped
  return { goals, unmappedPool: [...allChips], allChips }
}

// ── NBA computation ───────────────────────────────────────────────────────────

function computeNba(
  state: WorkspaceState,
  account: AccountData
): Array<{ level: 'warning' | 'info' | 'ok'; text: string }> {
  const items: Array<{ level: 'warning' | 'info' | 'ok'; text: string }> = []

  state.goals.forEach(g => {
    const total = g.initiatives.reduce((s, i) => s + i.projectIds.length, 0)
    const short = g.text.length > 48 ? g.text.slice(0, 48) + '…' : g.text
    if (total === 0) {
      items.push({ level: 'warning', text: `"${short}" has no mapped projects — active coverage gap.` })
    }
  })

  if (state.unmappedPool.length > 0) {
    items.push({
      level: 'info',
      text: `${state.unmappedPool.length} project${state.unmappedPool.length > 1 ? 's' : ''} in the unmapped pool — drag into an initiative to assign coverage.`,
    })
  }

  if (items.length === 0) {
    items.push({ level: 'ok', text: 'All goals have mapped initiatives and projects. Alignment coverage is strong.' })
  }

  return items.slice(0, 5)
}

// ── AI context builder ────────────────────────────────────────────────────────

function buildAiContext(state: WorkspaceState, account: AccountData): string {
  const lines: string[] = [
    `Account: ${account.name} | ${account.industry} | Health: ${account.health} | Stage: ${account.stage}`,
    `Wallet Share: ${account.walletShare}% | Renewal: ${account.renewal}`,
    '',
    'STRATEGIC ALIGNMENT WORKSPACE STATE:',
  ]
  state.goals.forEach((g, gi) => {
    const total = g.initiatives.reduce((s, i) => s + i.projectIds.length, 0)
    lines.push(`\nGoal ${gi + 1}: ${g.text} [${total === 0 ? 'GAP – no projects mapped' : `${total} projects mapped`}]`)
    g.initiatives.forEach((init, ii) => {
      const chips = state.allChips.filter(c => init.projectIds.includes(c.id))
      lines.push(`  Initiative ${ii + 1}: ${init.text || '(untitled)'}`)
      const wins = state.allChips.filter(c => init.projectIds.includes(c.id) && c.win).map(c => c.win)
      lines.push(`  Client Impact (from wins): ${wins.length > 0 ? wins.join('; ') : '(no wins matched yet)'}`)
      lines.push(`  Projects: ${chips.length > 0 ? chips.map(c => c.label).join(', ') : 'none'}`)
    })
  })
  if (state.unmappedPool.length > 0) {
    lines.push(`\nUnmapped Pool (${state.unmappedPool.length} items): ${state.unmappedPool.map(c => c.label).join(', ')}`)
  }
  return lines.join('\n')
}

// ── Inline edit cell ──────────────────────────────────────────────────────────

function InlineEditCell({
  value,
  onCommit,
  placeholder,
  tooltipTitle,
  tooltipDefinition,
  tooltipSources,
  multiline = false,
  bold = false,
}: {
  value: string
  onCommit: (v: string) => void
  placeholder: string
  tooltipTitle: string
  tooltipDefinition: string
  tooltipSources?: string[]
  multiline?: boolean
  bold?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const singleRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => {
    if (editing) {
      multiline ? inputRef.current?.focus() : singleRef.current?.focus()
    }
  }, [editing, multiline])

  function commit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed !== value) onCommit(trimmed || value)
  }

  if (editing) {
    const sharedStyle: React.CSSProperties = {
      width: '100%',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      border: '1px solid var(--accent)',
      borderRadius: 6,
      padding: '4px 8px',
      fontSize: '0.8125rem',
      outline: 'none',
      fontWeight: bold ? 600 : 400,
    }

    return multiline ? (
      <textarea
        ref={inputRef}
        rows={3}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Escape') { setDraft(value); setEditing(false) } }}
        style={{ ...sharedStyle, resize: 'vertical', minHeight: 56 }}
      />
    ) : (
      <input
        ref={singleRef}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') { setDraft(value); setEditing(false) }
        }}
        style={sharedStyle}
      />
    )
  }

  return (
    <div
      className="group flex items-start gap-1 cursor-text rounded"
      onClick={() => setEditing(true)}
      style={{ padding: '2px 0' }}
    >
      <span
        className="flex-1 leading-snug text-sm"
        style={{
          color: value ? (bold ? 'var(--text-hover)' : 'var(--text-primary)') : 'var(--text-muted)',
          fontWeight: bold ? 600 : 400,
          fontStyle: value ? 'normal' : 'italic',
        }}
      >
        {value || placeholder}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 transition-opacity">
        <Edit2 className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
        <span onMouseDown={e => e.preventDefault()}>
          <InfoTooltip title={tooltipTitle} definition={tooltipDefinition} sources={tooltipSources} />
        </span>
      </div>
    </div>
  )
}

// ── Chip component ─────────────────────────────────────────────────────────────

function Chip({
  chip,
  onRemove,
  dragging = false,
  goals,
  onAssign,
}: {
  chip: ProjectChip
  onRemove?: () => void
  dragging?: boolean
  goals?: GoalNode[]
  onAssign?: (goalId: string, initId: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <div className="relative inline-flex">
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.setData('chipId', chip.id)
          e.dataTransfer.effectAllowed = 'move'
          setMenuOpen(false)
        }}
        className="inline-flex flex-col gap-0.5 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-grab select-none transition-opacity"
        style={{
          background: chip.type === 'proposed' ? 'rgba(249,115,22,0.08)' : 'var(--surface)',
          border: `1px solid ${chip.sourceColor}44`,
          color: 'var(--text-primary)',
          opacity: dragging ? 0.35 : 1,
          maxWidth: 260,
          borderRadius: onAssign ? '8px 0 0 8px' : 8,
        }}
      >
        {/* Label row */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: chip.sourceColor }} />
          <span className="truncate" style={{ maxWidth: 160 }}>{chip.label}</span>
          <span onMouseDown={e => e.preventDefault()}>
            <InfoTooltip
              title={chip.sourceLabel}
              definition={`Detected via ${chip.sourceLabel}. ${chip.type === 'proposed' ? 'Proposed project from Autotask PSA.' : 'Active item in the current environment.'}`}
              sources={[chip.sourceLabel]}
            />
          </span>
          {chip.win && <WinTooltip win={chip.win} />}
          {onRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove() }}
              className="flex-shrink-0 hover:opacity-70 transition-opacity ml-auto"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

      </div>

      {/* Assign button — only shown in unmapped pool context */}
      {onAssign && goals && (
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="h-full flex items-center gap-0.5 px-2 text-xs font-medium transition-all"
            style={{
              background: menuOpen ? 'var(--accent)' : 'var(--accent-bg-soft, rgba(87,94,207,0.1))',
              color: menuOpen ? '#fff' : 'var(--accent)',
              border: `1px solid var(--accent-border, rgba(87,94,207,0.25))`,
              borderLeft: 'none',
              borderRadius: '0 8px 8px 0',
            }}
            title="Assign to an initiative"
          >
            Assign <ChevronRight className="w-3 h-3" />
          </button>

          {menuOpen && (
            <div
              className="absolute z-50 rounded-xl overflow-hidden"
              style={{
                top: '110%',
                left: 0,
                minWidth: 240,
                background: 'var(--surface-raised, var(--sidebar-bg))',
                border: '1px solid var(--border-strong, var(--border-subtle))',
                boxShadow: '0 8px 28px rgba(0,0,0,0.3)',
              }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border-faint)' }}>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Assign to initiative
                </span>
              </div>
              <div className="py-1 max-h-64 overflow-y-auto">
                {goals.map(goal => (
                  <div key={goal.id}>
                    <div className="px-3 py-1.5">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {goal.text.length > 40 ? goal.text.slice(0, 40) + '…' : goal.text}
                      </span>
                    </div>
                    {goal.initiatives.length === 0 ? (
                      <div className="px-4 py-1.5 text-xs" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No initiatives yet
                      </div>
                    ) : (
                      goal.initiatives.map(init => (
                        <button
                          key={init.id}
                          className="w-full text-left px-4 py-2 text-xs transition-colors hover:opacity-80"
                          style={{ color: 'var(--text-primary)', background: 'transparent' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(87,94,207,0.08)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => {
                            onAssign(goal.id, init.id)
                            setMenuOpen(false)
                          }}
                        >
                          {init.text
                            ? (init.text.length > 50 ? init.text.slice(0, 50) + '…' : init.text)
                            : <em style={{ color: 'var(--text-muted)' }}>Untitled initiative</em>}
                        </button>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Drop zone ─────────────────────────────────────────────────────────────────

function DropZone({
  children,
  onDrop,
  highlight,
  empty,
}: {
  children: React.ReactNode
  onDrop: (chipId: string) => void
  highlight: boolean
  empty: boolean
}) {
  const [over, setOver] = useState(false)

  return (
    <div
      className="flex flex-wrap gap-1.5 min-h-[40px] rounded-lg p-2 transition-all"
      style={{
        background: over ? 'rgba(87,94,207,0.08)' : 'transparent',
        border: over
          ? '1px dashed var(--accent)'
          : empty
          ? '1px dashed rgba(248,113,113,0.4)'
          : '1px dashed var(--border-faint)',
      }}
      onDragOver={e => { e.preventDefault(); setOver(true) }}
      onDragLeave={e => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
      }}
      onDrop={e => {
        e.preventDefault()
        setOver(false)
        const chipId = e.dataTransfer.getData('chipId')
        if (chipId) onDrop(chipId)
      }}
    >
      {children}
      {empty && !over && (
        <span className="text-xs px-2 py-1 rounded" style={{ color: '#f87171', fontSize: '11px' }}>
          Drop project here
        </span>
      )}
      {over && (
        <span className="text-xs px-2 py-1 rounded" style={{ color: 'var(--accent)', fontSize: '11px' }}>
          Release to assign
        </span>
      )}
    </div>
  )
}

// ── Win tooltip ───────────────────────────────────────────────────────────────

function WinTooltip({ win }: { win: string }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => setMounted(true), [])

  function show() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.top, left: r.left + r.width / 2 })
    }
  }

  const showBelow = pos !== null && pos.top < 160
  const tooltipStyle: React.CSSProperties = pos
    ? showBelow
      ? { top: pos.top + 20, left: pos.left, transform: 'translateX(-50%)' }
      : { bottom: window.innerHeight - pos.top + 8, left: pos.left, transform: 'translateX(-50%)' }
    : {}

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        className="inline-flex items-center justify-center cursor-help rounded-full flex-shrink-0"
        style={{
          width: 13, height: 13,
          background: 'rgba(74,222,128,0.15)',
          border: '1px solid rgba(74,222,128,0.4)',
          color: '#4ade80',
          fontSize: 8,
          fontWeight: 700,
          verticalAlign: 'middle',
          lineHeight: 1,
          marginLeft: 2,
        }}
      >
        w
      </span>
      {mounted && pos && createPortal(
        <div style={{
          position: 'fixed',
          ...tooltipStyle,
          width: 240,
          zIndex: 9999,
          background: 'var(--surface-raised, #1e2030)',
          border: '1px solid rgba(74,222,128,0.3)',
          borderRadius: 10,
          padding: '10px 12px',
          boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Proven Win
          </div>
          <div style={{ fontSize: '0.72rem', lineHeight: 1.55, color: 'var(--text-secondary, #94a3b8)' }}>
            {win}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Source badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: SourceRef }) {
  const typeLabel: Record<SourceType, string> = {
    internal: 'Internal data',
    meeting:  'Meeting / transcript',
    industry: 'Industry research',
    manual:   'Manually entered',
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0"
      style={{
        background: source.color + '16',
        color: source.color,
        border: `1px solid ${source.color}30`,
        fontSize: '10px',
      }}
      title={typeLabel[source.type]}
    >
      <span
        className="w-1 h-1 rounded-full flex-shrink-0"
        style={{ background: source.color }}
      />
      {source.label}
    </span>
  )
}

// ── Confidence pill (editable) ─────────────────────────────────────────────────

function ConfidencePill({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setDraft(String(value)) }, [value])
  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const color = value >= 75 ? '#4ade80' : value >= 50 ? '#facc15' : '#f87171'
  const label = value >= 75 ? 'High' : value >= 50 ? 'Medium' : 'Low'

  function commit() {
    setEditing(false)
    const n = parseInt(draft, 10)
    if (!isNaN(n)) onChange(Math.max(0, Math.min(100, n)))
  }

  if (editing) {
    return (
      <div className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={100}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          className="w-12 text-xs px-1 py-0.5 rounded outline-none text-center"
          style={{
            background: 'var(--bg)',
            color: 'var(--text-primary)',
            border: `1px solid ${color}`,
          }}
        />
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>%</span>
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium transition-opacity hover:opacity-75"
      style={{
        background: color + '16',
        color,
        border: `1px solid ${color}30`,
        fontSize: '10px',
        cursor: 'text',
      }}
      title="Click to adjust confidence score"
    >
      {value}% · {label}
    </button>
  )
}

// ── Provenance row (sources + confidence) ─────────────────────────────────────

function ProvenanceRow({
  sources,
  confidence,
  onConfidenceChange,
}: {
  sources: SourceRef[]
  confidence: number
  onConfidenceChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2">
      {sources.map((s, i) => <SourceBadge key={i} source={s} />)}
      <ConfidencePill value={confidence} onChange={onConfidenceChange} />
    </div>
  )
}

// ── Initiative row ────────────────────────────────────────────────────────────

function NoteCallout({
  note,
  onCommit,
}: {
  note: string
  onCommit: (v: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(note)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(note) }, [note])
  useEffect(() => { if (editing) textareaRef.current?.focus() }, [editing])

  function commit() {
    setEditing(false)
    if (draft.trim() !== note) onCommit(draft.trim())
  }

  return (
    <div
      className="px-4 py-2.5"
      style={{
        borderTop: '1px solid var(--border-faint)',
        background: 'rgba(251,191,36,0.05)',
        borderLeft: '3px solid #f59e0b',
      }}
    >
      <div className="flex items-start gap-2">
        <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Alysa Recommendation Note</span>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="p-0.5 rounded hover:opacity-70 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
                title="Edit note"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {editing ? (
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={e => { if (e.key === 'Escape') { setDraft(note); setEditing(false) } }}
              rows={3}
              className="w-full text-xs rounded px-2 py-1.5 outline-none resize-none"
              style={{
                background: 'var(--bg)',
                color: 'var(--text-primary)',
                border: '1px solid #f59e0b55',
              }}
            />
          ) : (
            <p
              className="text-xs leading-relaxed cursor-text"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setEditing(true)}
            >
              {note || <span className="italic" style={{ color: 'var(--text-muted)' }}>Click to add a recommendation note…</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function InitiativeRow({
  init,
  goalId,
  allChips,
  dispatch,
}: {
  init: Initiative
  goalId: string
  allChips: ProjectChip[]
  dispatch: React.Dispatch<Action>
}) {
  const chips = allChips.filter(c => init.projectIds.includes(c.id))

  return (
    <div style={{ borderTop: '1px solid var(--border-faint)' }}>
      {/* Main 4-column grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '1fr 200px 1fr 32px',
          alignItems: 'start',
        }}
      >
        {/* Initiative text */}
        <div className="px-4 py-3" style={{ borderRight: '1px solid var(--border-faint)' }}>
          <InlineEditCell
            value={init.text}
            onCommit={v => dispatch({ type: 'EDIT_INITIATIVE', goalId, initId: init.id, text: v })}
            placeholder="Describe the strategic initiative…"
            tooltipTitle="Strategic Initiative"
            tooltipDefinition="A mid-level strategy bridging a business goal and the technical work required. Seeded from Gap Analysis."
            tooltipSources={init.textSources.map(s => s.label)}
            multiline
          />
          <ProvenanceRow
            sources={init.textSources}
            confidence={init.textConfidence}
            onConfidenceChange={v => dispatch({ type: 'EDIT_TEXT_CONFIDENCE', goalId, initId: init.id, confidence: v })}
          />
        </div>

        {/* Client impact — derived from mapped chip wins */}
        <div className="px-4 py-3" style={{ borderRight: '1px solid var(--border-faint)' }}>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Client Impact</span>
            <InfoTooltip
              title="Client Impact"
              definition="Derived from the proven wins of mapped project chips. Assign projects with wins to populate this column."
            />
          </div>
          {chips.filter(c => c.win).length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {chips.filter(c => c.win).map(c => (
                <li key={c.id} className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="flex-shrink-0 mt-0.5" style={{ color: '#4ade80' }}>●</span>
                  <span className="leading-snug">{c.win}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
              Assign projects with wins to populate impact.
            </p>
          )}
        </div>

        {/* Project drop zone */}
        <div className="px-3 py-2">
          <DropZone
            onDrop={chipId => dispatch({ type: 'DROP_CHIP_ON_INITIATIVE', goalId, initId: init.id, chipId })}
            highlight={false}
            empty={chips.length === 0}
          >
            {chips.map(chip => (
              <Chip
                key={chip.id}
                chip={chip}
                onRemove={() => dispatch({ type: 'RETURN_CHIP_TO_POOL', chipId: chip.id })}
              />
            ))}
          </DropZone>
        </div>

        {/* Delete */}
        <div className="px-1 pt-3 flex justify-center">
          <button
            onClick={() => dispatch({ type: 'DELETE_INITIATIVE', goalId, initId: init.id })}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            title="Remove initiative"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recommendation note — full width callout */}
      <NoteCallout
        note={init.note ?? ''}
        onCommit={v => dispatch({ type: 'EDIT_INITIATIVE_NOTE', goalId, initId: init.id, note: v })}
      />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function StrategicAlignmentWorkspace({ account }: { account: AccountData }) {
  const { state, dispatch } = useWorkspace()
  const [showChat, setShowChat] = useState(false)
  const [poolDragOver, setPoolDragOver] = useState(false)

  const nba = useMemo(() => computeNba(state, account), [state, account])
  const aiContext = useMemo(() => buildAiContext(state, account), [state, account])

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-bold" style={{ color: 'var(--text-hover)' }}>
            Strategic Alignment Workspace
          </span>
          <InfoTooltip
            title="Strategic Alignment Workspace"
            definition="Maps business goals → strategic initiatives → technical projects. Drag project chips from the unmapped pool into initiatives to close coverage gaps. All cells are editable inline."
            sources={['IT Glue', 'Autotask PSA', 'Gap Analysis']}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'ADD_GOAL' })}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{
              background: 'var(--accent-bg-soft, rgba(87,94,207,0.08))',
              color: 'var(--accent)',
              border: '1px solid var(--accent-border, rgba(87,94,207,0.2))',
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Goal
          </button>
          <button
            onClick={() => setShowChat(v => !v)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: showChat ? 'var(--accent)' : 'var(--surface)',
              color: showChat ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showChat ? 'Close AI' : 'AI Assistant'}
          </button>
        </div>
      </div>


      {/* Main layout: workspace + optional AI chat */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">

          {/* Table column headers */}
          <div
            className="rounded-t-xl grid text-xs font-bold uppercase tracking-wide px-0 py-0"
            style={{
              gridTemplateColumns: '1fr 200px 1fr 32px',
              background: 'var(--surface)',
              border: '1px solid var(--border-subtle)',
              borderBottom: '2px solid var(--border-subtle)',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
          >
            {[
              {
                label: 'Strategic Initiative',
                tip: 'A mid-level strategy bridging a business goal and the technical work required to achieve it. Click to edit.',
                padding: 'px-4 py-2.5',
              },
              {
                label: 'Client Impact',
                tip: 'Qualitative or quantitative business outcome — e.g. "Reduces downtime risk by 70%" or "Saves 10 hrs/week". Click to edit.',
                padding: 'px-4 py-2.5',
              },
              {
                label: 'Mapped Projects',
                tip: 'Technical projects from the Unmapped Pool assigned to this initiative. Drag project chips here to map them.',
                padding: 'px-4 py-2.5',
              },
            ].map(col => (
              <div
                key={col.label}
                className={`${col.padding} flex items-center gap-1`}
                style={{
                  color: 'var(--text-muted)',
                  borderRight: col.label !== 'Mapped Projects' ? '1px solid var(--border-faint)' : 'none',
                }}
              >
                {col.label}
                <InfoTooltip title={col.label} definition={col.tip} />
              </div>
            ))}
            <div />
          </div>

          {/* Goal rows */}
          <div
            className="rounded-b-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)', borderTop: 'none' }}
          >
            {state.goals.length === 0 && (
              <div className="px-6 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                No business goals recorded. Click "Add Goal" to create one.
              </div>
            )}

            {state.goals.map((goal, gi) => {
              const totalMapped = goal.initiatives.reduce((s, i) => s + i.projectIds.length, 0)
              const isGap = totalMapped === 0
              const coverageColor = isGap ? '#f87171' : totalMapped < 3 ? '#facc15' : '#4ade80'

              return (
                <div
                  key={goal.id}
                  style={{
                    borderTop: gi > 0 ? '2px solid var(--border-subtle)' : 'none',
                    background: isGap ? 'rgba(248,113,113,0.025)' : 'transparent',
                  }}
                >
                  {/* Goal header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                    style={{
                      background: isGap
                        ? 'rgba(248,113,113,0.04)'
                        : 'rgba(87,94,207,0.03)',
                      borderBottom: goal.expanded ? '1px solid var(--border-faint)' : 'none',
                    }}
                    onClick={() => dispatch({ type: 'TOGGLE_GOAL', goalId: goal.id })}
                  >
                    {/* Coverage dot */}
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: coverageColor,
                        boxShadow: `0 0 6px ${coverageColor}55`,
                      }}
                    />

                    {/* Editable goal title */}
                    <div className="flex-1 min-w-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          color: 'var(--accent)',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        Business Goal:
                      </span>
                      <InlineEditCell
                        value={goal.text}
                        onCommit={v => dispatch({ type: 'EDIT_GOAL', goalId: goal.id, text: v })}
                        placeholder="Business goal…"
                        tooltipTitle="Business Goal"
                        tooltipDefinition="High-level business objective stated by the client. Seeded from CRM or meeting notes. Click to edit."
                        tooltipSources={['CRM', 'Strategy Meeting']}
                        bold
                      />
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: coverageColor + '18',
                          color: coverageColor,
                          border: `1px solid ${coverageColor}33`,
                        }}
                      >
                        {isGap ? 'No coverage' : `${totalMapped} project${totalMapped !== 1 ? 's' : ''}`}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); dispatch({ type: 'ADD_INITIATIVE', goalId: goal.id }) }}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium"
                        style={{
                          background: 'var(--accent-bg-soft, rgba(87,94,207,0.08))',
                          color: 'var(--accent)',
                          border: '1px solid var(--accent-border, rgba(87,94,207,0.2))',
                        }}
                      >
                        <Plus className="w-3 h-3" /> Initiative
                      </button>
                      {goal.expanded ? (
                        <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      ) : (
                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                  </div>

                  {/* Initiatives */}
                  {goal.expanded && (
                    <div>
                      {goal.initiatives.length === 0 ? (
                        <div
                          className="px-8 py-4 text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          No initiatives yet — click "+ Initiative" to define a strategy for this goal.
                        </div>
                      ) : (
                        goal.initiatives.map(init => (
                          <InitiativeRow
                            key={init.id}
                            init={init}
                            goalId={goal.id}
                            allChips={state.allChips}
                            dispatch={dispatch}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Unmapped pool */}
          <div
            className="mt-5 rounded-xl transition-all"
            style={{
              border: `1px dashed ${poolDragOver ? 'var(--accent)' : 'var(--border-subtle)'}`,
              background: poolDragOver ? 'rgba(87,94,207,0.05)' : 'var(--surface)',
            }}
            onDragOver={e => { e.preventDefault(); setPoolDragOver(true) }}
            onDragLeave={e => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setPoolDragOver(false)
            }}
            onDrop={e => {
              e.preventDefault()
              setPoolDragOver(false)
              const chipId = e.dataTransfer.getData('chipId')
              if (chipId) dispatch({ type: 'RETURN_CHIP_TO_POOL', chipId })
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                borderBottom: state.unmappedPool.length > 0 ? '1px solid var(--border-faint)' : 'none',
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Unmapped Technical Projects
                </span>
                <InfoTooltip
                  title="Unmapped Pool"
                  definition="Projects and environment items detected from PSA, RMM, and IT Glue that haven't been assigned to a strategic initiative. Drag them into an initiative above to establish technical coverage."
                  sources={['Autotask PSA', 'Kaseya RMM', 'IT Glue']}
                />
                {state.unmappedPool.length > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: 'rgba(248,113,113,0.12)',
                      color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.25)',
                    }}
                  >
                    {state.unmappedPool.length}
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                ← Drag chips up into an initiative to assign · Drag chips here to un-assign
              </span>
            </div>

            {state.unmappedPool.length > 0 ? (
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {state.unmappedPool.map(chip => (
                  <Chip
                    key={chip.id}
                    chip={chip}
                    goals={state.goals}
                    onAssign={(goalId, initId) =>
                      dispatch({ type: 'DROP_CHIP_ON_INITIATIVE', goalId, initId, chipId: chip.id })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="px-4 py-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                All projects are mapped to initiatives.
              </div>
            )}
          </div>
        </div>

        {/* AI Chat sidebar */}
        {showChat && (
          <div
            className="flex-shrink-0 rounded-xl overflow-hidden"
            style={{
              width: 300,
              border: '1px solid var(--border-subtle)',
              background: 'var(--sidebar-bg)',
              position: 'sticky',
              top: 80,
              maxHeight: '65vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SectionChat
              sectionTitle="Strategic Alignment Workspace"
              accountName={account.name}
              context={aiContext}
            />
          </div>
        )}
      </div>
    </div>
  )
}
