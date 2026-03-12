import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "deepH Plus — Hub",
  description: "Plataforma de Agentes de IA e Orquestração Inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-white text-sketch-charcoal min-h-screen flex flex-col font-sans antialiased">

        {/* Hidden SVG filter for crayon texture effect */}
        <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
          <defs>
            <filter id="crayon-texture" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>

        {/* Subtle doodle background decorations (fixed, behind everything) */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* teal blob top-right */}
          <div className="absolute top-[-5%] right-[-5%] w-64 h-64 rounded-full opacity-[0.06]"
               style={{ background: '#26C2B9', filter: 'blur(40px)' }} />
          {/* yellow blob bottom-left */}
          <div className="absolute bottom-[-5%] left-[-3%] w-72 h-72 rounded-full opacity-[0.08]"
               style={{ background: '#F9E05E', filter: 'blur(50px)' }} />
          {/* floating doodle circles */}
          <svg className="absolute top-[15%] right-[8%] w-6 h-6 opacity-20 doodle-float" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#26C2B9" strokeWidth="2.5" strokeDasharray="3 2" />
          </svg>
          <svg className="absolute top-[40%] left-[4%] w-4 h-4 opacity-15 doodle-float" style={{ animationDelay: '1.2s' }} viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" fill="#F9E05E" stroke="#222B31" strokeWidth="2" />
          </svg>
          <svg className="absolute bottom-[20%] right-[5%] w-5 h-5 opacity-20 doodle-float" style={{ animationDelay: '2.5s' }} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" fill="#26C2B9" />
          </svg>
          {/* scribble lines */}
          <svg className="absolute top-[60%] left-[12%] opacity-10 doodle-float" style={{ animationDelay: '0.8s' }} width="48" height="12" viewBox="0 0 48 12" fill="none">
            <path d="M2 6 Q12 2 22 6 Q32 10 42 6" stroke="#F9E05E" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <svg className="absolute top-[25%] left-[80%] opacity-10 doodle-float" style={{ animationDelay: '3s' }} width="36" height="10" viewBox="0 0 36 10" fill="none">
            <path d="M2 5 Q9 2 18 5 Q27 8 34 5" stroke="#26C2B9" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <AppHeader />

        <main className="flex flex-1 overflow-hidden">
          <AppSidebar />

          <section className="flex-1 flex flex-col overflow-y-auto">
            <div className="animate-fade-in w-full h-full">
              {children}
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
