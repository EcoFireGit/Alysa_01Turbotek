# Alysa — Strategic Client Alignment Engine

An AI-powered client intelligence platform for MSPs, built by [Prioriwise](https://prioriwise.ai). Alysa acts as a senior management consultant, helping MSP principals and technology alignment managers reduce churn, deepen client relationships, and drive strategic growth.

This instance is demo-configured for **TurboTek** — an 8-account portfolio with $2.4M ARR ($200K MRR).

---

## What It Does

Alysa surfaces insights across a client portfolio by synthesizing signals from PSA, RMM, documentation, meeting notes, and communications tools. It answers questions like:

- "Which accounts are at churn risk this quarter?"
- "What should I cover in the Crestview QSR next week?"
- "Where are we below the MSP Turning Point?"
- "What's our expansion opportunity with Graham Chambers?"

Every response follows a structured format: sources + confidence, advisory summary, recommended next steps, and follow-on questions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS (custom dark theme) |
| AI | Claude claude-opus-4-6 via Anthropic SDK (streaming + adaptive thinking) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Getting Started

**Prerequisites**: Node.js 18+, an Anthropic API key

```bash
# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # Production build
npm run start   # Start production server
```

---

## Portfolio Data

All account data is simulated for demo purposes. The portfolio includes 8 accounts across three health tiers:

| Account | ARR | Risk | Status |
|---|---|---|---|
| Harmon & Associates | $320K | 79 🔴 | Escalation — 48-day silence, renewal in 2mo |
| Crestview Medical Group | $380K | 74 🔴 | Escalation — HIPAA gap, missed QSR |
| Valley Fabrication Inc. | $240K | 71 🔴 | Escalation — network refresh 3yrs overdue |
| Northshore Orthopedics | $280K | 55 🟡 | Stabilise — Windows 10 EOL, budget freeze |
| Lakeview Logistics | $260K | 48 🟡 | Stabilise — ERP stalled, new IT contact |
| Meridian Dental Partners | $220K | 38 🟡 | Stable — transactional, no roadmap |
| Graham Chambers LLP | $360K | 22 🟢 | Expand — $540K–860K opportunity |
| Pinnacle Health Systems | $340K | 18 🟢 | Expand — $680K–1.1M opportunity |

Data sources simulated: **Autotask** (PSA) · **Kaseya** (RMM) · **IT Glue** · **Thread** (AI triage) · **Fathom** (meeting notes) · **MS Teams** · Forrester · IDC

---

## Key Concepts

**MSP Turning Point** — The moment when a client's MRR covers 100% of fixed costs to serve them. Accounts below this threshold consume more resources than they return; accounts above it generate pure profit margin.

**QSR** — Quarterly Strategic Review. A structured meeting between the MSP principal and client stakeholders to align on business goals, technology roadmap, and contract health.

**Risk Score** — 0–100. Above 70 = critical churn risk. Composed of sentiment signals, data health, support escalation patterns, and engagement recency.

---

## Project Structure

```
app/
  api/chat/route.ts     # Streaming Claude API endpoint
  page.tsx              # Root layout and state management
components/             # UI components (chat, sidebar, portfolio)
lib/
  system-prompt.ts      # Alysa's persona and portfolio data (primary config)
  accounts.ts           # Typed account objects
  types.ts              # Domain type definitions
```

To reconfigure Alysa for a different MSP client, update `lib/system-prompt.ts` (portfolio data, MSP context) and `lib/accounts.ts` (typed account objects).

---

## Built With

Alysa is a [Prioriwise](https://prioriwise.ai) customer demo. The underlying AI engine uses Claude claude-opus-4-6 with adaptive thinking enabled for deeper multi-step reasoning on complex portfolio questions.
