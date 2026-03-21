from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    # Add other configuration keys for hyperliquid wallet here
    HYPERLIQUID_WALLET: str = ""
    HYPERLIQUID_SECRET: str = ""

    # Endpoints if we decouple routing:
    ORCHESTRATOR_URL: str = "http://localhost:8000/orchestrator"
    QUANT_URL: str = "http://localhost:8000/quant"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
