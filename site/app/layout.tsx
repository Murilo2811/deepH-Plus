import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export const metadata: Metadata = {
  title: "deepH Plus — Hub",
  description: "Next Generation Data Intelligence and Agent Runtime Dashboard",
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
      <body suppressHydrationWarning className="bg-background text-text-primary min-h-screen flex flex-col font-sans antialiased bg-grid-pattern relative">
        <AppHeader />

        <main className="flex flex-1 overflow-hidden relative z-10">
          <AppSidebar />

          <section className="flex-1 flex flex-col relative bg-background/50 backdrop-blur-[2px] overflow-y-auto">
            {/* Immersive Ambient Glow Background */}
            <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan/5 blur-[120px] rounded-full opacity-60"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan/5 blur-[140px] rounded-full opacity-40"></div>
            </div>

            <div className="animate-fade-in w-full h-full">
              {children}
            </div>
          </section>
        </main>

      </body>
    </html>
  );
}
