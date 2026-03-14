"""
Alysa — AI-powered Customer Success Growth Engine
Built on Streamlit + Claude claude-opus-4-6 | Prioriwise brand
⚠️  ALL DATA IS SIMULATED FOR DEMO PURPOSES ONLY
"""

import streamlit as st
import anthropic
import os
import re
from dataclasses import dataclass, field
from typing import Optional

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Alysa | CS Growth Engine",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Brand CSS (Prioriwise palette) ───────────────────────────────────────────
st.markdown("""
<style>
  /* ── Prioriwise brand tokens ── */
  :root {
    --bg:           #1b1b1b;
    --surface:      #242424;
    --surface-hi:   #2a2a2a;
    --border:       rgba(255,255,255,0.08);
    --text:         #c5c1b9;
    --text-dim:     #8a8680;
    --text-hi:      #dcdad5;
    --accent:       #575ECF;
    --accent-light: #a5b4fc;
    --green:        #4ade80;
    --yellow:       #facc15;
    --red:          #f87171;
    --font:         'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* ── Global reset ── */
  html, body, [data-testid="stAppViewContainer"],
  [data-testid="stApp"] {
    background: var(--bg) !important;
    color: var(--text) !important;
    font-family: var(--font) !important;
  }

  /* ── Sidebar ── */
  [data-testid="stSidebar"] {
    background: #161616 !important;
    border-right: 1px solid var(--border) !important;
  }
  [data-testid="stSidebar"] * { color: var(--text) !important; }

  /* ── Hide default Streamlit chrome ── */
  #MainMenu, footer, header { visibility: hidden; }
  .block-container { padding-top: 1rem !important; padding-bottom: 1rem !important; }

  /* ── Buttons ── */
  .stButton > button {
    background: rgba(87,94,207,0.12) !important;
    color: var(--accent-light) !important;
    border: 1px solid rgba(87,94,207,0.25) !important;
    border-radius: 8px !important;
    font-size: 0.78rem !important;
    transition: all 0.15s !important;
  }
  .stButton > button:hover {
    background: rgba(87,94,207,0.22) !important;
    border-color: rgba(87,94,207,0.5) !important;
    color: #fff !important;
  }

  /* ── Input ── */
  .stTextInput > div > div > input,
  .stTextArea > div > div > textarea {
    background: #242424 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    border-radius: 12px !important;
    color: var(--text-hi) !important;
    font-size: 0.875rem !important;
  }
  .stTextInput > div > div > input:focus,
  .stTextArea > div > div > textarea:focus {
    border-color: rgba(87,94,207,0.5) !important;
    box-shadow: 0 0 0 2px rgba(87,94,207,0.15) !important;
  }

  /* ── Chat messages ── */
  .chat-user {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }
  .chat-user-bubble {
    max-width: 70%;
    background: rgba(87,94,207,0.15);
    border: 1px solid rgba(87,94,207,0.25);
    border-radius: 16px 16px 4px 16px;
    padding: 10px 14px;
    font-size: 0.875rem;
    color: #dcdad5;
    line-height: 1.5;
  }
  .chat-assistant {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
  }
  .chat-avatar {
    width: 28px; height: 28px;
    background: rgba(87,94,207,0.2);
    border: 1px solid rgba(87,94,207,0.3);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700;
    color: #a5b4fc;
    flex-shrink: 0;
    margin-top: 2px;
    line-height: 28px;
    text-align: center;
  }

  /* ── Score badges ── */
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    margin: 0 2px;
  }
  .badge-red   { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }
  .badge-yel   { background: rgba(250,204,21,0.12);  color: #facc15; border: 1px solid rgba(250,204,21,0.3); }
  .badge-grn   { background: rgba(74,222,128,0.12);  color: #4ade80; border: 1px solid rgba(74,222,128,0.3); }
  .badge-acc   { background: rgba(87,94,207,0.12);   color: #a5b4fc; border: 1px solid rgba(87,94,207,0.25);}

  /* ── Account card ── */
  .acct-card {
    background: #242424;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .acct-card:hover {
    border-color: rgba(87,94,207,0.4);
    background: #272727;
  }
  .acct-name { font-size: 0.82rem; font-weight: 600; color: #dcdad5; }
  .acct-meta { font-size: 0.72rem; color: #8a8680; margin-top: 1px; }

  /* ── Info / feedback panels ── */
  .info-panel {
    background: #1e1e1e;
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 14px;
    margin-top: 8px;
    font-size: 0.78rem;
  }
  .panel-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #8a8680;
    margin-bottom: 8px;
  }

  /* ── Progress bar ── */
  .prog-bar-bg {
    background: rgba(255,255,255,0.08);
    border-radius: 4px;
    height: 4px;
    width: 100%;
    margin-top: 4px;
  }

  /* ── Demo banner ── */
  .demo-banner {
    background: rgba(250,204,21,0.08);
    border: 1px solid rgba(250,204,21,0.2);
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.72rem;
    color: #a89a60;
    margin-bottom: 12px;
  }

  /* ── Divider ── */
  hr { border-color: rgba(255,255,255,0.06) !important; }

  /* ── Expander ── */
  .streamlit-expanderHeader {
    background: #1e1e1e !important;
    border: 1px solid rgba(255,255,255,0.06) !important;
    border-radius: 8px !important;
    color: var(--text-dim) !important;
    font-size: 0.78rem !important;
  }
  .streamlit-expanderContent {
    background: #1a1a1a !important;
    border: 1px solid rgba(255,255,255,0.04) !important;
  }

  /* ── Selectbox ── */
  .stSelectbox > div > div {
    background: #242424 !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
    color: var(--text) !important;
    border-radius: 8px !important;
    font-size: 0.8rem !important;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

  /* ── Typing dots ── */
  @keyframes blink { 0%,80%,100%{opacity:0} 40%{opacity:1} }
  .dot { display:inline-block; width:6px; height:6px; border-radius:50%;
         background:#575ECF; margin:0 2px;
         animation: blink 1.4s ease-in-out infinite; }
  .dot:nth-child(2){animation-delay:.2s}
  .dot:nth-child(3){animation-delay:.4s}
</style>
""", unsafe_allow_html=True)


