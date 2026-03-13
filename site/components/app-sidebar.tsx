"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, MessageSquare, Settings, Plus, BookOpen, Play, Users, Wrench, LayoutGrid, Box } from "lucide-react";
import { LibraryModal } from "./library-modal";
import { useState } from "react";

export function AppSidebar() {
    const pathname = usePathname();
    const [libraryOpen, setLibraryOpen] = useState(false);

    const navItems = [
        { href: "/",       icon: Zap,          label: "Dashboard" },
        { href: "/standard-library", icon: Box, label: "Standard Library" },
        { href: "/chat",   icon: MessageSquare, label: "Chat" },
        { href: "/run",    icon: Play,          label: "Modo Equipe" },
        { href: "/crews",  icon: Users,         label: "Times" },
        { href: "/skills", icon: Wrench,        label: "Skills" },
        { href: "/config", icon: Settings,      label: "Settings" },
        { href: "/help",   icon: BookOpen,      label: "Help Guide" },
    ];

    return (
        <aside className="w-20 md:w-24 flex flex-col items-center py-5 gap-4 bg-sketch-paper-warm relative"
               style={{ borderRight: '2.5px solid #222B31', boxShadow: 'inset -2px 0 10px rgba(0,0,0,0.05)' }}>

            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                    <Link href={item.href} key={item.href} title={item.label}>
                        {isActive ? (
                            /* ACTIVE: filled teal circle */
                            <div className="sketch-nav-active cursor-pointer bg-sketch-teal-dark border-2 border-sketch-charcoal shadow-[2px_2px_0_0_rgba(34,43,49,1)]" title={item.label}>
                                <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                        ) : (
                            /* INACTIVE: yellow-pale bg with charcoal icon */
                            <div className="sketch-nav-inactive cursor-pointer" title={item.label}>
                                <Icon className="w-5 h-5" style={{ strokeWidth: 2 }} />
                            </div>
                        )}
                    </Link>
                );
            })}

            <LibraryModal open={libraryOpen} onOpenChange={setLibraryOpen} />

            {/* New Agent button — charcoal dashed ring */}
            <div className="mt-auto pb-2">
                <Link href="/agents/new" title="Novo Agente">
                    <button
                        className="flex items-center justify-center w-12 h-12 transition-all duration-200 group"
                        style={{
                            background: 'transparent',
                            border: '2.5px dashed #222B31',
                            borderRadius: '50% 46% 54% 48% / 48% 54% 46% 52%',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#F9E05E';
                            (e.currentTarget as HTMLElement).style.border = '2.5px solid #222B31';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                            (e.currentTarget as HTMLElement).style.border = '2.5px dashed #222B31';
                        }}
                    >
                        <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
                              style={{ color: '#222B31', strokeWidth: 2.5 }} />
                    </button>
                </Link>
            </div>

            {/* Sketch side border accent — wavy teal line */}
            <div className="absolute right-0 top-0 h-full overflow-hidden pointer-events-none" style={{ width: '3px' }}>
                <svg width="3" height="100%" viewBox="0 0 3 800" preserveAspectRatio="none">
                    <path d="M1.5 0 Q3 20 1.5 40 Q0 60 1.5 80 Q3 100 1.5 120 Q0 140 1.5 160 Q3 180 1.5 200 Q0 220 1.5 240 Q3 260 1.5 280 Q0 300 1.5 320 Q3 340 1.5 360 Q0 380 1.5 400 Q3 420 1.5 440 Q0 460 1.5 480 Q3 500 1.5 520 Q0 540 1.5 560 Q3 580 1.5 600 Q0 620 1.5 640 Q3 660 1.5 680 Q0 700 1.5 720 Q3 740 1.5 760 Q0 780 1.5 800"
                          stroke="var(--sketch-teal-dark)" strokeWidth="2" fill="none" opacity="0.4" />
                </svg>
            </div>
        </aside>
    );
}
