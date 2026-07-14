import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // IctKapil brand — warm ember / sunset
        bg: {
          0: "#0d0b0a",
          1: "#161316",
          2: "#211a17",
          3: "#453027",
        },
        accent: {
          DEFAULT: "#FF6D29",
          soft: "#ffb385",
          dim: "#3a2115",
        },
        grey: "#BABABA",
        profit: "#4ADE80",
        loss: "#F87171",
        warn: "#FBBF24",
        border: "rgba(255,255,255,0.08)",
        // Ported from Phase 2/5 trading-journal components (TradeForm,
        // BacktestForm, calculators, calendar, etc.), which style against a
        // "surface" scale rather than the bg-0/1/2/3 ember scale above. Kept
        // as its own token group instead of rewriting every ported
        // className.
        surface: {
          DEFAULT: "#161316",
          light: "#211a17",
          border: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        sans: ["Neue Montreal", "Manrope", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        devanagari: ["Noto Sans Devanagari", "Manrope", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      backgroundImage: {
        "ember-radial":
          "radial-gradient(circle at 15% 30%, rgba(255,109,41,0.10), transparent 45%), radial-gradient(circle at 90% 80%, rgba(255,109,41,0.06), transparent 40%), linear-gradient(160deg, #0d0b0a 0%, #161316 45%, #453027 130%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
