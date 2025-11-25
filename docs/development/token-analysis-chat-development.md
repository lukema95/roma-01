# Token Analysis & Trading Advice Chat Feature - Development Guide

## Overview

This document provides a detailed development guide for implementing the token analysis and trading advice feature in the AI chat assistant. It covers architecture, implementation details, code examples, and testing strategies.

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ChatService                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Intent Detection & Message Parsing              │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  TokenAnalysisHandler (NEW)                     │  │
│  │  - Extract token symbol                         │  │
│  │  - Fetch market data                            │  │
│  │  - Perform technical analysis                   │  │
│  │  - Generate AI prompt with data                 │  │
│  └──────────────────────────────────────────────────┘  │
│                        │                                 │
│                        ▼                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LLM (via DSPy)                                 │  │
│  │  - Analyze data                                 │  │
│  │  - Generate recommendations                     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ DEX Toolkit  │   │ Technical    │   │ Agent        │
│ (Aster/HL)   │   │ Analysis     │   │ Manager      │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Key Components

1. **ChatService** (existing): Main chat interface
2. **TokenAnalysisHandler** (new): Handles token analysis requests
3. **TechnicalAnalysisToolkit** (existing): Calculates indicators
4. **DEX Toolkits** (existing): Fetch market data
5. **AgentManager** (existing): Provides access to DEX instances

## Implementation Plan

### Phase 1: Intent Detection & Token Extraction

#### Step 1.1: Create Token Analysis Handler

Create a new file: `backend/src/roma_trading/core/token_analysis_handler.py`

