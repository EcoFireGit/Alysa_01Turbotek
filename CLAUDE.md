# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

No test runner or linter is configured. TypeScript type-checking runs implicitly via Next.js dev/build.

## Environment Setup

Copy `.env.local.example` to `.env.local` and set:
```
ANTHROPIC_API_KEY=your_api_key_here
```

## Architecture

**Alysa** is a Next.js 14 App Router application — an AI-powered Strategic Client Alignment Engine for MSPs (Managed Service Providers), demo'd for TurboTek.

### Request Flow

1. User types or speaks a message in `components/ChatInterface.tsx`
2. POST to `app/api/chat/route.ts` with message history
3. Route calls Anthropic SDK (claude-opus-4-6 with adaptive thinking, streaming enabled)
4. Streamed response returned as SSE, rendered in `components/MessageBubble.tsx`

### Key Files

- **`lib/system-prompt.ts`** — The Claude system prompt defining Alysa's persona, response structure, and all simulated portfolio data. This is the primary source of domain logic; changes here directly affect AI behavior.
- **`lib/types.ts`** — All domain TypeScript types: `Account`, `ChatMessage`, `RiskLevel`, `HealthStatus`, `Priority`, etc.
- **`lib/accounts.ts`** — Hardcoded sample account data (8 accounts, ~$2.4M ARR) matching types from `lib/types.ts`. No real backend or database.
- **`app/api/chat/route.ts`** — Streaming POST endpoint. Receives `messages[]` + optional `systemContext`. Uses `anthropic.messages.stream()`.
- **`app/page.tsx`** — Root client component; manages account selection, theme (dark/light via localStorage), and top-level layout.

### Component Structure

```
app/page.tsx
├── Sidebar.tsx
│   ├── PortfolioDashboard.tsx  (account list with risk badges)
│   └── AccountCard.tsx          (per-account health metrics)
└── ChatInterface.tsx            (chat input, speech-to-text, message list)
    └── MessageBubble.tsx        (markdown rendering, sources, feedback)
        ├── SourcesPanel.tsx
        ├── FeedbackBar.tsx
        └── ScoreBadge.tsx
```

### Styling

- Tailwind CSS with a fully custom dark-first theme defined in `tailwind.config.ts` and `app/globals.css`
- CSS custom properties handle dark/light theming via `[data-theme="light"]` on `<html>`
- Custom prose class `.prose-alysa` for markdown-rendered assistant messages
- No component library — all UI is custom

### Domain Context (MSP-specific)

- **MSP Turning Point**: Moment when client MRR covers 100% of TurboTek's fixed costs for that account; below it = unprofitable relationship
- **Risk score**: 0–100; above ~70 is critical churn risk
- **Data sources simulated**: Autotask (PSA), Kaseya (RMM), IT Glue, Thread, Fathom, MS Teams, Forrester/IDC
- The system prompt instructs the model to use MSP-specific language: MRR stickiness, QSR, technology alignment, scope drift

### `app.py`

A separate Python file exists at the root — appears to be an alternative backend implementation. It is independent of the Next.js app.
