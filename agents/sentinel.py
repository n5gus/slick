from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import logging
from config import settings

router = APIRouter(prefix="/sentinel", tags=["Sentinel"])
logger = logging.getLogger(__name__)

class AlertPayload(BaseModel):
    source: str
    headline: str
    image_base64: str

@router.post("/trigger")
async def trigger_alert(payload: AlertPayload):
    """
    Simulates the Antigravity Browser Subagent successfully capturing an alert
    and triggering the Sentinel node. The Sentinel passes this to the Orchestrator via A2A.
    """
    logger.info(f"Sentinel triggered by {payload.source}: {payload.headline}")
    
    # A2A Request to Orchestrator
    a2a_payload = {
        "task_name": "analyze_geopolitics",
        "data": payload.model_dump()
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.ORCHESTRATOR_URL}/tasks/send",
                json=a2a_payload
            )
            response.raise_for_status()
            logger.info("Sentinel successfully passed data to Orchestrator.")
            return {"status": "success", "orchestrator_reply": response.json()}
        except Exception as e:
            logger.error(f"Failed to communicate with Orchestrator: {e}")
            raise HTTPException(status_code=500, detail="Orchestrator communication failed")
