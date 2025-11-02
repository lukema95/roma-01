/**
 * TypeScript type definitions for ROMA-01 Trading Platform
 */

export interface Agent {
  id: string;
  name: string;
  is_running: boolean;
  cycle_count: number;
  runtime_minutes: number;
}

export interface AgentStatus {
  agent_id: string;
  name: string;
  is_running: boolean;
  cycle_count: number;
  runtime_minutes: number;
}

export interface Account {
  total_wallet_balance: number;
  available_balance: number;
  total_unrealized_profit: number;
}

export interface Position {
  symbol: string;
  side: "long" | "short";
  position_amt: number;
  entry_price: number;
  mark_price: number;
  unrealized_profit: number;
  leverage: number;
  liquidation_price: number;
}

export interface Performance {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  avg_profit: number;
  avg_loss: number;
  profit_factor: number;
  sharpe_ratio: number;
  max_drawdown: number;
  total_pnl: number;
  best_trade?: {
    symbol: string;
    pnl: number;
  };
  worst_trade?: {
    symbol: string;
    pnl: number;
  };
}

export interface Decision {
  timestamp: string;
  cycle_number: number;
  chain_of_thought: string;
  decisions: Array<{
    action: string;
    symbol?: string;
    leverage?: number;
    position_size_usd?: number;
    stop_loss?: number;
    take_profit?: number;
    reasoning: string;
  }>;
  account_state: Account;
  positions: Position[];
}

export interface EquityPoint {
  timestamp: string;
  cycle: number;
  equity: number;
  pnl: number;
}

export interface Trade {
  symbol: string;
  side: "long" | "short";
  entry_price: number;
  close_price: number;
  quantity: number;
  leverage: number;
  open_time: string;
  close_time: string;
  pnl_pct: number;
  pnl_usdt: number;
  commission?: number;
}

