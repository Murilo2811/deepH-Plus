"use client";

import { usePathname } from "next/navigation";

const pageNames: Record<string, string> = {
    "/": "Dashboard",
    "/chat": "Chat",
    "/config": "Configurações",
    "/agents/new": "Novo Agente",
    "/agents/edit": "Editar Agente",
};

export function AppHeader() {
    const pathname = usePathname();
    const title = pageNames[pathname] ?? "deepH";

    return (
        <header className="h-14 border-b border-white/[0.05] bg-[#080a0b]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-4 rounded-full bg-emerald-500 opacity-80" />
                    <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-xs text-zinc-600 font-mono hidden sm:block">
                    localhost:7730
                </div>
                <div className="h-4 w-px bg-white/[0.08]" />
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] cursor-pointer hover:border-white/[0.12] transition-all">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[9px] font-bold text-emerald-950">
                        U
                    </div>
                    <span className="text-xs text-zinc-400 font-medium">Usuário</span>
                </div>
            </div>
        </header>
    );
}
