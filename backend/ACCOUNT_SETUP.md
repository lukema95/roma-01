# Multi-Model Account Setup Guide

## Overview

Each AI model in ROMA Trading Platform operates with its own **independent trading account**. This ensures:
- **Isolated Risk**: Each model's trading doesn't affect others
- **Fair Comparison**: Pure performance metrics for each model
- **Independent Capital**: Each model manages its own $10,000 USDT

## Account Architecture

```
┌─────────────────────────────────────────────────┐
│         ROMA Trading Platform                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ DeepSeek V3.1   │  │ Qwen3 Max       │      │
│  │ Account A       │  │ Account B       │      │
│  │ $10,000 USDT    │  │ $10,000 USDT    │      │
│  └─────────────────┘  └─────────────────┘      │
│                                                  │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Claude Sonnet   │  │ Grok 4          │      │
│  │ Account C       │  │ Account D       │      │
│  │ $10,000 USDT    │  │ $10,000 USDT    │      │
│  └─────────────────┘  └─────────────────┘      │
│                                                  │
│  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Gemini 2.5 Pro  │  │ GPT-5           │      │
│  │ Account E       │  │ Account F       │      │
│  │ $10,000 USDT    │  │ $10,000 USDT    │      │
│  └─────────────────┘  └─────────────────┘      │
│                                                  │
└─────────────────────────────────────────────────┘
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

# ==================== Aster Exchange Accounts ====================
# Each model has its own independent trading account

# DeepSeek Chat V3.1 Account
ASTER_USER_DEEPSEEK=0x1234...
ASTER_SIGNER_DEEPSEEK=0x5678...
ASTER_PRIVATE_KEY_DEEPSEEK=0xabcd...

# Qwen3 Max Account
ASTER_USER_QWEN=0x2345...
ASTER_SIGNER_QWEN=0x6789...
ASTER_PRIVATE_KEY_QWEN=0xbcde...

# Claude Sonnet 4.5 Account
ASTER_USER_CLAUDE=0x3456...
ASTER_SIGNER_CLAUDE=0x789a...
ASTER_PRIVATE_KEY_CLAUDE=0xcdef...

# Grok 4 Account
ASTER_USER_GROK=0x4567...
ASTER_SIGNER_GROK=0x89ab...
ASTER_PRIVATE_KEY_GROK=0xdef0...

# Gemini 2.5 Pro Account
ASTER_USER_GEMINI=0x5678...
ASTER_SIGNER_GEMINI=0x9abc...
ASTER_PRIVATE_KEY_GEMINI=0xef01...

# GPT-5 Account
ASTER_USER_GPT=0x6789...
ASTER_SIGNER_GPT=0xabcd...
ASTER_PRIVATE_KEY_GPT=0xf012...
```

## Configuration Files

Each model has its own configuration file in `backend/config/models/`:

| Model | Config File |
|-------|------------|
| DeepSeek Chat V3.1 | `deepseek-chat-v3.1.yaml` |
| Qwen3 Max | `qwen3-max.yaml` |
| Claude Sonnet 4.5 | `claude-sonnet-4.5.yaml` |
| Grok 4 | `grok-4.yaml` |
| Gemini 2.5 Pro | `gemini-2.5-pro.yaml` |
| GPT-5 | `gpt-5.yaml` |

Each config file specifies:
- LLM provider and model
- Exchange account credentials (via env vars)
- Trading strategy parameters
- Risk management rules
- Initial balance: **$10,000 USDT**

## Setting Up Multiple Accounts

### Option 1: Separate Aster Accounts (Recommended for Production)

1. Create 6 separate Aster exchange accounts
2. Fund each account with $10,000 USDT
3. Configure each account's credentials in `.env`

**Pros:**
- True isolation between models
- Accurate performance tracking
- No risk of conflicts

**Cons:**
- Requires 6 separate accounts
- Higher setup complexity

### Option 2: Single Account (For Testing Only)

For testing purposes, you can use the same account for all models:

```bash
# Use same account for all models (TESTING ONLY)
ASTER_USER_DEEPSEEK=0x1234...
ASTER_SIGNER_DEEPSEEK=0x5678...
ASTER_PRIVATE_KEY_DEEPSEEK=0xabcd...

# Copy the same values for other models
ASTER_USER_QWEN=0x1234...
ASTER_SIGNER_QWEN=0x5678...
ASTER_PRIVATE_KEY_QWEN=0xabcd...

# ... and so on
```

**⚠️ Warning:** Only enable **ONE** model at a time when using a single account, or they will conflict.

## Enabling/Disabling Models

Edit `backend/config/trading_config.yaml`:

```yaml
agents:
  - id: "deepseek-chat-v3.1"
    enabled: true    # Set to true/false
    
  - id: "qwen3-max"
    enabled: false   # Set to true/false
    
  # ... etc
```

## Risk Management Per Model

Each model's config includes independent risk management:

```yaml
risk_management:
  max_positions: 3              # Max simultaneous positions
  max_leverage: 10              # Max leverage per position
  max_position_size_pct: 25     # Max 25% of balance per position
  max_total_position_pct: 75    # Max 75% total exposure
  max_daily_loss_pct: 12        # Stop trading if 12% daily loss
  stop_loss_pct: 3              # 3% stop loss
  take_profit_pct: 10           # 10% take profit
```

## Trading Styles

Each model has a different trading style:

| Model | Style | Position Size | Risk Level |
|-------|-------|--------------|------------|
| DeepSeek Chat V3.1 | Balanced | 30% | Medium |
| Qwen3 Max | Balanced | 25% | Medium |
| Claude Sonnet 4.5 | Conservative | 25% | Low |
| Grok 4 | Aggressive | 30% | High |
| Gemini 2.5 Pro | Balanced | 25% | Medium |
| GPT-5 | Conservative | 25% | Low |

## Monitoring

Each model's performance can be monitored independently:

- **Frontend Dashboard**: `http://localhost:3000`
- **Live Chart**: Shows all active models
- **Leaderboard**: Compare model performance
- **Agent Details**: Click any model to see detailed stats

## Best Practices

1. **Start with One Model**: Test with DeepSeek first
2. **Monitor Closely**: Watch for 24 hours before adding more
3. **Gradual Rollout**: Enable one model at a time
4. **Check Balances**: Verify each account has sufficient funds
5. **Review Logs**: Check `backend/logs/` for any issues

## Troubleshooting

### Issue: "Account not found"
- Check that environment variables are set correctly
- Verify account has been created on Aster exchange

### Issue: "Insufficient balance"
- Ensure account has at least $10,000 USDT
- Check if funds are locked in other positions

### Issue: Models conflicting
- Verify each model uses different account credentials
- Check only intended models are enabled in config

## Security Notes

⚠️ **Never commit `.env` file to git**
⚠️ **Keep private keys secure**
⚠️ **Use separate accounts for production**
⚠️ **Enable 2FA on exchange accounts**

## Support

For issues or questions:
- Check logs: `backend/logs/roma_trading_*.log`
- Review API docs: `docs/API_REFERENCE.md`
- See troubleshooting: `docs/TROUBLESHOOTING.md`

