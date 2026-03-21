# Project Slick — GEMINI.md

> **"Geopolitical alpha. On-chain execution. Before TradFi wakes up."**

## What This Is

Slick is an autonomous A2A agent swarm that trades WTI Crude Oil perpetual futures on Hyperliquid 
by arbitraging real-time Middle East geopolitical sentiment against on-chain order book dynamics — 
fully automated, 24/7, with no human in the loop.

## Why This Exists

Traditional oil futures (NYMEX) close on weekends. Geopolitical conflict does not.
When news breaks at 2am Sunday, institutions can't act until Monday open. Hyperliquid's 
CL-USDC contract trades continuously — Slick exploits this window.

## The A2A Architecture

Three specialized agents negotiate over Google's A2A protocol:

| Agent | Role | Technology |
|---|---|---|
| **Sentinel** | Visual news scraper | Antigravity Browser Agent |
| **Quant** | Order book microstructure | hyperliquid-operator CLI |
| **Orchestrator** | Conviction scoring + execution | Gemini 1.5 Pro + FastAPI |

### Flow
```
[Antigravity Browser] 
    → captures Reuters/AJZ headline + screenshot
    → POST /sentinel/trigger
        → A2A POST /orchestrator/tasks/send
            → GET /quant/liquidity
            → Gemini scores sentiment (0.0 – 1.0)
            → if score > 0.85 AND liquidity > $10k
                → hl-op trade buy CL/USDC:USDC
```

## Gemini's Role

Gemini 1.5 Pro is the brain of the operation. It receives:
- A natural language geopolitical headline (+ optionally a screenshot)
- Live order book state (liquidity, funding rate, liquidations)

It returns a structured conviction score that directly gates trade execution. 
No score, no trade. The prompt is engineered to function as a quantitative risk model, 
not a chatbot.

## Stack
- **uv** — package management
- **FastAPI** — A2A endpoints
- **Google A2A Protocol** — agent-to-agent communication
- **Gemini 1.5 Pro** — multimodal sentiment scoring
- **Antigravity** — visual browser automation
- **hyperliquid-operator** — trade execution CLI

## Running It
```bash
uv sync
uv run uvicorn main:app --reload --port 8000
```

Trigger a test run:
```bash
curl -X POST http://localhost:8000/sentinel/trigger \
  -H "Content-Type: application/json" \
  -d '{"source": "reuters.com", "headline": "Iran closes Strait of Hormuz to tanker traffic", "image_base64": ""}'
```
