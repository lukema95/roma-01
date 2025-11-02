import { create } from "zustand";

type Theme = "dark" | "light" | "system";
type Resolved = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  resolved: Resolved;
  setTheme: (theme: Theme) => void;
  initialize: () => void;
}

export const useTheme = create<ThemeStore>((set, get) => ({
  theme: "system",
  resolved: "dark",
  
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
      const resolved = resolveTheme(theme);
      set({ resolved });
      document.documentElement.dataset.theme = resolved;
    }
  },
  
  initialize: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme") as Theme | null;
    const theme = stored || "system";
    const resolved = resolveTheme(theme);
    set({ theme, resolved });
    document.documentElement.dataset.theme = resolved;
  },
}));

function resolveTheme(theme: Theme): Resolved {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "dark";
  }
  return theme;
}

// Listen to system theme changes
if (typeof window !== "undefined") {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    const store = useTheme.getState();
    if (store.theme === "system") {
      const resolved = e.matches ? "dark" : "light";
      useTheme.setState({ resolved });
      document.documentElement.dataset.theme = resolved;
    }
  });
}

