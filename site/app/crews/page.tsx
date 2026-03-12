"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchAgents, fetchCrews, saveCrew, updateCrew, deleteCrew, type Agent, type Crew } from "@/lib/api";
import { Users, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Save, XCircle, Pencil, FileText } from "lucide-react";

function generateYaml(crew: Crew): string {
    const lines: string[] = [`name: ${crew.name}`];
    if (crew.description) lines.push(`description: ${crew.description}`);
    lines.push(`spec: ${crew.spec}`);
    return lines.join("\n");
}

function parseCrewYaml(yaml: string): Crew {
    const result: Crew = { name: "", description: "", spec: "" };
    const lines = yaml.split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const m = trimmed.match(/^(\w+):\s*(.*)/);
        if (!m) continue;
        const [, key, val] = m;
        const valTrimmed = val.trim().replace(/^["']|["']$/g, "");
        if (key === "name") result.name = valTrimmed;
        if (key === "description") result.description = valTrimmed;
        if (key === "spec") result.spec = valTrimmed;
    }
    return result;
}

export default function CrewsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [crews, setCrews] = useState<Crew[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [mode, setMode] = useState<"sequential" | "parallel">("sequential");
    const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [yamlOpen, setYamlOpen] = useState(false);
    // Tracks the *original* name of the crew being edited. null = creating new crew.
    const [editingCrewName, setEditingCrewName] = useState<string | null>(null);

    const [editorMode, setEditorMode] = useState<"visual" | "yaml">("visual");
    const [editorYamlStr, setEditorYamlStr] = useState("");
    const [editorYamlError, setEditorYamlError] = useState("");

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

    function resetForm() {
        setName("");
        setDescription("");
        setMode("sequential");
        setSelectedAgents([]);
        setEditingCrewName(null);
        setYamlOpen(false);
        setError("");
        setSuccess("");
        setEditorMode("visual");
        setEditorYamlStr("");
        setEditorYamlError("");
    }

    const spec = useMemo(() => {
        if (selectedAgents.length === 0) return "";
        return mode === "sequential"
            ? selectedAgents.join(">")
            : selectedAgents.join("+");
    }, [selectedAgents, mode]);

    const previewCrew: Crew = { name: name || "meu-time", description, spec };
    const yaml = generateYaml(previewCrew);

    const switchMode = (newMode: "visual" | "yaml") => {
        if (newMode === "visual" && editorMode === "yaml") {
            try {
                const parsed = parseCrewYaml(editorYamlStr);
                if (!parsed.name || !parsed.spec) throw new Error("YAML inválido: 'name' e 'spec' são obrigatórios.");

                setName(parsed.name);
                setDescription(parsed.description || "");

                const parts = parsed.spec.includes(">") ? parsed.spec.split(">") : parsed.spec.split("+");
                setMode(parsed.spec.includes(">") ? "sequential" : "parallel");
                setSelectedAgents(parts.map(p => p.trim()).filter(Boolean));

                setEditorYamlError("");
            } catch (e: any) {
                setEditorYamlError(e.message);
                return;
            }
        }
        if (newMode === "yaml" && editorMode === "visual") {
            setEditorYamlStr(yaml);
        }
        setEditorMode(newMode);
    };

    async function handleSave() {
        setError("");
        setSuccess("");
        setEditorYamlError("");

        let crewToSave: Crew;
        if (editorMode === "yaml") {
            try {
                crewToSave = parseCrewYaml(editorYamlStr);
                if (!crewToSave.name.trim() || !crewToSave.spec.trim()) {
                    setEditorYamlError("YAML inválido: 'name' e 'spec' são obrigatórios.");
                    return;
                }
            } catch (e: any) {
                setEditorYamlError("YAML inválido: " + e.message);
                return;
            }
        } else {
            if (!name.trim()) { setError("O nome do crew é obrigatório."); return; }
            if (selectedAgents.length === 0) { setError("Selecione ao menos um agente."); return; }
            crewToSave = { name: name.trim(), description: description.trim(), spec };
        }

        setSaving(true);
        try {
            if (editingCrewName !== null) {
                // Editing an existing crew — use PUT so the backend can handle renames
                const updated = await updateCrew(editingCrewName, crewToSave);
                setCrews(prev => prev.map(c => c.name === editingCrewName ? updated : c));
                setEditingCrewName(updated.name); // update in case name changed
                setSuccess(`Time "${updated.name}" atualizado com sucesso!`);
                // Keep the YAML in sync if we are in YAML mode
                if (editorMode === "yaml") setEditorYamlStr(generateYaml(updated));
            } else {
                // Creating a new crew — use POST
                const created = await saveCrew(crewToSave);
                setCrews(prev => {
                    const idx = prev.findIndex(c => c.name === created.name);
                    return idx >= 0 ? prev.map((c, i) => i === idx ? created : c) : [...prev, created];
                });
                setSuccess(`Time "${created.name}" salvo com sucesso!`);
                setEditingCrewName(created.name);
                if (editorMode === "yaml") setEditorYamlStr(generateYaml(created));
            }
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(crewName: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!window.confirm(`Excluir o crew "${crewName}"? Esta ação não pode ser desfeita.`)) return;
        setDeleting(crewName);
        setError("");
        try {
            await deleteCrew(crewName);
            setCrews(prev => prev.filter(c => c.name !== crewName));
            setSuccess(`Crew "${crewName}" excluído com sucesso.`);
            // Reset form if we were editing this crew
            if (editingCrewName === crewName) resetForm();
        } catch (e: any) {
            setError(e.message ?? "Erro ao excluir.");
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-50 uppercase tracking-tighter drop-shadow-md">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-500">Times</span> & Crews
                </h1>
                <p className="text-cyan border border-cyan/20 bg-cyan/5 px-2 py-0.5 rounded-full mt-2 font-medium tracking-widest text-[10px] uppercase inline-block">
                    Equipes de Agentes — YAML auto-salvo em <code className="font-mono">crews/</code>
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Builder */}
                <div className="rounded-2xl border border-white/5 bg-background-elevated/50 shadow-2xl backdrop-blur-sm p-5 flex flex-col gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan/5 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-1 relative">
                        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Plus className="w-4 h-4 text-cyan" />
                            {editingCrewName ? `Editando: ${editingCrewName}` : "Criar Novo Time"}
                        </h2>
                        <div className="flex bg-background/50 rounded border border-white/5 p-0.5">
                            {(["visual", "yaml"] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-colors ${editorMode === m
                                        ? "bg-cyan/20 text-cyan"
                                        : "text-slate-400 hover:text-slate-200"
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {editorYamlError && <p className="text-xs text-red-500">{editorYamlError}</p>}

                    {editorMode === "yaml" ? (
                        <div className="flex-1 flex flex-col gap-2 min-h-[350px]">
                            <div className="flex rounded-xl overflow-hidden border border-white/5 bg-background/60">
                                <div className="py-3 px-2 bg-black/30 select-none border-r border-white/5 min-w-[2.5rem] text-right">
                                    {editorYamlStr.split("\n").map((_, idx) => (
                                        <div key={idx} className="text-slate-500 text-[11px] font-mono leading-[1.625rem]">
                                            {idx + 1}
                                        </div>
                                    ))}
                                </div>
                                <textarea
                                    value={editorYamlStr}
                                    onChange={e => { setEditorYamlStr(e.target.value); setEditorYamlError(""); }}
                                    spellCheck={false}
                                    className="flex-1 bg-transparent text-cyan p-3 font-mono text-xs leading-[1.625rem] resize-y focus:outline-none min-h-[350px] w-full"
                                    style={{ tabSize: 2 }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-500 text-center mt-1">
                                ✏️ Edite o YAML diretamente e clique em Salvar Time.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Name */}
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Nome do Time</label>
                                <input
                                    value={name}
                                    onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                                    placeholder="meu-time"
                                    className="w-full rounded-xl border border-white/5 bg-background/60 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-cyan/40 placeholder-slate-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Descrição (opcional)</label>
                                <input
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Descreva o objetivo do time..."
                                    className="w-full rounded-xl border border-white/5 bg-background/60 text-slate-200 text-sm px-3 py-2 focus:outline-none focus:border-cyan/40 placeholder-slate-500"
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
                                            className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${mode === m ? "border-cyan text-cyan bg-cyan/10" : "border-white/5 text-slate-400 hover:border-cyan/30"}`}
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
                                                    className={`flex-1 text-left px-3 py-1.5 rounded-lg border text-xs transition-all ${isSelected ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-white/5 text-slate-300 hover:border-cyan/30"}`}
                                                >
                                                    {isSelected && <span className="mr-1 text-cyan/70">{idx + 1}.</span>}
                                                    {a.name}
                                                </button>
                                                {isSelected && mode === "sequential" && (
                                                    <div className="flex flex-col gap-0.5">
                                                        <button onClick={() => moveAgent(idx, "up")} className="text-slate-500 hover:text-cyan transition-colors"><ArrowUp className="w-3 h-3" /></button>
                                                        <button onClick={() => moveAgent(idx, "down")} className="text-slate-500 hover:text-cyan transition-colors"><ArrowDown className="w-3 h-3" /></button>
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
                                        <pre className="mt-2 text-xs text-cyan/80 bg-background/60 rounded-xl border border-white/5 p-3 overflow-x-auto font-mono leading-relaxed">
                                            {yaml}
                                        </pre>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* Feedback */}
                    {error && <p className="text-xs text-red-400">{error}</p>}
                    {success && <p className="text-xs text-green-400">{success}</p>}

                    {/* Actions */}
                    <div className="flex gap-2">
                        {editingCrewName && (
                            <button
                                onClick={resetForm}
                                title="Cancelar edição"
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm hover:border-slate-400 hover:text-slate-200 transition-all"
                            >
                                <XCircle className="w-4 h-4" /> Cancelar
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving || (editorMode === "visual" ? (!name.trim() || selectedAgents.length === 0) : !editorYamlStr.trim())}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan text-background font-semibold text-sm disabled:opacity-40 hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Salvando..." : editingCrewName ? "Atualizar Time" : "Salvar Time"}
                        </button>
                    </div>
                </div>

                {/* Crews List */}
                <div className="rounded-2xl border border-white/5 bg-background-elevated/50 shadow-2xl backdrop-blur-sm p-5 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan" />
                        Times Existentes ({crews.length})
                    </h2>
                    {crews.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Users className="w-10 h-10 text-cyan/20 mb-3" />
                            <p className="text-sm text-slate-500">Nenhum time criado ainda.</p>
                            <p className="text-xs text-slate-600 mt-1">Crie seu primeiro time à esquerda.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                            {crews.map(crew => (
                                <div
                                    key={crew.name}
                                    className={`rounded-xl border p-3 transition-all cursor-pointer ${editingCrewName === crew.name
                                        ? "border-cyan/60 bg-cyan/5"
                                        : "border-white/5 hover:border-cyan/30"
                                        }`}
                                    onClick={() => {
                                        const parts = crew.spec.includes(">")
                                            ? crew.spec.split(">")
                                            : crew.spec.split("+");
                                        setEditingCrewName(crew.name);
                                        setName(crew.name);
                                        setDescription(crew.description ?? "");
                                        setMode(crew.spec.includes(">") ? "sequential" : "parallel");
                                        setSelectedAgents(parts.filter(Boolean));
                                        setYamlOpen(false);
                                        setError("");
                                        setSuccess("");
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-slate-200">{crew.name}</div>
                                            {crew.description && <div className="text-xs text-slate-500 mt-0.5 truncate">{crew.description}</div>}
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                            <span className="text-xs text-slate-500 bg-background-dark/60 px-2 py-0.5 rounded-lg">
                                                {crew.spec.includes(">") ? "seq" : "par"}
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); }}
                                                title="Clique no card para editar"
                                                className="p-1 rounded-lg text-cyan/50 hover:text-cyan transition-all"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(crew.name, e)}
                                                disabled={deleting === crew.name}
                                                title="Excluir crew"
                                                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <code className="text-xs text-cyan/60 mt-1 block truncate">{crew.spec}</code>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
