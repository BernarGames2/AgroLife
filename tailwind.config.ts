import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        display: ['"Plus Jakarta Sans"', '"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "hsl(var(--primary-soft))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        ok: {
          DEFAULT: "hsl(var(--ok))",
          bg: "hsl(var(--ok-bg))",
          border: "hsl(var(--ok-border))",
        },
        warn: {
          DEFAULT: "hsl(var(--warn))",
          bg: "hsl(var(--warn-bg))",
          border: "hsl(var(--warn-border))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          bg: "hsl(var(--danger-bg))",
          border: "hsl(var(--danger-border))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          bg: "hsl(var(--info-bg))",
          border: "hsl(var(--info-border))",
        },
        target: "hsl(var(--target))",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px hsl(140 20% 20% / 0.04), 0 8px 24px -12px hsl(140 25% 20% / 0.12)",
        soft: "0 1px 2px hsl(140 20% 20% / 0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
} satisfies Config;
