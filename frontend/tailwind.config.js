/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-default)", "'Mona Sans'", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["var(--font-mono)", "'Mona Sans Mono'", "'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        canvas: {
          DEFAULT: "var(--color-canvas-default)",
          subtle: "var(--color-canvas-subtle)",
          inset: "var(--color-canvas-inset)",
        },
        fg: {
          DEFAULT: "var(--color-fg-default)",
          muted: "var(--color-fg-muted)",
          subtle: "var(--color-fg-subtle)",
          onEmphasis: "var(--color-fg-on-emphasis)",
        },
        border: {
          DEFAULT: "var(--color-border-default)",
          subtle: "var(--color-border-subtle)",
          muted: "var(--color-border-muted)",
        },
        accent: {
          primary: "var(--color-accent-primary)",
          hover: "var(--color-accent-hover)",
          subtle: "var(--color-accent-subtle)",
        },
        brand: {
          purple: "var(--color-purple)",
          gold: "var(--color-gold)",
          coral: "var(--color-coral)",
          cyan: "var(--color-cyan)",
        }
      }
    },
  },
  plugins: [],
}
