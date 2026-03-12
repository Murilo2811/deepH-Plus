"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAgents, runTeam, fetchCrews, type Agent, type Crew, type RunMode, type RunEventDagPlan, type RunEventUniverseHandoff } from "@/lib/api";
import { Play, Square, Users, ArrowRight, CheckSquare, Square as UncheckedSquare, Layers, Network, Terminal, GitMerge, Loader2 } from "lucide-react";
import { UniverseGraph, type UniverseNodeData, type HandoffEdgeData } from "@/components/universe-graph";
import { type Node, type Edge } from "@xyflow/react";

export interface GraphData {
    nodes: Node<UniverseNodeData>[];
    edges: Edge<HandoffEdgeData>[];
    activeNodes: string[];
    completedNodes: string[];
}

interface AgentOutput {
    agent: string;
    text: string;
    error?: string;
    running?: boolean;
}

export default function RunPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [crews, setCrews] = useState<Crew[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [selectedCrew, setSelectedCrew] = useState<string>("");
    const [mode, setMode] = useState<RunMode>("sequential");
    const [task, setTask] = useState("");
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<AgentOutput[]>([]);
    const abortRef = useRef<(() => void) | null>(null);
    const [activeTab, setActiveTab] = useState<"console" | "graph">("console");
    const [graphData, setGraphData] = useState<GraphData | null>(null);

    useEffect(() => {
        fetchAgents().then(setAgents).catch(console.error);
        fetchCrews().then(setCrews).catch(console.error);
    }, []);

    function toggleAgent(name: string) {
        setSelected(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        );
    }

    function handleStop() {
        abortRef.current?.();
        setRunning(false);
    }

    function handleRun() {
        if (!task.trim()) return;
        if (mode === "crew" && !selectedCrew) return;
        if (mode !== "crew" && selected.length === 0) return;

        setResults([]);
        setRunning(true);

        const callbacks = {
            onCrewStart: (e: { crew: string, universes: number }) => {
                setResults(prev => [...prev, { agent: `[Multiverse: ${e.crew}]`, text: `Iniciando ${e.universes} universos...`, running: false }]);
            },
            onDagPlan: (e: RunEventDagPlan) => {
                setGraphData({
                    nodes: e.nodes.map(n => ({
                        id: n.id,
                        position: { x: 0, y: 0 },
                        type: "universe",
                        data: {
                            label: n.label || n.id,
                            description: n.spec !== "-" ? n.spec : undefined,
                            status: "waiting"
                        }
                    })) as Node<UniverseNodeData>[],
                    edges: e.edges.map(ed => ({
                        id: `${ed.from}-${ed.to}-${ed.channel}`,
                        source: ed.from,
                        target: ed.to,
                        animated: true,
                        type: "handoff",
                        data: {
                            label: ed.channel || "handoff"
                        }
                    })) as Edge<HandoffEdgeData>[],
                    activeNodes: [],
                    completedNodes: []
                });
                setActiveTab("graph");
            },
            onAgentStart: ({ agent }: { agent: string }) => {
                setResults(prev => [...prev, { agent, text: "", running: true }]);
                setGraphData(prev => {
                    if (!prev) return null;
                    const activeNodes = Array.from(new Set([...prev.activeNodes, agent]));
                    return {
                        ...prev,
                        activeNodes,
                        nodes: prev.nodes.map(n => ({
                            ...n,
                            data: { ...n.data, status: activeNodes.includes(n.id) ? "running" : n.data.status }
                        })) as Node<UniverseNodeData>[]
                    };
                });
            },
            onAgentResult: ({ agent, text }: { agent: string, text: string }) => {
                setResults(prev => {
                    let idx = -1;
                    for (let i = prev.length - 1; i >= 0; i--) {
                        if (prev[i].agent === agent && prev[i].running) {
                            idx = i;
                            break;
                        }
                    }
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = { ...prev[idx], text, running: false };
                        return next;
                    }
                    return [...prev, { agent, text }];
                });
                setGraphData(prev => {
                    if (!prev) return null;
                    const activeNodes = prev.activeNodes.filter(n => n !== agent);
                    const completedNodes = Array.from(new Set([...prev.completedNodes, agent]));
                    return {
                        ...prev,
                        activeNodes,
                        completedNodes,
                        nodes: prev.nodes.map(n => ({
                            ...n,
                            data: { ...n.data, status: completedNodes.includes(n.id) ? "done" : activeNodes.includes(n.id) ? "running" : n.data.status }
                        })) as Node<UniverseNodeData>[]
                    };
                });
            },
            onUniverseHandoff: (e: RunEventUniverseHandoff) => {
                setResults(prev => [...prev, { agent: `[Handoff]`, text: `${e.from} ➔ ${e.to} via ${e.channel} (${e.chars} chars)`, running: false }]);
            },
            onAgentError: ({ agent, error }: { agent: string, error: string }) => {
                setResults(prev => {
                    let idx = -1;
                    for (let i = prev.length - 1; i >= 0; i--) {
                        if (prev[i].agent === agent && prev[i].running) {
                            idx = i;
                            break;
                        }
                    }
                    if (idx >= 0) {
                        const next = [...prev];
                        next[idx] = { ...prev[idx], text: "", error, running: false };
                        return next;
                    }
                    return [...prev, { agent, text: "", error }];
                });
                setGraphData(prev => {
                    if (!prev) return null;
                    const activeNodes = prev.activeNodes.filter(n => n !== agent);
                    const completedNodes = Array.from(new Set([...prev.completedNodes, agent]));
                    return {
                        ...prev,
                        activeNodes,
                        completedNodes,
                        nodes: prev.nodes.map(n => ({
                            ...n,
                            data: { ...n.data, status: n.id === agent ? "error" : n.data.status }
                        })) as Node<UniverseNodeData>[]
                    };
                });
            },
            onDone: () => setRunning(false),
        };

        abortRef.current = runTeam(selected, mode, task, callbacks, mode === "crew" ? selectedCrew : undefined);
    }

    const canRun = task.trim() !== "" && !running && (mode === "crew" ? !!selectedCrew : selected.length > 0);

    return (
        <div className="flex flex-col gap-10 p-8 max-w-5xl mx-auto animate-in">
            {/* Header Area */}
            <div className="relative">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--sketch-charcoal)] sketch-heading">
                    Modo <span className="underline decoration-sketch-yellow decoration-4 underline-offset-4">Equipe</span>
                </h1>
                <p className="mt-4 text-[var(--sketch-charcoal)] font-medium max-w-2xl">
                    Coordene múltiplos agentes em paralelo ou sequência para resolver tarefas complexas.
                </p>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-sketch-yellow opacity-20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Config & Input Section */}
            <div className="sketch-card-teal relative">
                <div className="flex flex-col gap-8">
                    {/* Execution Strategy */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-5 h-5 text-[var(--sketch-teal)]" />
                            <h2 className="sketch-label">Estratégia de Execução</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(["sequential", "parallel", "crew"] as RunMode[]).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`relative p-4 text-left transition-all sketch-card h-full ${mode === m
                                        ? "ring-2 ring-[var(--sketch-teal)] translate-y-[-2px] bg-[var(--sketch-yellow-pale)]"
                                        : "bg-white opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 shadow-sm"
                                        }`}
                                >
                                    <div className="font-bold text-[var(--sketch-charcoal)] flex items-center gap-2">
                                        {m === "crew" && <Network className="w-4 h-4" />}
                                        {m === "crew" ? "Multiverso (DAG)" : m === "sequential" ? "Sequencial" : "Paralelo"}
                                    </div>
                                    <div className="text-xs text-[var(--sketch-charcoal)] mt-1 leading-relaxed">
                                        {m === "crew" ? "Orquestração inteligente com grafo multiverso." : m === "sequential" ? "A saída de um agente alimenta o próximo." : "Todos os agentes executam simultaneamente."}
                                    </div>
                                    {mode === m && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--sketch-teal)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agent/Crew Selection */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {mode === "crew" ? <Network className="w-5 h-5 text-[var(--sketch-teal)]" /> : <Users className="w-5 h-5 text-[var(--sketch-teal)]" />}
                            <h2 className="sketch-label">
                                {mode === "crew" ? "Selecione a Equipe (Crew)" : `Selecionar Agentes (${selected.length})`}
                            </h2>
                        </div>

                        {mode === "crew" ? (
                            crews.length === 0 ? (
                                <div className="p-4 sketch-card-yellow text-sm italic">Nenhum multiverso configurado.</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {crews.map(crew => (
                                        <button
                                            key={crew.name}
                                            onClick={() => setSelectedCrew(crew.name)}
                                            className={`p-3 text-left transition-all sketch-card group ${selectedCrew === crew.name ? "bg-[var(--sketch-yellow)] border-[var(--sketch-charcoal)]" : "bg-white"}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {selectedCrew === crew.name ? <CheckSquare className="w-4 h-4" /> : <UncheckedSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />}
                                                <span className="font-bold text-sm truncate">{crew.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {agents.map(agent => (
                                    <button
                                        key={agent.name}
                                        onClick={() => toggleAgent(agent.name)}
                                        className={`p-3 text-left transition-all sketch-card group ${selected.includes(agent.name) ? "bg-[var(--sketch-yellow)] border-[var(--sketch-charcoal)]" : "bg-white"}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {selected.includes(agent.name) ? <CheckSquare className="w-4 h-4" /> : <UncheckedSquare className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />}
                                            <span className="font-bold text-sm truncate">{agent.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sequence Visualizer */}
                    {selected.length > 1 && mode === "sequential" && (
                        <div className="p-4 bg-[var(--sketch-yellow-pale)] border-2 border-dashed border-[var(--sketch-charcoal)/30] rounded-xl flex flex-wrap items-center gap-3">
                            <span className="text-[10px] font-black uppercase text-[var(--sketch-charcoal)] mr-1">Fluxo:</span>
                            {selected.map((name, i) => (
                                <div key={name} className="flex items-center gap-2">
                                    <span className="sketch-badge">{name}</span>
                                    {i < selected.length - 1 && <ArrowRight className="w-3 h-3 opacity-50" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Task Description */}
                    <div className="space-y-3">
                        <label className="sketch-label block">Descrição da Tarefa</label>
                        <textarea
                            value={task}
                            onChange={e => setTask(e.target.value)}
                            placeholder="Descreva o que os agentes devem realizar..."
                            rows={4}
                            className="sketch-input resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-4 pt-2">
                        <button
                            onClick={handleRun}
                            disabled={!canRun}
                            className={`sketch-btn-primary ${!canRun ? "opacity-40 cursor-not-allowed" : "animate-wiggle"}`}
                        >
                            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            {running ? "Executando..." : "Lançar Execução"}
                        </button>
                        {running && (
                            <button
                                onClick={handleStop}
                                className="sketch-btn-ghost text-red-600 border-red-400"
                            >
                                <Square className="w-4 h-4 fill-red-600" />
                                Abortar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {(results.length > 0 || graphData) && (
                <div className="space-y-6">
                    {/* View Toggle */}
                    <div className="flex gap-4 border-b-2 border-dashed border-[var(--sketch-charcoal)] pb-2 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab("console")}
                            className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === "console" ? "text-[var(--sketch-teal)] underline underline-offset-8 decoration-4" : "text-[var(--sketch-charcoal)] opacity-70 hover:opacity-100"}`}
                        >
                            <Terminal className="w-4 h-4" />
                            Log da Equipe
                        </button>
                        {graphData && (
                            <button
                                onClick={() => setActiveTab("graph")}
                                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === "graph" ? "text-[var(--sketch-teal)] underline underline-offset-8 decoration-4" : "text-[var(--sketch-charcoal-soft)] opacity-60 hover:opacity-100"}`}
                            >
                                <GitMerge className="w-4 h-4" />
                                Visualização Multiverso
                            </button>
                        )}
                    </div>

                    {/* Console View */}
                    {activeTab === "console" && (
                        <div className="space-y-4 animate-in">
                            {results.map((r, i) => (
                                <div
                                    key={i}
                                    className={`sketch-card ${r.error ? "border-red-500 shadow-red-500/20" : r.running ? "border-[var(--sketch-teal)] ring-1 ring-[var(--sketch-teal)]" : ""}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="sketch-badge">{r.agent}</span>
                                        {r.running && (
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-[var(--sketch-teal)] animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <div className="w-2 h-2 rounded-full bg-[var(--sketch-teal)] animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <div className="w-2 h-2 rounded-full bg-[var(--sketch-teal)] animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-lg p-1">
                                        {r.error ? (
                                            <p className="text-red-500 font-medium text-sm p-2">{r.error}</p>
                                        ) : (
                                            <pre className="text-sm overflow-x-auto p-4 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap font-mono leading-relaxed text-slate-700">
                                                {r.text}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Graph View */}
                    {activeTab === "graph" && graphData && (
                        <div className="sketch-card p-0 overflow-hidden h-[600px] border-4 animate-in">
                            <UniverseGraph {...(graphData as any)} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
