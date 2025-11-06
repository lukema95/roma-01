// Model metadata for ROMA-01 Trading Platform

export interface ModelMeta {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

const modelRegistry: Record<string, ModelMeta> = {
  "deepseek-chat-v3.1": {
    id: "deepseek-chat-v3.1",
    name: "DEEPSEEK CHAT V3.1",
    color: "#6366f1", // Indigo
    icon: "/logos/deepseek_logo.png",
  },
  "qwen3-max": {
    id: "qwen3-max",
    name: "QWEN3 MAX",
    color: "#8b5cf6", // Purple
    icon: "/logos/qwen_logo.png",
  },
  "claude-sonnet-4.5": {
    id: "claude-sonnet-4.5",
    name: "CLAUDE SONNET 4.5",
    color: "#f97316", // Orange
    icon: "/logos/Claude_logo.png",
  },
  "grok-4": {
    id: "grok-4",
    name: "GROK 4",
    color: "#000000", // Black
    icon: "/logos/Grok_logo.webp",
  },
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    name: "GEMINI 2.5 PRO",
    color: "#3b82f6", // Blue
    icon: "/logos/Gemini_logo.webp",
  },
  "gpt-5": {
    id: "gpt-5",
    name: "GPT 5",
    color: "#10b981", // Green
    icon: "/logos/GPT_logo.png",
  },
};

// Map backend model IDs to frontend model IDs
const modelIdMap: Record<string, string> = {
  "deepseek-v3.1": "deepseek-chat-v3.1",
  "deepseek-chat": "deepseek-chat-v3.1",
  "qwen3-max": "qwen3-max",
  "qwen-max": "qwen3-max",
  "claude-sonnet-4.5": "claude-sonnet-4.5",
  "grok-4": "grok-4",
  "gemini-2.5-pro": "gemini-2.5-pro",
  "gpt-5": "gpt-5",
};

function resolveModelId(id: string): string {
  return modelIdMap[id] || id;
}

export function getModelColor(id: string): string {
  const resolvedId = resolveModelId(id);
  return modelRegistry[resolvedId]?.color || "#6366f1"; // Default to indigo instead of gray
}

export function getModelName(id: string): string {
  const resolvedId = resolveModelId(id);
  return modelRegistry[resolvedId]?.name || id;
}

export function getModelIcon(id: string): string | undefined {
  const resolvedId = resolveModelId(id);
  return modelRegistry[resolvedId]?.icon;
}

export function resolveCanonicalId(id: string): string {
  return id;
}

export function registerModel(meta: ModelMeta) {
  modelRegistry[meta.id] = meta;
}

// Get all defined models in display order
export function getAllModels(): ModelMeta[] {
  const displayOrder = [
    "deepseek-chat-v3.1",
    "qwen3-max",
    "claude-sonnet-4.5",
    "grok-4",
    "gemini-2.5-pro",
    "gpt-5",
  ];
  
  return displayOrder
    .map(id => modelRegistry[id])
    .filter(Boolean);
}

