import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Roulette wheel segment colors (used directly in canvas, kept for compat)
        accent: "#ff5c3a",
        "accent-blue": "#3a7bff",
        "accent-green": "#22cc77",
        "accent-yellow": "#ffcc3a",
        "accent-purple": "#cc44ff",
        "accent-pink": "#ff44aa",
        // Design system tokens
        "ds-bg": "#111111",
        "ds-low": "#1c1b1b",
        "ds-container": "#201f1f",
        "ds-high": "#2a2a2a",
        "ds-highest": "#353534",
        "ds-lowest": "#0e0e0e",
        "ds-neon": "#E8FF47",
        "ds-on-neon": "#2D3400",
        "ds-outline": "#464834",
        "ds-text": "#F0F0F0",
        "ds-muted": "#888888",
        "ds-music": "#C97B84",
        "ds-movies": "#6B8CAE",
        "ds-games": "#7AAE8C",
        "ds-books": "#C4A882",
      },
      fontFamily: {
        // font-syne → Epilogue (existing classes keep working)
        syne: ["var(--font-epilogue)", "sans-serif"],
        // font-dm → Plus Jakarta Sans
        dm: ["var(--font-jakarta)", "sans-serif"],
        headline: ["var(--font-epilogue)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
