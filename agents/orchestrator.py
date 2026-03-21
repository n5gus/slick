from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import logging
from google import genai
import subprocess
import json
from config import settings

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])
logger = logging.getLogger(__name__)

# Configure Gemini
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class A2ATask(BaseModel):
    task_name: str
    data: dict

@router.post("/tasks/send")
async def process_task(task: A2ATask):
    """
    The main Orchestrator node hook receiving A2A requests.
    Awaits the visual news artifact from Sentinel, queries the Quant, and sends to Gemini.
    """
    if task.task_name != "analyze_geopolitics":
        raise HTTPException(status_code=400, detail="Unknown task")

    logger.info("Orchestrator received geopolitical task.")
    sentinel_data = task.data

    # Query Quant Agent
    async with httpx.AsyncClient() as http_client:
        try:
            quant_resp = await http_client.get(f"{settings.QUANT_URL}/liquidity")
            quant_resp.raise_for_status()
            liquidity_data = quant_resp.json()
            logger.info(f"Quant liquidity fetched: {liquidity_data}")
        except Exception as e:
            logger.error("Failed to reach Quant node.")
            raise HTTPException(status_code=500, detail="Quant node unreachable")

    # Pass to Gemini API
    sentiment_score = await evaluate_with_gemini(sentinel_data, liquidity_data)
    
    if sentiment_score > 0.85 and liquidity_data["available_liquidity_usd"] > 10000:
        logger.info(f"High conviction score ({sentiment_score}). Executing trade via hyperliquid-operator.")
        execution_result = await execute_trade()
        return {"status": "Trade Executed", "score": sentiment_score, "result": execution_result}
    
    logger.info(f"Sentiment score ({sentiment_score}) too low or liquidity insufficient. No trade.")
    return {"status": "No Trade", "score": sentiment_score}

async def evaluate_with_gemini(sentinel_data: dict, liquidity_data: dict) -> float:
    try:
        # We can implement vision processing if `image_base64` is real
        prompt = f"""
You are SLICK-ORACLE, an elite quantitative risk model for commodity derivatives.
Your sole function is to assess the probability that Brent Crude Oil (xyz:BRENTOIL perpetual futures on Hyperliquid) 
will experience an upward price shock within the next 4-8 hours based on breaking geopolitical signals.

## INPUTS

### Geopolitical Signal
Source: {sentinel_data.get('source')}
Headline: {sentinel_data.get('headline')}

### Market Microstructure (xyz:BRENTOIL on Hyperliquid)
Available Liquidity (USD): {liquidity_data.get('available_liquidity_usd')}
Current Funding Rate: {liquidity_data.get('current_funding_rate')}
Recent Liquidations (USD): {liquidity_data.get('recent_liquidations')}

### DOM Scraped Chart Data (5m Window)
Mark Price: {liquidity_data.get('mark_price')}
Oracle Price: {liquidity_data.get('oracle_price')}
OHLC: {liquidity_data.get('ohlc_5m')}

## SCORING RUBRIC

Score 0.90 – 1.00: Imminent supply shock. Direct military action targeting oil infrastructure, 
  Strait of Hormuz closure threat, or major state-level escalation. Trade immediately.

Score 0.70 – 0.89: High probability disruption. Confirmed airstrike near oil fields, 
  OPEC emergency meeting, or Iranian naval activity. Strong signal.

Score 0.50 – 0.69: Moderate risk. Diplomatic breakdown, sanctions announcement, 
  or proxy conflict escalation. Monitor closely.

Score 0.00 – 0.49: Noise. Political rhetoric, unconfirmed reports, or unrelated regional news.

## INSTRUCTIONS
1. Analyze the global geopolitical breaking news headline alongside the localized DOM scraped OHLC chart data.
2. Factor in funding rate: a positive funding rate > 0.01 suggests market is already long — reduce score by 0.05.
3. Factor in liquidity: if available_liquidity_usd < 5000, reduce score by 0.10 (thin market = dangerous slippage).
4. If the Geopolitical News dictates an explosive event AND the OHLC data shows an active bullish divergence or increasing volume (C > O), increase your conviction.
5. Return ONLY a raw JSON object with no explanation, no markdown, no preamble.

## OUTPUT FORMAT
{{"score": 0.00, "rationale": "one sentence max"}}
"""
        # Call Google Gen AI client directly
        response = client.models.generate_content(
            model="gemini-2.5-pro",
            contents=prompt
        )
        # Parse score
        text = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(text)
        score = float(result.get("score", 0.0))
        rationale = result.get("rationale", "")
        logger.info(f"Gemini score: {score} | Rationale: {rationale}")
        return score
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return 0.0

async def execute_trade() -> str:
    # Uses hl-op via subprocess to execute the trade
    try:
        # Running the trade via uv run in the hyperliquid-operator folder
        # We use --dry-run for safety during this hackathon implementation unless requested otherwise
        cmd = ["uv", "run", "hl-op", "trade", "buy", "BRENTOIL:USDC", "10", "--dry-run", "--json"]
        result = subprocess.run(cmd, cwd="hyperliquid-operator", capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        return str(e)
