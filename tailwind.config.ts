import type { Config } from "tailwindcss";

const tokenColor = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: tokenColor("--surface-canvas"),
        foreground: tokenColor("--content-primary"),
        light: {
          bg: tokenColor("--surface-canvas"),
          "bg-alt": tokenColor("--surface-muted"),
          card: tokenColor("--component-card-bg"),
          border: tokenColor("--border-default"),
        },
        primary: {
          DEFAULT: tokenColor("--brand-primary"),
          light: tokenColor("--brand-primary-soft"),
          dark: tokenColor("--brand-primary-strong"),
        },
        secondary: {
          DEFAULT: tokenColor("--brand-secondary"),
          light: tokenColor("--brand-secondary-soft"),
          dark: tokenColor("--brand-secondary-strong"),
        },
        accent: {
          purple: tokenColor("--accent-premium"),
          cyan: tokenColor("--accent-data"),
          yellow: tokenColor("--accent-attention"),
        },
        warning: tokenColor("--accent-attention"),
        success: {
          DEFAULT: tokenColor("--status-success"),
          light: tokenColor("--status-success-soft"),
          dark: tokenColor("--status-success-strong"),
        },
        text: {
          primary: tokenColor("--content-primary"),
          secondary: tokenColor("--content-secondary"),
          tertiary: tokenColor("--content-tertiary"),
        },
      },
      borderWidth: {
        3: "3px",
      },
      borderRadius: {
        "dopameme-sm": "var(--radius-sm)",
        "dopameme-md": "var(--radius-md)",
        "dopameme-lg": "var(--radius-lg)",
        "dopameme-xl": "var(--radius-xl)",
        "dopameme-pill": "var(--radius-pill)",
      },
      boxShadow: {
        "token-sm": "var(--shadow-sm)",
        "token-md": "var(--shadow-md)",
        "token-lg": "var(--shadow-lg)",
        "token-xl": "var(--shadow-xl)",
        "token-brand": "var(--shadow-brand)",
      },
    },
  },
  plugins: [],
};
export default config;
