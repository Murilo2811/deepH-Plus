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
                sans: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
                DEFAULT: "0.125rem",
                sm: "0.125rem",
                md: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
                full: "9999px"
            },
            colors: {
                primary: {
                    DEFAULT: "#0ff092",
                    hover: "rgba(15, 240, 146, 0.9)",
                },
                "background-light": "#f5f8f7",
                "background-dark": "#0a0c0b",
                "surface-dark": "#141a17",
                "accent-emerald": "#0ff092",
                "slate-panel": "#152a24",
                "border-accent": "#326755",

                // Keep UI generic colors for compatibility if needed
                neutral: {
                    bg1: '#0a0c0b',
                    bg2: '#141a17',
                    bg3: '#1a221e',
                },
                brand: {
                    DEFAULT: '#0ff092',
                    hover: '#0ea367',
                    foreground: '#0a0c0b'
                },
                border: {
                    DEFAULT: 'rgba(15, 240, 146, 0.1)',
                },
                text: {
                    primary: '#f1f5f9', // slate-100
                    secondary: '#94a3b8', // slate-400
                    muted: '#64748b', // slate-500
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")({ strategy: 'class' })],
}
export default config;
