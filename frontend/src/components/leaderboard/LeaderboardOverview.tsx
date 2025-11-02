"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { getModelName, getModelColor, getAllModels } from "@/lib/model/meta";
import { fmtUSD } from "@/lib/utils/formatters";
import { getCoinIcon } from "@/lib/utils/coinIcons";
import LeaderboardTable from "./LeaderboardTable";

export default function LeaderboardOverview() {
  const [tab, setTab] = useState<"overall" | "advanced">("overall");
  
  // Fetch running agents from API
  const { data: runningAgents } = useSWR("/agents", api.getAgents, {
    refreshInterval: 10000,
  });

  // Get all defined models and merge with running agents
  const agents = useMemo(() => {
    const allModels = getAllModels();
    const runningMap = new Map((runningAgents || []).map(a => [a.id, a]));
    
    return allModels.map(model => {
      const runningAgent = runningMap.get(model.id);
      return {
        id: model.id,
        name: model.name,
        is_running: runningAgent?.is_running || false,
        cycle_count: runningAgent?.cycle_count || 0,
        runtime_minutes: runningAgent?.runtime_minutes || 0,
      };
    });
  }, [runningAgents]);

  // Fetch account data for all running agents using a single aggregated endpoint approach
  // We'll create a stable key for all running agents
  const runningAgentIds = useMemo(() => 
    agents.filter(a => a.is_running).map(a => a.id).sort().join(','), 
    [agents]
  );

  // Fetch all accounts data
  const { data: allAccountsData } = useSWR(
    runningAgentIds ? `/agents/accounts/${runningAgentIds}` : null,
    async () => {
      const ids = runningAgentIds.split(',');
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const data = await api.getAccount(id);
            return { agentId: id, data };
          } catch (error) {
            console.error(`Failed to fetch account for ${id}:`, error);
            return { agentId: id, data: null };
          }
        })
      );
      return results;
    },
    { refreshInterval: 10000 }
  );

  // Get winning model (highest equity) and its equity value
  const { winningModel, winningEquity } = useMemo(() => {
    if (!allAccountsData || allAccountsData.length === 0) {
      return { winningModel: null as typeof agents[0] | null, winningEquity: 0 };
    }
    
    let maxEquity = -Infinity;
    let winner: typeof agents[0] | null = null;
    
    allAccountsData.forEach(({ agentId, data }) => {
      if (data?.total_wallet_balance && data.total_wallet_balance > maxEquity) {
        maxEquity = data.total_wallet_balance;
        winner = agents.find(a => a.id === agentId) || null;
      }
    });
    
    return { 
      winningModel: winner, 
      winningEquity: maxEquity > -Infinity ? maxEquity : 0 
    };
  }, [allAccountsData, agents]);

  // Fetch positions for the winning model
  const { data: winningPositions } = useSWR(
    winningModel ? `/agent/${winningModel.id}/positions` : null,
    winningModel ? () => api.getPositions(winningModel.id) : null,
    { refreshInterval: 10000 }
  );

  // Get active positions symbols from winning model
  const activeSymbols = useMemo(() => {
    if (!winningPositions || winningPositions.length === 0) {
      return [];
    }
    // Extract unique symbols from positions
    const symbols = new Set<string>();
    winningPositions.forEach((pos: any) => {
      if (pos.symbol) {
        symbols.add(pos.symbol);
      }
    });
    return Array.from(symbols);
  }, [winningPositions]);

  return (
    <div className="space-y-4">
      {/* Tab Controls */}
      <div className="flex items-center gap-3">
        <TabButton active={tab === "overall"} onClick={() => setTab("overall")}>
          OVERALL STATS
        </TabButton>
        <TabButton active={tab === "advanced"} onClick={() => setTab("advanced")}>
          ADVANCED ANALYTICS
        </TabButton>
      </div>

      {/* Leaderboard Table */}
      <LeaderboardTable mode={tab} agents={agents || []} />

      {/* Summary Card */}
      <WinnerCard agent={winningModel} symbols={activeSymbols} />

      {/* Model Bars Chart */}
      {agents && agents.length > 0 && <ModelBarsChart agents={agents} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-all"
      style={{
        background: active ? "var(--panel-bg)" : "transparent",
        borderColor: active ? "var(--brand-accent)" : "var(--panel-border)",
        color: active ? "var(--foreground)" : "var(--muted-text)",
      }}
    >
      {children}
    </button>
  );
}

