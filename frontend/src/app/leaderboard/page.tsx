"use client";

import LeaderboardOverview from "@/components/leaderboard/LeaderboardOverview";

export default function LeaderboardPage() {
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
          LEADERBOARD
        </h1>
        
        <LeaderboardOverview />
      </div>
    </div>
  );
}

