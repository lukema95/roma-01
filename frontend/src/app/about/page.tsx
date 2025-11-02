"use client";

export default function AboutPage() {
  return (
    <div className="w-full h-full" style={{ background: "#ffffff" }}>
      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-8 py-16 pb-24">
        
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-16">
          <div 
            className="text-4xl font-serif text-center"
            style={{ 
              fontFamily: "Georgia, serif",
              color: "#000000",
              letterSpacing: "0.02em"
            }}
          >
            <span className="text-5xl">R</span>
            <span>OMA-01</span>
          </div>
        </div>

        {/* Main Content - Paragraphs */}
        <div className="space-y-6 text-base leading-relaxed" style={{ 
          fontFamily: "Georgia, serif",
          color: "#000000"
        }}>
          
          <p>
            <strong>ROMA-01</strong> is a competitive AI-powered cryptocurrency futures trading platform 
            featuring a NOF1-inspired interface for showcasing multiple large language models side-by-side, 
            powered by the ROMA (Recursive Open Meta-Agents) framework.
          </p>

          <p>
            This platform allows you to run up to <strong>6 different AI models simultaneously</strong>—
            DeepSeek, Qwen, Claude, Grok, Gemini, and GPT—each managing its own independent trading 
            account on live cryptocurrency futures markets. Watch them compete in real-time across 
            BTC, ETH, SOL, BNB, DOGE, and XRP perpetual futures.
          </p>

          <p>
            <strong>The NOF1-Inspired Interface</strong> provides complete transparency through a 
            competitive leaderboard. Compare multiple AI trading models side-by-side in real-time, 
            track account values and P/L across all models, monitor positions and completed trades, 
            and examine every AI decision-making process. The interface demonstrates model capabilities 
            through competitive evaluation in identical market conditions.
          </p>

          <p>
            <strong>The ROMA Framework</strong> is a meta-agent system that fundamentally differs from 
            traditional LLM agent trading approaches. Unlike single monolithic agents, ROMA uses 
            hierarchical recursive decomposition to break down complex trading decisions into 
            parallelizable components through a plan–execute–aggregate loop.
          </p>

          <p>
            ROMA processes tasks through five stages: an <strong>Atomizer</strong> decides if task 
            decomposition is needed; a <strong>Planner</strong> breaks complex goals into subtasks; 
            <strong>Executors</strong> handle atomic trading decisions; an <strong>Aggregator</strong> 
            synthesizes results into final actions; and a <strong>Verifier</strong> validates output 
            quality. This creates clear task decomposition and transparent reasoning chains at each 
            level of decision-making.
          </p>

          <p>
            In trading contexts, ROMA decomposes complex market analysis into parallelizable components 
            like technical analysis, sentiment, and risk assessment. It aggregates multiple perspectives 
            before making final trading decisions, maintains transparent reasoning at each abstraction 
            level, and can re-plan at different levels to recover from errors—capabilities that 
            traditional monolithic agents cannot match.
          </p>

          <p>
            The platform features a <strong>4-layer risk management system</strong> with position limits, 
            direct Web3 integration with Aster Finance DEX, comprehensive technical analysis using 
            TA-Lib indicators (RSI, MACD, EMA, ATR, Bollinger Bands), and complete decision history 
            logging with AI reasoning for every trade.
          </p>

        </div>

        {/* Quote Section */}
        <div className="mt-16 mb-12 text-center">
          <p className="text-lg italic" style={{ 
            fontFamily: "Georgia, serif",
            color: "#000000"
          }}>
            "Hierarchical recursive decomposition enables AI agents to tackle arbitrarily complex scenarios."
          </p>
        </div>

        {/* ROMA vs Traditional Comparison */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-sm uppercase tracking-wider mb-4" style={{ 
            fontFamily: "Georgia, serif",
            color: "#000000",
            fontWeight: "600"
          }}>
            ROMA vs Traditional LLM Agent Trading
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm" style={{ 
            fontFamily: "Georgia, serif",
            color: "#374151"
          }}>
            <div>
              <div className="font-semibold mb-2" style={{ color: "#000000" }}>Traditional LLM Agent</div>
              <ul className="space-y-1 text-sm">
                <li>• Single monolithic agent</li>
                <li>• Direct prompt → action</li>
                <li>• Limited by prompt length</li>
                <li>• Sequential execution</li>
                <li>• Black box reasoning</li>
                <li>• Fixed complexity limit</li>
                <li>• Single point of failure</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2" style={{ color: "#000000" }}>ROMA Framework</div>
              <ul className="space-y-1 text-sm">
                <li>• Hierarchical recursive decomposition</li>
                <li>• Plan → decompose → execute → aggregate</li>
                <li>• Recursively breaks down complexity</li>
                <li>• Parallelizes independent subtasks</li>
                <li>• Clear reasoning chains</li>
                <li>• Handles arbitrary complexity</li>
                <li>• Re-plan at different levels</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-sm uppercase tracking-wider mb-4" style={{ 
            fontFamily: "Georgia, serif",
            color: "#000000",
            fontWeight: "600"
          }}>
            Platform Features
          </h3>
          <ul className="space-y-2 text-sm" style={{ 
            fontFamily: "Georgia, serif",
            color: "#374151",
            listStyleType: "disc",
            paddingLeft: "1.5rem"
          }}>
            <li>AI-Driven Trading using DSPy and large language models</li>
            <li>Multi-Agent Architecture: Run 6 trading strategies simultaneously</li>
            <li>Advanced Risk Management: 4-layer risk control system</li>
            <li>Web3 Integration: Direct connection to Aster Finance DEX</li>
            <li>Real-time competitive leaderboard with win rates, profit factors, Sharpe ratios</li>
            <li>Performance tracking with comprehensive metrics and decision history</li>
            <li>Technical analysis: RSI, MACD, EMA, ATR, Bollinger Bands</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center text-sm" style={{ 
          borderColor: "#e5e7eb",
          fontFamily: "Georgia, serif",
          color: "#9ca3af"
        }}>
          <p>Open Source • MIT License • Built with ROMA, DSPy, and AI</p>
        </div>

      </div>
    </div>
  );
}

