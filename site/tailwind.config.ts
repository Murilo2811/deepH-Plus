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
                sans: ['Poppins', 'system-ui', 'sans-serif'],
                display: ['Poppins', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
                DEFAULT: "0.375rem",
                sm: "0.25rem",
                md: "0.5rem",
                lg: "0.75rem",
                xl: "1rem",
                "2xl": "1.5rem",
                "sketch": "40% 60% 55% 45% / 45% 55% 45% 55%",
                "sketch-alt": "60% 40% 45% 55% / 55% 45% 55% 45%",
                full: "9999px"
            },
            colors: {
                // ── Sketch Palette ──────────────────────────────────────
                sketch: {
                    teal:         "#26C2B9",   // primary: filled circles, CTA
                    "teal-dark":  "#1A857F",   // better contrast for text/borders
                    "teal-light": "#7DE8E3",   // hover / lighter variant
                    yellow:       "#F9E05E",   // accent: ring fills, highlights
                    "yellow-pale":"#FFF9C4",   // decorative card fills
                    charcoal:     "#1A2126",   // Outlined mais profundo para melhor contraste
                    "charcoal-soft":"#3D4E57", // secondary text
                    bg:           "#FFFFFF",   // page background
                    "bg-off":     "#F9F9F9",   // slight off-white for sections (updated value)
                    "bg-card":    "#FFFFFF",   // card fill
                    paper:        "#FFF9E5",   // Tom de papel quente
                    "paper-cool": "#F8F9FA",   // Tom de papel frio
                    green:        "#4ADE80",   // Verde vívido para status
                    pink:         "#F472B6",   // Rosa vívido
                    blue:         "#60A5FA",   // Azul vívido
                },

                // ── Pastel & Paper (Used in Crayon Style) ────────────────
                pastel: {
                    blue:   "#AECBFA",
                    yellow: "#FFF4B4",
                    green:  "#C6F6D5",
                    pink:   "#FFD1DC",
                },
                paper: "#FFFEFA",

                // ── Semantic aliases (keep compatibility) ────────────────
                background: {
                    DEFAULT:  "#FFFFFF",
                    surface:  "#F7F9F8",
                    elevated: "#FFFFFF",
                },
                primary: {
                    DEFAULT: "#26C2B9",
                    hover:   "#1DA8A0",
                },
                // Legacy cyan alias → maps to sketch-teal
                cyan: {
                    DEFAULT: "#26C2B9",
                    dimmer:  "#1DA8A0",
                    glow:    "rgba(38,194,185,0.35)",
                    subtle:  "rgba(38,194,185,0.12)",
                },
                border: {
                    DEFAULT: "rgba(34,43,49,0.15)",
                    hover:   "rgba(34,43,49,0.30)",
                },
                text: {
                    primary:   "#222B31",
                    secondary: "#3D4E57",
                    muted:     "#6B818C",
                },
                // dark code/log area stays dark
                "surface-dark": "#1A2029",
                "background-dark": "#0F151C",
                slate: {
                    50:  "#F8FAFC",
                    100: "#F1F5F9",
                    200: "#E2E8F0",
                    300: "#CBD5E1",
                    400: "#94A3B8",
                    500: "#64748B",
                    600: "#475569",
                    700: "#334155",
                    800: "#1E293B",
                    900: "#0F172A",
                },
            },
            animation: {
                'fade-in':    'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-up':    'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float':      'float 5s ease-in-out infinite',
                'wiggle':     'wiggle 0.4s ease-in-out',
                'wiggle-loop':'wiggleLoop 2.5s ease-in-out infinite',
                'doodle':     'doodleAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                'bounce-soft':'bounceSoft 1.8s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%':   { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeUp: {
                    '0%':   { opacity: '0', transform: 'translateY(12px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(-1deg)' },
                    '50%':      { transform: 'translateY(-8px) rotate(1deg)' },
                },
                wiggle: {
                    '0%,100%': { transform: 'rotate(0deg)' },
                    '25%':     { transform: 'rotate(-4deg)' },
                    '75%':     { transform: 'rotate(4deg)' },
                },
                wiggleLoop: {
                    '0%,100%': { transform: 'rotate(-1deg) scale(1)' },
                    '50%':     { transform: 'rotate(1deg) scale(1.03)' },
                },
                doodleAppear: {
                    '0%':   { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
                    '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
                },
                bounceSoft: {
                    '0%,100%': { transform: 'translateY(0)' },
                    '50%':     { transform: 'translateY(-5px)' },
                },
            },
            boxShadow: {
                'sketch': '3px 3px 0px 0px #222B31',
                'sketch-teal': '3px 3px 0px 0px #26C2B9',
                'sketch-yellow': '3px 3px 0px 0px #F9E05E',
                'sketch-lg': '5px 5px 0px 0px #222B31',
                'sketch-hover': '5px 5px 0px 0px #222B31, inset 0 0 0 2px #222B31',
            },
        }
    },
    plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")({ strategy: 'class' })],
}
export default config;
