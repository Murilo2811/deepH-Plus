"use client";

import { useState, useCallback } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KitGallery } from "@/components/kit-gallery";
import { Sparkles, Users, Search, Filter, Box, Download, CheckCircle2, Zap, FileText, Brain, Code2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveCrew, type Crew } from "@/lib/api";

interface LibraryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: "agents" | "crews";
}

/* ── Crew Templates ─────────────────────────────────────────────────────── */
interface CrewTemplate {
    name: string;
    description: string;
    spec: string;
    icon: React.ReactNode;
    tags: string[];
}

const CREW_TEMPLATES: CrewTemplate[] = [
    {
        name: "pesquisa-tecnica",
        description: "Equipe otimizada para análise de código, revisão de documentação e geração de relatórios técnicos.",
        spec: "researcher>analyst>writer",
        icon: <Brain className="w-5 h-5" />,
        tags: ["análise", "documentação", "código"],
    },
    {
        name: "escrita-blog",
        description: "Fluxo completo de redação com pesquisa, escrita e otimização SEO para publicações.",
        spec: "researcher>writer>editor",
        icon: <FileText className="w-5 h-5" />,
        tags: ["conteúdo", "SEO", "blog"],
    },
    {
        name: "code-review",
        description: "Pipeline de revisão de código com análise estática, sugestões de melhoria e documentação.",
        spec: "linter>reviewer>documenter",
        icon: <Code2 className="w-5 h-5" />,
        tags: ["código", "revisão", "qualidade"],
    },
    {
        name: "brainstorm-rapido",
        description: "Geração rápida de ideias com múltiplos agentes criativos trabalhando em paralelo.",
        spec: "creative+analyst+strategist",
        icon: <Zap className="w-5 h-5" />,
        tags: ["ideação", "criatividade", "paralelo"],
    },
    {
        name: "analise-dados",
        description: "Processamento e visualização de dados com coleta, transformação e apresentação.",
        spec: "collector>transformer>visualizer",
        icon: <Sparkles className="w-5 h-5" />,
        tags: ["dados", "análise", "visualização"],
    },
    {
        name: "suporte-tecnico",
        description: "Equipe para triagem, diagnóstico e resolução de problemas técnicos de forma sequencial.",
        spec: "triager>diagnostician>resolver",
        icon: <Users className="w-5 h-5" />,
        tags: ["suporte", "diagnóstico", "resolução"],
    },
];

