import asyncio
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import httpx
import time
import statistics

router = APIRouter(prefix="/quant", tags=["Quant"])
logger = logging.getLogger(__name__)

class PositionInfo(BaseModel):
    coin: str
    size: float
    entry_price: float
    pnl: float

class LiquidityResponse(BaseModel):
    symbol: str
    available_liquidity_usd: float
    current_funding_rate: float
    recent_liquidations: float
    mark_price: float
    oracle_price: float
    ohlc_5m: str
    bollinger_upper: float
    bollinger_lower: float
    sma: float
    signal: str
    account_value: float
    win_rate: float
    total_trades: int
    wallet_age_days: int
    open_positions: List[PositionInfo]

@router.get("/liquidity", response_model=LiquidityResponse)
async def get_liquidity():
    logger.info("Quant agent querying Hyperliquid Info API for xyz:BRENTOIL")
    try:
        async with httpx.AsyncClient() as client:
            # 1. Get recent 1m candles for Bollinger Bands
            req_body = {
                "type": "candleSnapshot", 
                "req": {
                    "coin": "xyz:BRENTOIL", 
                    "interval": "1m", 
                    "startTime": int((time.time() - 3600) * 1000), 
                    "endTime": int(time.time() * 1000)
                }
            }
            resp = await client.post("https://api.hyperliquid.xyz/info", json=req_body)
            resp.raise_for_status()
            candles = resp.json()
            
            # 2. Extract closes and calculate Bollinger Bands
            if not isinstance(candles, list) or len(candles) < 20:
                logger.warning(f"Not enough candles returned ({len(candles) if isinstance(candles, list) else 'NONE'}), using default values.")
                closes = [104.77] * 20
                mark_price = 104.77
            else:
                closes = [float(c["c"]) for c in candles[-20:]]
                mark_price = float(candles[-1]["c"])

            sma = statistics.mean(closes)
            std = statistics.stdev(closes) if len(closes) > 1 else 0.0
            # 1.0 standard dev is aggressive but useful for a live demo to show some activity
            upper = sma + (1.0 * std)
            lower = sma - (1.0 * std)

            # Define Signal logic
            if mark_price < lower:
                signal = "BUY"
            elif mark_price > upper:
                signal = "SELL"
            else:
                signal = "HOLD"

            # 3. Get extra context (L2 Book)
            l2_req = {"type": "l2Book", "coin": "xyz:BRENTOIL"}
            l2_resp = await client.post("https://api.hyperliquid.xyz/info", json=l2_req)
            l2_data = l2_resp.json()
            
            bids = l2_data.get("levels", [[]])[0]
            available_liquidity = sum([float(b.get("sz", 0)) * float(b.get("px", 0)) for b in bids[:10]]) if bids else 0.0

            # 4. Get User Stats (Account Value, Wins, etc.)
            wallet_address = "0x517CFeae25Ac7D49aD70037b253B9f24C7E556Cf"
            user_state_req = {"type": "clearinghouseState", "user": wallet_address}
            user_state_resp = await client.post("https://api.hyperliquid.xyz/info", json=user_state_req)
            user_state = user_state_resp.json()
            
            account_value = float(user_state.get("marginSummary", {}).get("accountValue", 0.0))
            
            # Extract positions
            raw_positions = user_state.get("assetPositions", [])
            open_positions = []
            for p in raw_positions:
                pos = p.get("position", {})
                size = float(pos.get("szi", 0.0))
                if abs(size) > 0:
                    open_positions.append(
                        PositionInfo(
                            coin=pos.get("coin", "???"),
                            size=size,
                            entry_price=float(pos.get("entryPx", 0.0)),
                            pnl=float(pos.get("unrealizedPnl", 0.0))
                        )
                    )
            
            # 5. Get Fills for Win Rate (approximate for demo)
            fills_req = {"type": "userFills", "user": wallet_address}
            fills_resp = await client.post("https://api.hyperliquid.xyz/info", json=fills_req)
            fills = fills_resp.json()
            
            total_trades = len(fills)
            closed_trades = [f for f in fills if float(f.get("closedPnl", 0)) != 0]
            win_count = sum(1 for f in closed_trades if float(f.get("closedPnl", 0)) > 0)
            win_rate = (win_count / len(closed_trades) * 100) if closed_trades else 0.0
            
            # 6. Wallet age (since first fill)
            if fills:
                first_fill_time = min([int(f["time"]) for f in fills])
                wallet_age_days = int((time.time() - (first_fill_time / 1000)) / 86400)
            else:
                wallet_age_days = 0

            return LiquidityResponse(
                symbol="xyz:BRENTOIL",
                available_liquidity_usd=available_liquidity,
                current_funding_rate=0.0,
                recent_liquidations=0.0,
                mark_price=mark_price,
                oracle_price=mark_price,
                ohlc_5m=f"API Connected. EMA: {sma:.2f}",
                bollinger_upper=upper,
                bollinger_lower=lower,
                sma=sma,
                signal=signal,
                account_value=account_value,
                win_rate=win_rate,
                total_trades=total_trades,
                wallet_age_days=wallet_age_days,
                open_positions=open_positions
            )
    except Exception as e:
        logger.error(f"Error fetching liquidity from HL: {e}")
        return LiquidityResponse(
            symbol="xyz:BRENTOIL",
            available_liquidity_usd=0.0,
            current_funding_rate=0.0,
            recent_liquidations=0.0,
            mark_price=0.0,
            oracle_price=0.0,
            ohlc_5m="ERROR",
            bollinger_upper=0.0,
            bollinger_lower=0.0,
            sma=0.0,
            signal="ERROR",
            account_value=0.0,
            win_rate=0.0,
            total_trades=0,
            wallet_age_days=0,
            open_positions=[]
        )
