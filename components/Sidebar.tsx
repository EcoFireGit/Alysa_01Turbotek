'use client'

import { useState } from 'react'
import { Account } from '@/lib/types'
import { PortfolioDashboard } from './PortfolioDashboard'
import { LayoutDashboard, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  onAccountClick: (account: Account) => void
  onAskAbout: (prompt: string) => void
  onNewChat: () => void
}

export function Sidebar({ onAccountClick, onAskAbout, onNewChat }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'chat'>('portfolio')

  if (collapsed) {
    return (
      <div
        className="flex flex-col items-center py-4 gap-3 w-14 flex-shrink-0"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-subtle)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mb-2"
          style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}
        >
          A
        </div>
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setCollapsed(false); setActiveTab('portfolio') }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: activeTab === 'portfolio' ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <LayoutDashboard className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setCollapsed(false); setActiveTab('chat') }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color: activeTab === 'chat' ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col w-80 flex-shrink-0"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--accent-bg-hover)', color: 'var(--accent-light)', border: '1px solid var(--accent-border-strong)' }}
          >
            A
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-hover)' }}>Alysa</div>
            <div className="text-xs" style={{ color: 'var(--accent)' }}>Strategic Client Alignment</div>
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="w-6 h-6 rounded flex items-center justify-center"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex px-3 pt-3 gap-1"
        style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0' }}
      >
        {[
          { id: 'portfolio', label: 'Portfolio', icon: LayoutDashboard },
          { id: 'chat', label: 'History', icon: MessageSquare },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'portfolio' | 'chat')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-t-lg transition-all"
              style={{
                color: isActive ? 'var(--text-hover)' : 'var(--text-muted)',
                background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'portfolio' ? (
          <PortfolioDashboard onAccountClick={onAccountClick} onAskAbout={onAskAbout} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="w-8 h-8 mb-3" style={{ color: 'var(--text-faint)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Chat history coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
