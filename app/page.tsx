'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { ChatInterface } from '@/components/ChatInterface'
import { Account } from '@/lib/types'
import { Sun, Moon } from 'lucide-react'

export default function Home() {
  const [chatKey, setChatKey] = useState(0)
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>()
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('alysa-theme') as 'dark' | 'light' | null
    if (saved) setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('alysa-theme', theme)
  }, [theme])

  function handleAccountClick(account: Account) {
    const prompt = `Give me a full deep dive on ${account.name} — risk analysis, sentiment, data health gaps, and recommended next actions.`
    setInitialPrompt(prompt)
    setChatKey(prev => prev + 1)
  }

  function handleAskAbout(prompt: string) {
    setInitialPrompt(prompt)
    setChatKey(prev => prev + 1)
  }

  function handleNewChat() {
    setInitialPrompt(undefined)
    setChatKey(prev => prev + 1)
  }

  function handleFeedback(messageId: string, type: string, detail?: string) {
    console.log('Feedback:', { messageId, type, detail })
  }

  return (
    <div className="flex h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        onAccountClick={handleAccountClick}
        onAskAbout={handleAskAbout}
        onNewChat={handleNewChat}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg)' }}
        >
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium" style={{ color: 'var(--text-hover)' }}>Strategic Client Alignment Engine</div>
            <div
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}
            >
              claude-opus-4-6
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>$24M MRR · 8 accounts</span>
            <button
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleNewChat}
              className="px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}
              onMouseEnter={e => {
                (e.currentTarget).style.background = 'var(--accent-bg-hover)'
                ;(e.currentTarget).style.borderColor = 'var(--accent-border-hover)'
              }}
              onMouseLeave={e => {
                (e.currentTarget).style.background = 'var(--accent-bg)'
                ;(e.currentTarget).style.borderColor = 'var(--accent-border)'
              }}
            >
              + New chat
            </button>
          </div>
        </div>

        <ChatInterface
          key={chatKey}
          onFeedback={handleFeedback}
          initialPrompt={initialPrompt}
        />
      </div>
    </div>
  )
}
