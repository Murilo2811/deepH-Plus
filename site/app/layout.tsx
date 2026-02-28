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
      <body className="min-h-screen text-text-primary flex overflow-hidden antialiased bg-neutral-bg1">

        {/* Ambient glow minimalista */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-[20%] w-[600px] h-[300px] rounded-full opacity-[0.03] bg-brand blur-3xl" />
        </div>

        <AppSidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          <AppHeader />
          <main className="flex-1 overflow-y-auto w-full relative">
            <div className="max-w-6xl mx-auto w-full px-6 py-8 md:px-10 md:py-12">
              <div className="animate-in">
                {children}
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
