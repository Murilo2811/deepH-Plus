"use client";

"use client";

import { usePathname } from "next/navigation";
import { Grid } from "lucide-react";

export function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-background-surface/80 backdrop-blur-xl sticky top-0 z-50">
            {/* Logo and Brand Section */}
            <div className="flex items-center gap-4">
                <div className="relative group">
                    <div className="absolute inset-0 bg-cyan/20 blur-xl rounded-full group-hover:bg-cyan/40 transition-colors duration-500"></div>
                    <div className="relative p-2.5 rounded-xl bg-background-elevated border border-white/10 flex items-center justify-center interactive-glow">
                        <Grid className="text-cyan w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-display font-bold tracking-tight text-white flex items-center gap-2">
                        deepH Plus
                        <span className="text-[10px] bg-cyan/10 text-cyan px-2 py-0.5 rounded-full font-mono font-medium border border-cyan/20 uppercase tracking-widest hidden sm:inline-block">
                            v5.0
                        </span>
                    </h1>
                </div>
            </div>

            {/* System Status Section */}
            <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end">
                    <h2 className="text-xs font-semibold tracking-wide text-white">System Active</h2>
                    <p className="text-[10px] uppercase tracking-widest text-cyan/70 font-mono mt-0.5">Neural Core Online</p>
                </div>
                <div className="relative flex items-center justify-center h-8 w-8 rounded-full bg-cyan/5 border border-cyan/20">
                    <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-cyan/20"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
                </div>
            </div>
            
            {/* Animated Bottom Border */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-cyan to-transparent opacity-50 absolute left-0 animate-[shimmer_3s_infinite]"></div>
            </div>
        </header>
    );
}