function WinnerCard({ agent, symbols }: { agent: any; symbols: string[] }) {
  const { data: account } = useSWR(
    agent ? `/agent/${agent.id}/account` : null,
    agent ? () => api.getAccount(agent.id) : null,
    { refreshInterval: 10000 }
  );

  const color = agent ? getModelColor(agent.id) : undefined;
  const equity = account?.total_wallet_balance || 0;

  return (
    <div
      className="rounded-md border p-4"
      style={{
        background: agent ? `linear-gradient(0deg, ${color}10, var(--panel-bg))` : "var(--panel-bg)",
        borderColor: "var(--panel-border)",
      }}
    >
      <div className="text-xs uppercase tracking-wider mb-3" style={{ color: "var(--muted-text)" }}>
        WINNING MODEL
      </div>
      {agent ? (
        <div className="space-y-3">
          {/* Model Info */}
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ background: color }}
            />
            <div className="flex-1">
              <div className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                {getModelName(agent.id)}
              </div>
            </div>
          </div>

          {/* Total Equity */}
          <div className="border-t pt-3" style={{ borderColor: "var(--panel-border)" }}>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--muted-text)" }}>
              TOTAL EQUITY
            </div>
            <div className="text-xl font-bold tabular-nums" style={{ color: "var(--foreground)" }}>
              {fmtUSD(equity)}
            </div>
          </div>

          {/* Active Positions */}
          <div className="border-t pt-3" style={{ borderColor: "var(--panel-border)" }}>
            <div className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--muted-text)" }}>
              ACTIVE POSITIONS
            </div>
            <div className="flex flex-wrap gap-2">
              {symbols.length > 0 ? (
                symbols.map((symbol) => {
                  const coinIcon = getCoinIcon(symbol);
                  return (
                    <span
                      key={symbol}
                      className="inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs"
                      style={{
                        borderColor: "var(--panel-border)",
                        color: "var(--foreground)",
                      }}
                    >
                      {coinIcon && (
                        <img
                          src={coinIcon}
                          alt={symbol}
                          className="w-4 h-4"
                        />
                      )}
                      <span className="font-medium">{symbol}</span>
                    </span>
                  );
                })
              ) : (
                <div className="text-sm" style={{ color: "var(--muted-text)" }}>
                  No active positions
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm" style={{ color: "var(--muted-text)" }}>
          No data
        </div>
      )}
    </div>
  );
}

function ModelBarsChart({ agents }: { agents: any[] }) {
  const FULL = 120;
  const SCALE = 15000; // Max scale for chart

  // Fetch account data for all running agents
  const runningAgentIds = useMemo(() => 
    agents.filter(a => a.is_running).map(a => a.id).sort().join(','), 
    [agents]
  );

  const { data: allAccountsData } = useSWR(
    runningAgentIds ? `/agents/bars/${runningAgentIds}` : null,
    async () => {
      const ids = runningAgentIds.split(',');
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const data = await api.getAccount(id);
            return { agentId: id, equity: data?.total_wallet_balance || 0 };
          } catch (error) {
            console.error(`Failed to fetch account for ${id}:`, error);
            return { agentId: id, equity: 0 };
          }
        })
      );
      return results;
    },
    { refreshInterval: 10000 }
  );

  // Create a map of agent equity
  const equityMap = useMemo(() => {
    if (!allAccountsData) return new Map();
    return new Map(allAccountsData.map(({ agentId, equity }) => [agentId, equity]));
  }, [allAccountsData]);

  // Combine agents with their equity data
  const agentsWithAccounts = useMemo(() => {
    return agents.map(agent => ({
      agent,
      equity: agent.is_running ? (equityMap.get(agent.id) || 0) : 0,
    }));
  }, [agents, equityMap]);

  return (
    <div
      className="rounded-md border p-4"
      style={{
        background: "var(--panel-bg)",
        borderColor: "var(--panel-border)",
      }}
    >
      <div className="text-xs uppercase tracking-wider mb-4" style={{ color: "var(--muted-text)" }}>
        ACCOUNT VALUE
      </div>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
        {agentsWithAccounts.map(({ agent, equity }) => {
          const color = getModelColor(agent.id);
          const pct = Math.max(0, Math.min(equity / SCALE, 1));
          const fill = Math.max(4, Math.round(pct * FULL));

          return (
            <div key={agent.id} className="flex flex-col items-center gap-2">
              <div className="text-[11px] tabular-nums font-medium" style={{ color: "var(--foreground)" }}>
                {fmtUSD(equity)}
              </div>
              <div className="relative w-12" style={{ height: FULL }}>
                {/* Background bar */}
                <div
                  className="absolute inset-0 rounded border"
                  style={{
                    background: "color-mix(in oklab, var(--panel-border) 20%, transparent)",
                    borderColor: "var(--panel-border)",
                  }}
                />
                {/* Fill bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 rounded-b"
                  style={{
                    height: fill,
                    background: color,
                  }}
                />
              </div>
              <div className="text-[11px] text-center" style={{ color: "var(--muted-text)" }}>
                {getModelName(agent.id)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

