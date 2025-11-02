import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e1a",
        card: "#131824",
        primary: "#22c55e",
        destructive: "#ef4444",
        muted: "#64748b",
        accent: "#3b82f6",
      },
    },
  },
  plugins: [],
};

export default config;

