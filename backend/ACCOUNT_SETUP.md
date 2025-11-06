# Account Setup Guide

## Overview

ROMA Trading Platform uses an **account-centric architecture** where:
- **DEX Accounts** and **LLM Models** are decoupled and defined independently
- **Agents** bind an account, a model, and a trading strategy together
- Each agent can use any DEX (Aster or Hyperliquid) with any LLM model
- Multiple agents can share the same account or use separate accounts

This architecture provides:
- **Flexibility**: Mix and match accounts with models
- **Isolated Risk**: Each agent operates independently
- **Fair Comparison**: Compare model performance across different accounts
- **Multi-DEX Support**: Run agents on different DEXs simultaneously

## Account Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              ROMA Trading Platform                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Aster Acc 1 │  │ HL Acc 1    │  │ Aster Acc 2 │        │
│  │ $10,000     │  │ $5,000      │  │ $15,000     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│       │                │                │                    │
│       ├────────────────┼────────────────┤                  │
│       │                │                │                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ DeepSeek   │  │ Qwen        │  │ Claude      │        │
│  │ Model      │  │ Model       │  │ Model       │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│       │                │                │                    │
│       └────────────────┼────────────────┘                  │
│                        │                                    │
│              ┌─────────────────┐                           │
│              │   Agents        │                           │
│              │                 │                           │
│              │ Agent 1:        │                           │
│              │   Aster Acc 1   │                           │
│              │   + DeepSeek    │                           │
│              │                 │                           │
│              │ Agent 2:        │                           │
│              │   HL Acc 1      │                           │
│              │   + Qwen        │                           │
│              │                 │                           │
│              │ Agent 3:        │                           │
│              │   Aster Acc 2   │                           │
│              │   + Claude      │                           │
│              └─────────────────┘                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following structure:

```bash
# ==================== LLM API Keys ====================
DEEPSEEK_API_KEY=sk-xxxxx
QWEN_API_KEY=sk-xxxxx
ANTHROPIC_API_KEY=sk-xxxxx
XAI_API_KEY=xai-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
OPENAI_API_KEY=sk-xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# ==================== Aster Exchange Accounts ====================
# Numbered accounts (01, 02, 03, etc.) - use any numbering scheme

# Aster Account 01
ASTER_USER_01=0x1234...
ASTER_SIGNER_01=0x5678...
ASTER_PRIVATE_KEY_01=0xabcd...

# Aster Account 02 (optional - add more as needed)
ASTER_USER_02=0x2345...
ASTER_SIGNER_02=0x6789...
ASTER_PRIVATE_KEY_02=0xbcde...

# ==================== Hyperliquid Exchange Accounts ====================
# Hyperliquid Account 01
# IMPORTANT: api_secret is the API wallet private key, account_id is the MAIN wallet address
HL_SECRET_KEY_01=0x1234567890abcdef...  # API wallet private key (without 0x prefix)
HL_ACCOUNT_ADDRESS_01=0xabcd...  # MAIN wallet address (where funds are held)

# Hyperliquid Account 02 (optional)
HL_SECRET_KEY_02=0x234567890abcdef1...
HL_ACCOUNT_ADDRESS_02=0xbcde...
```

**Important Notes:**
- Account numbers (01, 02, etc.) are arbitrary - use any scheme you prefer
- Multiple agents can reference the same account
- Each account can be paired with any model
- For Hyperliquid: `HL_SECRET_KEY_XX` is the API wallet private key, `HL_ACCOUNT_ADDRESS_XX` is your main wallet address

## Configuration File

All configuration is now centralized in `backend/config/trading_config.yaml`. This file uses an **account-centric** structure with three main sections:

### 1. Accounts Section

Define your DEX accounts (Aster or Hyperliquid):

```yaml
accounts:
  - id: "aster-acc-01"
    dex_type: "aster"  # or "type: aster" (both are supported)
    user: ${ASTER_USER_01}
    signer: ${ASTER_SIGNER_01}
    private_key: ${ASTER_PRIVATE_KEY_01}
    testnet: false
    hedge_mode: false

  - id: "hl-acc-01"
    dex_type: "hyperliquid"  # or "type: hyperliquid" (both are supported)
    api_secret: ${HL_SECRET_KEY_01}  # API wallet private key
    account_id: ${HL_ACCOUNT_ADDRESS_01}  # MAIN wallet address
    testnet: false
    hedge_mode: false
```

