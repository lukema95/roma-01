"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { fmtUSD } from "@/lib/utils/formatters";
import { getCoinIcon } from "@/lib/utils/coinIcons";
import { useLanguage } from "@/store/useLanguage";
import { getTranslation } from "@/lib/i18n";

function fmtTime(timestamp?: string | number) {
  if (!timestamp) return "—";
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function AgentPositionsTable({ agentId }: { agentId: string }) {
  const language = useLanguage((s) => s.language);
  const t = getTranslation(language).agent;
  
  const { data: positions, isLoading } = useSWR(
    `/agent/${agentId}/positions`,
    () => api.getPositions(agentId),
    { refreshInterval: 5000 }
  );

  const totalUnreal = positions?.reduce(
    (acc, p) => acc + (p.unrealized_profit || 0),
    0
  ) || 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {t.activePositions}
        </div>
        <div className="text-xs" style={{ color: "var(--muted-text)" }}>
          {t.totalUnrealizedPnl}
          <span
            className="ml-1 font-bold"
            style={{ color: totalUnreal >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {fmtUSD(totalUnreal)}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px] terminal-text">
          <thead
            style={{
              background: "var(--panel-bg)",
              color: "var(--muted-text)",
            }}
          >
            <tr
              className="border-b"
              style={{ borderColor: "var(--panel-border)" }}
            >
              <th className="py-1.5 pr-3">Entry Time</th>
              <th className="py-1.5 pr-3">Symbol</th>
              <th className="py-1.5 pr-3">Entry Price</th>
              <th className="py-1.5 pr-3">Side</th>
              <th className="py-1.5 pr-3">Quantity</th>
              <th className="py-1.5 pr-3">Leverage</th>
              <th className="py-1.5 pr-3">Liquidation Price</th>
              <th className="py-1.5 pr-3">Margin</th>
              <th className="py-1.5 pr-3">Notional</th>
              <th className="py-1.5 pr-3">Unrealized P&L</th>
              <th className="py-1.5 pr-3">Exit Plan</th>
            </tr>
          </thead>
          <tbody style={{ color: "var(--foreground)" }}>
            {isLoading ? (
              <tr>
                <td
                  className="p-3 text-xs"
                  colSpan={11}
                  style={{ color: "var(--muted-text)" }}
                >
                  Loading positions...
                </td>
              </tr>
            ) : !positions || positions.length === 0 ? (
              <tr>
                <td
                  className="p-3 text-xs"
                  colSpan={11}
                  style={{ color: "var(--muted-text)" }}
                >
                  No active positions
                </td>
              </tr>
            ) : (
              positions.map((p, i) => {
                const isLong = p.side === "long";
                const notional = Math.abs(p.position_amt) * p.mark_price;
                const margin = (Math.abs(p.position_amt) * p.entry_price) / p.leverage;

                return (
                  <tr
                    key={i}
                    className="border-b"
                    style={{
                      borderColor:
                        "color-mix(in oklab, var(--panel-border) 50%, transparent)",
                    }}
                  >
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtTime(Date.now())}
                    </td>
                    <td className="py-1.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        {getCoinIcon(p.symbol) && (
                          <img
                            src={getCoinIcon(p.symbol)}
                            alt={p.symbol}
                            className="w-4 h-4"
                          />
                        )}
                        <span className="font-bold">{p.symbol.toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtUSD(p.entry_price)}
                    </td>
                    <td
                      className="py-1.5 pr-3"
                      style={{ color: isLong ? "#16a34a" : "#ef4444" }}
                    >
                      {isLong ? "LONG" : "SHORT"}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {Math.abs(p.position_amt).toFixed(2)}
                    </td>
                    <td className="py-1.5 pr-3">{p.leverage}X</td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtUSD(p.liquidation_price)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtUSD(margin)}
                    </td>
                    <td className="py-1.5 pr-3 tabular-nums">
                      {fmtUSD(notional)}
                    </td>
                    <td
                      className="py-1.5 pr-3 tabular-nums"
                      style={{
                        color:
                          p.unrealized_profit >= 0 ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {fmtUSD(p.unrealized_profit)}
                    </td>
                    <td className="py-1.5 pr-3">
                      <span style={{ color: "var(--muted-text)" }}>—</span>
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

