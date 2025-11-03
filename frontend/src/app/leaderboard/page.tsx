"use client";

import LeaderboardOverview from "@/components/leaderboard/LeaderboardOverview";
import { useLanguage } from "@/store/useLanguage";
import { getTranslation } from "@/lib/i18n";

export default function LeaderboardPage() {
  const language = useLanguage((s) => s.language);
  const t = getTranslation(language).leaderboard;
  
  return (
    <div 
      className="w-full terminal-scan px-3 py-3 sm:px-4 sm:py-4 lg:px-8 lg:py-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Page Title */}
        <h1 
          className="text-2xl font-bold uppercase tracking-wide mb-6 terminal-text"
          style={{ color: "var(--foreground)" }}
        >
          {t.title}
        </h1>
        
        <LeaderboardOverview />
      </div>
    </div>
  );
}

