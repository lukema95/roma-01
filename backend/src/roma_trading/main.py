"""
ROMA-01: AI-Powered Crypto Trading Platform - Main Entry Point

Starts the FastAPI server with all trading agents.

Usage:
    python -m roma_trading.main
"""

import asyncio
from loguru import logger
import sys

# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
    level="INFO",
)
logger.add(
    "logs/roma_trading_{time:YYYY-MM-DD}.log",
    rotation="00:00",
    retention="7 days",
    level="DEBUG",
)


def main():
    """Main entry point."""
    import uvicorn
    from roma_trading.config import get_settings
    
    settings = get_settings()
    
    logger.info("="*60)
    logger.info("🚀 Starting ROMA-01 Trading Platform")
    logger.info("="*60)
    logger.info(f"API Server: http://{settings.api_host}:{settings.api_port}")
    logger.info(f"CORS Origins: {settings.cors_origins}")
    logger.info("="*60)
    
    # Run FastAPI server
    uvicorn.run(
        "roma_trading.api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()

