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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Light mode color palette - Red & Blue dominant for betting game
        light: {
          bg: '#FFFFFF',
          'bg-alt': '#F7F9FC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        primary: {
          DEFAULT: '#2563EB', // Bright Blue - Trust & Tech
          light: '#60A5FA',
          dark: '#1E40AF',
        },
        secondary: {
          DEFAULT: '#DC2626', // Vibrant Red - Excitement
          light: '#EF4444',
          dark: '#B91C1C',
        },
        accent: {
          purple: '#8B5CF6', // Purple - Premium
          cyan: '#06B6D4', // Cyan - Modern
          yellow: '#F59E0B', // Yellow - Attention
        },
        success: {
          DEFAULT: '#10B981', // Green - Win/Up
          light: '#34D399',
          dark: '#059669',
        },
        text: {
          primary: '#1F2937',
          secondary: '#4B5563',
          tertiary: '#9CA3AF',
        }
      },
    },
  },
  plugins: [],
};
export default config;
