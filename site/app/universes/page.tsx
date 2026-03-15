"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { fetchCrews, updateCrew, type Crew, type Universe } from "@/lib/api";
import { UniverseGraph, type UniverseNodeData, type HandoffEdgeData } from "@/components/universe-graph";
import type { Node, Edge } from "@xyflow/react";
import { GitBranch, Users, Save, Shield, AlertTriangle, Layers, ChevronRight } from "lucide-react";

// ─── YAML Parser (manual, seguindo padrão do projeto) ───────────────────────

function parseUniverseYaml(yaml: string): Universe[] {
    const universes: Universe[] = [];
    let current: Partial<Universe> | null = null;

    for (const rawLine of yaml.split("\n")) {
        const line = rawLine.trimEnd();
        if (!line.trim() || line.trim().startsWith("#")) continue;

        // Top-level item: "- name: xxx" or "  - name: xxx"
        const itemMatch = line.match(/^\s*-\s+name:\s*(.+)/);
        if (itemMatch) {
            if (current && current.name) universes.push(current as Universe);
            current = { name: itemMatch[1].trim().replace(/^["']|["']$/g, "") };
            continue;
        }

        if (!current) continue;

        // Indented key: value pairs
        const kvMatch = line.match(/^\s+([\w_]+):\s*(.*)/);
        if (!kvMatch) continue;
        const [, key, rawVal] = kvMatch;
        const val = rawVal.trim().replace(/^["']|["']$/g, "");

        switch (key) {
            case "spec":
                current.spec = val;
                break;
            case "depends_on":
                // Supports: [a, b] or single value
                if (val.startsWith("[")) {
                    current.depends_on = val
                        .replace(/^\[|\]$/g, "")
                        .split(",")
                        .map(s => s.trim().replace(/^["']|["']$/g, ""))
                        .filter(Boolean);
                } else if (val) {
                    current.depends_on = [val];
                }
                break;
            case "input_port":
                current.input_port = val;
                break;
            case "output_port":
                current.output_port = val;
                break;
            case "output_kind":
                current.output_kind = val;
                break;
            case "merge_policy":
                current.merge_policy = val;
                break;
            case "handoff_max_chars":
                current.handoff_max_chars = parseInt(val) || undefined;
                break;
            case "input_prefix":
                current.input_prefix = val;
                break;
            case "input_suffix":
                current.input_suffix = val;
                break;
        }
    }
    if (current && current.name) universes.push(current as Universe);
    return universes;
}

// ─── YAML Serializer ────────────────────────────────────────────────────────

function universesToYaml(universes: Universe[]): string {
    if (!universes || universes.length === 0) return "# Nenhum universo definido\n";
    const lines: string[] = [];
    for (const u of universes) {
        lines.push(`- name: ${u.name}`);
        if (u.spec) lines.push(`  spec: ${u.spec}`);
        if (u.depends_on && u.depends_on.length > 0) {
            lines.push(`  depends_on: [${u.depends_on.join(", ")}]`);
        }
        if (u.input_port) lines.push(`  input_port: ${u.input_port}`);
        if (u.output_port) lines.push(`  output_port: ${u.output_port}`);
        if (u.output_kind) lines.push(`  output_kind: ${u.output_kind}`);
        if (u.merge_policy) lines.push(`  merge_policy: ${u.merge_policy}`);
        if (u.handoff_max_chars) lines.push(`  handoff_max_chars: ${u.handoff_max_chars}`);
        if (u.input_prefix) lines.push(`  input_prefix: ${u.input_prefix}`);
        if (u.input_suffix) lines.push(`  input_suffix: ${u.input_suffix}`);
        lines.push("");
    }
    return lines.join("\n");
}

// ─── Universe[] → ReactFlow Node/Edge ────────────────────────────────────────

function universesToGraph(universes: Universe[]): { nodes: Node<UniverseNodeData>[]; edges: Edge<HandoffEdgeData>[] } {
    if (!universes || universes.length === 0) return { nodes: [], edges: [] };

    const nodes: Node<UniverseNodeData>[] = universes.map((u, i) => ({
        id: u.name,
        type: "universe",
        position: { x: 0, y: 0 }, // dagre will layout
        data: {
            label: u.name,
            status: "waiting" as const,
            duration: u.output_kind || undefined,
        },
    }));

    const edges: Edge<HandoffEdgeData>[] = [];
    const nameSet = new Set(universes.map(u => u.name));

    for (const u of universes) {
        if (u.depends_on) {
            for (const dep of u.depends_on) {
                if (nameSet.has(dep)) {
                    const sourceUniverse = universes.find(x => x.name === dep);
                    edges.push({
                        id: `${dep}->${u.name}`,
                        source: dep,
                        target: u.name,
                        type: "handoff",
                        data: { active: false },
                        label: sourceUniverse?.output_kind || "",
                    });
                }
            }
        }
    }

    return { nodes, edges };
}

// ─── PAGE COMPONENT ─────────────────────────────────────────────────────────

export default function UniversesPage() {
    const [crews, setCrews] = useState<Crew[]>([]);
    const [selectedCrew, setSelectedCrew] = useState<Crew | null>(null);
    const [yamlStr, setYamlStr] = useState("");
    const [yamlError, setYamlError] = useState("");
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCrews().then(setCrews).catch(console.error);
    }, []);

    // When a crew is selected, set the YAML editor content
    const selectCrew = useCallback((crew: Crew) => {
        setSelectedCrew(crew);
        setYamlStr(universesToYaml(crew.universes || []));
        setYamlError("");
        setSuccess("");
        setError("");
    }, []);

    // Parse YAML in real-time for DAG preview
    const liveUniverses = useMemo<Universe[]>(() => {
        if (!yamlStr.trim()) return selectedCrew?.universes || [];
        try {
            const parsed = parseUniverseYaml(yamlStr);
            return parsed;
        } catch {
            return selectedCrew?.universes || [];
        }
    }, [yamlStr, selectedCrew]);

    const { nodes, edges } = useMemo(
        () => universesToGraph(liveUniverses),
        [liveUniverses]
    );

    const isReadOnly = selectedCrew?.source === "standard";

    const handleSave = async () => {
        if (!selectedCrew) return;
        setError("");
        setSuccess("");
        setYamlError("");

        let parsed: Universe[];
        try {
            parsed = parseUniverseYaml(yamlStr);
            if (parsed.length === 0) {
                setYamlError("YAML inválido: nenhum universo encontrado.");
                return;
            }
            if (parsed.some(u => !u.name || !u.spec)) {
                setYamlError("YAML inválido: todo universo precisa de 'name' e 'spec'.");
                return;
            }
        } catch (e: any) {
            setYamlError("Erro ao parsear YAML: " + e.message);
            return;
        }

        setSaving(true);
        try {
            const updatedCrew: Crew = {
                ...selectedCrew,
                universes: parsed,
            };
            const result = await updateCrew(selectedCrew.name, updatedCrew);
            setCrews(prev => prev.map(c => c.name === selectedCrew.name ? result : c));
            setSelectedCrew(result);
            setYamlStr(universesToYaml(result.universes || []));
            setSuccess("Universos salvos com sucesso!");
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar universos.");
        } finally {
            setSaving(false);
        }
    };

    // Validate YAML on change
    const handleYamlChange = (value: string) => {
        setYamlStr(value);
        setYamlError("");
        setSuccess("");
        try {
            parseUniverseYaml(value);
        } catch {
            setYamlError("Erro de sintaxe no YAML");
        }
    };

    // Separate crews with and without universes
    const crewsWithUniverses = crews.filter(c => c.universes && c.universes.length > 0);
    const crewsWithoutUniverses = crews.filter(c => !c.universes || c.universes.length === 0);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 flex items-center gap-4 border-b-[2.5px] border-sketch-charcoal bg-sketch-paper-warm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-sketch-teal-dark border-2 border-sketch-charcoal shadow-[2px_2px_0_0_rgba(34,43,49,1)]">
                        <GitBranch className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-sketch-charcoal tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                            Universos
                        </h1>
                        <p className="text-xs text-sketch-charcoal-soft font-medium tracking-wide">
                            Branches de execução • DAG visual • Editor YAML
                        </p>
                    </div>
                </div>
            </div>

            {/* 3-Panel Layout */}
            <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
                {/* Panel 1: Crew List */}
                <aside className="w-[280px] flex-shrink-0 border-r-[2.5px] border-sketch-charcoal bg-sketch-paper-warm overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-xs font-bold text-sketch-charcoal uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Times ({crews.length})
                        </h2>

                        {/* Crews with universes */}
                        {crewsWithUniverses.length > 0 && (
                            <div className="mb-4">
                                <p className="text-[10px] font-bold text-sketch-teal uppercase tracking-widest mb-2 flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> Com Universos
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {crewsWithUniverses.map(crew => (
                                        <button
                                            key={crew.name}
                                            onClick={() => selectCrew(crew)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all duration-200 group ${
                                                selectedCrew?.name === crew.name
                                                    ? "border-sketch-teal bg-[#26C2B9]/10 shadow-[2px_2px_0_0_rgba(34,43,49,0.5)]"
                                                    : "border-sketch-charcoal/20 hover:border-sketch-charcoal/50 bg-white/50 hover:bg-white/80"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`text-sm font-semibold truncate ${
                                                    selectedCrew?.name === crew.name ? "text-sketch-teal-dark" : "text-sketch-charcoal"
                                                }`}>{crew.name}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] font-bold bg-sketch-teal/15 text-sketch-teal-dark px-1.5 py-0.5 rounded-full">
                                                        {crew.universes?.length} u
                                                    </span>
                                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                                        selectedCrew?.name === crew.name ? "text-sketch-teal rotate-90" : "text-sketch-charcoal/30"
                                                    }`} />
                                                </div>
                                            </div>
                                            {crew.description && (
                                                <p className="text-[11px] text-sketch-charcoal-soft mt-0.5 truncate">{crew.description}</p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Crews without universes */}
                        {crewsWithoutUniverses.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-sketch-charcoal/40 uppercase tracking-widest mb-2">
                                    Sem Universos
                                </p>
                                <div className="flex flex-col gap-1">
                                    {crewsWithoutUniverses.map(crew => (
                                        <button
                                            key={crew.name}
                                            onClick={() => selectCrew(crew)}
                                            className={`w-full text-left px-3 py-2 rounded-lg border-2 transition-all opacity-50 hover:opacity-75 ${
                                                selectedCrew?.name === crew.name
                                                    ? "border-sketch-charcoal/30 bg-white/60"
                                                    : "border-transparent hover:border-sketch-charcoal/10 bg-transparent"
                                            }`}
                                            title="Sem universos definidos"
                                        >
                                            <span className="text-xs text-sketch-charcoal/60 truncate block">{crew.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {crews.length === 0 && (
                            <div className="py-12 text-center">
                                <Users className="w-8 h-8 text-sketch-charcoal/15 mx-auto mb-2" />
                                <p className="text-xs text-sketch-charcoal/40">Nenhum time encontrado.</p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Panel 2: DAG Visual */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#F5FAF9]">
                    {selectedCrew && nodes.length > 0 ? (
                        <div className="flex-1 relative" style={{ minHeight: "400px" }}>
                            <UniverseGraph nodes={nodes} edges={edges} />
                        </div>
                    ) : selectedCrew && nodes.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-8">
                                <Layers className="w-12 h-12 text-sketch-charcoal/15 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-sketch-charcoal/40">
                                    Nenhum universo definido
                                </p>
                                <p className="text-xs text-sketch-charcoal/30 mt-1 max-w-[280px]">
                                    Adicione universos no editor YAML à direita para visualizar o DAG.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="w-20 h-20 rounded-2xl border-[3px] border-dashed border-sketch-charcoal/15 flex items-center justify-center mx-auto mb-4">
                                    <GitBranch className="w-8 h-8 text-sketch-charcoal/15" />
                                </div>
                                <p className="text-sm font-semibold text-sketch-charcoal/40">
                                    Selecione uma crew à esquerda
                                </p>
                                <p className="text-xs text-sketch-charcoal/30 mt-1 max-w-[260px]">
                                    Escolha um time para visualizar seus universos como um DAG interativo.
                                </p>
                            </div>
                        </div>
                    )}
                </main>

                {/* Panel 3: YAML Editor */}
                <aside className="w-[380px] flex-shrink-0 border-l-[2.5px] border-sketch-charcoal bg-sketch-paper-warm flex flex-col overflow-hidden">
                    {selectedCrew ? (
                        <>
                            {/* Editor Header */}
                            <div className="px-4 py-3 border-b-2 border-sketch-charcoal/15 flex items-center justify-between">
                                <h2 className="text-xs font-bold text-sketch-charcoal uppercase tracking-widest flex items-center gap-2">
                                    <GitBranch className="w-3.5 h-3.5 text-sketch-teal" />
                                    universes: <span className="text-sketch-teal-dark">{selectedCrew.name}</span>
                                </h2>
                                {isReadOnly && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-sketch-teal-dark bg-sketch-teal/10 px-2 py-0.5 rounded-full border border-sketch-teal/20">
                                        <Shield className="w-3 h-3" /> Read-only
                                    </div>
                                )}
                            </div>

                            {/* YAML Editor */}
                            <div className="flex-1 overflow-auto">
                                <div className="flex min-h-full">
                                    {/* Line numbers */}
                                    <div className="py-3 px-2 bg-sketch-charcoal/5 select-none border-r border-sketch-charcoal/10 min-w-[2.5rem] text-right flex-shrink-0">
                                        {yamlStr.split("\n").map((_, idx) => (
                                            <div key={idx} className="text-sketch-charcoal/25 text-[11px] font-mono leading-[1.625rem]">
                                                {idx + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <textarea
                                        value={yamlStr}
                                        onChange={e => handleYamlChange(e.target.value)}
                                        spellCheck={false}
                                        readOnly={isReadOnly}
                                        className={`flex-1 bg-transparent text-sketch-charcoal p-3 font-mono text-xs leading-[1.625rem] resize-none focus:outline-none min-h-full w-full ${
                                            isReadOnly ? "opacity-60 cursor-not-allowed" : ""
                                        }`}
                                        style={{ tabSize: 2 }}
                                    />
                                </div>
                            </div>

                            {/* Editor Footer */}
                            <div className="px-4 py-3 border-t-2 border-sketch-charcoal/15 flex flex-col gap-2">
                                {yamlError && (
                                    <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> {yamlError}
                                    </p>
                                )}
                                {error && (
                                    <p className="text-[11px] font-semibold text-red-600">{error}</p>
                                )}
                                {success && (
                                    <p className="text-[11px] font-semibold text-sketch-teal-dark">{success}</p>
                                )}
                                {!isReadOnly && (
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !yamlStr.trim()}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sketch-teal-dark text-white font-bold text-sm border-2 border-sketch-charcoal shadow-[2px_2px_0_0_rgba(34,43,49,1)] hover:shadow-[1px_1px_0_0_rgba(34,43,49,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-40 disabled:hover:shadow-[2px_2px_0_0_rgba(34,43,49,1)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? "Salvando..." : "Salvar Universos"}
                                    </button>
                                )}
                                <p className="text-[10px] text-sketch-charcoal/40 text-center">
                                    Edite o YAML → DAG atualiza em tempo real
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <GitBranch className="w-8 h-8 text-sketch-charcoal/15 mx-auto mb-2" />
                                <p className="text-xs text-sketch-charcoal/40">
                                    Selecione um time para editar seus universos.
                                </p>
                            </div>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
