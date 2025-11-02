# ROMA Trading Backend

Python backend for ROMA Trading Platform powered by FastAPI, DSPy, and multiple LLM integrations.

## Quick Start

```bash
# Setup
./setup.sh

# Configure credentials
cp .env.example .env
nano .env  # Add your API keys

# Start server
./start.sh
```

Server runs on `http://localhost:8000`

## Architecture

```
backend/
├── config/               # Configuration files
│   ├── README.md         # Configuration guide
│   ├── trading_config.yaml
│   └── models/           # Model-specific configs
│       ├── deepseek-chat-v3.1.yaml
│       ├── qwen3-max.yaml
│       ├── claude-sonnet-4.5.yaml
│       ├── grok-4.yaml
│       ├── gemini-2.5-pro.yaml
│       └── gpt-5.yaml
├── src/
│   └── roma_trading/
│       ├── agents/       # Trading agents
│       ├── api/          # FastAPI endpoints
│       ├── core/         # Core modules
│       ├── config/       # Settings
│       └── toolkits/     # DEX & TA integrations
├── logs/                 # Trading logs
└── tests/                # Test files
```

## Key Features

- **Multi-Agent System**: Run up to 6 AI models simultaneously
- **DSPy Integration**: Structured AI reasoning with Chain-of-Thought
- **Aster DEX**: Web3 perpetual futures trading with EIP-191 signing
- **Technical Analysis**: RSI, MACD, EMA, ATR, Bollinger Bands
- **Risk Management**: 4-layer protection system
- **Real-time API**: REST + WebSocket endpoints
- **Performance Tracking**: Win rate, Sharpe ratio, profit factor

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/{id}` - Get agent status
- `GET /api/agents/{id}/account` - Account balance
- `GET /api/agents/{id}/positions` - Current positions
- `GET /api/agents/{id}/performance` - Performance metrics
- `GET /api/agents/{id}/decisions` - Decision history
- `GET /api/agents/{id}/trades` - Trade history
- `GET /api/agents/{id}/equity-history` - Equity curve

### Market
- `GET /api/market/prices` - Current market prices

### WebSocket
- `WS /ws/agents/{id}` - Real-time agent updates

Full API docs: http://localhost:8000/docs

## Configuration

See [config/README.md](config/README.md) for detailed configuration guide.

### Supported LLMs
- DeepSeek (recommended)
- Qwen
- Claude (Anthropic)
- Grok (xAI)
- Gemini (Google)
- GPT (OpenAI)

### Trading Pairs
BTC, ETH, SOL, BNB, DOGE, XRP (all paired with USDT)

## Development

```bash
# Activate virtual environment
source venv/bin/activate

# Run tests
pytest

# Start with debug logging
LOG_LEVEL=DEBUG python -m roma_trading.main
```

## Documentation

- [ACCOUNT_SETUP.md](ACCOUNT_SETUP.md) - Multi-model account setup
- [config/README.md](config/README.md) - Configuration guide
- [../docs/](../docs/) - Full documentation
- [../QUICKSTART.md](../QUICKSTART.md) - Quick start guide

## Requirements

- Python 3.12 or 3.13 (NOT 3.14)
- LLM API key (DeepSeek recommended)
- Aster DEX account with API credentials

## Support

For issues and questions, see [../docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)