```python
"""
Token analysis handler for chat service.

Handles token-specific analysis requests and generates comprehensive
market analysis with trading recommendations.
"""

import re
from typing import Optional, Dict, List
from loguru import logger
from roma_trading.agents import AgentManager
from roma_trading.toolkits.technical_analysis import TechnicalAnalysisToolkit


class TokenAnalysisHandler:
    """Handles token analysis requests in chat."""
    
    # Supported token symbols mapping
    TOKEN_MAPPING = {
        # Full names to symbols
        "bitcoin": "BTCUSDT",
        "ethereum": "ETHUSDT",
        "solana": "SOLUSDT",
        "binance": "BNBUSDT",
        "doge": "DOGEUSDT",
        "dogecoin": "DOGEUSDT",
        "ripple": "XRPUSDT",
        "xrp": "XRPUSDT",
        # Symbols
        "btc": "BTCUSDT",
        "eth": "ETHUSDT",
        "sol": "SOLUSDT",
        "bnb": "BNBUSDT",
        "doge": "DOGEUSDT",
        "xrp": "XRPUSDT",
    }
    
    def __init__(self, agent_manager: AgentManager):
        self.agent_manager = agent_manager
        self.ta_toolkit = TechnicalAnalysisToolkit()
    
    def detect_analysis_request(self, message: str) -> bool:
        """
        Detect if user message requests token analysis.
        
        Args:
            message: User's message
            
        Returns:
            True if analysis is requested
        """
        message_lower = message.lower()
        
        # Keywords that indicate analysis request
        analysis_keywords = [
            "analyze", "analysis", "analyze",
            "what about", "how about",
            "should i", "can i",
            "buy", "sell", "trade",
            "price", "trend", "signal",
            "recommendation", "advice"
        ]
        
        return any(keyword in message_lower for keyword in analysis_keywords)
    
    def extract_token_symbol(self, message: str) -> Optional[str]:
        """
        Extract token symbol from user message.
        
        Args:
            message: User's message
            
        Returns:
            Token symbol (e.g., "BTCUSDT") or None
        """
        message_lower = message.lower()
        
        # Check for full symbol (e.g., "BTCUSDT")
        symbol_pattern = r'\b([A-Z]{2,10}USDT)\b'
        match = re.search(symbol_pattern, message.upper())
        if match:
            return match.group(1)
        
        # Check token mapping
        for token_name, symbol in self.TOKEN_MAPPING.items():
            if token_name in message_lower:
                return symbol
        
        # Try to find 3-4 letter uppercase token codes
        token_pattern = r'\b([A-Z]{3,4})\b'
        matches = re.findall(token_pattern, message.upper())
        for match in matches:
            if match in ["BTC", "ETH", "SOL", "BNB", "DOGE", "XRP"]:
                return f"{match}USDT"
        
        return None
    
    async def fetch_token_data(
        self, 
        symbol: str, 
        timeframes: List[str] = ["3m", "1h", "4h"]
    ) -> Dict:
        """
        Fetch comprehensive token data for analysis.
        
        Args:
            symbol: Token symbol (e.g., "BTCUSDT")
            timeframes: List of timeframes to analyze
            
        Returns:
            Dictionary with market data and technical analysis
        """
        # Get any agent to access DEX
        agents = self.agent_manager.get_all_agents()
        if not agents:
            raise RuntimeError("No agents available for data access")
        
        agent = self.agent_manager.get_agent(agents[0]["id"])
        dex = agent.dex
        
        # Fetch current price
        current_price = await dex.get_market_price(symbol)
        
        # Fetch K-line data for each timeframe
        analysis_data = {}
        
        for timeframe in timeframes:
            try:
                klines = await dex.get_klines(symbol, interval=timeframe, limit=100)
                
                if klines and len(klines) >= 50:
                    analysis = self.ta_toolkit.analyze_klines(klines, interval=timeframe)
                    analysis_data[timeframe] = analysis
                else:
                    logger.warning(f"Insufficient data for {symbol} {timeframe}")
                    analysis_data[timeframe] = None
            except Exception as e:
                logger.error(f"Failed to fetch {timeframe} data for {symbol}: {e}")
                analysis_data[timeframe] = None
        
        return {
            "symbol": symbol,
            "current_price": current_price,
            "analysis": analysis_data
        }
    
    def format_analysis_prompt(
        self, 
        token_data: Dict, 
        language: str = "en"
    ) -> str:
        """
        Format token data into a prompt for AI analysis.
        
        Args:
            token_data: Token data dictionary from fetch_token_data
            language: Language for formatting ("en" or "zh")
            
        Returns:
            Formatted prompt string
        """
        symbol = token_data["symbol"]
        current_price = token_data["current_price"]
        analysis = token_data["analysis"]
        
        lines = []
        
        if language == "zh":
            lines.append(f"## {symbol} 市场数据分析")
            lines.append(f"\n当前价格: ${current_price:.4f}")
            
            # Add analysis for each timeframe
            for timeframe, data in analysis.items():
                if data is None:
                    continue
                
                lines.append(f"\n### {timeframe} 时间框架")
                lines.append(self.ta_toolkit.format_market_data(
                    symbol, data, language="zh"
                ))
        else:
            lines.append(f"## {symbol} Market Data Analysis")
            lines.append(f"\nCurrent Price: ${current_price:.4f}")
            
            # Add analysis for each timeframe
            for timeframe, data in analysis.items():
                if data is None:
                    continue
                
                lines.append(f"\n### {timeframe} Timeframe")
                lines.append(self.ta_toolkit.format_market_data(
                    symbol, data, language="en"
                ))
        
        return "\n".join(lines)
```

#### Step 1.2: Update ChatService

Modify `backend/src/roma_trading/core/chat_service.py`:

```python
# Add import
from roma_trading.core.token_analysis_handler import TokenAnalysisHandler

class ChatService:
    def __init__(self, agent_manager: AgentManager):
        self.agent_manager = agent_manager
        self.token_handler = TokenAnalysisHandler(agent_manager)  # Add this
    
    async def chat(self, message: str, language: str = "en") -> str:
        """
        Process a chat message and return AI response.
        
        Args:
            message: User's message
            language: Language preference ("en" or "zh")
            
        Returns:
            AI assistant's response
        """
        try:
            # Check if this is a token analysis request
            if self.token_handler.detect_analysis_request(message):
                token_symbol = self.token_handler.extract_token_symbol(message)
                
                if token_symbol:
                    # Perform token analysis
                    return await self._handle_token_analysis(
                        message, token_symbol, language
                    )
            
            # Default to general chat
            return await asyncio.to_thread(
                self._chat_sync, message, language
            )
        except Exception as e:
            logger.error(f"Error in chat service: {e}", exc_info=True)
            raise
    
    async def _handle_token_analysis(
        self, 
        message: str, 
        symbol: str, 
        language: str
    ) -> str:
        """Handle token analysis request."""
        try:
            # Fetch token data
            token_data = await self.token_handler.fetch_token_data(symbol)
            
            # Format analysis prompt
            analysis_prompt = self.token_handler.format_analysis_prompt(
                token_data, language
            )
            
            # Generate AI response with analysis
            return await asyncio.to_thread(
                self._chat_sync_with_context,
                message,
                analysis_prompt,
                language
            )
        except Exception as e:
            logger.error(f"Token analysis failed: {e}", exc_info=True)
            # Fallback to general chat
            return await asyncio.to_thread(
                self._chat_sync, 
                f"I encountered an error analyzing {symbol}. {message}",
                language
            )
    
    def _chat_sync_with_context(
        self, 
        message: str, 
        context: str, 
        language: str
    ) -> str:
        """Run chat with additional context."""
        lm = self._get_llm()
        
        # Load enhanced system prompt for token analysis
        system_prompt = render_prompt("chat_token_analysis", language=language)
        
        # Combine context with user message
        full_message = f"{context}\n\nUser Question: {message}"
        
        with dspy.context(lm=lm):
            chat_module = dspy.ChainOfThought(ChatResponse)
            result = chat_module(
                system_context=system_prompt,
                user_message=full_message
            )
        
        return result.response.strip()
```