# ── Simulated portfolio data (ALL MADE UP — DEMO ONLY) ───────────────────────
@dataclass
class Account:
    id: str
    name: str
    industry: str
    arr: int          # in dollars
    health: str       # red / yellow / green
    risk: int
    sentiment: int
    data_health: int
    profile: int
    priority: str
    signals: list
    renewal_months: Optional[int] = None
    expansion_low: Optional[int] = None
    expansion_high: Optional[int] = None
    notes: str = ""


DEMO_ACCOUNTS = [
    Account("vantara-bio", "Vantara Bio", "Biotech", 4_000_000,
            "red", 76, 12, 38, 10, "P0",
            ["60-day non-login", "No champion", "No economic buyer"],
            renewal_months=3, notes="Most urgent. Silent 60 days, renewal in 3 months."),
    Account("prism-health", "Prism Health Systems", "Healthcare", 5_000_000,
            "red", 76, 19, 43, 20, "P0",
            ["Support ticket surge", "Missed QBR", "Silent stakeholders"],
            notes="Support surge + silence = pre-churn pattern."),
    Account("meridian-bank", "Meridian Bank Corp", "Financial Services", 8_000_000,
            "red", 78, 28, 63, 42, "P0",
            ["Exec sponsor departed", "Adoption declining", "Stale contacts"],
            notes="Largest P0. Exec departure created vacuum."),
    Account("novamed", "NovaMed Health", "Healthcare", 6_000_000,
            "yellow", 58, 38, 58, 48, "P1",
            ["Compliance concerns", "New IT leadership", "Adoption stalled"],
            expansion_low=1_200_000, expansion_high=1_900_000,
            notes="Compliance resolution needed before expansion."),
    Account("helix", "Helix Genomics", "Biotech", 5_000_000,
            "yellow", 50, 50, 59, 40, "P1",
            ["Budget freeze", "Champion stretched", "Usage flat"],
            expansion_low=900_000, expansion_high=1_400_000,
            notes="Budget freeze is external. Champion fatigue is the risk."),
    Account("coreops", "CoreOps Industrial", "Manufacturing", 2_000_000,
            "yellow", 47, 44, 51, 22, "P1",
            ["New stakeholder", "Integration issues", "No economic buyer"],
            notes="Transition state — relationship reset needed."),
    Account("stratos", "Stratos Manufacturing", "Manufacturing", 3_000_000,
            "green", 28, 57, 65, 62, "P2",
            ["Stable usage", "Low engagement", "Single contact"],
            expansion_low=750_000, expansion_high=1_250_000,
            notes="Stable but passive. Deepen before expanding."),
    Account("clarity", "Clarity Insurance Ltd", "Financial Services", 4_000_000,
            "green", 21, 81, 80, 88, "expand",
            ["Strong advocate", "Renewal in 8 months", "High engagement"],
            renewal_months=8, expansion_low=1_250_000, expansion_high=2_000_000,
            notes="Ideal expansion candidate. Renewal window open."),
    Account("apex", "Apex Capital Group", "Financial Services", 7_000_000,
            "yellow", 41, 61, 75, 75, "expand",
            ["Procurement friction", "Strong relationship", "Wallet size unknown"],
            expansion_low=2_100_000, expansion_high=3_400_000,
            notes="Procurement is structural, not relational."),
    Account("genpath", "GenPath Biotech", "Biotech", 6_000_000,
            "green", 17, 84, 83, 95, "expand",
            ["QBR next month", "High adoption", "Full MEDPICC profile"],
            expansion_low=2_500_000, expansion_high=4_000_000,
            notes="Healthiest account. QBR is the expansion vehicle."),
]

