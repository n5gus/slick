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
        # Absolute path to virtualenv binary ensure it's found inside container
        hl_op_bin = "/app/.venv/bin/hl-op"
        cmd = [hl_op_bin, "trade", action, "XYZ-BRENTOIL/USDC:USDC", "1"]
        
        # Hyperliquid Operator expects WALLET_ADDRESS and PRIVATE_KEY
        # Project variables are HYPERLIQUID_API_WALLET_ADDRESS and HYPERLIQUID_SECRET
        env = os.environ.copy()
        env["WALLET_ADDRESS"] = os.getenv("HYPERLIQUID_API_WALLET_ADDRESS", "")
        env["PRIVATE_KEY"] = os.getenv("HYPERLIQUID_SECRET", "") # Or whatever the secret is
        
        # Explicit workdir ensure it can find local state files
        result = subprocess.run(cmd, cwd="/app", capture_output=True, text=True, env=env)
        
        if result.returncode == 0:
            logger.info(f"HL-OP SUCCESS: {result.stdout.strip()}")
        else:
            logger.error(f"HL-OP FAILED: {result.stderr.strip()}")
            
        return result.stdout
    except Exception as e:
        logger.error(f"Execution failed: {e}")
        return str(e)
