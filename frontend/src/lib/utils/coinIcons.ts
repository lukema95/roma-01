/**
 * Utility functions for coin icons
 */

// Map of coin symbols to icon paths
const coinIconMap: Record<string, string> = {
  BTC: "/coins/btc.svg",
  BTCUSDT: "/coins/btc.svg",
  ETH: "/coins/eth.svg",
  ETHUSDT: "/coins/eth.svg",
  SOL: "/coins/sol.svg",
  SOLUSDT: "/coins/sol.svg",
  BNB: "/coins/bnb.svg",
  BNBUSDT: "/coins/bnb.svg",
  DOGE: "/coins/doge.svg",
  DOGEUSDT: "/coins/doge.svg",
  XRP: "/coins/xrp.svg",
  XRPUSDT: "/coins/xrp.svg",
};

/**
 * Get the icon path for a coin symbol
 * @param symbol - The trading pair symbol (e.g., "BTCUSDT" or "BTC")
 * @returns The path to the icon, or undefined if not found
 */
export function getCoinIcon(symbol: string): string | undefined {
  // Try exact match first
  if (coinIconMap[symbol]) {
    return coinIconMap[symbol];
  }
  
  // Try removing USDT suffix
  const baseSymbol = symbol.replace("USDT", "");
  return coinIconMap[baseSymbol];
}

/**
 * Get the base coin name from a trading pair
 * @param symbol - The trading pair symbol (e.g., "BTCUSDT")
 * @returns The base coin name (e.g., "BTC")
 */
export function getBaseCoin(symbol: string): string {
  return symbol.replace("USDT", "");
}

