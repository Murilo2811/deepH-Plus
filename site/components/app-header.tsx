"use client";

import { usePathname } from "next/navigation";

export function AppHeader() {
    const pathname = usePathname();

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-white sticky top-0 z-50 relative" style={{
            borderBottom: '2.5px solid #222B31',
        }}>
            {/* Logo Section */}
            <div className="flex items-center gap-3">
                {/* Sketch circle logo */}
                <div className="relative flex-shrink-0" style={{ animation: 'wiggleLoop 3s ease-in-out infinite' }}>
                    <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
                        {/* outer ring charcoal */}
                        <circle cx="19" cy="19" r="17" stroke="#222B31" strokeWidth="2.5"
                            strokeDasharray="4 1.5" transform="rotate(-8 19 19)" />
                        {/* filled teal circle */}
                        <circle cx="19" cy="19" r="12" fill="#26C2B9" stroke="#222B31" strokeWidth="2" />
                        {/* inner spark */}
                        <circle cx="19" cy="19" r="5" fill="#FFF9C4" />
                    </svg>
                </div>

                <div>
                    <h1 className="text-lg font-bold tracking-tight leading-tight text-sketch-charcoal font-display uppercase">
                        deepH
                        <span className="ml-1.5 font-extrabold text-sketch-teal-dark">Plus</span>
                    </h1>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: '#3D4E57' }}>
                        v5.0 · Agent Hub
                    </span>
                </div>
            </div>

            {/* Right: Status indicator */}
            <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-semibold text-sketch-charcoal">Sistema Ativo</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-sketch-teal-dark">Neural Core Online</span>
                </div>

                {/* Sketch status dot */}
                <div className="relative">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="13" fill="#FFF9C4" stroke="#222B31" strokeWidth="2.5"
                            strokeDasharray="3 1" transform="rotate(10 16 16)" />
                        <circle cx="16" cy="16" r="6" fill="var(--sketch-teal-dark)" stroke="var(--sketch-charcoal)" strokeWidth="2">
                            <animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>
            </div>

            {/* Bottom sketch border wavy */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none" style={{ height: '3px' }}>
                <svg width="100%" height="3" viewBox="0 0 1000 3" preserveAspectRatio="none">
                    <path d="M0 1.5 Q50 0 100 1.5 Q150 3 200 1.5 Q250 0 300 1.5 Q350 3 400 1.5 Q450 0 500 1.5 Q550 3 600 1.5 Q650 0 700 1.5 Q750 3 800 1.5 Q850 0 900 1.5 Q950 3 1000 1.5"
                          stroke="#26C2B9" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
                </svg>
            </div>
        </header>
    );
}
