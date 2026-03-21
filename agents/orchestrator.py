from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import logging
import subprocess
from config import settings
import os

router = APIRouter(prefix="/orchestrator", tags=["Orchestrator"])
logger = logging.getLogger(__name__)

class A2ATask(BaseModel):
    task_name: str
    data: dict

@router.post("/tasks/send")
async def process_task(task: A2ATask):
    """
    On-chain trading using Bollinger Band triggers.
    """
    logger.info("Orchestrator evaluating Bollinger Band trade logic")

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

    # Evaluate simple BB logic
    signal = liquidity_data.get("signal", "HOLD")
    
    if signal == "BUY":
        logger.info(f"BB BUY SIGNAL: Price below lower band. Executing LONG on chain.")
        execution_result = await execute_trade("buy")
        return {"status": "Trade Executed", "signal": signal, "result": execution_result}
    elif signal == "SELL":
        logger.info(f"BB SELL SIGNAL: Price above upper band. Executing SHORT on chain.")
        execution_result = await execute_trade("sell")
        return {"status": "Trade Executed", "signal": signal, "result": execution_result}
    
    logger.info(f"No breakout (Signal: {signal}). No trade.")
    return {"status": "No Trade", "signal": signal}

async def execute_trade(action: str) -> str:
    try:
        # NO --dry-run! Trading actively on chain!
        cmd = ["uv", "run", "hl-op", "trade", action, "xyz:BRENTOIL", "1"]
        # Ensure env variables for wallet/secret are passed
        env = os.environ.copy()
        result = subprocess.run(cmd, cwd="/app", capture_output=True, text=True, env=env)
        return result.stdout
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        return str(e)
