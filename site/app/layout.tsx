import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "deepH Plus — Local AI Agent Runtime",
  description: "Painel de controle local do ecossistema deepH Plus (v4.0)",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="bg-background-dark text-slate-100 min-h-screen flex flex-col font-display antialiased">
        <AppHeader />

        <main className="flex flex-1 overflow-hidden">
          <AppSidebar />

          <section className="flex-1 flex flex-col relative bg-background-dark overflow-y-auto">
            {/* Decorative Gradient Background Element based on stitched html */}
            <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
              <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[100px] rounded-full"></div>
            </div>

            <div className="animate-in w-full h-full">
              {children}
            </div>
          </section>
        </main>

      </body>
    </html>
  );
}
