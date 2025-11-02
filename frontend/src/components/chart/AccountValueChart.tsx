"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { getModelColor, getModelName, getModelIcon, getAllModels } from "@/lib/model/meta";
import { adjustLuminance } from "@/lib/utils/color";
import type { Agent, EquityPoint } from "@/types";

interface AccountValueChartProps {
  agents: Agent[];
}

type Range = "ALL" | "72H";
type Mode = "$" | "%";

// Custom hook to fetch equity data for multiple agents
function useAgentsEquityData(agentIds: string[]) {
  // Create a stable key for the agents list
  const agentsKey = agentIds.sort().join(',');
  
  // Fetch all equity data in a single SWR call
  const { data: allEquityData } = useSWR(
    agentsKey ? `/agents/equity-batch?ids=${agentsKey}` : null,
    async () => {
      // Fetch all agents' equity data in parallel
      const results = await Promise.all(
        agentIds.map(async (id) => {
          try {
            const data = await api.getEquityHistory(id);
            return { agentId: id, data: data || [] };
          } catch (error) {
            console.error(`Failed to fetch equity for ${id}:`, error);
            return { agentId: id, data: [] };
          }
        })
      );
      return results;
    },
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  return allEquityData || [];
}

export function AccountValueChart({ agents }: AccountValueChartProps) {
  const [range, setRange] = useState<Range>("ALL");
  const [mode, setMode] = useState<Mode>("$");
  const [vw, setVw] = useState<number>(0);
  
  // Get all defined models and merge with running agents
  const allModels = useMemo(() => {
    const allDefinedModels = getAllModels();
    const runningMap = new Map(agents.map(a => [a.id, a]));
    
    return allDefinedModels.map(model => {
      const runningAgent = runningMap.get(model.id);
      return {
        id: model.id,
        name: model.name,
        is_running: runningAgent?.is_running || false,
      };
    });
  }, [agents]);

  const [active, setActive] = useState<Set<string>>(new Set(allModels.filter(m => m.is_running).map(m => m.id)));

  // Fetch equity history for running agents only
  const runningAgentIds = useMemo(() => allModels.filter(m => m.is_running).map(m => m.id), [allModels]);
  const equityDataQueries = useAgentsEquityData(runningAgentIds);
  
  // Track viewport width for responsive sizing
  useEffect(() => {
    const upd = () => setVw(typeof window !== "undefined" ? window.innerWidth : 0);
    upd();
    let timeout: ReturnType<typeof setTimeout>;
    const debouncedUpd = () => {
      clearTimeout(timeout);
      timeout = setTimeout(upd, 150);
    };
    window.addEventListener("resize", debouncedUpd);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", debouncedUpd);
    };
  }, []);

  // Combine equity history from all agents into chart data
  const chartData = useMemo(() => {
    // Create a map of timestamps to data points
    const timestampMap = new Map<number, any>();

    equityDataQueries.forEach(({ agentId, data }) => {
      if (!data || data.length === 0) return;

      data.forEach((point: EquityPoint) => {
        const timestamp = new Date(point.timestamp).getTime();
        if (!timestampMap.has(timestamp)) {
          timestampMap.set(timestamp, { timestamp: new Date(point.timestamp) });
        }
        timestampMap.get(timestamp)![agentId] = point.equity;
      });
    });

    // Convert map to array and sort by timestamp
    const points = Array.from(timestampMap.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Filter by range
    if (range === "72H" && points.length > 0) {
      const cutoff = Date.now() - 72 * 60 * 60 * 1000; // 72 hours ago
      return points.filter(p => p.timestamp.getTime() >= cutoff);
    }

    return points;
  }, [equityDataQueries, range]);

  // Calculate initial equity for percentage mode
  const initialEquity = useMemo(() => {
    const initial: Record<string, number> = {};
    if (chartData.length > 0) {
      runningAgentIds.forEach(id => {
        initial[id] = chartData[0]?.[id] || 10000;
      });
    }
    return initial;
  }, [chartData, runningAgentIds]);

  // Convert to percentage if needed
  const displayData = useMemo(() => {
    if (mode === "%") {
      return chartData.map(point => {
        const newPoint: any = { timestamp: point.timestamp };
        runningAgentIds.forEach(id => {
          if (point[id] !== undefined && initialEquity[id]) {
            newPoint[id] = ((point[id] - initialEquity[id]) / initialEquity[id]) * 100;
          }
        });
        return newPoint;
      });
    }
    return chartData;
  }, [chartData, mode, runningAgentIds, initialEquity]);

  // Calculate last index and value per model for end dot rendering
  const lastIdxById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const id of runningAgentIds) {
      for (let i = displayData.length - 1; i >= 0; i--) {
        const v = (displayData[i] as any)[id];
        if (typeof v === "number") {
          m[id] = i;
          break;
        }
      }
    }
    return m;
  }, [runningAgentIds, displayData]);

  const lastValById = useMemo(() => {
    const m: Record<string, number | undefined> = {};
    for (const id of runningAgentIds) {
      const idx = lastIdxById[id];
      if (typeof idx === "number") {
        const v = (displayData[idx] as any)?.[id];
        if (typeof v === "number") m[id] = v;
      }
    }
    return m;
  }, [runningAgentIds, displayData, lastIdxById]);

  const formatValue = (v: number | undefined) => {
    if (typeof v !== "number") return "--";
    if (mode === "%") return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
    try {
      return `$${Number(v).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch {
      const n = Math.round(Number(v) * 100) / 100;
      return `$${n}`;
    }
  };

  // End-logo size and dynamic right margin
  const endLogoBaseSize = vw < 380 ? 21 : vw < 640 ? 27 : vw < 1024 ? 42 : 44;
  const endLogoSize = Math.round((endLogoBaseSize * 2) / 3);
  const marginFactor = vw < 380 ? 1.2 : vw < 640 ? 1.35 : vw < 1024 ? 1.6 : 1.7;
  const chartRightMargin = Math.max(64, Math.round(endLogoSize * marginFactor));

  // Render model icon at the end of the line
  const renderEndDot = (id: string) => (p: any) => {
    const { cx, cy, index } = p || {};
    if (cx == null || cy == null) return <g key={`empty-${id}-${index}`} />;
    if (typeof lastIdxById[id] !== "number" || index !== lastIdxById[id])
      return <g key={`empty-${id}-${index}`} />;
    if (active.size && !active.has(id))
      return <g key={`empty-${id}-${index}`} />;
    
    const icon = getModelIcon(id);
    const color = getModelColor(id);
    const bg = color || "var(--chart-logo-bg)";
    const ring = typeof bg === "string" && bg.startsWith("#")
      ? adjustLuminance(bg, -0.15)
      : "var(--chart-logo-ring)";
    const size = endLogoSize;
    const haloR = Math.round((endLogoBaseSize / 3) * (2 / 3));
    const valueStr = formatValue(lastValById[id]);
    const isVisible = active.size ? active.has(id) : true;
    const showValueChip = isVisible;
    const fontSize = vw < 380 ? 11 : vw < 640 ? 12 : 13;
    const chipPadX = 8;
    const charW = Math.round(fontSize * 0.62);
    const chipTextW = valueStr.length * charW;
    const chipH = fontSize + 8;
    const chipW = chipTextW + chipPadX * 2;

    return (
      <g
        key={`${id}-dot-${index}`}
        transform={`translate(${cx}, ${cy})`}
        style={{ cursor: "pointer" }}
      >
        <g
          style={{
            transform: `scale(1)`,
            transformBox: "fill-box",
            transformOrigin: "50% 50%",
            transition: "transform 160ms ease",
          }}
        >
          {/* Continuous soft pulse halo */}
          <circle
            r={haloR}
            className="animate-ping"
            fill={color}
            opacity={0.075}
          />
          {/* Solid chip behind logo */}
          <circle
            r={Math.round(size * 0.55)}
            fill={bg as any}
            stroke={ring as any}
            strokeWidth={1}
          />
          {icon ? (
            <image
              href={icon}
              x={-size / 2}
              y={-size / 2}
              width={size}
              height={size}
              preserveAspectRatio="xMidYMid meet"
              style={{
                filter: "drop-shadow(0 0 2px rgba(0,0,0,0.6))",
                pointerEvents: "none",
              }}
            />
          ) : (
            <circle r={Math.max(6, Math.round(size * 0.38))} fill={color} />
          )}
        </g>
        {/* Right value chip */}
        {showValueChip && (
          <g
            key={`chip-${id}-${valueStr}`}
            transform={`translate(${Math.round(size * 0.7) + 8}, ${-Math.round(chipH / 2)})`}
            style={{ pointerEvents: "none" }}
          >
            <rect
              rx={6}
              ry={6}
              width={chipW}
              height={chipH}
              fill={color}
              opacity={0.9}
            />
            <text
              x={chipW / 2}
              y={Math.round(chipH * 0.68)}
              textAnchor="middle"
              fontSize={fontSize}
              className="tabular-nums"
              fill="#fff"
              fontWeight={700}
            >
              {valueStr}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div
      className="flex h-full flex-col rounded-md border p-3"
      style={{
        background: "var(--panel-bg)",
        borderColor: "var(--panel-border)",
      }}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div
          className="text-xs font-semibold tracking-wider"
          style={{ color: "var(--muted-text)" }}
        >
          Account Value
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px]">
          {/* Range Toggle */}
          <div
            className="flex overflow-hidden rounded border"
            style={{ borderColor: "var(--chip-border)" }}
          >
            {(["ALL", "72H"] as Range[]).map((r) => (
              <button
                key={r}
                className="px-2 py-1 chip-btn"
                style={
                  range === r
                    ? {
                        background: "var(--btn-active-bg)",
                        color: "var(--btn-active-fg)",
                      }
                    : { color: "var(--btn-inactive-fg)" }
                }
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Mode Toggle */}
          <div
            className="flex overflow-hidden rounded border"
            style={{ borderColor: "var(--chip-border)" }}
          >
            {(["$", "%"] as Mode[]).map((m) => (
              <button
                key={m}
                className="px-2 py-1 chip-btn"
                style={
                  mode === m
                    ? {
                        background: "var(--btn-active-bg)",
                        color: "var(--btn-active-fg)",
                      }
                    : { color: "var(--btn-inactive-fg)" }
                }
                onClick={() => setMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <div className="min-h-0 flex-1">
          <div className="chart-container relative h-full w-full no-tap-highlight select-none">
            {displayData.length === 0 ? (
              <div className="flex h-full items-center justify-center" style={{ color: "var(--muted-text)" }}>
                <div className="text-center">
                  <div className="text-2xl mb-2">📈</div>
                  <p className="text-sm">No equity data available yet</p>
                  <p className="text-xs mt-1">Data will appear after trading starts</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart 
                  data={displayData} 
                  margin={{ 
                    top: 8, 
                    right: (() => {
                      // Increase right margin if value chip could overflow
                      const visibleIds = runningAgentIds.filter((id) =>
                        active.size ? active.has(id) : true
                      );
                      let maxW = 0;
                      for (const id of visibleIds) {
                        const s = formatValue(lastValById[id]);
                        const fs = vw < 380 ? 11 : vw < 640 ? 12 : 13;
                        const cW = Math.round(fs * 0.62);
                        const est = s.length * cW + 16 + Math.round(endLogoSize * 0.7) + 10;
                        if (est > maxW) maxW = est;
                      }
                      return Math.max(chartRightMargin, maxW);
                    })(),
                    bottom: 8, 
                    left: 0 
                  }}
                >
                <CartesianGrid stroke="var(--grid-stroke)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(v: Date) => format(v, "MM-dd HH:mm")}
                  tick={{ fill: "var(--axis-tick)", fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(v: number) =>
                    mode === "%" ? `${v.toFixed(1)}%` : `$${Math.round(v).toLocaleString()}`
                  }
                  tick={{ fill: "var(--axis-tick)", fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--tooltip-bg)",
                    border: "1px solid var(--tooltip-border)",
                    color: "var(--tooltip-fg)",
                  }}
                  labelFormatter={(v) => format(new Date(v), "yyyy-MM-dd HH:mm")}
                  formatter={(val: number) =>
                    mode === "%" ? `${Number(val).toFixed(2)}%` : `$${Number(val).toFixed(2)}`
                  }
                />
                <ReferenceLine
                  y={mode === "$" ? 10000 : 0}
                  stroke="var(--ref-line)"
                  strokeDasharray="4 4"
                />
                {runningAgentIds.map((id) => (
                  <Line
                    key={id}
                    type="monotone"
                    dataKey={id}
                    stroke={getModelColor(id)}
                    strokeWidth={1.8}
                    dot={renderEndDot(id)}
                    name={getModelName(id)}
                    hide={active.size > 0 && !active.has(id)}
                    className="series"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Legend */}
        {allModels.length > 0 && (
          <div className="mt-3">
            {/* Small screens: horizontal scrollable legend */}
            <div className="block md:hidden">
              <div
                className="flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap pr-1"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                {allModels.map((model) => {
                  const isRunning = model.is_running;
                  const activeOn = isRunning && (active.size === 0 || active.has(model.id));
                  const icon = getModelIcon(model.id);
                  const displayColor = isRunning ? getModelColor(model.id) : "#6b7280";
                  
                  return (
                    <button
                      key={model.id}
                      disabled={!isRunning}
                      className="inline-flex min-w-[110px] flex-shrink-0 flex-col items-center justify-center gap-1 rounded border px-2 py-2 text-[11px] chip-btn"
                      style={{
                        borderColor: "var(--chip-border)",
                        background: activeOn ? "var(--btn-active-bg)" : "transparent",
                        color: isRunning ? (activeOn ? "var(--btn-active-fg)" : "var(--btn-inactive-fg)") : "#6b7280",
                        opacity: isRunning ? 1 : 0.5,
                        cursor: isRunning ? "pointer" : "not-allowed",
                      }}
                      onClick={() => {
                        if (!isRunning) return;
                        setActive((prev) => {
                          if (prev.size === 1 && prev.has(model.id)) return new Set(runningAgentIds);
                          return new Set([model.id]);
                        });
                      }}
                    >
                      <div className="flex flex-col items-center gap-0.5 w-full">
                        <div className="flex items-center gap-1">
                          {icon ? (
                            <span
                              className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full flex-shrink-0"
                              style={{
                                background: displayColor,
                                padding: '2px',
                              }}
                            >
                              <img
                                src={icon}
                                alt=""
                                className="h-full w-full object-contain"
                                style={{ opacity: isRunning ? 1 : 0.6 }}
                              />
                            </span>
                          ) : (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                              style={{ background: displayColor }}
                            />
                          )}
                          {isRunning && (
                            <span className="px-1 py-0.5 rounded text-[8px] font-semibold leading-none" style={{ background: "#10b981", color: "#fff" }}>
                              LIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-center leading-tight max-w-full break-words px-1" style={{ wordBreak: "break-word" }}>
                          {getModelName(model.id)}
                        </span>
                      </div>
                      <div className="font-semibold leading-tight tabular-nums text-[11px] mt-0.5">
                        {isRunning 
                          ? formatValue(lastValById[model.id])
                          : "—"
                        }
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: equal-width grid legend */}
            <div className="hidden md:grid gap-2" style={{ gridTemplateColumns: `repeat(${allModels.length}, minmax(0, 1fr))` }}>
              {allModels.map((model) => {
                const isRunning = model.is_running;
                const activeOn = isRunning && (active.size === 0 || active.has(model.id));
                const icon = getModelIcon(model.id);
                const displayColor = isRunning ? getModelColor(model.id) : "#6b7280";
                
                return (
                  <button
                    key={model.id}
                    disabled={!isRunning}
                    className="w-full inline-flex flex-col items-center justify-center gap-1 rounded border px-2 py-2 text-[11px] chip-btn"
                    style={{
                      borderColor: "var(--chip-border)",
                      background: activeOn ? "var(--btn-active-bg)" : "transparent",
                      color: isRunning ? (activeOn ? "var(--btn-active-fg)" : "var(--btn-inactive-fg)") : "#6b7280",
                      opacity: isRunning ? 1 : 0.5,
                      cursor: isRunning ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (!isRunning) return;
                      setActive((prev) => {
                        if (prev.size === 1 && prev.has(model.id)) return new Set(runningAgentIds);
                        return new Set([model.id]);
                      });
                    }}
                  >
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <div className="flex items-center gap-1">
                        {icon ? (
                          <span
                            className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full flex-shrink-0"
                            style={{
                              background: displayColor,
                              padding: '2px',
                            }}
                          >
                            <img
                              src={icon}
                              alt=""
                              className="h-full w-full object-contain"
                              style={{ opacity: isRunning ? 1 : 0.6 }}
                            />
                          </span>
                        ) : (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                            style={{ background: displayColor }}
                          />
                        )}
                        {isRunning && (
                          <span className="px-1 py-0.5 rounded text-[8px] font-semibold leading-none" style={{ background: "#10b981", color: "#fff" }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-center leading-tight max-w-full break-words px-1" style={{ wordBreak: "break-word" }}>
                        {getModelName(model.id)}
                      </span>
                    </div>
                    <div className="font-semibold leading-tight tabular-nums text-[11px] mt-0.5">
                      {isRunning 
                        ? formatValue(lastValById[model.id])
                        : "—"
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountValueChart;