export function LibraryModal({ open, onOpenChange, defaultTab = "agents" }: LibraryModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [importing, setImporting] = useState<string | null>(null);
    const [imported, setImported] = useState<string[]>([]);

    const handleImportCrew = useCallback(async (template: CrewTemplate) => {
        setImporting(template.name);
        try {
            const crew: Crew = {
                name: template.name,
                description: template.description,
                spec: template.spec,
            };
            await saveCrew(crew);
            setImported(prev => [...prev, template.name]);
        } catch (e: any) {
            alert(`Erro ao importar modelo: ${e.message}`);
        } finally {
            setImporting(null);
        }
    }, []);

    const filteredTemplates = CREW_TEMPLATES.filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some(tag => tag.includes(q))
        );
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-sketch-paper-warm border-2 border-sketch-charcoal shadow-[6px_6px_0_0_#222B31]">
                <DialogHeader className="border-b-2 border-sketch-charcoal pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sketch-teal-dark rounded-xl border-2 border-sketch-charcoal shadow-[2px_2px_0_0_#222B31]">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-sketch-charcoal tracking-tight">
                                Biblioteca deepH
                            </DialogTitle>
                            <DialogDescription className="text-sketch-charcoal/60">
                                Explore e instale novos Agentes, Skills e modelos de Equipes.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex items-center gap-4 py-4 px-2">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sketch-charcoal/40 group-focus-within:text-sketch-teal-dark transition-colors" />
                        <Input 
                            placeholder="Buscar na biblioteca..." 
                            className="pl-10 border-2 border-sketch-charcoal bg-white/50 focus:bg-white transition-all shadow-[2px_2px_0_0_rgba(34,43,49,0.1)] focus:shadow-[3px_3px_0_0_#222B31]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="border-2 border-sketch-charcoal gap-2 font-bold hover:bg-sketch-teal-dark hover:text-white transition-all shadow-[2px_2px_0_0_#222B31] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                        <Filter className="w-4 h-4" /> Filtros
                    </Button>
                </div>

                <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="bg-transparent border-b-2 border-sketch-charcoal w-full justify-start rounded-none h-auto p-0 gap-6">
                        <TabsTrigger 
                            value="agents" 
                            className="rounded-none border-b-4 border-transparent data-[state=active]:border-sketch-teal-dark data-[state=active]:bg-transparent text-sketch-charcoal/50 data-[state=active]:text-sketch-teal-dark font-bold px-4 py-3 transition-all"
                        >
                            <Sparkles className="w-4 h-4 mr-2" /> Agentes (Kits)
                        </TabsTrigger>
                        <TabsTrigger 
                            value="crews" 
                            className="rounded-none border-b-4 border-transparent data-[state=active]:border-sketch-teal-dark data-[state=active]:bg-transparent text-sketch-charcoal/50 data-[state=active]:text-sketch-teal-dark font-bold px-4 py-3 transition-all"
                        >
                            <Users className="w-4 h-4 mr-2" /> Modelos de Crew
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <TabsContent value="agents" className="mt-0 focus-visible:ring-0">
                            <KitGallery
                                searchQuery={searchQuery}
                                onInstallSuccess={() => {/* opcional: fechar modal ou mostrar toast */}}
                            />
                        </TabsContent>
                        <TabsContent value="crews" className="mt-0 focus-visible:ring-0">
                            {filteredTemplates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Users className="w-10 h-10 text-sketch-charcoal/20 mb-3" />
                                    <p className="text-sm text-sketch-charcoal/50 font-bold">
                                        Nenhum modelo encontrado para &quot;{searchQuery}&quot;
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredTemplates.map((template) => {
                                        const isImporting = importing === template.name;
                                        const isImported = imported.includes(template.name);
                                        const isParallel = template.spec.includes("+");

                                        return (
                                            <div
                                                key={template.name}
                                                className="sketch-card group relative flex flex-col gap-3 p-5 h-full"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="p-2 bg-sketch-teal-dark/10 border-2 border-sketch-teal-dark/30 text-sketch-teal-dark"
                                                         style={{ borderRadius: '10px 12px 11px 13px' }}>
                                                        {template.icon}
                                                    </div>
                                                    <span className="sketch-badge text-[9px] py-0.5 px-2" style={{ boxShadow: 'none', border: '2px solid var(--sketch-charcoal)' }}>
                                                        {isParallel ? "paralelo" : "sequencial"}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-sketch-charcoal text-base">{template.name}</h4>
                                                    <p className="text-xs text-sketch-charcoal/50 mt-1 line-clamp-2">
                                                        {template.description}
                                                    </p>
                                                </div>

                                                {/* Spec preview */}
                                                <code className="text-[11px] font-mono text-sketch-teal-dark bg-sketch-teal-dark/5 px-3 py-1.5 border border-sketch-teal-dark/20 mt-auto"
                                                      style={{ borderRadius: '6px 8px 7px 9px' }}>
                                                    {template.spec}
                                                </code>

                                                {/* Tags */}
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {template.tags.map(tag => (
                                                        <span key={tag} className="text-[10px] font-bold text-sketch-charcoal/40 bg-sketch-charcoal/5 px-2 py-0.5"
                                                              style={{ borderRadius: '4px 6px 5px 7px' }}>
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Import button */}
                                                <button
                                                    onClick={() => handleImportCrew(template)}
                                                    disabled={isImporting || isImported}
                                                    className={`w-full py-2.5 text-sm font-black flex items-center justify-center gap-2 transition-all duration-150 uppercase tracking-wider ${
                                                        isImported
                                                            ? "bg-green-50 text-green-700 border-2 border-green-300"
                                                            : "sketch-btn-primary py-2.5 text-sm"
                                                    }`}
                                                    style={isImported ? { borderRadius: '10px 12px 11px 13px' } : {}}
                                                >
                                                    {isImporting ? (
                                                        <>
                                                            <div className="w-4 h-4 rounded-full border-2 border-sketch-teal/30 border-t-sketch-teal animate-spin" />
                                                            Importando...
                                                        </>
                                                    ) : isImported ? (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4" /> Importado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4" /> Importar Modelo
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