### Phase 2: Enhanced System Prompts

#### Step 2.1: Create Token Analysis Prompt

Create `backend/prompts/chat_token_analysis_en.md`:

```markdown
You are an expert cryptocurrency trading analyst for the ROMA-01 platform.

When analyzing token data, you will receive:
- Current market price
- Technical indicators (RSI, MACD, EMA, ATR)
- Volume analysis
- Multi-timeframe data (3m, 1h, 4h)

Your task is to:
1. Analyze the technical indicators and market conditions
2. Identify trends and patterns
3. Provide a clear trading recommendation (BUY/LONG, SELL/SHORT, HOLD, or WAIT)
4. Include specific entry price, stop loss, and take profit levels
5. Assess risk level (High/Medium/Low)
6. Explain your reasoning clearly

Guidelines:
- RSI above 70 suggests overbought, below 30 suggests oversold
- MACD histogram crossing above zero suggests bullish momentum
- Price above EMA20/EMA50 suggests uptrend
- High volume confirms trend strength
- Consider multiple timeframes for confirmation
- Always include risk warnings
- Be conservative with recommendations

Format your response clearly with:
- Market Summary
- Technical Analysis
- Trading Recommendation
- Risk Assessment
- Entry/Exit Levels
```

Create `backend/prompts/chat_token_analysis_zh.md`:

```markdown
你是 ROMA-01 平台的加密货币交易分析专家。

分析代币数据时，你将收到：
- 当前市场价格
- 技术指标（RSI、MACD、EMA、ATR）
- 成交量分析
- 多时间框架数据（3分钟、1小时、4小时）

你的任务是：
1. 分析技术指标和市场状况
2. 识别趋势和模式
3. 提供清晰的交易建议（买入/做多、卖出/做空、持有或等待）
4. 包含具体的入场价、止损价和止盈价
5. 评估风险水平（高/中/低）
6. 清楚地解释你的推理

指导原则：
- RSI 超过 70 表示超买，低于 30 表示超卖
- MACD 柱状图穿越零轴上方表示看涨动量
- 价格高于 EMA20/EMA50 表示上升趋势
- 高成交量确认趋势强度
- 考虑多个时间框架以确认
- 始终包含风险警告
- 建议要保守

清晰格式化你的回复，包括：
- 市场摘要
- 技术分析
- 交易建议
- 风险评估
- 入场/出场价位
```

### Phase 3: API Updates

#### Step 3.1: Update Chat API Endpoint

Modify `backend/src/roma_trading/api/main.py`:

```python
@app.post("/api/chat")
async def chat_with_ai(
    chat_request: ChatMessage,
    language: Optional[str] = Query("en", description="Language preference")
):
    """
    Chat with AI assistant about trading strategies, prompts, and platform features.
    Now supports token analysis requests.
    
    Args:
        chat_request: Chat message from user
        language: Language preference ("en" or "zh")
    
    Returns:
        AI assistant's response
    """
    try:
        chat_service = get_chat_service()
        response = await chat_service.chat(chat_request.message, language)
        
        return {
            "status": "success",
            "message": response
        }
    
    except RuntimeError as e:
        logger.error(f"Chat service error: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to process chat message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process chat message")
```

### Phase 4: Frontend Updates (Optional)

#### Step 4.1: Update Chat Component

The frontend chat component (`frontend/src/components/RightSideTabs.tsx`) should already work with the enhanced API. However, you may want to add:

