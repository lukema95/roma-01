"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { fmtUSD, fmtPercent } from "@/lib/utils/formatters";

export default function AgentStatsSummary({ agentId }: { agentId: string }) {
  // Fetch account data
  const { data: account } = useSWR(`/agent/${agentId}/account`, () =>
    api.getAccount(agentId), { refreshInterval: 5000 }
  );

  // Fetch positions for calculating margin
  const { data: positions } = useSWR(`/agent/${agentId}/positions`, () =>
    api.getPositions(agentId), { refreshInterval: 5000 }
  );

  // Fetch performance metrics
  const { data: performance } = useSWR(`/agent/${agentId}/performance`, () =>
    api.getPerformance(agentId), { refreshInterval: 10000 }
  );

  // Fetch trades for statistics
  const { data: trades } = useSWR(`/agent/${agentId}/trades`, () =>
    api.getTrades(agentId), { refreshInterval: 10000 }
  );

  // Calculate available cash (estimate)
  const availableCash = useMemo(() => {
    if (!account || !positions) return undefined;
    const sumMargin = positions.reduce((acc, p) => {
      const margin = (Math.abs(p.position_amt) * p.entry_price) / p.leverage;
      return acc + margin;
    }, 0);
    return account.total_wallet_balance - sumMargin;
  }, [account, positions]);

  // Calculate average leverage from trades
  const avgLeverage = useMemo(() => {
    if (!trades || trades.length === 0) return undefined;
    const sum = trades.reduce((acc, t) => acc + (t.leverage || 0), 0);
    return sum / trades.length;
  }, [trades]);

  // Calculate average confidence (placeholder - would need to come from decisions)
  const avgConfidence = useMemo(() => {
    // TODO: Calculate from decision history when available
    return 69.2; // Mock value matching the image
  }, []);

  // HOLD TIMES calculation (simple version based on trades)
  const holdTimes = useMemo(() => {
    if (!trades || trades.length === 0) {
      return { longPct: 0, shortPct: 0, flatPct: 100 };
    }

    const longTrades = trades.filter(t => t.side === "long");
    const shortTrades = trades.filter(t => t.side === "short");
    
    const total = trades.length;
    const longPct = (longTrades.length / total) * 100;
    const shortPct = (shortTrades.length / total) * 100;
    const flatPct = 100 - longPct - shortPct;

    return { longPct, shortPct, flatPct };
  }, [trades]);

  // Total fees
  const totalFees = performance?.total_pnl ? 
    (performance.total_pnl - (account?.total_unrealized_profit || 0)) : 
    undefined;

  if (!account) {
    return (
      <div 
        className="rounded-md border p-4"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
        }}
      >
        <div className="text-xs" style={{ color: "var(--muted-text)" }}>
          Loading statistics...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Part 1: Account Summary */}
      <div
        className="rounded-md border p-4 relative"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
        }}
      >
        {/* Right corner note */}
        <div
          className="absolute right-3 top-2 text-[11px] whitespace-nowrap"
          style={{ color: "var(--muted-text)" }}
        >
          Does not include funding costs and rebates
        </div>

        <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat
            label="Total Account Value"
            value={fmtUSD(account.total_wallet_balance)}
          />
          <Stat
            label="Total P&L"
            value={fmtUSD(performance?.total_pnl)}
            tone="pnl"
            num={performance?.total_pnl}
          />
          <Stat
            label="Net Realized"
            value={fmtUSD(performance?.total_pnl)}
            tone="pnl"
            num={performance?.total_pnl}
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Stat
            label="Available Cash"
            value={fmtUSD(availableCash)}
          />
          <div></div>
          <Stat
            label="Total Fees"
            value={fmtUSD(totalFees)}
          />
        </div>
      </div>

      {/* Part 2: Trading Stats + Hold Times */}
      <div
        className="rounded-md border p-4"
        style={{
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
        }}
      >
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <Stat
            label="Average Leverage"
            value={avgLeverage != null ? avgLeverage.toFixed(1) : "—"}
          />
          <Stat
            label="Average Confidence"
            value={`${avgConfidence.toFixed(1)}%`}
          />
          <Stat
            label="Biggest Win"
            value={fmtUSD(performance?.best_trade?.pnl)}
            tone="pnl"
            num={performance?.best_trade?.pnl}
          />
          <Stat
            label="Biggest Loss"
            value={fmtUSD(performance?.worst_trade?.pnl)}
            tone="pnl"
            num={performance?.worst_trade?.pnl}
          />
        </div>

        {/* HOLD TIMES */}
        <div className="mt-3">
          <div
            className="text-xs mb-1"
            style={{ color: "var(--muted-text)" }}
          >
            HOLD TIMES
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-4">
            <div>
              Long:
              <span 
                className="ml-2 tabular-nums font-semibold"
                style={{ color: "#22c55e" }}
              >
                {holdTimes.longPct.toFixed(1)}%
              </span>
            </div>
            <div>
              Short:
              <span 
                className="ml-2 tabular-nums font-semibold"
                style={{ color: "#ef4444" }}
              >
                {holdTimes.shortPct.toFixed(1)}%
              </span>
            </div>
            <div>
              Flat:
              <span 
                className="ml-2 tabular-nums font-semibold"
                style={{ color: "var(--muted-text)" }}
              >
                {holdTimes.flatPct.toFixed(1)}%
              </span>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  num,
}: {
  label: string;
  value?: string;
  tone?: "pnl";
  num?: number | null | undefined;
}) {
  return (
    <div className="flex flex-col">
      <div className="text-xs" style={{ color: "var(--muted-text)" }}>
        {label}
      </div>
      <div
        className="tabular-nums text-base font-semibold"
        style={{
          color:
            tone === "pnl"
              ? num == null || Number.isNaN(num)
                ? "var(--muted-text)"
                : num > 0
                  ? "#22c55e"
                  : num < 0
                    ? "#ef4444"
                    : "var(--muted-text)"
              : "var(--foreground)",
        }}
      >
        {value ?? "—"}
      </div>
    </div>
  );
}

