"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/utils/formatters";
import { getCoinIcon } from "@/lib/utils/coinIcons";
import { useLanguage } from "@/store/useLanguage";
import { getTranslation } from "@/lib/i18n";

function holdTime(openTime?: string, closeTime?: string) {
  if (!openTime || !closeTime) return "—";
  const a = new Date(openTime).getTime();
  const b = new Date(closeTime).getTime();
  const ms = Math.max(0, b - a);
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}H ${mm}M`;
}

function fmtPrice(n?: number) {
  if (n == null || Number.isNaN(n)) return "--";
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 1 : abs >= 100 ? 2 : abs >= 1 ? 4 : 5;
  return `$${n.toFixed(digits)}`;
}

export default function AgentTradesTable({ agentId }: { agentId: string }) {
  const language = useLanguage((s) => s.language);
  const t = getTranslation(language).agent;
  
  const { data: trades, isLoading } = useSWR(
    `/agent/${agentId}/trades`,
    () => api.getTrades(agentId),
    { refreshInterval: 10000 }
  );

  // Sort by close time (most recent first) and limit to 25
  const sortedTrades = (trades || [])
    .sort((a, b) => {
      const timeA = new Date(a.close_time).getTime();
      const timeB = new Date(b.close_time).getTime();
      return timeB - timeA;
    })
    .slice(0, 25);

  return (
    <div>
      <div
        className="mb-2 text-sm font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {t.last25Trades}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px] terminal-text">
          <thead
            style={{
              color: "var(--muted-text)",
              background: "var(--panel-bg)",
            }}
          >
            <tr
              className="border-b"
              style={{ borderColor: "var(--panel-border)" }}
            >
              <th className="py-1.5 pr-3">SIDE</th>
              <th className="py-1.5 pr-3">COIN</th>
              <th className="py-1.5 pr-3">ENTRY PRICE</th>
              <th className="py-1.5 pr-3">EXIT PRICE</th>
              <th className="py-1.5 pr-3">QUANTITY</th>
              <th className="py-1.5 pr-3">HOLDING TIME</th>
              <th className="py-1.5 pr-3">NOTIONAL ENTRY</th>
              <th className="py-1.5 pr-3">NOTIONAL EXIT</th>
              <th className="py-1.5 pr-3">TOTAL FEES</th>
              <th className="py-1.5 pr-3">NET P&L</th>
            </tr>
          </thead>
          <tbody style={{ color: "var(--foreground)" }}>
            {isLoading ? (
              <tr>
                <td
                  className="p-3 text-xs"
                  colSpan={10}
                  style={{ color: "var(--muted-text)" }}
                >
                  Loading trades...
                </td>
              </tr>
            ) : sortedTrades.length === 0 ? (
              <tr>
                <td
                  className="p-3 text-xs"
                  colSpan={10}
                  style={{ color: "var(--muted-text)" }}
                >
                  {t.noTrades}
                </td>
              </tr>
            ) : (
              sortedTrades.map((t, i) => {
                const qty = Math.abs(t.quantity || 0);
                const notionalIn = t.entry_price * qty;
                const notionalOut = t.close_price * qty;
                const isProfit = t.pnl_usdt >= 0;

                return (
                  <tr
                    key={i}
                    className="border-b"
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--panel-border) 50%, transparent)",
                    }}
                  >
                    <td
                      className="py-1.5 pr-3"
                      style={{
                        color: t.side === "long" ? "#16a34a" : "#ef4444",
                      }}
                    >
                      {t.side?.toUpperCase()}
                    </td>
                    <td className="py-1.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        {getCoinIcon(t.symbol) && (
                          <img
                            src={getCoinIcon(t.symbol)}
                            alt={t.symbol}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="font-bold">{t.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtPrice(t.entry_price)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtPrice(t.close_price)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {qty.toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-3">
                      {holdTime(t.open_time, t.close_time)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtUSD(notionalIn)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtUSD(notionalOut)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      $0.00
                    </td>
                    <td
                      className="py-1.5 pr-3 tabular-nums"
                      style={{ color: isProfit ? "#22c55e" : "#ef4444" }}
                    >
                      {fmtUSD(t.pnl_usdt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

