# Token Analysis & Trading Advice Chat Feature - Requirements

## Overview

This document describes the requirements for enhancing the AI chat assistant to support token-specific analysis and trading advice. Users will be able to ask the AI to analyze a specific token's current market data and receive trading recommendations.

## Background

The current AI chat assistant (`ChatService`) provides general help about trading strategies, prompts, and platform features. This enhancement will add the ability to:

1. Analyze real-time market data for a specific token
2. Perform technical analysis using existing indicators
3. Generate trading recommendations based on the analysis
4. Provide actionable trading advice

## Functional Requirements

### FR1: Token Data Collection
- **FR1.1**: The system shall fetch current market price for any supported token symbol
- **FR1.2**: The system shall retrieve K-line data (OHLCV) for multiple timeframes (3m, 1h, 4h)
- **FR1.3**: The system shall calculate technical indicators including:
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - EMA (Exponential Moving Average) - 20 and 50 periods
  - ATR (Average True Range)
  - Volume analysis
  - Price change percentages
- **FR1.4**: The system shall support all tokens available in the trading system (BTC, ETH, SOL, BNB, DOGE, XRP, etc.)

### FR2: Intent Recognition
- **FR2.1**: The system shall detect when a user message requests token analysis
- **FR2.2**: The system shall extract token symbol from user message (e.g., "analyze BTC", "what about ETH?", "BTCUSDT analysis")
- **FR2.3**: The system shall handle various input formats:
  - Symbol only: "BTC", "ETH", "SOL"
  - Full symbol: "BTCUSDT", "ETHUSDT"
  - Natural language: "analyze Bitcoin", "what's happening with Ethereum?"
- **FR2.4**: The system shall support both English and Chinese language inputs

### FR3: Analysis Generation
- **FR3.1**: The system shall perform comprehensive technical analysis using existing `TechnicalAnalysisToolkit`
- **FR3.2**: The system shall analyze multiple timeframes (short-term: 3m, medium-term: 1h, long-term: 4h)
- **FR3.3**: The system shall format market data in a structured way for AI consumption
- **FR3.4**: The system shall include the following in the analysis:
  - Current price and recent price movements
  - Technical indicator values and interpretations
  - Volume trends
  - Market trend identification (bullish/bearish/neutral)
  - Support and resistance levels (if available)

### FR4: Trading Recommendations
- **FR4.1**: The system shall generate trading recommendations based on analysis
- **FR4.2**: Recommendations shall include:
  - Suggested action (BUY/LONG, SELL/SHORT, HOLD, WAIT)
  - Confidence level (high/medium/low)
  - Entry price suggestion
  - Stop loss level
  - Take profit target
  - Recommended leverage (if applicable)
  - Risk assessment
- **FR4.3**: The system shall provide reasoning for each recommendation
- **FR4.4**: The system shall consider risk management principles in recommendations

### FR5: Response Formatting
- **FR5.1**: The system shall format responses in a clear, readable structure
- **FR5.2**: Responses shall include:
  - Summary of current market conditions
  - Key technical indicators and their meanings
  - Trading recommendation with reasoning
  - Risk warnings
- **FR5.3**: The system shall support both English and Chinese output
- **FR5.4**: The system shall use markdown formatting for better readability

### FR6: Error Handling
- **FR6.1**: The system shall handle invalid token symbols gracefully
- **FR6.2**: The system shall handle data fetch failures (network issues, API errors)
- **FR6.3**: The system shall provide helpful error messages to users
- **FR6.4**: The system shall fall back to general chat mode if analysis fails

## Non-Functional Requirements

### NFR1: Performance
- **NFR1.1**: Token analysis should complete within 5 seconds
- **NFR1.2**: Data fetching should not block other chat requests
- **NFR1.3**: Use caching for frequently requested tokens (optional enhancement)

### NFR2: Reliability
- **NFR2.1**: The system shall gracefully degrade if DEX API is unavailable
- **NFR2.2**: The system shall handle rate limiting from DEX APIs
- **NFR2.3**: The system shall retry failed requests with exponential backoff

### NFR3: Usability
- **NFR3.1**: Users should be able to request analysis using natural language
- **NFR3.2**: Responses should be clear and actionable
- **NFR3.3**: The feature should integrate seamlessly with existing chat interface

### NFR4: Maintainability
- **NFR4.1**: Code should reuse existing `TechnicalAnalysisToolkit` and DEX toolkits
- **NFR4.2**: New functionality should follow existing code patterns
- **NFR4.3**: Changes should not break existing chat functionality

## User Stories

### US1: Basic Token Analysis
**As a** user  
**I want to** ask the AI to analyze a specific token  
**So that** I can get insights about its current market condition

**Example:**
- User: "Analyze BTC"
- AI: Provides comprehensive analysis with price, indicators, and recommendation

### US2: Trading Advice
**As a** trader  
**I want to** get trading recommendations for a token  
**So that** I can make informed trading decisions

**Example:**
- User: "What should I do with ETH?"
- AI: Provides analysis and specific trading recommendation (BUY/SELL/HOLD)

### US3: Multi-Timeframe Analysis
**As a** trader  
**I want to** understand both short-term and long-term trends  
**So that** I can align my trading strategy accordingly

**Example:**
- User: "Analyze SOL with different timeframes"
- AI: Provides analysis for 3m, 1h, and 4h timeframes

### US4: Risk-Aware Recommendations
**As a** risk-conscious trader  
**I want to** receive recommendations that include risk assessment  
**So that** I can manage my risk appropriately

**Example:**
- User: "Should I buy BTC now?"
- AI: Provides recommendation with risk level, stop loss, and position sizing advice

## Technical Constraints

1. Must use existing `ChatService` architecture
2. Must reuse `TechnicalAnalysisToolkit` for calculations
3. Must use existing DEX toolkits (`AsterToolkit`, `HyperliquidToolkit`) for data
4. Must work with existing LLM providers (DeepSeek, Qwen, Claude, etc.)
5. Must maintain backward compatibility with existing chat functionality

## Success Criteria

1. ✅ Users can request token analysis using natural language
2. ✅ System successfully extracts token symbols from various input formats
3. ✅ Analysis includes comprehensive technical indicators
4. ✅ Recommendations are actionable and include risk assessment
5. ✅ Response time is under 5 seconds
6. ✅ Feature works in both English and Chinese
7. ✅ Existing chat functionality remains unaffected

## Out of Scope (Future Enhancements)

- Historical performance analysis
- Comparison between multiple tokens
- Backtesting recommendations
- Integration with user's actual trading positions
- Real-time price alerts
- Custom indicator calculations
- News sentiment analysis
- Social media sentiment analysis

## Dependencies

- Existing `ChatService` (`backend/src/roma_trading/core/chat_service.py`)
- `TechnicalAnalysisToolkit` (`backend/src/roma_trading/toolkits/technical_analysis.py`)
- DEX Toolkits (`AsterToolkit`, `HyperliquidToolkit`)
- Agent Manager for accessing DEX instances
- DSPy framework for LLM interactions

## Related Documentation

- [Architecture Document](architecture.md)
- [Development Guide](token-analysis-chat-development.md)
- [API Documentation](../api/rest-api.md)

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-19  
**Status**: Draft

