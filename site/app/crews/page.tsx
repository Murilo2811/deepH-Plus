"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchAgents, fetchCrews, saveCrew, type Agent, type Crew } from "@/lib/api";
import { Users, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Save } from "lucide-react";

function generateYaml(crew: Crew): string {
    const lines: string[] = [`name: ${crew.name}`];
    if (crew.description) lines.push(`description: ${crew.description}`);
    lines.push(`spec: ${crew.spec}`);
    return lines.join("\n");
}

export default function CrewsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [crews, setCrews] = useState<Crew[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [mode, setMode] = useState<"sequential" | "parallel">("sequential");
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [yamlOpen, setYamlOpen] = useState(false);

    useEffect(() => {
        fetchAgents().then(setAgents).catch(console.error);
        fetchCrews().then(setCrews).catch(console.error);
    }, []);

    function toggleAgent(agentName: string) {
        setSelectedAgents(prev =>
            prev.includes(agentName) ? prev.filter(n => n !== agentName) : [...prev, agentName]
        );
    }

    function moveAgent(index: number, direction: "up" | "down") {
        if (mode !== "sequential") return;
        setSelectedAgents(prev => {
            const arr = [...prev];
            const target = direction === "up" ? index - 1 : index + 1;
            if (target < 0 || target >= arr.length) return arr;
            [arr[index], arr[target]] = [arr[target], arr[index]];
            return arr;
        });
    }

    const spec = useMemo(() => {
        if (selectedAgents.length === 0) return "";
        return mode === "sequential"
            ? selectedAgents.join(">")
            : selectedAgents.join("+");
    }, [selectedAgents, mode]);

    const previewCrew: Crew = { name: name || "meu-time", description, spec };
    const yaml = generateYaml(previewCrew);

    async function handleSave() {
        setError("");
        setSuccess("");
        if (!name.trim()) { setError("O nome do crew é obrigatório."); return; }
        if (selectedAgents.length === 0) { setError("Selecione ao menos um agente."); return; }
        setSaving(true);
        try {
            const crew: Crew = { name: name.trim(), description: description.trim(), spec };
            await saveCrew(crew);
            setCrews(prev => {
                const idx = prev.findIndex(c => c.name === crew.name);
                return idx >= 0 ? prev.map((c, i) => i === idx ? crew : c) : [...prev, crew];
            });
            setSuccess(`Time "${crew.name}" salvo com sucesso!`);
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary">Times (Crews)</h1>
                <p className="text-sm text-slate-400 mt-1">Crie e gerencie equipes de agentes. O arquivo YAML é salvo automaticamente na pasta <code className="bg-primary/10 text-primary px-1 rounded">crews/</code>.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Builder */}
                <div className="rounded-2xl border border-primary/10 bg-background-dark/40 p-5 flex flex-col gap-5">
                    <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" /> Criar Novo Time
                    </h2>

                    {/* Name */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Nome do Time</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                            placeholder="meu-time"
                            className="w-full rounded-xl border border-primary/10 bg-background-dark/60 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-primary/40 placeholder-slate-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Descrição (opcional)</label>
                        <input
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Descreva o objetivo do time..."
                            className="w-full rounded-xl border border-primary/10 bg-background-dark/60 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-primary/40 placeholder-slate-500"
                        />
                    </div>

                    {/* Mode */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Modo</label>
                        <div className="flex gap-2">
                            {(["sequential", "parallel"] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${mode === m ? "border-primary text-primary bg-primary/10" : "border-primary/10 text-slate-400 hover:border-primary/30"}`}
                                >
                                    {m === "sequential" ? "Sequencial (>)" : "Paralelo (+)"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agent Selector */}
                    <div>
                        <label className="text-xs text-slate-400 mb-2 block">Agentes</label>
                        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                            {agents.length === 0 ? (
                                <p className="text-xs text-slate-500">Nenhum agente encontrado.</p>
                            ) : agents.map(a => {
                                const idx = selectedAgents.indexOf(a.name);
                                const isSelected = idx >= 0;
                                return (
                                    <div key={a.name} className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleAgent(a.name)}
                                            className={`flex-1 text-left px-3 py-1.5 rounded-lg border text-xs transition-all ${isSelected ? "border-primary/50 bg-primary/10 text-primary" : "border-primary/10 text-slate-300 hover:border-primary/30"}`}
                                        >
                                            {isSelected && <span className="mr-1 text-primary/70">{idx + 1}.</span>}
                                            {a.name}
                                        </button>
                                        {isSelected && mode === "sequential" && (
                                            <div className="flex flex-col gap-0.5">
                                                <button onClick={() => moveAgent(idx, "up")} className="text-slate-500 hover:text-primary transition-colors"><ArrowUp className="w-3 h-3" /></button>
                                                <button onClick={() => moveAgent(idx, "down")} className="text-slate-500 hover:text-primary transition-colors"><ArrowDown className="w-3 h-3" /></button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* YAML Preview */}
                    {spec && (
                        <div>
                            <button
                                onClick={() => setYamlOpen(v => !v)}
                                className="text-xs text-slate-400 flex items-center gap-1 hover:text-primary transition-colors"
                            >
                                {yamlOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                Preview YAML
                            </button>
                            {yamlOpen && (
                                <pre className="mt-2 text-xs text-primary/80 bg-background-dark/60 rounded-xl border border-primary/10 p-3 overflow-x-auto font-mono leading-relaxed">
                                    {yaml}
                                </pre>
                            )}
                        </div>
                    )}

                    {/* Feedback */}
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    {success && <p className="text-xs text-green-400">{success}</p>}

                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim() || selectedAgents.length === 0}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background-dark font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(15,240,146,0.2)]"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Salvando..." : "Salvar Time"}
                    </button>
                </div>

                {/* Crews List */}
                <div className="rounded-2xl border border-primary/10 bg-background-dark/40 p-5 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Times Existentes ({crews.length})
                    </h2>
                    {crews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="w-10 h-10 text-primary/20 mb-3" />
                            <p className="text-sm text-slate-500">Nenhum time criado ainda.</p>
                            <p className="text-xs text-slate-600 mt-1">Crie seu primeiro time à esquerda.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                            {crews.map(crew => (
                                <div
                                    key={crew.name}
                                    className="rounded-xl border border-primary/10 p-3 hover:border-primary/30 transition-all cursor-pointer"
                                    onClick={() => {
                                        const parts = crew.spec.includes(">")
                                            ? crew.spec.split(">")
                                            : crew.spec.split("+");
                                        setName(crew.name);
                                        setDescription(crew.description ?? "");
                                        setMode(crew.spec.includes(">") ? "sequential" : "parallel");
                                        setSelectedAgents(parts.filter(Boolean));
                                        setYamlOpen(false);
                                        setError("");
                                        setSuccess("");
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm font-medium text-slate-200">{crew.name}</div>
                                            {crew.description && <div className="text-xs text-slate-500 mt-0.5">{crew.description}</div>}
                                        </div>
                                        <span className="text-xs text-slate-600 bg-background-dark/60 px-2 py-0.5 rounded-lg shrink-0">
                                            {crew.spec.includes(">") ? "seq" : "par"}
                                        </span>
                                    </div>
                                    <code className="text-xs text-primary/60 mt-1 block truncate">{crew.spec}</code>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
