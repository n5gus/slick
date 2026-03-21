# Assistant Instructions for Project Slick

This `GEMINI.md` file defines the context, technical constraints, and operational guidelines for Gemini (and Antigravity) when working on **Project Slick**. The AI assistant must strictly adhere to these guidelines to ensure consistency, security, and proper execution across the project.

## 1. Project Context
**Project Slick** is an autonomous trading bot built on an A2A-connected Python agent swarm. Its purpose is to arbitrage real-time Middle East geopolitical sentiment (visually scraped using Antigravity) against on-chain CL-USDC perpetual futures order book dynamics on Hyperliquid L1.

## 2. Technical Stack Constraints
- **Package Management:** Exclusively use `uv` for lightning-fast dependency resolution and virtual environments. Avoid standard `pip` or `poetry` unless dictated by third-party edge cases.
- **Core Framework:** Use `FastAPI` for all webhooks, REST APIs, and A2A communication endpoints. Responses should be lightning fast.
- **Execution CLI:** Use `algo-traders-club/hyperliquid-operator` for order routing, leverage adjustments, and position management. Commands are issued via `subprocess` from Python.
- **Agent Communication:** Strict adherence to the Google A2A Protocol, utilizing `/.well-known/agent.json` discovery and standard `tasks/send` payloads.
- **Intelligence:** Implement robust prompt engineering leveraging Gemini 3 Pro for multimodal sentiment analysis on the macro side, merging it with localized JSON quantitative inputs.

## 3. Agentic Swarm Architecture
The project must strictly implement three distinct Python agents negotiating via FastAPI.
1. **The "Sentinel" (Macro News):** 
   - Uses the `Antigravity` Browser subagent to scrape breaking alerts (Reuters, live crisis maps, X).
   - Generates multimodal Artifacts (image + text) and POSTs them via A2A to the Orchestrator.
2. **The "Quant" (Hyperliquid Order Book):** 
   - Continuously polls `hyperliquid-operator` CLI.
   - Monitors CL-USDC depth, funding rates, and liquidations.
   - Exposes an endpoint returning structured JSON payloads for the exact liquidity needed to absorb trades.
3. **The "Orchestrator" (Gemini Execution):** 
   - Awaits visual news Artifacts from the Sentinel.
   - Queries the Quant for exact CL-USDC liquidity immediately.
   - Feeds the combined multimodal context to the Gemini API.
   - **Trade Rule:** Executes a leveraged long position utilizing `hyperliquid-operator` ONLY IF Gemini returns a Sentiment Score $> 0.85$ *and* the Quant confirms favorable numbers.

## 4. Coding Conventions & Best Practices
- **Asynchronous Execution:** Because this project involves heavy network IO (FastAPI polling, API calls to Gemini, CLI subprocess execution), ensure functions are async where applicable using `asyncio` and `httpx`.
- **Validation:** Use `Pydantic` heavily to validate payload schemas across the agent endpoints.
- **Safety First:** When creating the Antigravity `SKILL.md` or executing browser tasks, configure logic to fail safely and gracefully avoiding bot-detection triggers.
- **System Interactions:** Always test subprocess wrappers handling the `hyperliquid-operator` CLI via dry runs or mock logs to ensure precision in sizing and sides before writing the production logic.
- **Modularity:** Keep each agent's execution logic modular and separate. Maintain distinct `.py` files. 

## 5. Primary Goals
- The paramount objective is low latency responses and fault tolerance between the 3 agents.
- The A2A handshake must be seamless.
- Never write credentials inside the code; enforce standard `pydantic-settings` or `.env` loads.
