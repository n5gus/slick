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
    async with httpx.AsyncClient() as client:
        try:
            quant_resp = await client.get(f"{settings.QUANT_URL}/liquidity")
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
        You are an elite quantitative analyst AI determining the probability of an oil surge based on breaking Middle East geopolitical news.
        
        Headlines: {sentinel_data.get('headline')}
        Market Liquidity: {liquidity_data.get('available_liquidity_usd')} USD
        Current Funding Rate: {liquidity_data.get('current_funding_rate')}
        
        Analyze the severity. A score of 1.0 means imminent war/supply shock and 100% certainty oil (CL-USDC) goes up. 
        A score of 0.0 means no impact. Return ONLY a JSON object: {{"score": 0.00}}
        """
        # Call Google Gen AI client directly
        response = client.models.generate_content(
            model="gemini-1.5-pro",
            contents=prompt
        )
        # Parse score
        text = response.text.strip().replace("```json", "").replace("```", "")
        result = json.loads(text)
        return float(result.get("score", 0.0))
    except Exception as e:
        logger.error(f"Gemini API Error: {e}")
        return 0.0

async def execute_trade() -> str:
    # Uses hl-op via subprocess to execute the trade
    try:
        # Running the trade via uv run in the hyperliquid-operator folder
        # We use --dry-run for safety during this hackathon implementation unless requested otherwise
        cmd = ["uv", "run", "hl-op", "trade", "buy", "CL/USDC:USDC", "10", "--dry-run", "--json"]
        result = subprocess.run(cmd, cwd="hyperliquid-operator", capture_output=True, text=True)
        return result.stdout
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        return str(e)
