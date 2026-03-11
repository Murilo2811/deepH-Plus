"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, MessageSquare, Settings, Plus, BookOpen, Play, Users, Wrench } from "lucide-react";

export function AppSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: Zap, label: "Dashboard" },
        { href: "/chat", icon: MessageSquare, label: "Chat" },
        { href: "/run", icon: Play, label: "Modo Equipe" },
        { href: "/crews", icon: Users, label: "Times" },
        { href: "/skills", icon: Wrench, label: "Skills" },
        { href: "/config", icon: Settings, label: "Settings" },
        { href: "/help", icon: BookOpen, label: "Help Guide" },
    ];

    return (
        <aside className="w-20 md:w-24 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-background-surface/50 backdrop-blur-xl relative z-40">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (isActive) {
                    return (
                        <Link href={item.href} key={item.href} title={item.label}>
                            <div className="relative group cursor-pointer">
                                {/* Active State Background Glow */}
                                <div className="absolute inset-0 bg-cyan/20 blur-xl rounded-xl"></div>
                                
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan/20 to-cyan/5 border border-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.15)] interactive-glow">
                                    <Icon className="w-6 h-6 text-cyan" />
                                </div>
                                
                                {/* Active Indicator Dot */}
                                <div className="absolute -right-1 -top-1 w-3 h-3 bg-cyan rounded-full border-2 border-background-dark shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
                            </div>
                        </Link>
                    );
                }

                return (
                    <Link href={item.href} key={item.href} title={item.label}>
                        <div className="relative w-12 h-12 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-300 flex items-center justify-center cursor-pointer group">
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 blur-md rounded-xl transition-opacity duration-300"></div>
                            <Icon className="relative w-6 h-6 text-slate-400 group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform" />
                        </div>
                    </Link>
                )
            })}

            <div className="mt-auto">
                <Link href="/agents/new" title="New Agent">
                    <button className="relative w-12 h-12 rounded-xl border border-dashed border-cyan/30 flex items-center justify-center bg-cyan/5 hover:bg-cyan/10 hover:border-cyan/50 transition-all duration-300 group overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-cyan/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <Plus className="relative w-6 h-6 text-cyan/70 group-hover:text-cyan transition-colors" />
                    </button>
                </Link>
            </div>
            
            {/* Sidebar Right Border Gradient */}
            <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        </aside>
    );
}
