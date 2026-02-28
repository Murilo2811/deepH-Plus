"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Settings, Bot, Plus, Zap } from "lucide-react";

const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/chat", icon: MessageSquare, label: "Chat" },
    { href: "/agents/new", icon: Plus, label: "Novo Agente" },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 flex flex-col h-full sticky top-0 border-r border-white/[0.06] bg-[#080a0b]">
            {/* Logo */}
            <div className="px-5 pt-6 pb-4">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                        <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <span className="font-semibold text-zinc-50 text-lg tracking-tight">deepH</span>
                        <div className="text-[10px] text-zinc-500 font-mono -mt-0.5">v1.0 • local</div>
                    </div>
                </Link>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-white/[0.05] mb-4" />

            {/* Menu section label */}
            <div className="px-5 mb-2">
                <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Menu</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5">
                {navItems.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]"
                                }`}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive
                                    ? "bg-emerald-500/15 text-emerald-400"
                                    : "text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/[0.06]"
                                }`}>
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            {label}
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom — Settings */}
            <div className="p-3 border-t border-white/[0.05]">
                <Link
                    href="/config"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group ${pathname === "/config"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
                        }`}
                >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 group-hover:bg-white/[0.06] transition-all">
                        <Settings className="w-3.5 h-3.5" />
                    </div>
                    Configurações
                </Link>

                {/* Status indicator */}
                <div className="mt-3 mx-1 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-zinc-500">Servidor ativo</span>
                </div>
            </div>
        </aside>
    );
}
