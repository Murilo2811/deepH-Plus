import { ReactNode } from "react";
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: ReactNode;
    trend?: "up" | "down" | "stable";
}

export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-background-surface/30 backdrop-blur-md p-5 transition-all duration-300 hover:border-cyan/30 hover:bg-background-surface/50">
            {/* Background Glow */}
            <div className="absolute -inset-10 bg-cyan/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Subtle Scanning Grid Line */}
            <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent -translate-y-full group-hover:animate-[scan_3s_ease-in-out_infinite]"></div>

            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <h3 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 font-display">
                            {value}
                        </span>
                        {subtitle && (
                            <span className="text-[10px] text-cyan font-semibold tracking-wider uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                                {subtitle}
                            </span>
                        )}
                    </div>
                </div>
                {icon && (
                    <div className="w-10 h-10 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shadow-[0_0_15px_rgba(0,240,255,0.1)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300">
                        {icon}
                    </div>
                )}
            </div>

            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan/40 to-fuchsia-500/40 group-hover:w-full transition-all duration-700 ease-out"></div>
        </div>
    );
}
