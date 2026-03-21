# Project Slick (Hyperliquid Edition)

**Project Slick** is an autonomous trading bot built on an A2A-connected Python agent swarm. Its purpose is to arbitrage real-time Middle East geopolitical sentiment (visually scraped using Antigravity) against on-chain xyz:BRENTOIL perpetual futures order book dynamics on Hyperliquid L1.

## The Agentic Swarm Architecture

The core of Slick is a trio of modular Python agents negotiating via FastAPI.

### 1. Sentinel
* **Endpoint:** `POST /sentinel/trigger`
* **Role:** The Macro News Node. Triggered by a Browser Subagent that has captured breaking visualizations or text headlines regarding Middle East Geopolitical events.
* **Flow:** Formats the captured artifacts and pushes it to the Orchestrator via an A2A `tasks/send` invocation.

### 2. Quant
* **Endpoint:** `GET /quant/liquidity`
* **Role:** The Micro-Structure Node. Connects via subprocess to `hyperliquid-operator`, evaluating real-time depth for the xyz:BRENTOIL perpetuals market.
* **Flow:** Exposes a JSON payload detailing the current structural liquidity and funding rates.

### 3. Orchestrator
* **Endpoint:** `POST /orchestrator/tasks/send`
* **Role:** The Execution Brain. Feeds the visual artifact alongside the micro-structure JSON to the Gemini 1.5 Pro multimodal framework.
* **Flow:** Analyzes for "Bullish Sentiment" $> 0.85$. If conditions and structural liquidity intersect, fires a leveraged long trade using the local CLI tools.

## Development Setup

1. **Install dependencies using uv:**
   ```bash
   uv sync
   # Ensure dependencies are installed: fastapi, uvicorn, google-genai, etc.
   ```
2. **Environment Variables:**
   A `.env` file is required in the project root.
   ```env
   GEMINI_API_KEY=your-api-key-here
   ORCHESTRATOR_URL=http://localhost:8000/orchestrator
   QUANT_URL=http://localhost:8000/quant
   ```
3. **Hyperliquid Operator Integration:**
   `hyperliquid-operator` must be cloned in the project root:
   ```bash
   git clone https://github.com/algo-traders-club/hyperliquid-operator.git
   ```
   Follow its nested `README.md` to configure the trading Wallet credentials.

4. **Running the Swarm Locally:**
   ```bash
   uv run uvicorn main:app --reload
   ```

## Tech Stack
* Python 3.12+ (uv-based)
* FastAPI + Pydantic
* google-genai
* algo-traders-club/hyperliquid-operator
