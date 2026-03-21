from fastapi import FastAPI
import uvicorn
from contextlib import asynccontextmanager
import logging

from agents.sentinel import router as sentinel_router
from agents.quant import router as quant_router
from agents.orchestrator import router as orchestrator_router
from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Agentic Swarm: Project Slick")
    yield
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
