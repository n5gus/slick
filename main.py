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
    logger.info("Starting autonomous trading loop...")
    while True:
        try:
            liq = await get_liquidity()
            if liq.signal == "BUY":
                logger.info("AUTO: BUY Signal Detected. Firing Execution.")
                await execute_trade("buy")
            elif liq.signal == "SELL":
                logger.info("AUTO: SELL Signal Detected. Firing Execution.")
                await execute_trade("sell")
        except Exception as e:
            logger.error(f"Auto-trader failed: {e}")
        await asyncio.sleep(10) # check every 10s

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
