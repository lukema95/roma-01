"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { getCoinIcon } from "@/lib/utils/coinIcons";
import { useLanguage } from "@/store/useLanguage";
import { getTranslation } from "@/lib/i18n";

function formatTime(timestamp: string) {
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

export default function AgentDecisionsHistory({ agentId }: { agentId: string }) {
  const language = useLanguage((s) => s.language);
  const t = getTranslation(language).agent;
  
  const { data: decisionsData, isLoading } = useSWR(
    `/agent/${agentId}/decisions`,
    () => api.getDecisions(agentId, 10),
    { refreshInterval: 10000 }
  );

  // Sort by cycle_number (higher number = more recent)
  const decisions = useMemo(() => {
    if (!decisionsData) return [];
    return [...decisionsData].sort((a, b) => {
      const cycleA = a.cycle_number || 0;
      const cycleB = b.cycle_number || 0;
      return cycleB - cycleA;
    });
  }, [decisionsData]);

  return (
    <div>
      <div
        className="mb-2 text-sm font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {t.recentDecisions}
      </div>

      {isLoading ? (
        <div className="text-xs" style={{ color: "var(--muted-text)" }}>
          Loading decisions...
        </div>
      ) : !decisions || decisions.length === 0 ? (
        <div className="text-xs" style={{ color: "var(--muted-text)" }}>
          {t.noDecisions}
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision: any, idx: number) => (
            <div
              key={idx}
              className="rounded border p-3"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                borderColor: "var(--chip-border)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      background: "var(--chip-bg)",
                      color: "var(--brand-accent)",
                    }}
                  >
                    CYCLE #{decision.cycle_number}
                  </span>
                  <span
                    className="text-xs tabular-nums"
                    style={{ color: "var(--muted-text)" }}
                  >
                    {formatTime(decision.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {decision.account_state && (
                    <>
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted-text)" }}
                      >
                        Balance:
                      </span>
                      <span
                        className="text-xs font-bold tabular-nums"
                        style={{ color: "var(--foreground)" }}
                      >
                        ${decision.account_state.total_wallet_balance.toFixed(2)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Chain of Thought */}
              {decision.chain_of_thought && (
                <div className="mb-2">
                  <div
                    className="text-xs mb-1 font-semibold"
                    style={{ color: "var(--muted-text)" }}
                  >
                    CHAIN OF THOUGHT:
                  </div>
                  <div
                    className="text-xs leading-relaxed whitespace-pre-wrap terminal-text"
                    style={{
                      color: "var(--foreground)",
                      maxHeight: "300px",
                      overflowY: "auto",
                      wordBreak: "break-word",
                    }}
                  >
                    {decision.chain_of_thought}
                  </div>
                </div>
              )}

              {/* Decisions */}
              {decision.decisions && decision.decisions.length > 0 && (
                <div>
                  <div
                    className="text-xs mb-1 font-semibold"
                    style={{ color: "var(--muted-text)" }}
                  >
                    ACTIONS:
                  </div>
                  <div className="space-y-1">
                    {decision.decisions.map((dec: any, decIdx: number) => (
                      <div
                        key={decIdx}
                        className="text-xs flex items-start gap-2"
                      >
                        <span
                          className="px-2 py-0.5 rounded font-bold uppercase text-[10px]"
                          style={{
                            background:
                              dec.action === "open_long"
                                ? "rgba(34, 197, 94, 0.15)"
                                : dec.action === "open_short"
                                ? "rgba(239, 68, 68, 0.15)"
                                : dec.action === "close_position"
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(100, 116, 139, 0.15)",
                            color:
                              dec.action === "open_long"
                                ? "#22c55e"
                                : dec.action === "open_short"
                                ? "#ef4444"
                                : dec.action === "close_position"
                                ? "#f59e0b"
                                : "var(--muted-text)",
                          }}
                        >
                          {dec.action.replace("_", " ")}
                        </span>
                        {dec.symbol && (
                          <span
                            className="font-bold"
                            style={{ color: "var(--foreground)" }}
                          >
                            {dec.symbol}
                          </span>
                        )}
                        {dec.leverage && (
                          <span style={{ color: "var(--muted-text)" }}>
                            {dec.leverage}x
                          </span>
                        )}
                        {dec.position_size_usd && (
                          <span style={{ color: "var(--muted-text)" }}>
                            ${dec.position_size_usd.toFixed(0)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Reasoning */}
                  {decision.decisions[0]?.reasoning && (
                    <div
                      className="text-xs mt-2 leading-relaxed"
                      style={{ color: "var(--muted-text)" }}
                    >
                      <span className="font-semibold">{t.reasoning}</span>{" "}
                      {decision.decisions[0].reasoning}
                    </div>
                  )}
                </div>
              )}

              {/* Positions summary */}
              {decision.positions && decision.positions.length > 0 && (
                <div className="mt-2 pt-2 border-t" style={{ borderColor: "var(--panel-border)" }}>
                  <div
                    className="text-xs mb-1"
                    style={{ color: "var(--muted-text)" }}
                  >
                    {decision.positions.length} Active Position
                    {decision.positions.length > 1 ? "s" : ""}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {decision.positions.map((pos: any, posIdx: number) => (
                      <span
                        key={posIdx}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{
                          background: pos.side === "long" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                          color: pos.side === "long" ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {pos.symbol} {pos.side.toUpperCase()} {pos.leverage}x
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

