"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookOpen, Cpu, ShieldCheck, Zap, ChevronUp } from "lucide-react";

// ============================================================
// O TEXTO DO TUTORIAL É CARREGADO DIRETAMENTE DO ARQUIVO .TXT
// via fetch no client. Isso preserva CADA palavra, espaço
// e caractere exatamente como está no arquivo original.
// ============================================================

export default function HelpPage() {
    const [tutorialText, setTutorialText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const preRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        fetch("/tutorial_deepH.txt")
            .then((res) => {
                if (!res.ok) throw new Error("Arquivo não encontrado");
                return res.text();
            })
            .then((text) => {
                setTutorialText(text);
                setLoading(false);
            })
            .catch(() => {
                setTutorialText("Erro ao carregar o tutorial. Verifique se o arquivo tutorial_deepH.txt está na pasta public/.");
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 mt-4">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold">
                        Guia Oficial deepH Plus
                    </h1>
                    <p className="text-primary mt-1 font-medium tracking-wide">
                        Versão 4.0 — Emerald Engine
                    </p>
                </div>
            </div>

            {/* Privacy notice */}
            <div className="p-4 rounded-lg bg-[#0ff092]/10 border border-[#0ff092]/30 text-[#0ff092] text-sm flex gap-3 mb-8">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div>
                    <strong className="font-bold">PRIVACIDADE EM PRIMEIRO LUGAR:</strong>{" "}
                    Toda a execução do deepH Plus ocorre{" "}
                    <strong>100% no seu computador</strong>. Seus agentes e
                    segredos nunca saem da sua máquina.
                </div>
            </div>

            {/* Tutorial text — LITERAL, word for word */}
            <div className="glass-card rounded-2xl border border-primary/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-primary/10 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Tutorial Completo — Guia para Iniciantes
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64 text-primary animate-pulse">
                        Carregando tutorial...
                    </div>
                ) : (
                    <pre
                        ref={preRef}
                        className="p-6 md:p-8 text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words font-mono overflow-x-auto"
                        style={{ fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }}
                    >
                        {tutorialText}
                    </pre>
                )}
            </div>

            {/* Footer */}
            <footer className="pt-16 pb-8 border-t border-primary/5 flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center gap-2 text-primary/40">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                        Built with deepH Plus Engine
                    </span>
                </div>
                <p className="text-muted-foreground italic text-sm text-center">
                    &quot;Seus agentes, suas regras, seu computador.&quot; — v4.0
                </p>
            </footer>

            {/* Scroll to top button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/30 transition-all z-50"
                    aria-label="Voltar ao topo"
                >
                    <ChevronUp className="w-5 h-5" />
                </button>
            )}
        </div>
    );
}
