"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Terminal, Key, Component, Shapes, Settings2, LayoutTemplate, MessageSquare, PlusSquare, Network, HeartHandshake, AlertTriangle, ShieldCheck, Database, Zap, Book } from "lucide-react";

export default function HelpPage() {
    const [activeSection, setActiveSection] = useState("intro");

    const sections = [
        { id: "intro", title: "Parte 0 — O que é o deepH Plus?", icon: BookOpen },
        { id: "install", title: "Parte 1 — Instalação", icon: Terminal },
        { id: "open", title: "Parte 2 — Abrindo o Painel", icon: LayoutTemplate },
        { id: "layout", title: "Parte 3 — Conhecendo o Layout", icon: Component },
        { id: "api", title: "Parte 4 — Configurando API", icon: Key },
        { id: "dashboard", title: "Parte 5 — O Dashboard", icon: Shapes },
        { id: "chat", title: "Parte 6 — Conversando no Chat", icon: MessageSquare },
        { id: "agents", title: "Parte 7 — Criando Agentes", icon: PlusSquare },
        { id: "terminal", title: "Parte 8 — Modo Terminal", icon: Terminal },
        { id: "providers", title: "Parte 9 — Provedores de IA", icon: Database },
        { id: "troubleshoot", title: "Parte 10 — Solução de Problemas", icon: AlertTriangle },
        { id: "multi-agent", title: "Parte 11 — Múltiplos Agentes", icon: Network },
        { id: "kits", title: "Parte 12 — Usando Kits", icon: Settings2 },
        { id: "glossary", title: "Glossário e Dicas", icon: Book },
    ];

    // Simple scroll spy logic
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
                        Índice do Tutorial
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
                        <BookOpen className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-100">Guia Completo — deepH</h1>
                        <p className="text-primary mt-1 font-medium tracking-wide">Versão 4.0 — Interface Visual Premium</p>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0ff092]/10 border border-[#0ff092]/30 text-[#0ff092] text-sm flex gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <div>
                        <strong className="font-bold">ANTES DE COMEÇAR:</strong> Este tutorial foi escrito para QUALQUER pessoa.
                        Explicaremos tudo passo a passo. Não se preocupe se nunca usou IA antes. Toda a execução do deepH Plus ocorre <strong>100% no seu computador</strong>.
                    </div>
                </div>

                {/* Section 0 */}
                <section id="intro" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">0.</span> O que é o deepH Plus?
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        O deepH Plus é o seu <strong>ESCRITÓRIO PESSOAL DE ASSISTENTES DE IA</strong>, instalado diretamente no seu computador. Tudo roda localmente, sem enviar seus dados para nenhum servidor externo.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        Imagine que você contratou vários "funcionários virtuais especializados". Cada um tem nome, personalidade e habilidades definidas por você. Cada um desses é chamado de <strong>AGENTE</strong>.
                    </p>
                    <div className="glass-card p-5 rounded-xl border border-primary/5">
                        <h4 className="font-bold text-slate-200 mb-2">Exemplos de Agentes que você pode ter:</h4>
                        <ul className="list-disc list-inside text-slate-300 ml-4 space-y-1 marker:text-primary">
                            <li>Um <strong>Consultor Financeiro</strong> para análise de investimentos</li>
                            <li>Um <strong>Redator</strong> para escrever textos e e-mails</li>
                            <li>Um <strong>Programador</strong> para ajudar com código</li>
                            <li>Um <strong>Pesquisador</strong> para buscar informações</li>
                        </ul>
                    </div>
                </section>

                {/* Section 1 */}
                <section id="install" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">1.</span> Instalação e Pré-Requisitos
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Você NÃO precisa instalar nada especial. O deepH Plus é um arquivo único executável (<code className="text-primary bg-primary/10 px-1 rounded">.exe</code>) em Go, que já carrega o painel web dentro de si.
                    </p>

                    <h3 className="text-lg font-bold text-slate-200 mt-6">Estrutura de Pastas (C:\Users\BOSS\deepH)</h3>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-2">
                        <div><span className="text-primary">deeph.exe</span>        → O programa principal (motor em Go)</div>
                        <div><span className="text-primary">start_ui.bat</span>     → Atalho de duplo clique para iniciar</div>
                        <div><span className="text-primary">config.json</span>      → Suas configs e API Keys (NUNCA apague!)</div>
                        <div><span className="text-primary">agents/</span>          → Pasta com seus agentes (.yaml)</div>
                        <div><span className="text-primary">skills/</span>          → Habilidades extras instaladas</div>
                        <div><span className="text-primary">sessions/</span>        → Histórico das conversas</div>
                    </div>
                </section>

                {/* Section 2 */}
                <section id="open" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">2.</span> Abrindo o Painel Visual
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Para abrir o sistema da forma mais fácil possível:
                    </p>
                    <ol className="list-decimal list-inside text-slate-300 space-y-2 marker:text-primary font-medium">
                        <li><strong>Abra a pasta:</strong> C:\Users\BOSS\deepH</li>
                        <li><strong>Dê duplo clique</strong> no arquivo <code className="text-primary bg-primary/10 px-1 rounded">start_ui.bat</code></li>
                    </ol>
                    <p className="text-slate-300 leading-relaxed">
                        Uma tela <strong>preta (terminal)</strong> abrirá. É o motor do sistema. Em seguida, seu navegador padrão abrirá no endereço <code className="text-primary bg-primary/10 px-1 rounded">http://localhost:7730</code> exibindo a Interface Premium.
                    </p>

                    <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm flex gap-3 mt-4">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div>
                            <strong className="font-bold">AVISO CRÍTICO:</strong> Não feche a janela preta (terminal)! Ela é o "motor" do sistema. Se fechá-la, o painel visual vai parar de funcionar completamente. Pode minimizá-la à vontade.
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section id="layout" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">3.</span> Conhecendo o Layout
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        A interface utiliza o <strong>Glassmorphism</strong> (efeito vidro) e <strong>Dark Mode</strong>. A barra lateral à esquerda possui botões de navegação:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div>
                            <div>
                                <h4 className="font-bold text-slate-200">Dashboard</h4>
                                <p className="text-xs text-slate-400">Tela inicial com seus agentes</p>
                            </div>
                        </div>
                        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-primary" /></div>
                            <div>
                                <h4 className="font-bold text-slate-200">Chat</h4>
                                <p className="text-xs text-slate-400">Converse com as IAs</p>
                            </div>
                        </div>
                        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><PlusSquare className="w-5 h-5 text-primary" /></div>
                            <div>
                                <h4 className="font-bold text-slate-200">Novo Agente</h4>
                                <p className="text-xs text-slate-400">Crie um assistente do zero</p>
                            </div>
                        </div>
                        <div className="glass-card p-4 rounded-xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Settings2 className="w-5 h-5 text-primary" /></div>
                            <div>
                                <h4 className="font-bold text-slate-200">Configurações</h4>
                                <p className="text-xs text-slate-400">Gerenciar API Keys e chaves</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4 */}
                <section id="api" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">4.</span> Configurando Chaves de API
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Para o sistema pensar, ele precisa de uma "API Key". Você obtém isso no site do provedor (como DeepSeek, OpenAI ou Anthropic).
                    </p>
                    <ol className="list-decimal list-inside text-slate-300 space-y-2 mt-2">
                        <li>Vá no menu <strong>Configurações (⚙️)</strong>.</li>
                        <li>Encontre a seção do provedor que deseja usar (Ex: DeepSeek).</li>
                        <li>Cole sua <code className="text-primary bg-primary/10 px-1 rounded">sk-xxxx...</code> no campo correspondente.</li>
                        <li>Clique em <strong className="text-primary">Save Settings</strong>.</li>
                    </ol>
                    <p className="text-sm text-slate-400 italic">As chaves ficam salvas BEM SEGURAS apenas no seu config.json local.</p>
                </section>

                {/* Section 5 */}
                <section id="dashboard" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">5.</span> O Dashboard: Seus Agentes
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        É a tela inicial onde vivem seus agentes. Cada agente aparece como um cartão na tela.
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                        <li><strong>Conversar:</strong> Clique para abrir o bate-papo com ele.</li>
                        <li><strong>Editar:</strong> Clique na engrenagem que aparece ao focar (hover) no cartão.</li>
                        <li><strong>Excluir:</strong> Clique na lixeira, também no hover. (Confirmará antes de apagar).</li>
                    </ul>
                </section>

                {/* Section 6 */}
                <section id="chat" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">6.</span> Conversando no Chat
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Clique no cartão do agente para abrir a conversa.
                    </p>
                    <div className="glass-card p-5 rounded-xl border border-primary/5 mt-4">
                        <ul className="text-slate-300 space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">1.</span>
                                Digite sua dúvida na caixa de texto na parte inferior.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">2.</span>
                                Pressione <strong className="text-white">ENTER</strong> (sem Shift) ou clique em Enviar.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">3.</span>
                                O chat suporta Formatação Rica (Markdown), negrito, código, tabelas, etc.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary font-bold">4.</span>
                                Conversas são salvas em <code className="text-primary bg-primary/10 px-1 rounded">sessions/</code> no seu computador.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Section 7 */}
                <section id="agents" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">7.</span> Criando e Editando Agentes
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        No editor de agentes (menu de mais "+"), você pode criar assistentes especialistas.
                        A peça mais importante é o <strong>SYSTEM PROMPT</strong>.
                    </p>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 mt-2">
                        <p className="text-sm text-slate-400 mb-2">Exemplo de um System Prompt:</p>
                        <code className="text-primary text-sm font-mono whitespace-pre-wrap">
                            "Você é um consultor financeiro brasileiro experiente.{"\n"}
                            Sempre forneça análises equilibradas, mencione riscos{"\n"}
                            e acompanhe os benefícios. Responda de forma clara."
                        </code>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Escolha também o Provedor (ex: deepseek) e o Modelo (ex: deepseek-chat).
                    </p>
                </section>

                {/* Section 8 */}
                <section id="terminal" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">8.</span> Modo Terminal (Avançado)
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Você não precisa abrir a UI para usar o sistema. Pode abrir o PowerShell em <code className="text-primary bg-primary/10 px-1 rounded">C:\Users\BOSS\deepH</code> e executar:
                    </p>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-2">
                        <div>.\deeph.exe run "guide" "Qual a capital do Brasil?"</div>
                        <div>.\deeph.exe agents list</div>
                        <div>.\deeph.exe skills list</div>
                    </div>
                </section>

                {/* Section 9 */}
                <section id="providers" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">9.</span> Provedores Analisados
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse mt-2">
                            <thead>
                                <tr className="border-b border-primary/20 text-slate-100">
                                    <th className="p-3">Provedor</th>
                                    <th className="p-3">Custo</th>
                                    <th className="p-3">Velocidade</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300 text-sm">
                                <tr className="border-b border-white/5">
                                    <td className="p-3 font-bold text-primary">DeepSeek</td>
                                    <td className="p-3">Muito Barato!</td>
                                    <td className="p-3">Rápido</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="p-3 font-bold text-primary">Groq</td>
                                    <td className="p-3">Top (Gratuito limitado)</td>
                                    <td className="p-3">Ultrarrápido</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="p-3 font-bold text-primary">OpenAI (GPT-4o)</td>
                                    <td className="p-3">Moderado/Alto</td>
                                    <td className="p-3">Rápido e Inteligente</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="p-3 font-bold text-primary">Ollama</td>
                                    <td className="p-3">Local (Grátis offline)</td>
                                    <td className="p-3">Depende do seu PC</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Section 10 */}
                <section id="troubleshoot" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">10.</span> Solução de Problemas
                    </h2>
                    <div className="space-y-4 mt-4">
                        <div className="glass-card p-4 rounded-xl border-l-4 border-l-orange-500">
                            <h4 className="font-bold text-white">Falha ao abrir a página (localhost)</h4>
                            <p className="text-sm text-slate-300 mt-1">A janela preta (terminal) está fechada. Dê duplo clique em <code className="text-primary">start_ui.bat</code> novamente.</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl border-l-4 border-l-red-500">
                            <h4 className="font-bold text-white">Chat não responde</h4>
                            <p className="text-sm text-slate-300 mt-1">Ocorre se sua API Key está ausente, errada ou sem saldo (créditos). Verifique isso em <code className="text-primary">Configurações</code>.</p>
                        </div>
                        <div className="glass-card p-4 rounded-xl border-l-4 border-l-blue-500">
                            <h4 className="font-bold text-white">Port already in use (porta 7730)</h4>
                            <p className="text-sm text-slate-300 mt-1">Abra o Gerenciador de Tarefas, feche o "deeph.exe" e abra novamente.</p>
                        </div>
                    </div>
                </section>

                {/* Section 11 & 12 Combine */}
                <section id="multi-agent" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">11 & 12.</span> Orquestração e Kits (Avançado)
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        No PowerShell, você pode colocar os agentes para colaborar:
                    </p>
                    <ul className="list-disc list-inside text-slate-300 space-y-2 mt-2">
                        <li><strong>Modo Paralelo (+):</strong> <code className="text-primary bg-primary/10 px-1">.\deeph.exe run "pesquisador+redator" "Tema X"</code></li>
                        <li><strong>Modo Sequencial (&gt;):</strong> <code className="text-primary bg-primary/10 px-1">.\deeph.exe run "planejador&gt;coder" "App web"</code></li>
                        <li><strong>Listar Kits Prontos:</strong> <code className="text-primary bg-primary/10 px-1">.\deeph.exe kit list</code></li>
                        <li><strong>Instalar Kit:</strong> <code className="text-primary bg-primary/10 px-1">.\deeph.exe kit add reviewpack</code></li>
                    </ul>
                </section>

                {/* Glossary */}
                <section id="glossary" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        Glossário Rápido
                    </h2>
                    <ul className="text-slate-300 space-y-3 mt-4">
                        <li><strong className="text-primary">Agente:</strong> O assistente com regras e personalidade que você cria.</li>
                        <li><strong className="text-primary">System Prompt:</strong> Instruções vitais do coração do agente.</li>
                        <li><strong className="text-primary">Skill:</strong> Habilidades que você "equipa" no agente (pesquisa, código).</li>
                        <li><strong className="text-primary">API Key:</strong> Sua senha de acesso comprada/gerada com o provedor (DeepSeek, OpenAI).</li>
                    </ul>
                    <div className="mt-8 text-center text-slate-500 font-display italic">
                        "Seus agentes, suas regras, seu computador." — Equipe deepH
                    </div>
                </section>

            </main>
        </div>
    );
}
