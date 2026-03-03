"use client";

import React, { useState, useEffect } from "react";
import {
    BookOpen,
    Terminal,
    Key,
    Component,
    Shapes,
    Settings2,
    LayoutTemplate,
    MessageSquare,
    PlusSquare,
    Network,
    ShieldCheck,
    Database,
    Zap,
    Book,
    Cpu,
    Stethoscope,
    HelpCircle,
    Info,
    AlertTriangle
} from "lucide-react";

export default function HelpPage() {
    const [activeSection, setActiveSection] = useState("intro");

    const sections = [
        { id: "intro", title: "Parte 0 — O que é o deepH Plus?", icon: Info },
        { id: "install", title: "Parte 1 — Instalação", icon: Terminal },
        { id: "open", title: "Parte 2 — Abrindo o Painel", icon: LayoutTemplate },
        { id: "layout", title: "Parte 3 — Conhecendo o Layout", icon: Component },
        { id: "api", title: "Parte 4 — Configurando API", icon: Key },
        { id: "dashboard", title: "Parte 5 — O Dashboard", icon: Shapes },
        { id: "chat", title: "Parte 6 — Conversando no Chat", icon: MessageSquare },
        { id: "agents", title: "Parte 7 — Criando Agentes", icon: PlusSquare },
        { id: "crews", title: "Parte 8 — Esquadrões (Crews)", icon: Network },
        { id: "coach", title: "Parte 9 — O Coach", icon: Stethoscope },
        { id: "terminal", title: "Parte 10 — Modo Terminal", icon: Terminal },
        { id: "providers", title: "Parte 11 — Provedores de IA", icon: Database },
        { id: "troubleshoot", title: "Parte 12 — Solução de Problemas", icon: HelpCircle },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            window.scrollTo({ top: element.offsetTop - 80, behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mx-auto p-6 md:p-8 mt-4">

            {/* Sidebar Navigation */}
            <aside className="hidden md:block w-72 shrink-0">
                <div className="sticky top-24 glass-card p-4 rounded-xl border border-primary/10">
                    <h3 className="font-display font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Tutorial v4.0
                    </h3>
                    <nav className="flex flex-col gap-1">
                        {sections.map((s) => {
                            const Icon = s.icon;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => scrollTo(s.id)}
                                    className={`flex items-center gap-3 text-left w-full px-3 py-2 rounded-lg text-sm transition-all ${activeSection === s.id
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-surface-dark"
                                        }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{s.title}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 max-w-3xl space-y-12 pb-32">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Cpu className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-100">Guia Oficial deepH Plus</h1>
                        <p className="text-primary mt-1 font-medium tracking-wide">Versão 4.0 — Emerald Engine</p>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0ff092]/10 border border-[#0ff092]/30 text-[#0ff092] text-sm flex gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <div>
                        <strong className="font-bold">PRIVACIDADE EM PRIMEIRO LUGAR:</strong> Toda a execução do deepH Plus ocorre <strong>100% no seu computador</strong>. Seus agentes e segredos nunca saem da sua máquina.
                    </div>
                </div>

                {/* Section 0 */}
                <section id="intro" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">0.</span> O que é o deepH Plus?
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        O deepH Plus é o seu <strong>Escritório Pessoal de IA</strong>. Ele transforma modelos de linguagem em assistentes úteis que pertencem a você.
                    </p>
                    <div className="glass-card p-5 rounded-xl border border-primary/5">
                        <h4 className="font-bold text-slate-200 mb-2">Conceito de Agente:</h4>
                        <p className="text-slate-400 text-sm">
                            Um agente é um assistente virtual com <strong>personalidade, ferramentas e memória</strong> configuradas por você para tarefas específicas.
                        </p>
                    </div>
                </section>

                {/* Section 1 */}
                <section id="install" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">1.</span> Instalação e Pastas
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Sistema portátil em Go. Pasta raiz recomendada: <code className="text-primary bg-primary/10 px-1 rounded">C:\Users\BOSS\deepH</code>.
                    </p>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-1">
                        <div><span className="text-primary">agents/</span> → Configurações dos seus assistentes</div>
                        <div><span className="text-primary">crews/</span> → Definições de equipes (Crews)</div>
                        <div><span className="text-primary">skills/</span> → Habilidades instaladas</div>
                    </div>
                </section>

                {/* Section 2 */}
                <section id="open" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">2.</span> Abrindo o Painel Visual
                    </h2>
                    <div className="flex flex-col gap-4">
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-slate-200 font-bold mb-2">Dê duplo clique em:</p>
                            <code className="text-primary text-xl font-bold">start_ui.bat</code>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Isso iniciará o motor backend e abrirá seu navegador em <code className="text-primary">http://localhost:7730</code>.
                        </p>
                    </div>
                </section>

                {/* Section 3 */}
                <section id="layout" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">3.</span> Design Emerald Green
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        A interface foi desenhada para alta produtividade com estética premium. Use a barra lateral para alternar entre <strong>Dashboard, Esquadrões e Chat</strong>.
                    </p>
                </section>

                {/* Section 4 */}
                <section id="api" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">4.</span> Configurando Chaves de API
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Acesse <strong>Configurações</strong> e insira suas chaves (DeepSeek, OpenAI, etc). O sistema utiliza estas chaves para se comunicar com os "cérebros" da IA.
                    </p>
                </section>

                {/* Section 5 */}
                <section id="dashboard" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">5.</span> O Dashboard
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Visualize todos os seus agentes ativos. Você pode iniciar conversas, editar configurações ou gerenciar o estado de cada assistente.
                    </p>
                </section>

                {/* Section 6 */}
                <section id="chat" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">6.</span> Chat em Tempo Real
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Experiência de chat rica com suporte a **Context Management**. O sistema lembra inteligentemente das partes cruciais da conversa para manter a eficiência.
                    </p>
                </section>

                {/* Section 7 */}
                <section id="agents" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">7.</span> Criando Agentes
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Personalize seus agentes. Defina o <strong>System Prompt</strong> para moldar o comportamento e escolha quais <strong>Skills</strong> (habilidades) eles terão acesso.
                    </p>
                </section>

                {/* Section 8 */}
                <section id="crews" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">8.</span> Esquadrões (Crews)
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Orquestre múltiplos agentes em equipe. Use o comando <code className="text-primary">run</code> com:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 marker:text-primary">
                        <li><strong className="text-primary">+</strong> para execução em paralelo.</li>
                        <li><strong className="text-primary">&gt;</strong> para execução sequencial (pipeline).</li>
                    </ul>
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mt-2">
                        <p className="text-xs text-primary uppercase font-bold mb-1">Exemplo real:</p>
                        <code className="text-sm text-slate-200 font-mono">
                            deeph run "planner+researcher&gt;writer" "Desenvolva um artigo"
                        </code>
                    </div>
                </section>

                {/* Section 9 */}
                <section id="coach" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">9.</span> O Coach IA
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        A IA "Coach" monitora suas execuções e oferece sugestões automáticas de melhoria e otimização de custos/tokens diretamente no dashboard.
                    </p>
                </section>

                {/* Section 10 */}
                <section id="terminal" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">10.</span> Execução via Terminal
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Comandos poderosos para orquestração avançada:
                    </p>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-1">
                        <div>.\deeph.exe run "agent" "task"</div>
                        <div>.\deeph.exe crew list</div>
                        <div>.\deeph.exe type explain code/go</div>
                    </div>
                </section>

                {/* Section 11 */}
                <section id="providers" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">11.</span> Provedores Suportados
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {["DeepSeek", "OpenAI", "Anthropic", "Ollama", "Groq"].map(p => (
                            <div key={p} className="glass-card py-3 px-1 rounded-lg text-center text-xs font-bold text-primary border border-primary/10">
                                {p}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 12 */}
                <section id="troubleshoot" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">12.</span> Solução de Problemas
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                            <h4 className="font-bold text-slate-200">Localhost não carrega?</h4>
                            <p className="text-sm text-slate-400">Verifique se o terminal está rodando o motor Go. Se estiver fechado, a UI não funciona.</p>
                        </div>
                        <div className="p-4 rounded-xl border border-white/5 bg-white/5">
                            <h4 className="font-bold text-slate-200">Timeout na resposta?</h4>
                            <p className="text-sm text-slate-400">Pode ser instabilidade no provedor ou API Key incorreta. Verifique o saldo no provedor escolhido.</p>
                        </div>
                    </div>
                </section>

                <footer className="pt-16 pb-8 border-t border-primary/5 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-primary/40">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Built with deepH Plus Engine</span>
                    </div>
                    <p className="text-slate-500 italic text-sm text-center">
                        "Seus agentes, suas regras, seu computador." — v4.0
                    </p>
                </footer>

            </main>
        </div>
    );
}
