# Use official Python 3.12 slim as base image
FROM python:3.12-slim-bookworm

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Ensure curl and basic build tools are available
RUN apt-get update && apt-get install -y curl gcc build-essential && rm -rf /var/lib/apt/lists/*

# Copy project definition
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy the entire project (including the hyperliquid-operator CLI folder)
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI server
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