ALYSA_SYSTEM_PROMPT = """You are Alysa, an AI-powered Customer Success Growth Engine for B2B SaaS, built by Prioriwise.

⚠️ IMPORTANT: All portfolio data below is SIMULATED / DEMO DATA for demonstration purposes only.

You are working with a CSM managing 10 DEMO accounts totaling $50M SIMULATED ARR across Financial Services, Healthcare, Biotech, and Manufacturing.

SIMULATED PORTFOLIO:
- Vantara Bio: $4M ARR, Risk 76🔴, Sentiment 12🔴, Data Health 38🔴, Profile 10% — P0, 60-day silence, renewal in 3 months
- Prism Health Systems: $5M ARR, Risk 76🔴, Sentiment 19🔴, Data Health 43🔴, Profile 20% — P0, support surge, missed QBR
- Meridian Bank Corp: $8M ARR, Risk 78🔴, Sentiment 28🔴, Data Health 63🟡, Profile 42% — P0, exec sponsor departed
- NovaMed Health: $6M ARR, Risk 58🟡, Sentiment 38🔴, Data Health 58🟡, Profile 48% — P1, compliance concerns
- Helix Genomics: $5M ARR, Risk 50🟡, Sentiment 50🟡, Data Health 59🟡, Profile 40% — P1, budget freeze
- CoreOps Industrial: $2M ARR, Risk 47🟡, Sentiment 44🟡, Data Health 51🟡, Profile 22% — P1, new stakeholder
- Stratos Manufacturing: $3M ARR, Risk 28🟢, Sentiment 57🟡, Data Health 65🟡, Profile 62% — P2
- Clarity Insurance Ltd: $4M ARR, Risk 21🟢, Sentiment 81🟢, Data Health 80🟢, Profile 88% — Expand, renewal in 8 months
- Apex Capital Group: $7M ARR, Risk 41🟡, Sentiment 61🟡, Data Health 75🟢, Profile 75% — Expand, procurement friction
- GenPath Biotech: $6M ARR, Risk 17🟢, Sentiment 84🟢, Data Health 83🟢, Profile 95% — Expand, QBR next month

SIMULATED DATA SOURCES: Salesforce, ServiceNow, MS Teams, Email, Internal Jira (NOT client-side), Forrester, IDC

FORMAT EVERY RESPONSE with:
1. A sources block at the top:
---SOURCES---
Data Used: [sources]
Confidence: 🟢 High / 🟡 Moderate / 🔴 Low
Data Gaps: [gaps, always note client-side Jira unavailable if relevant]
---END SOURCES---

2. Your analysis (use markdown tables, headers, bullet points)

3. A brief next-step prompt at the end.

Always remind users this is demo/simulated data when presenting findings.
Be strategy-first, concise, and actionable."""


# ── Helpers ───────────────────────────────────────────────────────────────────
def score_color(score: int, invert: bool = False) -> str:
    """Return badge class based on score. invert=True for sentiment/data health."""
    if invert:
        if score >= 70: return "grn"
        if score >= 40: return "yel"
        return "red"
    else:
        if score >= 70: return "red"
        if score >= 40: return "yel"
        return "grn"


def health_dot(health: str) -> str:
    colors = {"red": "#f87171", "yellow": "#facc15", "green": "#4ade80"}
    c = colors.get(health, "#8a8680")
    return f'<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:{c};box-shadow:0 0 5px {c};margin-right:6px;"></span>'


