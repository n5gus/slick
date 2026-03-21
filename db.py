import logging
import asyncpg
from supabase import create_client, Client
from contextlib import asynccontextmanager
from config import settings

logger = logging.getLogger(__name__)

# Standard Supabase Client (REST)
supabase_client: Client | None = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# Connection pool for TimescaleDB raw SQL queries
_db_pool: asyncpg.Pool = None

async def init_db_pool():
    global _db_pool
    if settings.DATABASE_URL:
        # Standard Timescale setup or postgres connection pool
        _db_pool = await asyncpg.create_pool(settings.DATABASE_URL)
        logger.info("TimescaleDB Postgres connection pool initialized")

async def close_db_pool():
    if _db_pool:
        await _db_pool.close()
        logger.info("TimescaleDB Postgres connection pool closed")

@asynccontextmanager
async def get_db_conn():
    if not _db_pool:
        raise RuntimeError("Database pool is not initialized")
    async with _db_pool.acquire() as connection:
        yield connection
