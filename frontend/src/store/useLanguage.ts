import { create } from "zustand";

type Language = "en" | "zh";

interface LanguageStore {
  language: Language;
  setLanguage: (language: Language) => void;
  initialize: () => void;
}

export const useLanguage = create<LanguageStore>((set) => ({
  language: "en",
  
  setLanguage: (language: Language) => {
    set({ language });
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
    }
  },
  
  initialize: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("language") as Language | null;
    const language = stored || "en";
    set({ language });
    document.documentElement.lang = language;
  },
}));

