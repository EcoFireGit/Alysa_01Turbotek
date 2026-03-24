'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Sparkles, UserCircle, Layers, PlayCircle, FileText, MessageSquareText, ArrowLeft, Map, CalendarDays } from 'lucide-react'
import { getAccountBySlug } from '@/lib/accountDetailData'
import { MeetingPrepTab } from './MeetingPrepTab'
import { ClientProfileTab } from './ClientProfileTab'
import { GapAnalysisTab } from './GapAnalysisTab'
import { PlanPlaysTab } from './PlanPlaysTab'
import { StrategicRoadmapTab } from './StrategicRoadmapTab'
import { QBRExecBriefTab } from './QBRExecBriefTab'
import { OutcomesFeedbackTab } from './OutcomesFeedbackTab'

type TabId = 'prep' | 'profile' | 'gaps' | 'plays' | 'roadmap' | 'qbr' | 'outcomes'

const TABS: { id: TabId; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { id: 'prep',     label: 'Meeting Prep',          icon: <CalendarDays className="w-4 h-4" />,    tooltip: 'Pre-call brief: goals, flags, stickiness signals' },
  { id: 'profile',  label: 'Client Profile',       icon: <UserCircle className="w-4 h-4" />,      tooltip: 'Capture and organize client intel' },
  { id: 'gaps',     label: 'Gap Analysis',          icon: <Layers className="w-4 h-4" />,          tooltip: 'Compare current state vs. ideal state' },
  { id: 'plays',    label: 'Plan & Plays',          icon: <PlayCircle className="w-4 h-4" />,      tooltip: 'Action plans and discovery plays' },
  { id: 'roadmap',  label: 'Strategic Roadmap',     icon: <Map className="w-4 h-4" />,             tooltip: 'Business goals aligned to strategy and tactics' },
  { id: 'qbr',      label: 'QSR / Exec Brief',      icon: <FileText className="w-4 h-4" />,        tooltip: 'Generate a client-facing executive summary' },
  { id: 'outcomes', label: 'Outcomes & Feedback',   icon: <MessageSquareText className="w-4 h-4" />, tooltip: 'Track recommendation accuracy' },
]

export function AccountDetailView({ accountId }: { accountId: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('prep')
  const account = getAccountBySlug(accountId)

  useEffect(() => {
    // Apply saved theme
    const saved = localStorage.getItem('alysa-theme')
    if (saved) document.documentElement.setAttribute('data-theme', saved)
    // Enable scrolling (globals.css sets overflow: hidden for the chat layout)
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    return () => {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
  }, [])

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Account not found: {accountId}</div>
      </div>
    )
  }

  const stageColor = account.stage === 'Healthy' ? '#4ade80' : account.stage === 'Monitor' ? '#facc15' : '#f87171'
  const healthColor = account.health >= 70 ? '#4ade80' : account.health >= 40 ? '#facc15' : '#f87171'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Sticky header */}
      <div className="sticky top-0 z-20 px-6 py-3" style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-subtle)' }}>
        {/* Top row */}
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <Building2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-hover)' }}>{account.name}</h1>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: stageColor + '22', color: stageColor, border: `1px solid ${stageColor}44` }}
            >
              {account.stage}
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>{account.arr}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>· Renewal: {account.renewal}</span>
          </div>

          {/* Right stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Health</div>
              <div className="text-xl font-bold" style={{ color: healthColor }}>{account.health}</div>
            </div>
            <div style={{ width: '110px' }}>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>Profile</span><span>{account.profileCompleteness}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--border-subtle)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${account.profileCompleteness}%`,
                    background: account.profileCompleteness >= 70 ? '#4ade80' : account.profileCompleteness >= 50 ? '#facc15' : '#f87171',
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Wallet Share</div>
              <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{account.walletShare}%</div>
            </div>
          </div>
        </div>

        {/* Next Best Conversation bar */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2"
          style={{
            background: 'var(--accent-bg-soft, rgba(87,94,207,0.08))',
            border: '1px solid var(--accent-border-medium, rgba(87,94,207,0.2))',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <span className="text-xs">
            <strong style={{ color: 'var(--accent)' }}>Next Best Conversation: </strong>
            <span style={{ color: 'var(--text-secondary)' }}>{account.nextBestConversation}</span>
          </span>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border-faint)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.tooltip}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all"
              style={{
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                background: 'transparent',
                marginBottom: '-1px',
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {activeTab === 'prep'     && <MeetingPrepTab account={account} />}
        {activeTab === 'profile'  && <ClientProfileTab account={account} />}
        {activeTab === 'gaps'     && <GapAnalysisTab account={account} />}
        {activeTab === 'plays'    && <PlanPlaysTab account={account} />}
        {activeTab === 'roadmap'  && <StrategicRoadmapTab account={account} />}
        {activeTab === 'qbr'      && <QBRExecBriefTab account={account} />}
        {activeTab === 'outcomes' && <OutcomesFeedbackTab account={account} />}
      </div>
    </div>
  )
}
