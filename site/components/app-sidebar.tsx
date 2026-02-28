"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Bot, MessageSquare, Settings, Plus } from "lucide-react";

export function AppSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", icon: Zap, label: "Dashboard" },
        { href: "/chat", icon: MessageSquare, label: "Chat" },
        { href: "/config", icon: Settings, label: "Settings" },
    ];

    return (
        <aside className="w-20 md:w-24 border-r border-primary/10 flex flex-col items-center py-6 gap-6 bg-background-dark/50">
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (isActive) {
                    return (
                        <Link href={item.href} key={item.href} title={item.label}>
                            <div className="relative group cursor-pointer">
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(15,240,146,0.3)]">
                                    <Icon className="w-6 h-6 text-background-dark font-bold" />
                                </div>
                                <div className="absolute -right-1 -top-1 w-3 h-3 bg-primary rounded-full border-2 border-background-dark"></div>
                            </div>
                        </Link>
                    );
                }

                return (
                    <Link href={item.href} key={item.href} title={item.label}>
                        <div className="w-12 h-12 rounded-xl border border-primary/10 hover:border-primary/50 transition-all flex items-center justify-center cursor-pointer group">
                            <Icon className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                )
            })}

            <div className="mt-auto">
                <Link href="/agents/new" title="New Agent">
                    <button className="w-12 h-12 rounded-xl border border-dashed border-primary/30 flex items-center justify-center hover:bg-primary/5 transition-colors group">
                        <Plus className="w-6 h-6 text-primary/60 group-hover:text-primary" />
                    </button>
                </Link>
            </div>
        </aside>
    );
}
