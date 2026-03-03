"use client";

import { usePathname } from "next/navigation";
import { Grid, Network } from "lucide-react";

export function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-background-dark sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-primary/10">
                    <Grid className="text-primary w-6 h-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight">deepH Plus</h1>
                <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-bold border border-primary/30 mt-0.5">v4.0</span>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:block">
                    <h2 className="text-xs font-bold tracking-tight text-slate-100 text-right">System Active</h2>
                    <p className="text-[9px] uppercase tracking-widest text-primary/70 font-medium">Neural Core Online</p>
                </div>
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary emerald-glow"></span>
                </div>
            </div>
        </header>
    );
}
