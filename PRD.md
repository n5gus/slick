# Product Requirements Document: Project Slick (Hyperliquid Edition)

**Team:** ManBearBull Capital
**Target Market:** Hyperliquid L1 (xyz:BRENTOIL Perpetual Futures)
**Live Site:** We are live at `slicktrader.xyz` (domain registered today).
**Objective:** Deploy an A2A-connected Python agent swarm to autonomously trade oil derivatives by arbitraging real-time Middle East geopolitical sentiment against on-chain order book dynamics.

## 1. The Problem & Market Opportunity

Traditional commodity markets close for the weekend, but geopolitical conflict does not. When news breaks in the Middle East, traditional oil futures gap violently at the Sunday open. Hyperliquid's xyz:BRENTOIL contract trades 24/7, making it the premier venue for real-time price discovery.

However, standard algorithmic trading bots cannot process qualitative, visual geopolitical news. Standard web scrapers get blocked by Cloudflare on news sites. Slick solves this by using Antigravity's Browser Agent to visually scrape breaking news and Gemini to translate that visual data into a quantitative confidence score, executing trades on Hyperliquid before traditional institutions can boot up their terminals.

## 2. The Tech Stack

* **Environment & Package Management:** uv (for lightning-fast dependency resolution and isolated virtual environments).
* **Core Framework:** FastAPI (for lightweight, high-performance A2A endpoints and webhooks).
* **Execution Layer:** `algo-traders-club/hyperliquid-operator` (wrapping the open-source CLI for order routing, leverage adjustments, and position management).
* **Data Storage:** Local PostgreSQL database with the TimescaleDB extension (for persisting time-series order book data and OHLC history).
* **Data Acquisition:** Antigravity Browser Subagent (for bypassing bot-protection and capturing visual DOM artifacts).
* **Agent Communication:** Google A2A Protocol (`/.well-known/agent.json` discovery and `tasks/send` payloads).
* **Intelligence:** Gemini 3 Pro (for multimodal sentiment analysis and consensus logic).

## 3. The Agentic Swarm Architecture

To satisfy the hackathon's A2A requirement, Slick will be split into three distinct, specialized Python agents that negotiate over local FastAPI endpoints.

### Agent 1: The "Sentinel" (Macro News Node)
* **Role:** The eyes of the operation.
* **Flow:** Uses the Antigravity Browser Agent to autonomously navigate to live Middle East crisis maps, Reuters feeds, and high-signal X (Twitter) accounts. It captures screenshots of breaking alerts.
* **Output:** Generates a multimodal Artifact (Image + raw text) and pushes it to the Orchestrator via an A2A `tasks/send` POST request.

### Agent 2: The "Quant" (Hyperliquid Micro-Structure Node)
* **Role:** The numbers guy.
* **Flow:** Continuously polls the `hyperliquid-operator` CLI. It tracks the xyz:BRENTOIL order book depth, current funding rates, and recent liquidation cascades.
* **Output:** Exposes a FastAPI endpoint. When queried, it returns a structured JSON payload of the exact liquidity available to absorb a market order.

### Agent 3: The "Orchestrator" (Gemini Execution Node)
* **Role:** The brain and the trigger finger.
* **Flow:** Receives the visual news Artifact from the Sentinel. Immediately sends an A2A request to the Quant for the current xyz:BRENTOIL order book state. It feeds both the geopolitical context and the order book data to Gemini.
* **Execution:** If Gemini returns a "Bullish" sentiment score $> 0.85$ and the Quant confirms favorable funding rates, the Orchestrator fires a subprocess command to the `hyperliquid-operator` to execute a leveraged long position.

## 4. Hackathon Milestones (The "Path to Profit")

* **Infrastructure Initialization:** Use uv to scaffold the project, install FastAPI, and clone the `hyperliquid-operator` CLI into the workspace.
* **The A2A Handshake:** Spin up the FastAPI servers on your Droplet and ensure the Sentinel and Quant agents can successfully pass JSON-RPC messages to the Orchestrator.
* **Antigravity Integration:** Write the `SKILL.md` file instructing Antigravity how to safely actuate the browser to capture Al Jazeera or Reuters headlines.
* **The Gemini Brain:** Craft the prompt engineering that allows Gemini to weigh the visual news artifact against the JSON order book data.
* **Execution Hook:** Map the final Gemini output to a valid `hyperliquid-operator` shell command (e.g., `operator trade --market xyz:BRENTOIL --size 10 --side buy`).