def priority_badge(p: str) -> str:
    config = {
        "P0":      ("🚨 P0",     "red"),
        "P1":      ("⚠️ P1",     "yel"),
        "P2":      ("📋 P2",     "acc"),
        "expand":  ("🚀 Expand", "grn"),
        "maintain":("✅ Keep",   "acc"),
    }
    label, cls = config.get(p, ("–", "acc"))
    return f'<span class="badge badge-{cls}">{label}</span>'


def fmt_arr(v: int) -> str:
    return f"${v/1_000_000:.0f}M"


def progress_bar_html(pct: int) -> str:
    color = "#4ade80" if pct >= 70 else "#facc15" if pct >= 40 else "#f87171"
    return f"""
    <div class="prog-bar-bg">
      <div style="height:4px;border-radius:4px;width:{pct}%;background:{color};transition:width .4s;"></div>
    </div>"""


def strip_sources_block(text: str) -> str:
    return re.sub(r"---SOURCES---.*?---END SOURCES---", "", text, flags=re.DOTALL).strip()


def extract_sources_meta(text: str) -> dict:
    m = re.search(r"---SOURCES---(.*?)---END SOURCES---", text, re.DOTALL)
    if not m:
        return {"sources": ["Salesforce", "ServiceNow"], "confidence": "moderate", "gaps": []}
    block = m.group(1)

    src_m = re.search(r"Data Used:\s*([^\n]+)", block)
    conf_m = re.search(r"Confidence:\s*([^\n]+)", block)
    gap_m = re.search(r"Data Gaps:\s*([^\n]+)", block)

    sources = [s.strip() for s in re.split(r"[,·]", src_m.group(1))] if src_m else []
    conf_raw = conf_m.group(1).lower() if conf_m else ""
    confidence = "high" if "high" in conf_raw else "low" if "low" in conf_raw else "moderate"
    gaps = [g.strip() for g in re.split(r"[,·]", gap_m.group(1))] if gap_m else []
    return {"sources": sources, "confidence": confidence, "gaps": gaps}


def render_sources_panel(meta: dict):
    conf_cfg = {
        "high":     ("🟢 High Confidence",     "#4ade80", "rgba(74,222,128,0.1)"),
        "moderate": ("🟡 Moderate Confidence",  "#facc15", "rgba(250,204,21,0.1)"),
        "low":      ("🔴 Low Confidence — verify before acting", "#f87171", "rgba(248,113,113,0.1)"),
    }
    label, color, bg = conf_cfg[meta["confidence"]]
    source_chips = " ".join(
        f'<span class="badge badge-acc">{s}</span>' for s in meta["sources"] if s
    )
    gap_html = "".join(
        f'<div style="font-size:.72rem;color:#a89a60;margin-top:3px;">⚠️ {g}</div>'
        for g in meta["gaps"] if g
    )
    st.markdown(f"""
    <div class="info-panel">
      <div class="panel-label">ℹ️ SOURCES &amp; EVIDENCE</div>
      <div style="background:{bg};color:{color};padding:4px 10px;border-radius:6px;font-size:.72rem;font-weight:600;margin-bottom:8px;">{label}</div>
      <div style="margin-bottom:6px;">{source_chips}</div>
      {gap_html}
      <div style="font-size:.68rem;color:#3a3835;margin-top:6px;">⚠️ Client-side Jira unavailable — delivery signals may be incomplete</div>
    </div>""", unsafe_allow_html=True)


def render_feedback_bar():
    st.markdown('<div class="panel-label" style="margin-top:10px;">💬 FEEDBACK</div>',
                unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)
    with c1:
        if st.button("👍 On track", key=f"fb_pos_{st.session_state.fb_key}"):
            st.session_state.last_feedback = "positive"
    with c2:
        if st.button("👎 Needs work", key=f"fb_neg_{st.session_state.fb_key}"):
            st.session_state.last_feedback = "negative"
    with c3:
        if st.button("🔄 Refine it", key=f"fb_ref_{st.session_state.fb_key}"):
            st.session_state.last_feedback = "refine"

    if st.session_state.get("last_feedback") == "positive":
        st.markdown('<div style="font-size:.72rem;color:#4ade80;">✅ Glad that was helpful.</div>',
                    unsafe_allow_html=True)
    elif st.session_state.get("last_feedback") in ("negative", "refine"):
        opts = ["Scores feel off", "Missing context", "Too detailed",
                "Go deeper", "Wrong priority order", "Add a data source"]
        chosen = st.selectbox("What to adjust?",
                              ["Select…"] + opts,
                              key=f"fb_sel_{st.session_state.fb_key}")
        if chosen and chosen != "Select…":
            st.session_state.pending_prompt = f"Please adjust the previous response: {chosen}"
            st.session_state.last_feedback = None
            st.rerun()