**Important for Hyperliquid:**
- `api_secret`: Private key of your **API wallet** (used for signing transactions)
- `account_id`: Address of your **MAIN wallet** (where funds are held)
- These are **different addresses** - don't confuse them!

### 2. Models Section

Define your LLM models:

```yaml
models:
  - id: "deepseek-v3.1"
    provider: "deepseek"
    model: "deepseek-chat"
    api_key: ${DEEPSEEK_API_KEY}

  - id: "qwen-max"
    provider: "qwen"
    model: "qwen-max"
    api_key: ${QWEN_API_KEY}
```

### 3. Agents Section

Bind accounts, models, and strategies together:

```yaml
agents:
  - id: "deepseek-aster-01"
    name: "DeepSeek on Aster"
    account_id: "aster-acc-01"
    model_id: "deepseek-v3.1"
    enabled: true
    strategy:
      initial_balance: 10000
      risk_management:
        max_positions: 3
        max_leverage: 10
        # ... more strategy config
```

See `backend/config/README_CONFIG.md` for detailed configuration documentation.

## Setting Up Multiple Accounts

### Account-Centric Architecture

The platform uses an **account-centric** architecture where:
- **Accounts** and **Models** are defined separately
- **Agents** bind an account, a model, and a strategy together
- Multiple agents can share the same account (not recommended)
- Each agent can use different DEXs (Aster or Hyperliquid)

### Recommended Setup: Separate Accounts

1. **Create separate exchange accounts** (Aster or Hyperliquid)
2. **Fund each account** with your desired amount (e.g., $10,000 USDT)
3. **Configure account credentials** in `.env`:
   ```bash
   ASTER_USER_01=0x1234...
   ASTER_SIGNER_01=0x5678...
   ASTER_PRIVATE_KEY_01=0xabcd...
   
   ASTER_USER_02=0x2345...  # Different account
   ASTER_SIGNER_02=0x6789...
   ASTER_PRIVATE_KEY_02=0xbcde...
   ```

4. **Define accounts in `trading_config.yaml`**:
   ```yaml
   accounts:
     - id: "aster-acc-01"
       dex_type: "aster"
       user: ${ASTER_USER_01}
       signer: ${ASTER_SIGNER_01}
       private_key: ${ASTER_PRIVATE_KEY_01}
   
     - id: "aster-acc-02"
       dex_type: "aster"
       user: ${ASTER_USER_02}
       signer: ${ASTER_SIGNER_02}
       private_key: ${ASTER_PRIVATE_KEY_02}
   ```

5. **Create agents** that bind accounts to models:
   ```yaml
   agents:
     - id: "deepseek-acc01"
       account_id: "aster-acc-01"
       model_id: "deepseek-v3.1"
       enabled: true
     
     - id: "qwen-acc02"
       account_id: "aster-acc-02"
       model_id: "qwen-max"
       enabled: true
   ```

**Benefits:**
- ✅ True isolation between agents
- ✅ Accurate performance tracking per agent
- ✅ No risk of conflicts
- ✅ Can mix different DEXs (e.g., 3 Aster accounts + 3 Hyperliquid accounts)
- ✅ Easy to add/remove agents without changing account configs

### Alternative: Shared Account (Testing Only)

For testing, you can use the same account for multiple agents:

```yaml
accounts:
  - id: "test-account"
    dex_type: "aster"
    user: ${ASTER_USER_01}
    signer: ${ASTER_SIGNER_01}
    private_key: ${ASTER_PRIVATE_KEY_01}

agents:
  - id: "agent1"
    account_id: "test-account"  # Same account
    model_id: "deepseek-v3.1"
    enabled: true
  
  - id: "agent2"
    account_id: "test-account"  # Same account
    model_id: "qwen-max"
    enabled: false  # ⚠️ Only enable ONE at a time!
```

**⚠️ Warning:** When using a shared account, only enable **ONE** agent at a time, or they will conflict and overwrite each other's positions.

## Enabling/Disabling Agents

Edit `backend/config/trading_config.yaml` and set `enabled: true/false` for each agent:

