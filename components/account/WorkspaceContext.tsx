'use client'

import { createContext, useContext, useReducer, useMemo, ReactNode } from 'react'
import { AccountData } from '@/lib/types'

// ── Types (re-exported for consumers) ─────────────────────────────────────────

export interface ProjectChip {
  id: string
  label: string
  sourceLabel: string
  sourceColor: string
  type: 'current' | 'proposed'
  win?: string
}

export type SourceType = 'internal' | 'meeting' | 'industry' | 'manual'

export interface SourceRef {
  label: string
  color: string
  type: SourceType
}

export interface Initiative {
  id: string
  text: string
  textSources: SourceRef[]
  textConfidence: number
  projectIds: string[]
  note?: string
}

export interface GoalNode {
  id: string
  text: string
  initiatives: Initiative[]
  expanded: boolean
}

export interface WorkspaceState {
  goals: GoalNode[]
  unmappedPool: ProjectChip[]
  allChips: ProjectChip[]
}

export type WorkspaceAction =
  | { type: 'EDIT_GOAL'; goalId: string; text: string }
  | { type: 'ADD_GOAL' }
  | { type: 'TOGGLE_GOAL'; goalId: string }
  | { type: 'ADD_INITIATIVE'; goalId: string }
  | { type: 'EDIT_INITIATIVE'; goalId: string; initId: string; text: string }
  | { type: 'EDIT_TEXT_CONFIDENCE'; goalId: string; initId: string; confidence: number }
  | { type: 'DELETE_INITIATIVE'; goalId: string; initId: string }
  | { type: 'DROP_CHIP_ON_INITIATIVE'; goalId: string; initId: string; chipId: string }
  | { type: 'RETURN_CHIP_TO_POOL'; chipId: string }
  | { type: 'EDIT_INITIATIVE_NOTE'; goalId: string; initId: string; note: string }

// ── Context ────────────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  state: WorkspaceState
  dispatch: React.Dispatch<WorkspaceAction>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used inside WorkspaceProvider')
  return ctx
}

// ── Helpers (duplicated from StrategicAlignmentWorkspace to avoid cross-import) ─

function detectChipSource(label: string): { sourceLabel: string; sourceColor: string } {
  if (/kaseya|rmm|autotask|psa|it glue/i.test(label)) return { sourceLabel: 'Autotask / Kaseya', sourceColor: '#f97316' }
  if (/microsoft|m365|azure|office/i.test(label)) return { sourceLabel: 'M365 Tenant', sourceColor: '#0ea5e9' }
  if (/cisco|meraki|network|firewall|vpn/i.test(label)) return { sourceLabel: 'Network Mgmt', sourceColor: '#8b5cf6' }
  if (/veeam|backup|bcdr|datto/i.test(label)) return { sourceLabel: 'Backup Platform', sourceColor: '#10b981' }
  if (/mdr|soc|sentinel|security|mfa|intune/i.test(label)) return { sourceLabel: 'Security Stack', sourceColor: '#ef4444' }
  return { sourceLabel: 'IT Glue / CRM', sourceColor: '#64748b' }
}

function findWin(chipLabel: string, account: AccountData): string | undefined {
  const words = chipLabel.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  const candidates = [
    ...account.businessOutcomes.map(o => o.impact),
    ...account.qbrDelivered,
  ]
  return candidates.find(c => words.some(w => c.toLowerCase().includes(w)))
}