# ── Session state init ────────────────────────────────────────────────────────
if "messages" not in st.session_state:
    st.session_state.messages = []
if "fb_key" not in st.session_state:
    st.session_state.fb_key = 0
if "last_feedback" not in st.session_state:
    st.session_state.last_feedback = None
if "pending_prompt" not in st.session_state:
    st.session_state.pending_prompt = None


# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    # Logo / brand
    st.markdown("""
    <div style="display:flex;align-items:center;gap:10px;padding:4px 0 16px;">
      <div style="width:32px;height:32px;background:rgba(87,94,207,.2);border:1px solid rgba(87,94,207,.3);
                  border-radius:9px;display:flex;align-items:center;justify-content:center;
                  font-size:.75rem;font-weight:700;color:#a5b4fc;">A</div>
      <div>
        <div style="font-size:.9rem;font-weight:700;color:#dcdad5;">Alysa</div>
        <div style="font-size:.68rem;color:#575ECF;">by Prioriwise</div>
      </div>
    </div>
    <div class="demo-banner">⚠️ DEMO MODE — All data is simulated</div>
    """, unsafe_allow_html=True)

    # Portfolio stats strip
    st.markdown("""
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px;">
      <div style="background:#242424;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px;">
        <div style="font-size:.65rem;color:#8a8680;">Total ARR</div>
        <div style="font-size:1.1rem;font-weight:700;color:#dcdad5;">$50M</div>
        <div style="font-size:.65rem;color:#8a8680;">10 accounts</div>
      </div>
      <div style="background:#242424;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px;">
        <div style="font-size:.65rem;color:#8a8680;">At-Risk ARR</div>
        <div style="font-size:1.1rem;font-weight:700;color:#f87171;">$17M</div>
        <div style="font-size:.65rem;color:#8a8680;">3 P0 accounts</div>
      </div>
      <div style="background:#242424;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px;">
        <div style="font-size:.65rem;color:#8a8680;">Expansion</div>
        <div style="font-size:1.1rem;font-weight:700;color:#4ade80;">+$5.9M</div>
        <div style="font-size:.65rem;color:#8a8680;">near-term low</div>
      </div>
      <div style="background:#242424;border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:10px;">
        <div style="font-size:.65rem;color:#8a8680;">Whitespace</div>
        <div style="font-size:1.1rem;font-weight:700;color:#575ECF;">$22M</div>
        <div style="font-size:.65rem;color:#8a8680;">full portfolio</div>
      </div>
    </div>
    """, unsafe_allow_html=True)

    # Health bar
    st.markdown("""
    <div style="margin-bottom:14px;">
      <div style="font-size:.65rem;color:#8a8680;margin-bottom:4px;">PORTFOLIO HEALTH</div>
      <div style="height:6px;border-radius:4px;overflow:hidden;display:flex;gap:2px;">
        <div style="flex:34;background:#f87171;" title="P0 $17M"></div>
        <div style="flex:26;background:#facc15;" title="P1 $13M"></div>
        <div style="flex:14;background:#575ECF;" title="Expand $7M"></div>
        <div style="flex:20;background:#4ade80;" title="Expand $10M"></div>
        <div style="flex:6;background:#94a3b8;"  title="P2 $3M"></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:4px;font-size:.6rem;color:#5a5650;">
        <span style="color:#f87171;">■ P0 34%</span>
        <span style="color:#facc15;">■ P1 26%</span>
        <span style="color:#4ade80;">■ Expand 40%</span>
      </div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown('<div style="font-size:.65rem;color:#8a8680;margin-bottom:6px;">QUICK ACTIONS</div>',
                unsafe_allow_html=True)
    quick_prompts = {
        "🚨 P0 Action Plans":       "Deep dive action plans for all P0 accounts",
        "🚀 Expansion Strategy":    "Full expansion strategy across all eligible accounts",
        "📊 Three-Score Summary":   "Show Risk, Sentiment and Data Health scores for all 10 accounts",
        "📋 Exec Summary":          "Executive portfolio summary for my CS leader",
        "✉️ Re-engagement Emails":  "Draft re-engagement emails for P0 accounts",
        "🎯 Gap Analysis":          "MEDPICC gap analysis across the full portfolio",
    }
    for label, prompt in quick_prompts.items():
        if st.button(label, key=f"qa_{label}"):
            st.session_state.pending_prompt = prompt
            st.rerun()

    st.markdown("<hr>", unsafe_allow_html=True)
    st.markdown('<div style="font-size:.65rem;color:#8a8680;margin-bottom:6px;">ACCOUNTS — click to deep dive</div>',
                unsafe_allow_html=True)

    priority_order = {"P0": 0, "P1": 1, "P2": 2, "expand": 3, "maintain": 4}
    sorted_accounts = sorted(DEMO_ACCOUNTS, key=lambda a: priority_order.get(a.priority, 5))

    for acct in sorted_accounts:
        rc = score_color(acct.risk)
        sc = score_color(acct.sentiment, invert=True)
        dc = score_color(acct.data_health, invert=True)

        card_html = f"""
        <div class="acct-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <div>
              <div class="acct-name">{health_dot(acct.health)}{acct.name}</div>
              <div class="acct-meta">{acct.industry} · {fmt_arr(acct.arr)}</div>
            </div>
            {priority_badge(acct.priority)}
          </div>
          <div style="margin-bottom:6px;">
            <span class="badge badge-{rc}">Risk {acct.risk}</span>
            <span class="badge badge-{sc}">Sent {acct.sentiment}</span>
            <span class="badge badge-{dc}">Data {acct.data_health}</span>
          </div>
          <div style="font-size:.65rem;color:#8a8680;margin-bottom:2px;">Profile {acct.profile}%</div>
          {progress_bar_html(acct.profile)}
        </div>"""
        st.markdown(card_html, unsafe_allow_html=True)
        if st.button(f"Ask about {acct.name}", key=f"acct_{acct.id}"):
            st.session_state.pending_prompt = (
                f"Give me a complete deep dive on {acct.name}: risk analysis, "
                f"sentiment breakdown, data health gaps, MEDPICC gaps, and specific next actions."
            )
            st.rerun()

    st.markdown("<hr>", unsafe_allow_html=True)
    if st.button("🗑 Clear chat"):
        st.session_state.messages = []
        st.session_state.fb_key += 1
        st.session_state.last_feedback = None
        st.rerun()


# ── Main area ─────────────────────────────────────────────────────────────────
# Top bar
st.markdown("""
<div style="display:flex;align-items:center;justify-content:space-between;
            padding:10px 0 14px;border-bottom:1px solid rgba(255,255,255,.06);margin-bottom:16px;">
  <div style="display:flex;align-items:center;gap:10px;">
    <div style="font-size:.95rem;font-weight:600;color:#dcdad5;">Customer Success Intelligence</div>
    <span class="badge badge-acc">claude-opus-4-6</span>
    <span class="badge" style="background:rgba(250,204,21,.1);color:#a89a60;border:1px solid rgba(250,204,21,.2);">
      ⚠️ DEMO DATA
    </span>
  </div>
  <div style="font-size:.72rem;color:#5a5650;">$50M simulated ARR · 10 demo accounts · March 2026</div>
</div>
""", unsafe_allow_html=True)

# Empty state
if not st.session_state.messages:
    st.markdown("""
    <div style="text-align:center;padding:40px 20px 20px;">
      <div style="width:52px;height:52px;background:rgba(87,94,207,.15);border:1px solid rgba(87,94,207,.3);
                  border-radius:16px;display:flex;align-items:center;justify-content:center;
                  font-size:1.4rem;margin:0 auto 16px;">⚡</div>
      <div style="font-size:1.2rem;font-weight:600;color:#dcdad5;margin-bottom:6px;">Welcome to Alysa</div>
      <div style="font-size:.85rem;color:#8a8680;max-width:480px;margin:0 auto 24px;line-height:1.5;">
        Your AI Customer Success Growth Engine. Ask about your simulated portfolio,
        accounts, risks, or expansion opportunities.
      </div>
    </div>
    """, unsafe_allow_html=True)

    cols = st.columns(3)
    starter_prompts = [
        ("🚨 P0 rescue plans", "Deep dive action plans for all P0 accounts"),
        ("🚀 Expansion strategy", "Full expansion strategy across all eligible accounts"),
        ("📊 Show all scores", "Show Risk, Sentiment, and Data Health scores for all 10 accounts"),
        ("✉️ Re-engagement email", "Draft re-engagement email for Vantara Bio"),
        ("📋 Executive summary", "Executive portfolio summary for my CS leader"),
        ("🎯 QBR outline", "QBR deck outline for GenPath Biotech"),
    ]
    for i, (label, prompt) in enumerate(starter_prompts):
        with cols[i % 3]:
            if st.button(label, key=f"start_{i}", use_container_width=True):
                st.session_state.pending_prompt = prompt
                st.rerun()

# Render chat history
for i, msg in enumerate(st.session_state.messages):
    if msg["role"] == "user":
        st.markdown(f"""
        <div class="chat-user">
          <div class="chat-user-bubble">{msg["content"]}</div>
        </div>""", unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="chat-assistant">
          <div class="chat-avatar">A</div>
          <div style="flex:1;min-width:0;"></div>
        </div>""", unsafe_allow_html=True)

        clean = strip_sources_block(msg["content"])
        st.markdown(clean)

        # Sources + feedback on last assistant message
        if i == len(st.session_state.messages) - 1:
            meta = extract_sources_meta(msg["content"])
            render_sources_panel(meta)
            render_feedback_bar()

