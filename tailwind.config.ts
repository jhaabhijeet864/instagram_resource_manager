import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./plugins/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FDFCF9",
          100: "#FAF7F2",
          200: "#F4EFEA",
          300: "#EAE3D9",
          400: "#DFD6C8",
          500: "#C8BCA9",
          600: "#A89A84",
          700: "#7E725F",
          800: "#554C3E",
          900: "#2E2921",
        },
        warm: {
          charcoal: "#1C1917",
          espresso: "#292524",
          stone: "#44403C",
          muted: "#78716C",
          border: "#E7E1D8",
          card: "#FFFFFF",
          surface: "#FDFBF7",
          accent: "#B45309", // Warm cognac/amber
        },
      },
      fontFamily: {
        // Instagram's exact web font stack (font-family used by instagram.com)
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        warm: "0 2px 12px -2px rgba(44, 38, 34, 0.06), 0 1px 3px rgba(44, 38, 34, 0.04)",
        "warm-lg": "0 10px 30px -4px rgba(44, 38, 34, 0.08), 0 4px 8px -2px rgba(44, 38, 34, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
