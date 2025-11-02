# Configuration Guide

Complete guide to configuring the ROMA Trading Platform.

---

## 📋 Table of Contents

1. [Environment Variables](#environment-variables)
2. [Trading Configuration](#trading-configuration)
3. [Agent Configuration](#agent-configuration)
4. [Risk Management](#risk-management)
5. [Model Configuration](#model-configuration)
6. [Advanced Settings](#advanced-settings)

---

## 🔐 Environment Variables

### Backend Configuration (`backend/.env`)

```bash
# LLM Providers
DEEPSEEK_API_KEY=your_deepseek_api_key
QWEN_API_KEY=your_qwen_api_key
OPENROUTER_API_KEY=your_openrouter_api_key  # Optional

# Aster DEX Configuration
ASTER_USER=0xYourUserAddress
ASTER_SIGNER=0xYourSignerAddress
ASTER_PRIVATE_KEY=your_private_key

# Optional: Testnet
# ASTER_TESTNET=true
```

### Required Keys

#### 1. DeepSeek API Key
- Sign up at: https://platform.deepseek.com
- Navigate to API Keys section
- Create new API key
- Copy to `.env`

#### 2. Aster DEX Credentials
- **User Address**: Your wallet address
- **Signer Address**: Authorized signer address
- **Private Key**: For signing transactions (keep secure!)

⚠️ **Security**: Never commit `.env` to version control!

---

## 🎯 Trading Configuration

### Main Config (`backend/config/trading_config.yaml`)

```yaml
# System Settings
system:
  scan_interval_minutes: 3        # How often agents make decisions
  max_concurrent_agents: 5        # Maximum number of agents
  log_level: "INFO"               # DEBUG, INFO, WARNING, ERROR

# API Settings
api:
  host: "0.0.0.0"                 # API server host
  port: 8000                      # API server port

# Active Agents
agents:
  - id: "deepseek_aggressive"
    name: "DeepSeek Aggressive"
    enabled: true                  # Set to false to disable
    config_file: "config/models/deepseek_aggressive.yaml"
  
  - id: "deepseek_conservative"
    name: "DeepSeek Conservative"
    enabled: false                 # Disabled for single-agent mode
    config_file: "config/models/deepseek_conservative.yaml"
  
  - id: "qwen_balanced"
    name: "Qwen Balanced"
    enabled: false                 # Disabled by default
    config_file: "config/models/qwen_balanced.yaml"
```

### Configuration Options

| Option | Description | Default | Recommended |
|--------|-------------|---------|-------------|
| `scan_interval_minutes` | Decision cycle frequency | 3 | 3-5 min |
| `max_concurrent_agents` | Max parallel agents | 5 | 1-3 |
| `log_level` | Logging verbosity | INFO | INFO (prod), DEBUG (dev) |

---

## 🤖 Agent Configuration

### Agent Config Template (`config/models/{agent_id}.yaml`)

```yaml
# Agent Identity
agent:
  id: "deepseek_aggressive"
  name: "DeepSeek Aggressive Trader"
  description: "High-frequency trading with larger position sizes"

# LLM Configuration
llm:
  provider: "deepseek"              # deepseek, qwen, openrouter
  api_key: "${DEEPSEEK_API_KEY}"    # From .env
  model: "deepseek-chat"            # Model name
  temperature: 0.15                 # 0.0 (deterministic) to 1.0 (creative)
  max_tokens: 4000                  # Max response length

# Exchange Configuration
exchange:
  type: "aster"                     # Currently only aster supported
  user: "${ASTER_USER}"
  signer: "${ASTER_SIGNER}"
  private_key: "${ASTER_PRIVATE_KEY}"
  testnet: false                    # Set true for testnet

# Strategy Configuration
strategy:
  initial_balance: 10000.0          # For display/calculations
  scan_interval_minutes: 3          # Decision frequency
  
  # Resource Allocation (for multi-agent)
  max_account_usage_pct: 100        # 100% for single agent, 60% for multi
  
  # Trading Pairs
  default_coins:
    - "BTCUSDT"
    - "ETHUSDT"
    - "SOLUSDT"
    - "BNBUSDT"
  
  # Risk Management
  risk_management:
    max_positions: 3                # Max concurrent positions
    max_leverage: 10                # Max leverage per position
    max_position_size_pct: 30       # Single position max % of account
    max_total_position_pct: 80      # Total positions max % of balance
    max_single_trade_pct: 50        # Max % per trade (no positions)
    max_single_trade_with_positions_pct: 30  # Max % (with positions)
    max_daily_loss_pct: 15          # Daily loss limit
    stop_loss_pct: 3                # Per-position stop loss
    take_profit_pct: 10             # Per-position take profit
  
  # Trading Style
  trading_style: "aggressive"       # aggressive, conservative, balanced
```

---

## ⚖️ Risk Management

### Risk Layers

#### Layer 1: Single Trade Limits
- **No positions**: Max 50% of available balance
- **With positions**: Max 30% of available balance

```yaml
risk_management:
  max_single_trade_pct: 50
  max_single_trade_with_positions_pct: 30
```

#### Layer 2: Total Position Limit
- **All positions combined**: Max 80% of total balance

```yaml
risk_management:
  max_total_position_pct: 80
```

#### Layer 3: Per-Position Limits
- **Single position**: Max 30% of account
- **Stop loss**: 3% from entry
- **Take profit**: 10% from entry

```yaml
risk_management:
  max_position_size_pct: 30
  stop_loss_pct: 3
  take_profit_pct: 10
```

#### Layer 4: Daily Limits
- **Daily loss**: Max 15% of starting balance

```yaml
risk_management:
  max_daily_loss_pct: 15
```

### Risk Profiles

#### Aggressive
```yaml
max_positions: 3
max_leverage: 10
max_position_size_pct: 30
max_total_position_pct: 80
stop_loss_pct: 3
take_profit_pct: 10
```

#### Conservative
```yaml
max_positions: 2
max_leverage: 5
max_position_size_pct: 15
max_total_position_pct: 60
stop_loss_pct: 2
take_profit_pct: 8
```

#### Balanced
```yaml
max_positions: 3
max_leverage: 7
max_position_size_pct: 20
max_total_position_pct: 70
stop_loss_pct: 2.5
take_profit_pct: 9
```

---

## 🧠 Model Configuration

### LLM Providers

#### DeepSeek (Recommended)
```yaml
llm:
  provider: "deepseek"
  api_key: "${DEEPSEEK_API_KEY}"
  model: "deepseek-chat"
  temperature: 0.15
  max_tokens: 4000
```

**Pros**: Fast, cheap, good for trading logic  
**Cons**: Less creative

#### Qwen
```yaml
llm:
  provider: "qwen"
  api_key: "${QWEN_API_KEY}"
  model: "qwen-max"
  temperature: 0.2
  max_tokens: 4000
```

**Pros**: Good reasoning, multilingual  
**Cons**: Slightly slower

#### OpenRouter (Multiple Models)
```yaml
llm:
  provider: "openrouter"
  api_key: "${OPENROUTER_API_KEY}"
  model: "anthropic/claude-3-sonnet"
  temperature: 0.1
  max_tokens: 4000
```

**Pros**: Access to many models  
**Cons**: Higher cost

### Temperature Settings

| Temperature | Behavior | Use Case |
|-------------|----------|----------|
| 0.0 - 0.1 | Very deterministic | Production trading |
| 0.1 - 0.3 | Mostly consistent | Default |
| 0.3 - 0.7 | Balanced | Testing strategies |
| 0.7 - 1.0 | Creative/random | Not recommended |

**Recommendation**: 0.1-0.2 for production

---

## 🎚️ Advanced Settings

### Multi-Agent Setup

When running multiple agents:

**Agent 1 (Aggressive):**
```yaml
max_account_usage_pct: 60  # 60% of available
```

**Agent 2 (Conservative):**
```yaml
max_account_usage_pct: 40  # 40% of available
```

**Total**: 100% allocated, no overlap

### Coin Selection

#### High Balance ($100+)
```yaml
default_coins:
  - "BTCUSDT"    # All coins
  - "ETHUSDT"
  - "SOLUSDT"
  - "BNBUSDT"
```

#### Medium Balance ($20-$100)
```yaml
default_coins:
  - "ETHUSDT"    # Skip BTC (too expensive)
  - "SOLUSDT"
  - "BNBUSDT"
```

#### Low Balance ($5-$20)
```yaml
default_coins:
  - "SOLUSDT"    # Focus on cheap coins
  - "BNBUSDT"
```

### Scan Intervals

| Interval | Behavior | Use Case |
|----------|----------|----------|
| 1 min | Very frequent | Scalping |
| 3 min | Frequent | Day trading (default) |
| 5 min | Moderate | Swing trading |
| 15 min | Infrequent | Position trading |

**Recommendation**: 3-5 minutes for most strategies

### Leverage Settings

⚠️ **Higher leverage = Higher risk**

| Leverage | Risk Level | Use Case |
|----------|------------|----------|
| 2-3x | Low | Conservative |
| 5-7x | Medium | Balanced |
| 8-10x | High | Aggressive |
| 10x+ | Very High | Expert only |

**Recommendation**: Start with 5x, adjust based on experience

---

## 🔄 Configuration Changes

### Applying Changes

1. **Edit configuration file**:
```bash
nano backend/config/trading_config.yaml
# or
nano backend/config/models/deepseek_aggressive.yaml
```

2. **Restart backend**:
```bash
cd backend
# Stop: Ctrl+C
./start.sh
```

3. **Changes take effect immediately**

### Hot Reload

❌ **Not supported** - Requires restart

### Validation

Configuration is validated on startup:
- Missing required fields → Error
- Invalid values → Warning + Default
- Environment variables → Resolved at runtime

---

## 🧪 Testing Configuration

### 1. Testnet Mode

Enable testnet in agent config:
```yaml
exchange:
  testnet: true
```

### 2. Dry Run (Coming Soon)

```yaml
strategy:
  dry_run: true  # Log decisions, don't execute
```

### 3. Small Balance

Start with minimum:
```yaml
risk_management:
  max_position_size_pct: 10  # Very conservative
  max_total_position_pct: 30
```

---

## 📊 Monitoring Configuration

### Log Levels

```yaml
system:
  log_level: "DEBUG"  # More verbose
  log_level: "INFO"   # Default
  log_level: "WARNING"  # Errors only
```

### Decision Logging

All decisions automatically logged to:
```
backend/logs/decisions/{agent_id}/decision_*.json
```

No configuration needed.

---

## 🔐 Security Best Practices

1. **API Keys**:
   - Use `.env` file
   - Never commit to git
   - Rotate regularly

2. **Private Keys**:
   - Store securely
   - Use hardware wallet in production
   - Test with small amounts first

3. **IP Whitelisting**:
   - Configure on Aster DEX
   - Lock to your server IP

4. **Limits**:
   - Start conservative
   - Increase gradually
   - Monitor closely

5. **Monitoring**:
   - Check logs daily
   - Set up alerts
   - Have emergency stop plan

---

## 📝 Configuration Checklist

### First Time Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Add DeepSeek API key
- [ ] Add Aster credentials
- [ ] Review `trading_config.yaml`
- [ ] Check risk management settings
- [ ] Set appropriate leverage limits
- [ ] Choose trading pairs
- [ ] Test on testnet first

### Before Going Live
- [ ] Reduce position limits
- [ ] Lower leverage
- [ ] Set tight stop losses
- [ ] Enable only 1 agent
- [ ] Monitor first 24 hours
- [ ] Review all decisions
- [ ] Verify P/L calculation

### Regular Maintenance
- [ ] Review performance weekly
- [ ] Adjust risk limits as needed
- [ ] Rotate API keys monthly
- [ ] Update models if available
- [ ] Check for updates

---

## 🆘 Common Issues

### "Missing API key"
- Check `.env` file exists
- Verify key format
- Ensure no extra spaces

### "Insufficient balance"
- Reduce position sizes
- Lower leverage
- Check available balance

### "Too many positions"
- Check `max_positions` setting
- Close some positions manually
- Adjust strategy

### Agent not trading
- Check `enabled: true`
- Verify scan interval
- Check logs for errors
- Ensure API keys valid

---

**For more help, see [Troubleshooting Guide](TROUBLESHOOTING.md)**

