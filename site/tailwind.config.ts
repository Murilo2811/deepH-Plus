import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                sm: "0.125rem",
                md: "0.375rem",
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
                full: "9999px"
            },
            colors: {
                // Background & Surface Layers
                background: {
                    DEFAULT: "#000000",
                    surface: "#08080A", // Slightly raised layer
                    elevated: "#121214", // Popovers, modals, cards
                },
                // Primary Brand: Electric Cyan
                cyan: {
                    DEFAULT: "#00E5FF",
                    dimmer: "#00BBDD",
                    glow: "rgba(0, 229, 255, 0.4)",
                    subtle: "rgba(0, 229, 255, 0.1)",
                },
                // Extended Neutral Palette for text and borders
                slate: {
                    100: "#F1F5F9",
                    300: "#CBD5E1",
                    400: "#94A3B8",
                    500: "#64748B",
                    800: "#1E293B",
                    900: "#0F172A",
                },
                text: {
                    primary: "#F8FAFC", // Almost white
                    secondary: "#94A3B8", // Muted slate
                    muted: "#475569"
                },
                border: {
                    DEFAULT: "rgba(255, 255, 255, 0.08)",
                    hover: "rgba(255, 255, 255, 0.15)",
                },
                // Fallbacks for current vars
                "background-dark": "#000000",
                "surface-dark": "#08080A",
                "accent-emerald": "#00E5FF",
                primary: {
                    DEFAULT: "#00E5FF",
                    hover: "rgba(0, 229, 255, 0.8)",
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                pulseGlow: {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0, 229, 255, 0.2)' },
                    '50%': { opacity: '0.6', boxShadow: '0 0 40px rgba(0, 229, 255, 0.4)' },
                }
            },
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")({ strategy: 'class' })],
}
export default config;