1. Token symbol highlighting in messages
2. Formatting for analysis responses
3. Quick action buttons for common tokens

## Testing Strategy

### Unit Tests

Create `backend/tests/test_token_analysis_handler.py`:

```python
import pytest
from roma_trading.core.token_analysis_handler import TokenAnalysisHandler

def test_detect_analysis_request():
    handler = TokenAnalysisHandler(mock_agent_manager)
    
    assert handler.detect_analysis_request("analyze BTC") == True
    assert handler.detect_analysis_request("what about ETH?") == True
    assert handler.detect_analysis_request("hello") == False

def test_extract_token_symbol():
    handler = TokenAnalysisHandler(mock_agent_manager)
    
    assert handler.extract_token_symbol("analyze BTC") == "BTCUSDT"
    assert handler.extract_token_symbol("what about Bitcoin?") == "BTCUSDT"
    assert handler.extract_token_symbol("ETHUSDT analysis") == "ETHUSDT"
    assert handler.extract_token_symbol("hello") == None
```

### Integration Tests

Test the full flow:
1. Send chat message requesting token analysis
2. Verify token data is fetched
3. Verify AI response includes analysis and recommendation

### Manual Testing Checklist

- [ ] "Analyze BTC" returns comprehensive analysis
- [ ] "What should I do with ETH?" returns trading recommendation
- [ ] "BTCUSDT" is correctly recognized
- [ ] Invalid token symbols are handled gracefully
- [ ] Error messages are user-friendly
- [ ] Works in both English and Chinese
- [ ] Response time is under 5 seconds
- [ ] Existing chat functionality still works

## Error Handling

### Common Errors and Solutions

1. **No agents available**
   - Error: "No agents available for data access"
   - Solution: Check agent configuration, ensure at least one agent is configured

2. **Invalid token symbol**
   - Error: Token not found in mapping
   - Solution: Return helpful message suggesting supported tokens

3. **Data fetch failure**
   - Error: Network or API error
   - Solution: Fallback to general chat, log error

4. **Insufficient data**
   - Error: Not enough K-line data
   - Solution: Use available data, warn user if data is limited

## Performance Optimization

1. **Caching**: Cache token data for 30 seconds to avoid repeated API calls
2. **Async operations**: Use async/await for all I/O operations
3. **Timeout handling**: Set timeouts for API calls (5 seconds)
4. **Connection pooling**: Reuse DEX connections when possible

## Security Considerations

1. **Input validation**: Validate and sanitize token symbols
2. **Rate limiting**: Implement rate limiting for analysis requests
3. **Error messages**: Don't expose internal errors to users
4. **API keys**: Ensure DEX API keys are properly secured

## Future Enhancements

1. **Historical analysis**: Compare current data with historical patterns
2. **Multi-token comparison**: Analyze multiple tokens simultaneously
3. **Custom indicators**: Allow users to specify custom technical indicators
4. **Backtesting**: Provide backtesting results for recommendations
5. **Position integration**: Consider user's existing positions in recommendations

## Deployment Checklist

- [ ] Code reviewed and tested
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Prompts reviewed for accuracy
- [ ] Error handling tested
- [ ] Performance tested
- [ ] Security review completed
- [ ] Frontend compatibility verified
- [ ] Rollback plan prepared

## Rollback Plan

If issues occur after deployment:

1. Revert `chat_service.py` changes
2. Remove `token_analysis_handler.py`
3. Revert API endpoint changes
4. Restart backend service

## Monitoring

Monitor the following metrics:

1. **Response time**: Average time for token analysis requests
2. **Error rate**: Percentage of failed analysis requests
3. **Usage**: Number of token analysis requests per day
4. **Token popularity**: Most analyzed tokens

## Related Files

- `backend/src/roma_trading/core/chat_service.py` - Main chat service
- `backend/src/roma_trading/core/token_analysis_handler.py` - Token analysis handler (new)
- `backend/src/roma_trading/toolkits/technical_analysis.py` - Technical analysis toolkit
- `backend/prompts/chat_token_analysis_en.md` - English prompt (new)
- `backend/prompts/chat_token_analysis_zh.md` - Chinese prompt (new)
- `backend/src/roma_trading/api/main.py` - API endpoints

---

**Document Version**: 1.0  
**Last Updated**: 2025-11-19  
**Status**: Draft

