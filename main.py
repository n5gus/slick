from fastapi import FastAPI
import uvicorn
import asyncio
from contextlib import asynccontextmanager
import logging

from agents.sentinel import router as sentinel_router
from agents.quant import router as quant_router, get_liquidity
from agents.orchestrator import router as orchestrator_router, execute_trade
from config import settings
from db import init_db_pool, close_db_pool

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def background_trader():
    """Autonomous trading loop for the hackathon judges."""
    logger.info("Starting autonomous mean-reversion scalping loop...")
    current_position = 0  # 1 for Long, -1 for Short, 0 for Flat

    while True:
        logger.info("TRADER LOOP HEARTBEAT")
        try:
            liq = await get_liquidity()
            # Status check for logs
            pos_str = "LONG" if current_position == 1 else "SHORT" if current_position == -1 else "FLAT"
            logger.info(f"TRADER_STATE: {pos_str} | Price: {liq.mark_price:.2f} | SMA: {liq.sma:.2f} | Signal: {liq.signal}")

            # 1. Take Profits (Mean Reversion back to SMA)
            if current_position == 1 and liq.mark_price >= liq.sma:
                logger.info(f"TAKE PROFIT: Price {liq.mark_price:.2f} >= SMA {liq.sma:.2f}. Closing LONG.")
                await execute_trade("sell")
                current_position = 0
            elif current_position == -1 and liq.mark_price <= liq.sma:
                logger.info(f"TAKE PROFIT: Price {liq.mark_price:.2f} <= SMA {liq.sma:.2f}. Closing SHORT.")
                await execute_trade("buy")
                current_position = 0
                
            # 2. Enter New Positions on BB extremes
            if liq.signal == "BUY" and current_position == 0:
                logger.info(f"AUTO: BB Lower Breakout ({liq.mark_price:.2f} < {liq.bollinger_lower:.2f}). Firing LONG.")
                await execute_trade("buy")
                current_position = 1
            elif liq.signal == "SELL" and current_position == 0:
                logger.info(f"AUTO: BB Upper Breakout ({liq.mark_price:.2f} > {liq.bollinger_upper:.2f}). Firing SHORT.")
                await execute_trade("sell")
                current_position = -1
                
        except Exception as e:
            logger.error(f"Auto-trader failed: {e}")
        
        await asyncio.sleep(5)  # Accelerated 5s checks for fast TP execution

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Agentic Swarm: Project Slick")
    await init_db_pool()
    loop_task = asyncio.create_task(background_trader())
    yield
    loop_task.cancel()
    await close_db_pool()
    logger.info("Swarm shutting down.")

app = FastAPI(title="Project Slick - Hyperliquid A2A Swarm", lifespan=lifespan)

# Inter-agent communication points
app.include_router(sentinel_router)
app.include_router(quant_router)
app.include_router(orchestrator_router)

@app.get("/")
async def root():
    return {"status": "Swarm Online", "agents": ["Sentinel", "Quant", "Orchestrator"]}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