```yaml
agents:
  - id: "deepseek-aster-01"
    name: "DeepSeek on Aster"
    account_id: "aster-acc-01"
    model_id: "deepseek-v3.1"
    enabled: true    # Set to true to enable, false to disable
    
  - id: "qwen-hl-01"
    name: "Qwen on Hyperliquid"
    account_id: "hl-acc-01"
    model_id: "qwen-max"
    enabled: false   # Set to true/false
    
  # ... add more agents as needed
```

## Risk Management Per Agent

Each agent's strategy includes independent risk management:

```yaml
agents:
  - id: "my-agent"
    account_id: "aster-acc-01"
    model_id: "deepseek-v3.1"
    strategy:
      initial_balance: 10000
      risk_management:
        max_positions: 3              # Max simultaneous positions
        max_leverage: 10              # Max leverage per position
        max_position_size_pct: 25     # Max 25% of balance per position
        max_total_position_pct: 75    # Max 75% total exposure
        max_daily_loss_pct: 12        # Stop trading if 12% daily loss
        stop_loss_pct: 3              # 3% stop loss
        take_profit_pct: 10           # 10% take profit
      trading_style: "balanced"       # conservative, balanced, or aggressive
```

See `backend/config/README_CONFIG.md` for complete strategy configuration options.

## Trading Styles

You can configure different trading styles per agent:

| Style | Characteristics | Position Size | Risk Level |
|-------|----------------|--------------|------------|
| Conservative | Lower leverage, smaller positions | 20-25% | Low |
| Balanced | Moderate leverage, medium positions | 25-30% | Medium |
| Aggressive | Higher leverage, larger positions | 30-40% | High |

Set `trading_style` in each agent's strategy configuration.

## Monitoring

Each agent's performance can be monitored independently:

- **Frontend Dashboard**: `http://localhost:3000`
- **Live Chart**: Shows all active agents with account value over time
- **Leaderboard**: Compare agent performance
- **Agent Details**: Click any agent to see detailed stats (positions, trades, decisions)
- **Filtering**: Filter by DEX type, account, or agent in the sidebar

## Best Practices

1. **Start with One Agent**: Test with a single agent first (e.g., DeepSeek on Aster)
2. **Monitor Closely**: Watch for 24 hours before adding more agents
3. **Gradual Rollout**: Enable one agent at a time
4. **Use Separate Accounts**: For production, use separate accounts for each agent
5. **Check Balances**: Verify each account has sufficient funds
6. **Review Logs**: Check `backend/logs/` for any issues
7. **Hyperliquid Setup**: Remember to set both API wallet private key (`api_secret`) and main wallet address (`account_id`)

## Troubleshooting

### Issue: "Account not found"
- Check that environment variables are set correctly in `.env`
- Verify the account ID in `trading_config.yaml` matches an account in the `accounts` section
- For Aster: Verify account has been created on the exchange
- For Hyperliquid: Verify `account_id` is set to your main wallet address

### Issue: "Insufficient balance"
- Ensure account has sufficient funds
- Check if funds are locked in other positions
- Verify `account_id` for Hyperliquid points to the wallet with funds (main wallet, not API wallet)

### Issue: "Hyperliquid balance showing $0.00"
- **Check `account_id`**: This should be your **MAIN wallet address**, not the API wallet address
- **Check `api_secret`**: This should be your **API wallet private key** (without 0x prefix)
- Verify funds are in the main wallet address
- Check network (mainnet vs testnet)

### Issue: Agents conflicting
- Verify each agent uses a different account (recommended)
- If sharing an account, only enable ONE agent at a time
- Check that `account_id` in agent config matches an account in the `accounts` section

### Issue: "Order has invalid price"
- This is a Hyperliquid-specific error - price formatting should be handled automatically
- If it persists, check logs for formatted price values

## Security Notes

⚠️ **Never commit `.env` file to git**
⚠️ **Keep private keys secure**
⚠️ **Use separate accounts for production**
⚠️ **Enable 2FA on exchange accounts**

## Additional Resources

For more detailed information:
- **Configuration Guide**: `backend/config/README_CONFIG.md` - Complete configuration documentation
- **Quick Start**: `backend/config/QUICK_START.md` - Step-by-step setup guide
- **Architecture Docs**: `docs/development/architecture.md` - System architecture details
- **Logs**: `backend/logs/roma_trading_*.log` - Check logs for errors

## Support

For issues or questions:
- Check the troubleshooting section above
- Review logs in `backend/logs/`
- Check configuration files for errors
- Verify environment variables are set correctly