function buildInitialState(account: AccountData): WorkspaceState {
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

  function keywordsOverlap(a: string, b: string): boolean {
    const stopwords = new Set(['with', 'from', 'that', 'this', 'have', 'will', 'your', 'their', 'been', 'into'])
    const words = (s: string) => s.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopwords.has(w))
    return words(a).some(w => words(b).some(bw => bw.includes(w) || w.includes(bw)))
  }

  const gapConfidence = (c: 'High' | 'Medium' | 'Low') => c === 'High' ? 84 : c === 'Medium' ? 62 : 38

  function buildNote(conf: number, gapRow?: { recommendation: string; confidence: 'High' | 'Medium' | 'Low' }, chips?: ProjectChip[]): string {
    const chipNames = chips && chips.length > 0 ? chips.slice(0, 2).map(c => c.label).join(', ') : null
    const projectContext = chipNames ? ` Mapped projects include: ${chipNames}.` : ''

    if (!gapRow) {
      return `No gap data found for this goal — this initiative was added manually. Confirm the approach directly with your client before including it in the QSR.${projectContext}`
    }
    if (conf >= 75) {
      return `Engine confidence is high (${conf}%) — this initiative is strongly supported by Gap Analysis data. Confirm the technical scope with your client and plan for delivery this quarter.${projectContext}`
    }
    if (conf >= 50) {
      return `Engine confidence is medium (${conf}%) — inferred from Gap Analysis with some ambiguity. Confirm with your client whether this initiative aligns with their current priorities before pitching it at the next QSR.${projectContext}`
    }
    return `Engine confidence is low (${conf}%) — limited data available to support this recommendation. Validate this initiative directly with the client. Consider asking: "Is [goal] still a top priority for your team this year?"${projectContext}`
  }

  const goals: GoalNode[] = account.businessGoals.map((goalText, gi) => {
    // 1st pass: exact / prefix match
    let matchingGapRows = account.gapRows.filter(r =>
      r.goal === goalText ||
      goalText.toLowerCase().includes(r.goal.toLowerCase().slice(0, 20)) ||
      r.goal.toLowerCase().includes(goalText.toLowerCase().slice(0, 20))
    )

    // 2nd pass: keyword overlap across all gap rows
    if (matchingGapRows.length === 0) {
      matchingGapRows = account.gapRows.filter(r => keywordsOverlap(r.goal, goalText) || keywordsOverlap(r.recommendation, goalText))
    }

    const matchedChips = allChips.filter(c => keywordsOverlap(c.label, goalText))

    const initiative: Initiative = matchingGapRows.length > 0
      ? (() => {
          const conf = gapConfidence(matchingGapRows[0].confidence)
          const chips = matchedChips.slice(0, 3)
          return {
            id: `init-${gi}-0`,
            text: matchingGapRows[0].recommendation,
            textSources: [
              { label: 'Gap Analysis', color: '#7c3aed', type: 'internal' as SourceType },
              { label: 'Strategy Meeting', color: '#0ea5e9', type: 'meeting' as SourceType },
            ],
            textConfidence: conf,
            projectIds: chips.map(c => c.id),
            note: buildNote(conf, matchingGapRows[0], chips),
          }
        })()
      : (() => {
          const chips = matchedChips.slice(0, 3)
          const verb = goalText.toLowerCase().startsWith('reduce') ? 'Reduce' :
                       goalText.toLowerCase().startsWith('enable') ? 'Enable' :
                       goalText.toLowerCase().startsWith('achieve') ? 'Achieve' :
                       goalText.toLowerCase().startsWith('maintain') ? 'Maintain' : 'Address'
          return {
            id: `init-${gi}-0`,
            text: `${verb} the gap: assess current state and define a roadmap to meet this goal. Schedule a discovery session with the client to confirm priorities and technical approach.`,
            textSources: [{ label: 'Manual Entry', color: '#64748b', type: 'manual' as SourceType }],
            textConfidence: 40,
            projectIds: chips.map(c => c.id),
            note: buildNote(40, undefined, chips),
          }
        })()

    return { id: `goal-${gi}`, text: goalText, initiatives: [initiative], expanded: true }
  })

  const mappedChipIds = new Set(goals.flatMap(g => g.initiatives.flatMap(i => i.projectIds)))
  const unmappedPool = allChips.filter(c => !mappedChipIds.has(c.id))

  return { goals, unmappedPool, allChips }
}

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'EDIT_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.goalId ? { ...g, text: action.text } : g) }

    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, {
          id: `goal-${Date.now()}`,
          text: 'New Business Goal',
          initiatives: [{
            id: `init-${Date.now()}`,
            text: '',
            textSources: [{ label: 'Manual Entry', color: '#64748b', type: 'manual' as SourceType }],
            textConfidence: 50,
            projectIds: [],
            note: 'No gap data found for this goal — this initiative was added manually. Confirm the approach directly with your client before including it in the QSR.',
          }],
          expanded: true,
        }],
      }

    case 'TOGGLE_GOAL':
      return { ...state, goals: state.goals.map(g => g.id === action.goalId ? { ...g, expanded: !g.expanded } : g) }

    case 'ADD_INITIATIVE':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.goalId ? {
          ...g,
          initiatives: [...g.initiatives, {
            id: `init-${Date.now()}`,
            text: '',
            textSources: [{ label: 'Manual Entry', color: '#64748b', type: 'manual' as SourceType }],
            textConfidence: 50,
            projectIds: [],
            note: 'No gap data found for this goal — this initiative was added manually. Confirm the approach directly with your client before including it in the QSR.',
          }],
        } : g),
      }

    case 'EDIT_INITIATIVE':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.goalId ? {
          ...g,
          initiatives: g.initiatives.map(i => i.id === action.initId ? { ...i, text: action.text } : i),
        } : g),
      }

    case 'EDIT_TEXT_CONFIDENCE':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.goalId ? {
          ...g,
          initiatives: g.initiatives.map(i => i.id === action.initId ? { ...i, textConfidence: action.confidence } : i),
        } : g),
      }

    case 'EDIT_INITIATIVE_NOTE':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.goalId ? {
          ...g,
          initiatives: g.initiatives.map(i => i.id === action.initId ? { ...i, note: action.note } : i),
        } : g),
      }

    case 'DELETE_INITIATIVE':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.goalId ? {
          ...g,
          initiatives: g.initiatives.filter(i => i.id !== action.initId),
        } : g),
      }

    case 'DROP_CHIP_ON_INITIATIVE': {
      const newGoals = state.goals.map(g => ({
        ...g,
        initiatives: g.initiatives.map(i => ({
          ...i,
          projectIds: i.id === action.initId
            ? Array.from(new Set([...i.projectIds, action.chipId]))
            : i.projectIds.filter(id => id !== action.chipId),
        })),
      }))
      const mappedIds = new Set(newGoals.flatMap(g => g.initiatives.flatMap(i => i.projectIds)))
      return { ...state, goals: newGoals, unmappedPool: state.allChips.filter(c => !mappedIds.has(c.id)) }
    }

    case 'RETURN_CHIP_TO_POOL': {
      const newGoals = state.goals.map(g => ({
        ...g,
        initiatives: g.initiatives.map(i => ({ ...i, projectIds: i.projectIds.filter(id => id !== action.chipId) })),
      }))
      const mappedIds = new Set(newGoals.flatMap(g => g.initiatives.flatMap(i => i.projectIds)))
      return { ...state, goals: newGoals, unmappedPool: state.allChips.filter(c => !mappedIds.has(c.id)) }
    }

    default:
      return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ account, children }: { account: AccountData; children: ReactNode }) {
  const initialState = useMemo(() => buildInitialState(account), [account.id])
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  )
}
