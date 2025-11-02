"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/utils/formatters";
import { getCoinIcon } from "@/lib/utils/coinIcons";

const ORDER = ["BTC", "ETH", "SOL", "BNB", "DOGE", "XRP"] as const;

interface PriceData {
  symbol: string;
  price: number;
}

export function PriceTicker() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [loop, setLoop] = useState(false);

  // Fetch real prices from backend
  const { data: pricesData, error: pricesError } = useSWR(
    "/api/market/prices", 
    () => api.getMarketPrices(), // Use arrow function to avoid SWR passing key as argument
    {
      refreshInterval: 5000, // Update every 5 seconds
      fallbackData: []
    }
  );

  // Convert API data to PriceData format
  const prices = useMemo<PriceData[]>(() => {
    if (!pricesData || pricesData.length === 0) {
      // Fallback mock data while loading
      return [
        { symbol: "BTC", price: 0 },
        { symbol: "ETH", price: 0 },
        { symbol: "SOL", price: 0 },
        { symbol: "BNB", price: 0 },
        { symbol: "DOGE", price: 0 },
        { symbol: "XRP", price: 0 },
      ];
    }
    return pricesData.map(p => ({ symbol: p.symbol, price: p.price }));
  }, [pricesData]);

  const list = useMemo(() => {
    return ORDER.map((s) => prices.find((p) => p.symbol === s)).filter(Boolean) as PriceData[];
  }, [prices]);

  // Check if ticker needs to loop
  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    
    const check = () => {
      const need = track.scrollWidth > wrap.clientWidth + 8;
      setLoop(need);
    };
    
    check();
    const ro = new ResizeObserver(check);
    ro.observe(wrap);
    ro.observe(track);
    
    return () => ro.disconnect();
  }, [list]);

  return (
    <div
      className="w-full border-b h-[var(--ticker-h)]"
      style={{
        borderColor: "var(--panel-border)",
        background: "var(--panel-bg)",
      }}
    >
      <div ref={wrapRef} className="h-full overflow-hidden px-3">
        {loop ? (
          <div className="relative h-full">
            <div
              ref={trackRef}
              className="ticker-track absolute left-0 top-0 flex h-full items-center gap-6 whitespace-nowrap text-xs leading-relaxed"
              style={{ color: "var(--foreground)", animation: "ticker-scroll 22s linear infinite" }}
            >
              {renderItems(list)}
              {renderItems(list)}
            </div>
          </div>
        ) : (
          <div
            ref={trackRef}
            className="terminal-text flex h-full items-center gap-6 whitespace-nowrap text-xs leading-relaxed"
            style={{ color: "var(--foreground)", overflowX: "auto" }}
          >
            {renderItems(list)}
          </div>
        )}
      </div>
    </div>
  );
}

function renderItems(list: PriceData[]) {
  return list.map((p, i) => {
    const coinIcon = getCoinIcon(p.symbol);
    return (
      <span
        key={`${p.symbol}-${i}`}
        className="inline-flex items-center gap-1.5 tabular-nums"
        style={{ color: "var(--muted-text)" }}
      >
        {coinIcon && (
          <img
            src={coinIcon}
            alt={p.symbol}
            className="w-4 h-4"
          />
        )}
        <b className="mr-1" style={{ color: "var(--foreground)" }}>
          {p.symbol}
        </b>
        <span>{fmtUSD(p.price)}</span>
      </span>
    );
  });
}

// Add ticker-scroll animation to global CSS if not already present
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes ticker-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  if (!document.head.querySelector('[data-ticker-style]')) {
    style.setAttribute('data-ticker-style', 'true');
    document.head.appendChild(style);
  }
}

export default PriceTicker;

