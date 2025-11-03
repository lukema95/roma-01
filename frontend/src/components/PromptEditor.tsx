"use client";

import { useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CustomPrompts {
  enabled: boolean;
  trading_philosophy: string;
  entry_preferences: string;
  position_management: string;
  market_preferences: string;
  additional_rules: string;
}

export default function PromptEditor({ agentId }: { agentId: string }) {
  const [prompts, setPrompts] = useState<CustomPrompts>({
    enabled: false,
    trading_philosophy: "",
    entry_preferences: "",
    position_management: "",
    market_preferences: "",
    additional_rules: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, [agentId]);

  const loadPrompts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/agents/${agentId}/prompts`);
      const data = await response.json();
      if (data.status === "success") {
        setPrompts(data.data);
      }
    } catch (err) {
      console.error("Failed to load prompts:", err);
      setError("Failed to load prompts");
    } finally {
      setLoading(false);
    }
  };

  const savePrompts = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/agents/${agentId}/prompts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prompts),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || "Failed to save prompts");
      }
    } catch (err) {
      console.error("Failed to save prompts:", err);
      setError("Failed to save prompts");
    } finally {
      setSaving(false);
    }
  };

  const clearPrompts = async () => {
    if (!confirm("Are you sure you want to clear all custom prompts?")) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Clear by saving empty prompts to backend
      const emptyPrompts = {
        enabled: false,
        trading_philosophy: "",
        entry_preferences: "",
        position_management: "",
        market_preferences: "",
        additional_rules: "",
      };

      const response = await fetch(`${API_BASE}/api/agents/${agentId}/prompts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emptyPrompts),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setPrompts(emptyPrompts);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.message || "Failed to clear prompts");
      }
    } catch (err) {
      console.error("Failed to clear prompts:", err);
      setError("Failed to clear prompts");
    } finally {
      setSaving(false);
    }
  };

  const [fullPrompt, setFullPrompt] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(false);

  const loadFullPromptPreview = async () => {
    setLoadingPreview(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/agents/${agentId}/prompts/preview`);
      const data = await response.json();
      if (data.status === "success") {
        setFullPrompt(data.data.full_prompt);
      } else {
        setFullPrompt("Failed to load preview");
        setError("Failed to load preview");
      }
    } catch (err) {
      console.error("Failed to load prompt preview:", err);
      setFullPrompt("Failed to load preview");
      setError("Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const togglePreview = () => {
    if (!showPreview) {
      loadFullPromptPreview();
    }
    setShowPreview(!showPreview);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: "var(--muted-text)" }}>
        <div className="text-xs">Loading prompts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 h-full overflow-y-auto p-3" style={{ fontSize: "11px" }}>
      {/* Header */}
      <div className="pb-2 border-b space-y-2" style={{ borderColor: "var(--panel-border)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-xs uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
              CUSTOM PROMPTS
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--muted-text)" }}>
              Customize AI trading strategy
            </div>
          </div>
          
          {/* Enable Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prompts.enabled}
              onChange={(e) => setPrompts({...prompts, enabled: e.target.checked})}
              className="w-3.5 h-3.5"
            />
            <span className="text-[10px]" style={{ color: "var(--foreground)" }}>Enable</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={togglePreview}
            disabled={loadingPreview}
            className="flex-1 py-1.5 px-2 text-[10px] font-medium rounded transition-colors"
            style={{
              background: showPreview ? "var(--brand-accent)" : "transparent",
              color: showPreview ? "#ffffff" : "var(--foreground)",
              border: `1px solid ${showPreview ? "var(--brand-accent)" : "var(--panel-border)"}`,
              opacity: loadingPreview ? 0.5 : 1,
              cursor: loadingPreview ? "not-allowed" : "pointer"
            }}
          >
            {loadingPreview ? "Loading..." : showPreview ? "Hide Preview" : "View Full Prompt"}
          </button>
          <button
            onClick={clearPrompts}
            disabled={saving}
            className="flex-1 py-1.5 px-2 text-[10px] font-medium rounded transition-colors"
            style={{
              background: "transparent",
              color: "#ef4444",
              border: "1px solid #ef4444",
              opacity: saving ? 0.5 : 1,
              cursor: saving ? "not-allowed" : "pointer"
            }}
          >
            {saving ? "Clearing..." : "Clear All"}
          </button>
        </div>
      </div>

      {error && (
        <div 
          className="p-2 rounded text-[10px]" 
          style={{ 
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.3)"
          }}
        >
          {error}
        </div>
      )}

      {/* Preview Section */}
      {showPreview && (
        <div 
          className="p-3 rounded max-h-96 overflow-y-auto"
          style={{ 
            background: "var(--bg)",
            border: "1px solid var(--panel-border)"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--foreground)" }}>
              Full System Prompt Preview
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(fullPrompt);
                alert("Copied to clipboard!");
              }}
              disabled={!fullPrompt}
              className="text-[10px] px-2 py-1 rounded hover:opacity-70"
              style={{ 
                background: "var(--brand-accent)",
                color: "#ffffff",
                opacity: fullPrompt ? 1 : 0.5,
                cursor: fullPrompt ? "pointer" : "not-allowed"
              }}
            >
              Copy
            </button>
          </div>
          <pre 
            className="text-[10px] leading-relaxed whitespace-pre-wrap font-mono"
            style={{ color: "var(--muted-text)" }}
          >
            {fullPrompt || "Loading preview..."}
          </pre>
        </div>
      )}

      {/* Prompt Fields */}
      <div className="space-y-3">
        <PromptField
          label="Trading Philosophy"
          value={prompts.trading_philosophy}
          onChange={(value) => setPrompts({...prompts, trading_philosophy: value})}
          placeholder="例如：核心目标是最大化夏普比率，质量优于数量，只在高确信度时交易"
          disabled={!prompts.enabled}
        />

        <PromptField
          label="Entry Preferences"
          value={prompts.entry_preferences}
          onChange={(value) => setPrompts({...prompts, entry_preferences: value})}
          placeholder="例如：多维度交叉验证（价格+量+指标），信心度≥75才开仓"
          disabled={!prompts.enabled}
        />

        <PromptField
          label="Position Management"
          value={prompts.position_management}
          onChange={(value) => setPrompts({...prompts, position_management: value})}
          placeholder="例如：盈利持仓至少30分钟，让利润奔跑，快速止损"
          disabled={!prompts.enabled}
        />

        <PromptField
          label="Market Preferences"
          value={prompts.market_preferences}
          onChange={(value) => setPrompts({...prompts, market_preferences: value})}
          placeholder="例如：上涨做多，下跌做空，震荡观望，保持多空平衡"
          disabled={!prompts.enabled}
        />

        <PromptField
          label="Additional Rules"
          value={prompts.additional_rules}
          onChange={(value) => setPrompts({...prompts, additional_rules: value})}
          placeholder="例如：每小时最多2次交易，连亏2次休息30分钟，风险回报≥1:3"
          disabled={!prompts.enabled}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={savePrompts}
        disabled={saving || !prompts.enabled}
        className="w-full py-2 px-3 text-xs font-medium rounded transition-colors"
        style={{
          background: saved ? "#22c55e" : prompts.enabled ? "var(--brand-accent)" : "#6b7280",
          color: "#ffffff",
          opacity: saving || !prompts.enabled ? 0.5 : 1,
          cursor: saving || !prompts.enabled ? "not-allowed" : "pointer"
        }}
      >
        {saving ? "Saving..." : saved ? "✓ Saved Successfully" : "Save Prompts"}
      </button>

      {saved && (
        <div 
          className="text-[10px] text-center p-2 rounded"
          style={{ 
            background: "rgba(34, 197, 94, 0.1)",
            color: "#22c55e"
          }}
        >
          ✓ Prompts saved! Will take effect in next trading cycle.
        </div>
      )}

      {prompts.enabled && (
        <div 
          className="text-[10px] p-2 rounded"
          style={{ 
            background: "rgba(59, 130, 246, 0.1)",
            color: "var(--muted-text)",
            border: "1px solid rgba(59, 130, 246, 0.2)"
          }}
        >
          💡 <strong>Tip:</strong> Custom prompts are appended to core system rules. Changes take effect in the next trading cycle.
        </div>
      )}
    </div>
  );
}

function PromptField({ 
  label, 
  value, 
  onChange, 
  placeholder,
  disabled 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-1">
      <label 
        className="text-[10px] font-medium uppercase tracking-wider"
        style={{ color: "var(--foreground)" }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full p-2 text-[10px] rounded resize-none focus:outline-none focus:ring-1 transition-colors font-mono"
        style={{ 
          background: disabled ? "var(--panel-bg)" : "var(--bg)",
          border: `1px solid var(--panel-border)`,
          color: disabled ? "var(--muted-text)" : "var(--foreground)",
          cursor: disabled ? "not-allowed" : "text",
          opacity: disabled ? 0.6 : 1
        }}
      />
      <div className="text-[9px]" style={{ color: "var(--muted-text)" }}>
        {value.length} characters
      </div>
    </div>
  );
}

