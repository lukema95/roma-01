"""
Analytics calculator for trading performance metrics.

Provides detailed analytics including:
- Trade size statistics (avg, median)
- Holding period statistics (avg, median)
- Leverage statistics (avg, median)
- Confidence statistics (avg, median)
- Position type distribution (% long, % short, % flat)
- Win rate, expectancy
- Biggest win/loss
"""

from typing import List, Dict, Optional
from datetime import datetime
import statistics
from loguru import logger


class TradingAnalytics:
    """Calculate comprehensive trading analytics from trade history."""
    
    @staticmethod
    def calculate_analytics(
        trades: List[Dict],
        decisions: List[Dict] = None,
    ) -> Dict:
        """
        Calculate comprehensive trading analytics.
        
        Args:
            trades: List of completed trades
            decisions: List of decision records (for confidence/leverage if available)
            
        Returns:
            Dictionary with all analytics metrics
        """
        if not trades:
            return TradingAnalytics._empty_analytics()
        
        # Basic trade statistics
        total_trades = len(trades)
        
        # Trade sizes (notional value at entry)
        trade_sizes = [abs(t["quantity"] * t["entry_price"]) for t in trades]
        avg_trade_size = statistics.mean(trade_sizes) if trade_sizes else 0
        median_trade_size = statistics.median(trade_sizes) if trade_sizes else 0
        
        # Holding periods (in minutes)
        holding_periods = []
        for t in trades:
            try:
                open_time = datetime.fromisoformat(t["open_time"])
                close_time = datetime.fromisoformat(t["close_time"])
                duration_mins = (close_time - open_time).total_seconds() / 60
                holding_periods.append(duration_mins)
            except Exception as e:
                logger.warning(f"Failed to parse trade times: {e}")
                continue
        
        avg_hold_mins = statistics.mean(holding_periods) if holding_periods else 0
        median_hold_mins = statistics.median(holding_periods) if holding_periods else 0
        
        # Leverage statistics
        leverages = [t.get("leverage", 10) for t in trades]
        avg_leverage = statistics.mean(leverages) if leverages else 10.0
        median_leverage = statistics.median(leverages) if leverages else 10.0
        
        # Position type distribution
        long_trades = sum(1 for t in trades if t.get("side") == "long")
        short_trades = sum(1 for t in trades if t.get("side") == "short")
        pct_long = (long_trades / total_trades * 100) if total_trades > 0 else 0
        pct_short = (short_trades / total_trades * 100) if total_trades > 0 else 0
        
        # Win rate & expectancy
        winning_trades = [t for t in trades if t.get("pnl_usdt", 0) > 0]
        losing_trades = [t for t in trades if t.get("pnl_usdt", 0) < 0]
        
        win_rate = (len(winning_trades) / total_trades * 100) if total_trades > 0 else 0
        
        avg_win = statistics.mean([t["pnl_usdt"] for t in winning_trades]) if winning_trades else 0
        avg_loss = statistics.mean([t["pnl_usdt"] for t in losing_trades]) if losing_trades else 0
        
        # Expectancy = (Win% × AvgWin) + (Loss% × AvgLoss)
        expectancy = (win_rate / 100 * avg_win) + ((100 - win_rate) / 100 * avg_loss) if total_trades > 0 else 0
        
        # Biggest win/loss
        biggest_win = max([t.get("pnl_usdt", 0) for t in trades]) if trades else 0
        biggest_loss = min([t.get("pnl_usdt", 0) for t in trades]) if trades else 0
        
        # Confidence statistics (if available from decisions)
        avg_confidence = 0.0
        median_confidence = 0.0
        if decisions:
            confidences = []
            for d in decisions:
                for decision in d.get("decisions", []):
                    conf = decision.get("confidence")
                    if conf is not None:
                        confidences.append(conf)
            
            if confidences:
                avg_confidence = statistics.mean(confidences) * 100  # Convert to percentage
                median_confidence = statistics.median(confidences) * 100
        
        return {
            # Trade counts
            "total_trades": total_trades,
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            
            # Trade size
            "avg_trade_size": avg_trade_size,
            "median_trade_size": median_trade_size,
            
            # Holding periods (in minutes, but we'll convert to hours for display)
            "avg_hold_mins": avg_hold_mins,
            "median_hold_mins": median_hold_mins,
            
            # Leverage
            "avg_leverage": avg_leverage,
            "median_leverage": median_leverage,
            
            # Position distribution
            "pct_long": pct_long,
            "pct_short": pct_short,
            "pct_flat": 100 - pct_long - pct_short,  # Time not in position (if tracked)
            
            # Performance
            "win_rate": win_rate,
            "expectancy": expectancy,
            "biggest_win": biggest_win,
            "biggest_loss": biggest_loss,
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            
            # Confidence
            "avg_confidence": avg_confidence,
            "median_confidence": median_confidence,
        }
    
    @staticmethod
    def _empty_analytics() -> Dict:
        """Return empty analytics structure."""
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "avg_trade_size": 0.0,
            "median_trade_size": 0.0,
            "avg_hold_mins": 0.0,
            "median_hold_mins": 0.0,
            "avg_leverage": 10.0,
            "median_leverage": 10.0,
            "pct_long": 0.0,
            "pct_short": 0.0,
            "pct_flat": 100.0,
            "win_rate": 0.0,
            "expectancy": 0.0,
            "biggest_win": 0.0,
            "biggest_loss": 0.0,
            "avg_win": 0.0,
            "avg_loss": 0.0,
            "avg_confidence": 0.0,
            "median_confidence": 0.0,
        }
    
    @staticmethod
    def format_hold_time(minutes: float) -> str:
        """
        Format holding time from minutes to human-readable format.
        
        Args:
            minutes: Duration in minutes
            
        Returns:
            Formatted string like "5h 30m" or "45m"
        """
        hours = int(minutes // 60)
        mins = int(minutes % 60)
        
        if hours > 0:
            return f"{hours}h {mins}m"
        else:
            return f"{mins}m"

