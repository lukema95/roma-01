"use client";

import { useMemo } from "react";
import PriceTicker from "@/components/PriceTicker";
import { MultiAgentChart } from "@/components/MultiAgentChart";
import { RightSideTabs } from "@/components/RightSideTabs";
import useSWR from "swr";
import { api } from "@/lib/api";
import { getAllModels } from "@/lib/model/meta";

export default function HomePage() {
  // Fetch running agents from API
  const { data: runningAgents, error } = useSWR("/agents", api.getAgents, {
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

  // Show PriceTicker even while loading
  const content = (
    <div className="w-full terminal-scan flex flex-col h-[calc(100vh-var(--header-h))]">
      <PriceTicker />
      <section className="grid grid-cols-1 gap-3 p-3 overflow-hidden lg:grid-cols-3 lg:gap-3 lg:p-3 h-[calc(100vh-var(--header-h)-var(--ticker-h))]">
        {error ? (
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="p-6 rounded border" style={{ background: "var(--panel-bg)", borderColor: "var(--panel-border)", color: "var(--foreground)" }}>
              <p className="font-semibold mb-2" style={{ color: "#ef4444" }}>Failed to load agents</p>
              <p className="text-sm" style={{ color: "var(--muted-text)" }}>{error.message}</p>
            </div>
          </div>
        ) : !agents ? (
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--brand-accent)" }}></div>
              <p style={{ color: "var(--muted-text)" }}>Loading trading platform...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 h-[95%]">
              <MultiAgentChart agents={agents.filter(a => a.is_running)} />
            </div>
            <div className="lg:col-span-1 h-full overflow-hidden">
              <RightSideTabs agents={agents} />
            </div>
          </>
        )}
      </section>
    </div>
  );

  return content;
}

