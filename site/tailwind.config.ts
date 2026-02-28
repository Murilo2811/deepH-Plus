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
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
                lg: '0.25rem', // Sharp geometry as per frontend-specialist
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                brand: {
                    DEFAULT: '#10b981', // Emerald
                    hover: '#059669',
                    light: '#34d399',
                    subtle: 'rgba(16, 185, 129, 0.15)',
                },
                neutral: {
                    bg1: 'hsl(240, 6%, 4%)', // Extremely dark/cool
                    bg2: 'hsl(240, 6%, 7%)',
                    bg3: 'hsl(240, 5%, 10%)',
                    bg4: 'hsl(240, 5%, 14%)',
                    bg5: 'hsl(240, 4%, 18%)',
                    bg6: 'hsl(240, 4%, 22%)',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#A1A1AA',
                    muted: '#71717A',
                },
                status: {
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: {
                    subtle: 'hsla(0, 0%, 100%, 0.04)',
                    DEFAULT: 'hsla(0, 0%, 100%, 0.08)',
                    strong: 'hsla(0, 0%, 100%, 0.15)',
                },
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideDown: {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        }
    },
    plugins: [require("tailwindcss-animate")],
}
export default config;