# ── Input & streaming ─────────────────────────────────────────────────────────
st.markdown("<div style='height:16px;'></div>", unsafe_allow_html=True)

with st.form("chat_form", clear_on_submit=True):
    col_input, col_btn = st.columns([10, 1])
    with col_input:
        user_input = st.text_input(
            label="Chat input",
            placeholder="Ask about your portfolio, an account, or request an artifact…",
            label_visibility="collapsed",
        )
    with col_btn:
        submitted = st.form_submit_button("→")

# Handle pending prompt (from sidebar buttons)
prompt_to_send = None
if st.session_state.pending_prompt:
    prompt_to_send = st.session_state.pending_prompt
    st.session_state.pending_prompt = None
elif submitted and user_input.strip():
    prompt_to_send = user_input.strip()

if prompt_to_send:
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt_to_send})
    st.session_state.fb_key += 1
    st.session_state.last_feedback = None

    # Show user bubble immediately
    st.markdown(f"""
    <div class="chat-user">
      <div class="chat-user-bubble">{prompt_to_send}</div>
    </div>""", unsafe_allow_html=True)

    # Avatar row
    st.markdown("""
    <div class="chat-assistant">
      <div class="chat-avatar">A</div>
    </div>""", unsafe_allow_html=True)

    # Stream from Claude
    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        st.error("⚠️ ANTHROPIC_API_KEY not set. Add it to your environment and restart.")
    else:
        client = anthropic.Anthropic(api_key=api_key)
        api_messages = [
            {"role": m["role"], "content": m["content"]}
            for m in st.session_state.messages
        ]

        response_placeholder = st.empty()
        full_response = ""

        try:
            with client.messages.stream(
                model="claude-opus-4-6",
                max_tokens=4096,
                thinking={"type": "adaptive"},
                system=ALYSA_SYSTEM_PROMPT,
                messages=api_messages,
            ) as stream:
                for text in stream.text_stream:
                    full_response += text
                    clean = strip_sources_block(full_response)
                    response_placeholder.markdown(clean + "▌")

            response_placeholder.markdown(strip_sources_block(full_response))

        except anthropic.AuthenticationError:
            full_response = "❌ Invalid API key. Please check ANTHROPIC_API_KEY."
            response_placeholder.error(full_response)
        except Exception as e:
            full_response = f"❌ Error: {str(e)}"
            response_placeholder.error(full_response)

        # Persist
        st.session_state.messages.append({"role": "assistant", "content": full_response})

        # Sources + feedback inline
        if full_response and not full_response.startswith("❌"):
            meta = extract_sources_meta(full_response)
            render_sources_panel(meta)
            render_feedback_bar()

# Footer
st.markdown("""
<div style="text-align:center;padding:16px 0 4px;font-size:.65rem;color:#3a3835;">
  Alysa uses simulated data from Salesforce · ServiceNow · MS Teams · Email · Forrester · IDC
  &nbsp;·&nbsp; Powered by Claude claude-opus-4-6
  &nbsp;·&nbsp; ⚠️ All data is made up for demo purposes
</div>
""", unsafe_allow_html=True)
