# Quick Start Guide - Account-Centric Configuration

## Step 1: Edit Configuration

```bash
cd backend/config
# Edit the default trading_config.yaml file
vim trading_config.yaml  # or use your preferred editor
```

## Step 2: Set Up Environment Variables

Create `.env` file in `backend/` directory:

```bash
# LLM API Keys
DEEPSEEK_API_KEY=sk-your-key-here
QWEN_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-your-key-here
OPENAI_API_KEY=sk-your-key-here
XAI_API_KEY=xai-your-key-here
GOOGLE_API_KEY=AIzaSy-your-key-here

# Aster DEX Account 1
ASTER_USER_01=your-main-wallet-address
ASTER_SIGNER_01=your-signer-address
ASTER_PRIVATE_KEY_01=your-private-key

# Hyperliquid DEX Account 1
HL_SECRET_KEY_01=your-api-wallet-private-key
HL_ACCOUNT_ADDRESS_01=your-main-wallet-address 
```

## Step 3: Configure Accounts

Edit `trading_config.yaml`, fill in the `accounts` section:

```yaml
accounts:
  - id: "aster-acc-01"
    name: "My Aster Account"
    dex_type: "aster"
    user: ${ASTER_USER_01}
    signer: ${ASTER_SIGNER_01}
    private_key: ${ASTER_PRIVATE_KEY_01}
    testnet: false
    hedge_mode: false
```

## Step 4: Configure Models

Fill in the `models` section:

```yaml
models:
  - id: "deepseek-v3.1"
    provider: "deepseek"
    api_key: ${DEEPSEEK_API_KEY}
    model: "deepseek-chat"
    temperature: 0.15
    max_tokens: 4000
```

## Step 5: Create Agents

Bind accounts and models in the `agents` section:

```yaml
agents:
  - id: "my-first-agent"
    name: "My First Agent"
    enabled: true
    account_id: "aster-acc-01"    # Reference to account above
    model_id: "deepseek-v3.1"     # Reference to model above
    strategy:
      initial_balance: 10000.0
      scan_interval_minutes: 3
      default_coins:
        - BTCUSDT
        - ETHUSDT
      risk_management:
        max_positions: 3
        max_leverage: 10
        stop_loss_pct: 3
        take_profit_pct: 10
```

## Step 6: Start the Platform

```bash
cd backend
python -m roma_trading.main
```

Or use Docker:

```bash
docker compose up
```

## Common Configurations

### Single Agent Setup

```yaml
accounts:
  - id: "my-account"
    dex_type: "aster"
    user: ${ASTER_USER_01}
    signer: ${ASTER_SIGNER_01}
    private_key: ${ASTER_PRIVATE_KEY_01}

models:
  - id: "my-model"
    provider: "deepseek"
    api_key: ${DEEPSEEK_API_KEY}
    model: "deepseek-chat"

agents:
  - id: "my-agent"
    account_id: "my-account"
    model_id: "my-model"
    enabled: true
```

### Multiple Agents on Same Account (Testing Only)

```yaml
agents:
  - id: "agent-1"
    account_id: "my-account"  # Same account
    model_id: "model-1"
  - id: "agent-2"
    account_id: "my-account"  # Same account
    model_id: "model-2"
```

⚠️ **Warning**: Only enable ONE agent at a time when sharing accounts, or they will conflict.

### Multiple Accounts with Different Models

```yaml
accounts:
  - id: "account-1"
    dex_type: "aster"
    # ... config
  - id: "account-2"
    dex_type: "hyperliquid"
    # ... config

models:
  - id: "model-1"
    # ... config
  - id: "model-2"
    # ... config

agents:
  - id: "agent-1"
    account_id: "account-1"
    model_id: "model-1"
  - id: "agent-2"
    account_id: "account-2"
    model_id: "model-2"
```

## Validation Checklist

Before starting, verify:

- [ ] All environment variables are set in `.env`
- [ ] Account IDs in `agents` match IDs in `accounts`
- [ ] Model IDs in `agents` match IDs in `models`
- [ ] All required fields are filled (user/signer/private_key for Aster, api_secret for Hyperliquid)
- [ ] At least one agent has `enabled: true`
- [ ] Testnet accounts if using `testnet: true`

## Troubleshooting

### "Account not found: xxx"
- Check that `account_id` in agent matches an `id` in `accounts` section
- Verify spelling and case sensitivity

### "Model not found: xxx"
- Check that `model_id` in agent matches an `id` in `models` section
- Verify spelling and case sensitivity

### "Missing required fields"
- Aster accounts: Need `user`, `signer`, `private_key`
- Hyperliquid accounts: Need `api_secret`
- Models: Need `provider` and `model`

### Agent not starting
- Check `enabled: true` (or omit, defaults to true)
- Check logs: `backend/logs/roma_trading_*.log`
- Verify environment variables are loaded correctly

## Next Steps

- See `README_CONFIG.md` for detailed configuration guide
- See `ACCOUNT_SETUP.md` for account setup instructions
- See `docs/integrations/` for Hyperliquid integration details

