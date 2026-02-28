import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "deepH — Local AI Agent Runtime",
  description: "Painel de controle local do deepH AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen text-zinc-50 flex overflow-hidden antialiased" style={{ backgroundColor: '#080a0b', fontFamily: "'Inter', system-ui, sans-serif" }}>
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }} />
        </div>

        <AppSidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
