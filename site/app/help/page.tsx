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
        { id: "intro", title: "Parte 0 â€” O que Ã© o deepH Plus?", icon: Info },
        { id: "install", title: "Parte 1 â€” InstalaÃ§Ã£o", icon: Terminal },
        { id: "open", title: "Parte 2 â€” Abrindo o Painel", icon: LayoutTemplate },
        { id: "layout", title: "Parte 3 â€” Conhecendo o Layout", icon: Component },
        { id: "api", title: "Parte 4 â€” Configurando API", icon: Key },
        { id: "dashboard", title: "Parte 5 â€” O Dashboard", icon: Shapes },
        { id: "chat", title: "Parte 6 â€” Conversando no Chat", icon: MessageSquare },
        { id: "agents", title: "Parte 7 â€” Criando Agentes", icon: PlusSquare },
        { id: "crews", title: "Parte 8 â€” EsquadrÃµes (Crews)", icon: Network },
        { id: "coach", title: "Parte 9 â€” O Coach", icon: Stethoscope },
        { id: "terminal", title: "Parte 10 â€” Modo Terminal", icon: Terminal },
        { id: "providers", title: "Parte 11 â€” Provedores de IA", icon: Database },
        { id: "troubleshoot", title: "Parte 12 â€” SoluÃ§Ã£o de Problemas", icon: HelpCircle },
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
                        <p className="text-primary mt-1 font-medium tracking-wide">VersÃ£o 4.0 â€” Emerald Engine</p>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0ff092]/10 border border-[#0ff092]/30 text-[#0ff092] text-sm flex gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <div>
                        <strong className="font-bold">PRIVACIDADE EM PRIMEIRO LUGAR:</strong> Toda a execuÃ§Ã£o do deepH Plus ocorre <strong>100% no seu computador</strong>. Seus agentes e segredos nunca saem da sua mÃ¡quina.
                    </div>
                </div>

                {/* Section 0 */}
                <section id="intro" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">0.</span> O que é o deepH Plus?
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        O deepH Plus é um <strong>GERENCIADOR PESSOAL DE ASSISTENTES DE IA</strong> que funciona diretamente no seu computador, sem necessidade de cadastro em sites externos ou assinatura de serviços.
                    </p>
                    <p className="text-slate-300 leading-relaxed">
                        A ideia central é simples: você cria &quot;funcionários virtuais&quot; chamados <strong>AGENTES</strong>. Cada agente tem um nome, uma especialidade e um jeito de se comportar que você mesmo define.
                    </p>
                    <div className="glass-card p-5 rounded-xl border border-primary/5 space-y-2">
                        <h4 className="font-bold text-slate-200">Exemplos de agentes que você pode criar:</h4>
                        <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 marker:text-primary">
                            <li>Um <strong>&quot;Redator Criativo&quot;</strong> para escrever posts para redes sociais.</li>
                            <li>Um <strong>&quot;Analista Financeiro&quot;</strong> para interpretar planilhas.</li>
                            <li>Um <strong>&quot;Assistente de Código&quot;</strong> para revisar scripts de programação.</li>
                            <li>Um <strong>&quot;Tradutor&quot;</strong> para converter textos de inglês para português.</li>
                        </ul>
                    </div>
                    <div className="glass-card p-5 rounded-xl border border-primary/5 space-y-2">
                        <h4 className="font-bold text-slate-200">A grande diferença para um site de IA normal:</h4>
                        <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 marker:text-primary">
                            <li>✓ Tudo roda no <strong>SEU computador</strong>.</li>
                            <li>✓ Suas conversas ficam salvas <strong>LOCALMENTE</strong>, não em nuvem externa.</li>
                            <li>✓ Você conecta diretamente aos serviços de IA usando sua própria chave — o deepH Plus nunca lê suas chaves nem suas mensagens.</li>
                        </ul>
                    </div>
                </section>


                {/* Section 1 */}
                <section id="install" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">1.</span> InstalaÃ§Ã£o e Estrutura de Pastas
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        VocÃª <strong>NÃƒO precisa instalar nenhum programa complicado</strong>. O deepH Plus se apresenta como um Ãºnico arquivo chamado <code className="text-primary bg-primary/10 px-1 rounded">deeph.exe</code>. Basta ele existir na pasta para funcionar.
                    </p>
                    <div className="glass-card p-5 rounded-xl border border-primary/5 space-y-2">
                        <h4 className="font-bold text-slate-200 mb-3">O que vocÃª precisa ter:</h4>
                        <ul className="list-decimal list-inside text-slate-400 text-sm space-y-1 marker:text-primary">
                            <li>Windows 10 ou 11 (versÃ£o 64 bits).</li>
                            <li>A pasta do deepH Plus: <code className="text-primary bg-primary/10 px-1 rounded">C:\Users\BOSS\deepH</code></li>
                            <li>ConexÃ£o com a internet (necessÃ¡ria para a IA poder responder).</li>
                        </ul>
                    </div>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-2">
                        <div><span className="text-primary font-bold">deeph.exe</span> <span className="text-slate-500">â†’ O arquivo principal. Nunca exclua nem mova.</span></div>
                        <div><span className="text-primary font-bold">start_ui.bat</span> <span className="text-slate-500">â†’ Atalho de dois cliques para abrir o painel.</span></div>
                        <div><span className="text-primary font-bold">config.json</span> <span className="text-slate-500">â†’ ConfiguraÃ§Ãµes e API Keys. FaÃ§a backup!</span></div>
                        <div><span className="text-primary font-bold">agents/</span> <span className="text-slate-500">â†’ Seus agentes (arquivos .yaml)</span></div>
                        <div><span className="text-primary font-bold">crews/</span> <span className="text-slate-500">â†’ Equipes de agentes</span></div>
                        <div><span className="text-primary font-bold">skills/</span> <span className="text-slate-500">â†’ Habilidades extras dos agentes</span></div>
                        <div><span className="text-primary font-bold">sessions/</span> <span className="text-slate-500">â†’ HistÃ³rico de conversas salvo no PC</span></div>
                    </div>
                </section>

                {/* Section 2 */}
                <section id="open" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">2.</span> Como Abrir o Painel Visual
                    </h2>
                    <div className="space-y-3">
                        <h3 className="font-bold text-slate-200">MÃ©todo Recomendado: O Atalho de Dois Cliques</h3>
                        {[
                            { step: "1", text: "Pressione [Windows + E] para abrir o Explorador de Arquivos." },
                            { step: "2", text: "Na barra de endereÃ§os, clique, apague o conteÃºdo, digite C:\\Users\\BOSS\\deepH e pressione ENTER." },
                            { step: "3", text: "Dentro da pasta, procure o arquivo start_ui.bat." },
                            { step: "4", text: "DÃª um DUPLO CLIQUE neste arquivo (dois cliques rÃ¡pidos seguidos)." },
                        ].map(({ step, text }) => (
                            <div key={step} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <span className="text-primary font-bold shrink-0">PASSO {step}:</span>
                                <span className="text-slate-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-300 text-sm space-y-1">
                        <p className="font-bold">âš ï¸ AVISO FUNDAMENTAL â€” SOBRE A JANELA PRETA:</p>
                        <p>Esta janela preta Ã© o &quot;motor&quot; do sistema. Ela precisa ficar aberta o tempo todo.</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 text-amber-400/80">
                            <li>VocÃª pode <strong>MINIMIZÃ-LA</strong> (clicar no traÃ§o [_] para esconder).</li>
                            <li>Mas <strong>NÃƒO A FECHE</strong> (clicar no X). Se fechar: o painel para de funcionar.</li>
                            <li>Para resolver: abra o start_ui.bat novamente e aguarde.</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">MÃ©todo Alternativo: Via Terminal</h3>
                        <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-1">
                            <div><span className="text-slate-500"># Navegue atÃ© a pasta</span></div>
                            <div><span className="text-primary">cd</span> C:\Users\BOSS\deepH</div>
                            <div><span className="text-primary">.\deeph.exe</span> ui</div>
                            <div className="mt-2"><span className="text-slate-500"># Depois acesse no navegador:</span></div>
                            <div>http://localhost:7730</div>
                        </div>
                    </div>
                </section>

                {/* Section 3 */}
                <section id="layout" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">3.</span> Conhecendo o Layout da Interface
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Ao abrir o painel, vocÃª verÃ¡ uma tela de fundo escuro com elementos em <strong>verde esmeralda</strong> brilhante. A tela Ã© dividida em duas Ã¡reas principais:
                    </p>
                    <div className="grid gap-2">
                        {[
                            { icon: "ðŸ ", name: "Dashboard", desc: "A tela inicial. Mostra todos os seus agentes em formato de cartÃµes." },
                            { icon: "ðŸ‘¥", name: "EsquadrÃµes", desc: "Gerencia equipes (vÃ¡rios agentes trabalhando juntos em uma mesma tarefa)." },
                            { icon: "ðŸ’¬", name: "Chat", desc: "Abre a janela de conversa. VocÃª digita aqui e o agente responde." },
                            { icon: "âž•", name: "Novo Agente", desc: "Cria um agente novo do zero." },
                            { icon: "âš™ï¸", name: "ConfiguraÃ§Ãµes", desc: "Onde vocÃª insere as chaves de API e define configuraÃ§Ãµes gerais." },
                        ].map(({ icon, name, desc }) => (
                            <div key={name} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                                <span className="text-xl shrink-0">{icon}</span>
                                <div>
                                    <span className="font-bold text-slate-200 text-sm">{name}: </span>
                                    <span className="text-slate-400 text-sm">{desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 4 */}
                <section id="api" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">4.</span> Configurando suas Chaves de API
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        O deepH Plus conecta vocÃª <strong>diretamente</strong> ao serviÃ§o de IA de sua escolha. Para isso, vocÃª precisa de uma <strong>CHAVE DE API</strong> â€” funciona como uma &quot;senha de acesso&quot; ao cÃ©rebro da IA.
                    </p>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">Onde obter sua chave:</h3>
                        {[
                            { name: "DeepSeek (Recomendado)", url: "platform.deepseek.com", prefix: "sk-", tip: "BaratÃ­ssimo e de alta qualidade." },
                            { name: "Groq (Cota gratuita)", url: "console.groq.com", prefix: "gsk_", tip: "Ultra-rÃ¡pido, generoso e gratuito." },
                            { name: "OpenAI", url: "platform.openai.com", prefix: "sk-proj-", tip: "GPT-4o. Pago, mÃ­nimo US$5 de crÃ©dito." },
                            { name: "Ollama (Offline)", url: "ollama.ai", prefix: "Sem chave!", tip: "Instale localmente. Privacidade total." },
                        ].map(({ name, url, prefix, tip }) => (
                            <div key={name} className="p-3 rounded-lg bg-white/3 border border-white/5 text-sm">
                                <p className="font-bold text-slate-200">{name}</p>
                                <p className="text-slate-400">Acesse: <code className="text-primary">{url}</code> â€” Chave comeÃ§a com: <code className="text-primary">{prefix}</code></p>
                                <p className="text-slate-500 text-xs mt-1">{tip}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">Como inserir a chave no deepH Plus:</h3>
                        {[
                            "Clique em âš™ï¸ ConfiguraÃ§Ãµes na barra lateral.",
                            "Encontre a seÃ§Ã£o do seu provedor (ex: DeepSeek).",
                            "Clique no campo de texto e cole sua chave com CTRL+V.",
                            "Certifique-se de nÃ£o ter espaÃ§os antes ou depois da chave.",
                            "Role atÃ© o final e clique no botÃ£o verde \"Save Settings\".",
                        ].map((text, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <span className="text-primary font-bold shrink-0">PASSO {i + 1}:</span>
                                <span className="text-slate-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-primary text-sm">
                        <p className="font-bold">ðŸ”’ SEGURANÃ‡A:</p>
                        <p className="text-slate-400 mt-1">Sua chave fica armazenada APENAS no arquivo <code className="text-primary">config.json</code> no seu computador. O deepH Plus nunca envia sua chave para servidores prÃ³prios.</p>
                    </div>
                </section>

                {/* Section 5 */}
                <section id="dashboard" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">5.</span> O Dashboard
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        O Dashboard Ã© a tela principal â€” a &quot;recepÃ§Ã£o&quot; do seu escritÃ³rio. Quando vocÃª clica em ðŸ  Dashboard, verÃ¡ cartÃµes translÃºcidos representando cada agente criado.
                    </p>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1">
                        <div className="text-primary">â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—</div>
                        <div><span className="text-primary">â•‘</span>  ðŸ¤–  NOME DO AGENTE         â— Ativo   <span className="text-primary">â•‘</span></div>
                        <div><span className="text-primary">â•‘</span>     Provedor: deepseek                 <span className="text-primary">â•‘</span></div>
                        <div><span className="text-primary">â•‘</span>  DescriÃ§Ã£o: Assistente geral           <span className="text-primary">â•‘</span></div>
                        <div><span className="text-primary">â•‘</span>    [ CONVERSAR ]    [ âš™ï¸ EDITAR ]     <span className="text-primary">â•‘</span></div>
                        <div className="text-primary">â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•</div>
                    </div>
                    <div className="grid gap-2">
                        {[
                            { label: "[CONVERSAR]", desc: "Inicia uma conversa com o agente." },
                            { label: "[EDITAR âš™ï¸]", desc: "Altera nome, descriÃ§Ã£o, provedor ou System Prompt do agente." },
                            { label: "â— Ativo", desc: "Ponto verde pulsante â€” agente pronto para receber conversas." },
                        ].map(({ label, desc }) => (
                            <div key={label} className="flex gap-3 p-3 rounded-lg bg-white/3 border border-white/5 text-sm">
                                <code className="text-primary shrink-0">{label}</code>
                                <span className="text-slate-400">{desc}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 6 */}
                <section id="chat" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">6.</span> Como Conversar no Chat
                    </h2>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">Abrindo a conversa:</h3>
                        {[
                            "No Dashboard, encontre o cartÃ£o do agente desejado.",
                            "Clique no botÃ£o [CONVERSAR].",
                            "A tela de Chat vai abrir.",
                        ].map((text, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <span className="text-primary font-bold shrink-0">PASSO {i + 1}:</span>
                                <span className="text-slate-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">Enviando sua primeira mensagem:</h3>
                        {[
                            "Clique dentro do campo de texto na PARTE INFERIOR da tela.",
                            "Digite o que vocÃª quer perguntar. Exemplo: \"Me faÃ§a um resumo de 5 tÃ³picos sobre como economizar energia em casa.\"",
                            "Pressione ENTER ou clique na seta â†‘ para enviar.",
                            "Os trÃªs pontinhos pulsantes (â— â— â—) indicam que a IA estÃ¡ pensando.",
                            "A resposta aparece letra por letra em tempo real!",
                        ].map((text, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <span className="text-primary font-bold shrink-0">PASSO {i + 1}:</span>
                                <span className="text-slate-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="glass-card p-4 rounded-xl border border-primary/5 space-y-2 text-sm">
                        <p className="font-bold text-slate-200">Recursos disponÃ­veis no chat:</p>
                        <div className="flex gap-3"><code className="text-primary shrink-0">[Copiar]</code><span className="text-slate-400">Copia a resposta para a Ã¡rea de transferÃªncia (CTRL+V em outro lugar).</span></div>
                        <div className="flex gap-3"><code className="text-primary shrink-0">[Regenerar]</code><span className="text-slate-400">Pede uma nova resposta diferente para a mesma pergunta.</span></div>
                        <div className="flex gap-3"><code className="text-primary shrink-0">SHIFT+ENTER</code><span className="text-slate-400">Quebra de linha sem enviar a mensagem.</span></div>
                    </div>
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-300 text-sm">
                        <strong>ðŸ’¡ Dica:</strong> Para comeÃ§ar uma conversa zerada (sem histÃ³rico), volte ao Dashboard e clique em [CONVERSAR] novamente â€” isso abre uma sessÃ£o nova.
                    </div>
                </section>

                {/* Section 7 */}
                <section id="agents" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">7.</span> Criando um Novo Agente
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Criar um agente Ã© como preencher a ficha de contrataÃ§Ã£o de um &quot;funcionÃ¡rio virtual&quot;. Na barra lateral, clique em âž• <strong>Novo Agente</strong>.
                    </p>
                    <div className="space-y-3">
                        {[
                            {
                                section: "General Information", fields: [
                                    { name: "Agent Name", desc: "Nome sem espaÃ§os. Ex: planner, redator_pro. Vira o nome do arquivo .yaml." },
                                    { name: "Description", desc: "1-2 frases sobre o que o agente faz. Aparece no cartÃ£o do Dashboard." },
                                ]
                            },
                            {
                                section: "System Prompt (O mais importante!)", fields: [
                                    { name: "System Prompt", desc: "InstruÃ§Ãµes secretas que definem a personalidade. Defina: QUEM Ã© o agente, COMO deve se comportar, em qual IDIOMA, o que NÃƒO deve fazer e como FORMATAR as respostas." },
                                ]
                            },
                            {
                                section: "Provider & Model", fields: [
                                    { name: "Provider", desc: "Empresa de IA: DeepSeek | OpenAI | Anthropic | Groq | Ollama" },
                                    { name: "Model", desc: "Ex: deepseek-chat, gpt-4o-mini, llama-3.3-70b-versatile, llama3" },
                                ]
                            },
                            {
                                section: "I/O Ports (Conecta agentes em pipeline)", fields: [
                                    { name: "INPUTS â€” Name", desc: "RÃ³tulo da entrada. Ex: task, context." },
                                    { name: "INPUTS â€” Accepts", desc: "Tipos aceitos: text/plain, text/markdown, plan/summary, summary/text" },
                                    { name: "OUTPUTS â€” Name", desc: "RÃ³tulo da saÃ­da. Ex: result, plan." },
                                    { name: "OUTPUTS â€” Produces", desc: "Tipos produzidos: text/markdown, plan/summary, code/html, code/python" },
                                ]
                            },
                            {
                                section: "Metadata", fields: [
                                    { name: "context_moment", desc: "Momento de uso no fluxo. Ex: discovery" },
                                    { name: "context_max_input_tokens", desc: "Limite de tokens do contexto. Ex: \"900\" (entre aspas no YAML)" },
                                ]
                            },
                            {
                                section: "Skills & Capabilities", fields: [
                                    { name: "Skills", desc: "Habilidades extras: echo, web_search, memory, file_write_dialog. Deixe em branco para agente bÃ¡sico de chat." },
                                ]
                            },
                        ].map(({ section, fields }) => (
                            <div key={section} className="glass-card p-4 rounded-xl border border-primary/5 space-y-2">
                                <h4 className="font-bold text-primary text-sm">{section}</h4>
                                {fields.map(({ name, desc }) => (
                                    <div key={name} className="text-sm">
                                        <span className="font-bold text-slate-200">{name}: </span>
                                        <span className="text-slate-400">{desc}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">Modo YAML â€” Exemplo completo:</h3>
                        <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-0.5">
                            <div><span className="text-primary">name:</span> planner</div>
                            <div><span className="text-primary">provider:</span> deepseek</div>
                            <div><span className="text-primary">model:</span> deepseek-chat</div>
                            <div><span className="text-primary">system_prompt:</span> |</div>
                            <div className="pl-4 text-slate-400">VocÃª Ã© o Planner. Crie planos objetivos.</div>
                            <div><span className="text-primary">skills:</span></div>
                            <div className="pl-4">- echo</div>
                            <div><span className="text-primary">io:</span></div>
                            <div className="pl-4"><span className="text-primary">inputs:</span></div>
                            <div className="pl-8">- name: task</div>
                            <div className="pl-10">accepts: [text/plain]</div>
                            <div className="pl-10">required: true</div>
                            <div className="pl-10">max_tokens: 220</div>
                            <div className="pl-4"><span className="text-primary">outputs:</span></div>
                            <div className="pl-8">- name: plan</div>
                            <div className="pl-10">produces: [plan/summary, summary/text]</div>
                            <div><span className="text-primary">metadata:</span></div>
                            <div className="pl-4">context_moment: discovery</div>
                            <div className="pl-4">context_max_input_tokens: &quot;900&quot;</div>
                        </div>
                        <p className="text-amber-300 text-xs">âš ï¸ Regra de ouro do YAML: use ESPAÃ‡OS, nunca TAB. Um erro de indentaÃ§Ã£o invalida o arquivo.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-slate-300">
                        ApÃ³s preencher, clique em <strong className="text-primary">Deploy Agent</strong>. O agente aparecerÃ¡ no Dashboard imediatamente!
                    </div>
                </section>

                {/* Section 8 */}
                <section id="crews" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">8.</span> EsquadrÃµes (Crews): VÃ¡rios Agentes em Equipe
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        Crews sÃ£o equipes de agentes que trabalham juntos. Imagine uma agÃªncia: o Pesquisador coleta dados, o Redator escreve, o Revisor corrige. Tudo automatizado!
                    </p>
                    <div className="space-y-3">
                        {[
                            { symbol: "+", mode: "PARALELO", color: "text-emerald-400", desc: "VÃ¡rios agentes recebem a mesma tarefa e trabalham AO MESMO TEMPO. Use para diferentes perspectivas.", ex: "pesquisador1+pesquisador2" },
                            { symbol: ">", mode: "SEQUENCIAL", color: "text-blue-400", desc: "Linha de montagem. O resultado do primeiro vira entrada do segundo. Use quando cada etapa depende da anterior.", ex: "planejador>codificador>revisor" },
                            { symbol: "+>", mode: "MISTO", color: "text-purple-400", desc: "Mistura os dois modos! Paralelo primeiro, depois sequencial com os resultados combinados.", ex: "pesq1+pesq2>redator" },
                        ].map(({ symbol, mode, color, desc, ex }) => (
                            <div key={mode} className="glass-card p-4 rounded-xl border border-primary/5">
                                <div className="flex items-center gap-2 mb-1">
                                    <code className={`text-xl font-bold ${color}`}>{symbol}</code>
                                    <span className="font-bold text-slate-200">{mode}</span>
                                </div>
                                <p className="text-slate-400 text-sm mb-2">{desc}</p>
                                <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">{`.\\deeph.exe run "${ex}" "Sua tarefa"`}</code>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <p className="text-xs text-primary uppercase font-bold mb-1">Crew de exemplo incluÃ­do:</p>
                        <p className="text-slate-300 text-sm"><strong>build-calculator</strong>: Arquiteto â†’ Desenvolvedor â†’ Assistente de ImplantaÃ§Ã£o. Cria um arquivo HTML e abre o diÃ¡logo &quot;Salvar como&quot; automaticamente!</p>
                        <code className="text-xs text-slate-400 mt-2 block">{`.\\deeph.exe run "build-calculator" "Crie uma calculadora neon"`}</code>
                    </div>
                </section>

                {/* Section 9 */}
                <section id="coach" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">9.</span> O Coach: Assistente de DiagnÃ³stico
                    </h2>
                    <p className="text-slate-300 leading-relaxed">
                        O Coach Ã© um sistema de monitoramento embutido que observa silenciosamente as execuÃ§Ãµes dos seus agentes e oferece sugestÃµes automÃ¡ticas de melhoria.
                    </p>
                    <div className="glass-card p-4 rounded-xl border border-primary/5 space-y-1 text-sm">
                        <p className="font-bold text-slate-200 mb-2">O Coach pode avisar sobre:</p>
                        <p className="text-slate-400">â€¢ Prompts que poderiam ser mais eficientes.</p>
                        <p className="text-slate-400">â€¢ Modelos mais baratos para a mesma tarefa.</p>
                        <p className="text-slate-400">â€¢ ConfiguraÃ§Ãµes que podem estar causando lentidÃ£o.</p>
                    </div>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-1">
                        <div><span className="text-slate-500"># Ver estatÃ­sticas de uso</span></div>
                        <div>.\deeph.exe coach stats</div>
                        <div className="mt-2"><span className="text-slate-500"># Resetar dicas</span></div>
                        <div>.\deeph.exe coach reset --all</div>
                        <div className="mt-2"><span className="text-slate-500"># Desativar Coach em uma execuÃ§Ã£o</span></div>
                        <div>.\deeph.exe run &quot;guide&quot; &quot;Minha tarefa&quot; --coach=false</div>
                    </div>
                </section>

                {/* Section 10 */}
                <section id="terminal" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">10.</span> Usando no Terminal
                    </h2>
                    <div className="space-y-2">
                        <h3 className="font-bold text-slate-200">Como abrir o terminal na pasta correta:</h3>
                        {[
                            "Pressione [Windows + X] e clique em \"Terminal\" ou \"PowerShell\".",
                            "Digite: cd C:\\Users\\BOSS\\deepH e pressione ENTER.",
                            "O caminho mudarÃ¡ para: PS C:\\Users\\BOSS\\deepH>",
                        ].map((text, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                <span className="text-primary font-bold shrink-0">PASSO {i + 1}:</span>
                                <span className="text-slate-300 text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-300 space-y-2">
                        <div><span className="text-slate-500"># Abrir interface visual</span></div>
                        <div>.\deeph.exe ui</div>
                        <div className="mt-2"><span className="text-slate-500"># Rodar agente Ãºnico</span></div>
                        <div>.\deeph.exe run &quot;guide&quot; &quot;Explique o que Ã© criptomoeda&quot;</div>
                        <div className="mt-2"><span className="text-slate-500"># Paralelo / Sequencial</span></div>
                        <div>.\deeph.exe run &quot;agente1+agente2&quot; &quot;Sua tarefa&quot;</div>
                        <div>.\deeph.exe run &quot;planejador&gt;dev&gt;revisor&quot; &quot;Sua tarefa&quot;</div>
                        <div className="mt-2"><span className="text-slate-500"># Ver plano sem gastar crÃ©ditos</span></div>
                        <div>.\deeph.exe trace &quot;planejador+leitor&gt;revisor&quot; &quot;Tarefa&quot;</div>
                        <div className="mt-2"><span className="text-slate-500"># Salvar resposta em arquivo</span></div>
                        <div>.\deeph.exe run &quot;guide&quot; &quot;RelatÃ³rio sobre IA&quot; &gt; resultado.txt</div>
                        <div className="mt-2"><span className="text-slate-500"># Listar agentes e crews</span></div>
                        <div>.\deeph.exe agent list</div>
                        <div>.\deeph.exe crew list</div>
                    </div>
                </section>

                {/* Section 11 */}
                <section id="providers" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">11.</span> Qual Provedor de IA Devo Usar?
                    </h2>
                    <div className="space-y-3">
                        {[
                            { title: "Melhor custo-benefÃ­cio", rec: "DeepSeek (deepseek-chat)", why: "Incrivelmente barato e de altÃ­ssima qualidade. PadrÃ£o do deepH Plus por uma razÃ£o." },
                            { title: "MÃ¡xima velocidade", rec: "Groq (llama-3.3-70b-versatile)", why: "Infraestrutura especializada. Muito mais rÃ¡pido e com cota gratuita generosa." },
                            { title: "Privacidade total sem internet", rec: "Ollama (llama3 ou mistral)", why: "Roda dentro do seu PC. Sem nuvem, sem chave. Exige 8GB+ de RAM." },
                            { title: "MÃ¡xima inteligÃªncia e raciocÃ­nio", rec: "OpenAI GPT-4o ou Anthropic Claude 3.5", why: "Modelos mais sofisticados. Excelentes para tarefas complexas. Custo mais alto." },
                        ].map(({ title, rec, why }) => (
                            <div key={title} className="glass-card p-4 rounded-xl border border-primary/5">
                                <p className="text-xs text-primary uppercase font-bold mb-1">{title}</p>
                                <p className="font-bold text-slate-200 text-sm">{rec}</p>
                                <p className="text-slate-400 text-xs mt-1">{why}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-surface-dark border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto">
                        <div className="flex gap-2 text-slate-500 mb-1">
                            <span className="w-20">Provedor</span>
                            <span className="w-16">Custo</span>
                            <span className="w-20">Velocidade</span>
                            <span className="w-20">Qualidade</span>
                            <span>Offline?</span>
                        </div>
                        {[
                            ["DeepSeek", "â˜…â˜…â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…â˜…", "NÃ£o"],
                            ["Groq", "â˜…â˜…â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…", "NÃ£o"],
                            ["OpenAI", "â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…â˜…", "NÃ£o"],
                            ["Anthropic", "â˜…â˜…â˜…", "â˜…â˜…â˜…", "â˜…â˜…â˜…â˜…â˜…", "NÃ£o"],
                            ["Ollama", "GrÃ¡tis", "â˜…â˜… (PC)", "â˜…â˜…â˜…", "SIM âœ“"],
                        ].map(([name, cost, speed, quality, offline]) => (
                            <div key={name} className="flex gap-2">
                                <span className="w-20 text-primary">{name}</span>
                                <span className="w-16">{cost}</span>
                                <span className="w-20">{speed}</span>
                                <span className="w-20">{quality}</span>
                                <span>{offline}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 12 */}
                <section id="troubleshoot" className="scroll-mt-24 space-y-4">
                    <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2 border-b border-primary/10 pb-2">
                        <span className="text-primary">12.</span> SoluÃ§Ã£o de Problemas Comuns
                    </h2>
                    <div className="space-y-3">
                        {[
                            {
                                problem: "O navegador nÃ£o abriu automaticamente",
                                cause: "O motor iniciou mas o navegador nÃ£o abriu sozinho.",
                                steps: ["Aguarde 5 a 10 segundos.", "Abra o navegador manualmente.", "Na barra de endereÃ§os, acesse: http://localhost:7730"]
                            },
                            {
                                problem: "PÃ¡gina em branco ou \"NÃ£o foi possÃ­vel conectar\"",
                                cause: "A janela preta (motor) foi fechada ou nunca iniciou.",
                                steps: ["Verifique se a janela preta existe na barra de tarefas.", "Se nÃ£o existir: dÃª duplo clique em start_ui.bat novamente.", "Aguarde a mensagem 'UI Server running...' antes de acessar."]
                            },
                            {
                                problem: "Erro 'Port already in use' na janela preta",
                                cause: "A porta 7730 estÃ¡ ocupada por uma instÃ¢ncia anterior.",
                                steps: ["Pressione CTRL + SHIFT + ESC para abrir o Gerenciador de Tarefas.", "Encontre 'deeph.exe', clique com botÃ£o direito â†’ Finalizar Tarefa.", "Abra o start_ui.bat novamente."]
                            },
                            {
                                problem: "Chat nÃ£o responde ou mostra 'Erro na API'",
                                cause: "Chave de API incorreta, expirada ou sem crÃ©ditos.",
                                steps: ["Clique em âš™ï¸ ConfiguraÃ§Ãµes na barra lateral.", "Acesse o site do provedor e confira se a conta tem crÃ©ditos.", "Crie uma nova chave e substitua no deepH Plus.", "Confirme que o agente usa o mesmo provedor da chave configurada."]
                            },
                            {
                                problem: "Respostas muito lentas",
                                cause: "Modelo pesado ou conexÃ£o lenta.",
                                steps: ["Troque o provedor do agente para Groq (ultra-rÃ¡pido).", "No OpenAI, use gpt-4o-mini ao invÃ©s de gpt-4o.", "Verifique a velocidade da sua internet."]
                            },
                            {
                                problem: "Agente criado nÃ£o aparece no Dashboard",
                                cause: "O painel precisa ser atualizado.",
                                steps: ["Pressione F5 para recarregar a pÃ¡gina.", "Verifique se o arquivo existe em: agents/[nome].yaml", "Abra o arquivo com Bloco de Notas e cheque erros de formato."]
                            },
                        ].map(({ problem, cause, steps }) => (
                            <div key={problem} className="p-4 rounded-xl border border-white/5 bg-white/3 space-y-2">
                                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                    {problem}
                                </h4>
                                <p className="text-slate-500 text-xs">Causa: {cause}</p>
                                <ul className="space-y-1">
                                    {steps.map((step, i) => (
                                        <li key={i} className="text-slate-400 text-sm flex gap-2">
                                            <span className="text-primary shrink-0">{i + 1}.</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="pt-16 pb-8 border-t border-primary/5 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-primary/40">
                        <Zap className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Built with deepH Plus Engine</span>
                    </div>
                    <p className="text-slate-500 italic text-sm text-center">
                        &quot;Seus agentes, suas regras, seu computador.&quot; â€” v4.0
                    </p>
                </footer>

            </main>
        </div>
    );
}
