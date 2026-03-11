"use client";

import { useEffect, useState, useRef } from "react";
import { fetchAgents, runTeam, fetchCrews, type Agent, type Crew, type RunMode, type RunEventDagPlan, type RunEventUniverseHandoff } from "@/lib/api";
import { Play, Square, Users, ArrowRight, CheckSquare, Square as UncheckedSquare, Layers, Network, Terminal, GitMerge } from "lucide-react";
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
                setResults(prev => [...prev, { agent: `[Multiverse: ${e.crew}]`, text: `Starting ${e.universes} universes...`, running: false }]);
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
        <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary">Modo Equipe</h1>
                <p className="text-sm text-slate-400 mt-1">Execute múltiplos agentes em sequência ou paralelo</p>
            </div>

            {/* Config Panel */}
            <div className="rounded-2xl border border-primary/10 bg-background-dark/40 p-6 flex flex-col gap-6">
                {/* Mode Picker */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        Modo de Execução
                    </h2>
                    <div className="flex gap-3">
                        {(["sequential", "parallel", "crew"] as RunMode[]).map(m => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 rounded-xl border text-sm font-medium transition-all ${mode === m
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-primary/10 hover:border-primary/30 text-slate-400"
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {m === "crew" && <Network className="w-4 h-4" />}
                                    {m === "crew" ? "Multiverso (DAG)" : m === "sequential" ? "Sequencial" : "Paralelo"}
                                </div>
                                <div className="text-xs font-normal opacity-70 mt-0.5">
                                    {m === "crew" ? "Orquestração Inteligente" : m === "sequential" ? "Saída de um alimenta o próximo" : "Todos ao mesmo tempo"}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scope Selector */}
                {mode === "crew" ? (
                    <div>
                        <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                            <Network className="w-4 h-4 text-primary" />
                            Selecione um Crew (Multiverso)
                        </h2>
                        {crews.length === 0 ? (
                            <p className="text-sm text-slate-500">Nenhum crew encontrado. Crie um crew primeiro.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-2">
                                {crews.map(crew => {
                                    const isSelected = selectedCrew === crew.name;
                                    return (
                                        <button
                                            key={crew.name}
                                            onClick={() => setSelectedCrew(crew.name)}
                                            className={`text-left p-3 rounded-xl border transition-all ${isSelected
                                                ? "border-primary/60 bg-primary/10 text-primary"
                                                : "border-primary/10 hover:border-primary/30 text-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isSelected
                                                    ? <CheckSquare className="w-4 h-4 shrink-0" />
                                                    : <UncheckedSquare className="w-4 h-4 shrink-0 text-slate-500" />
                                                }
                                                <div className="min-w-0">
                                                    <div className="font-medium text-sm truncate">{crew.name}</div>
                                                    {crew.description && (
                                                        <div className="text-xs text-slate-500 truncate">{crew.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Agent Selector */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Selecione os Agentes ({selected.length} escolhidos)
                            </h2>
                            {agents.length === 0 ? (
                                <p className="text-sm text-slate-500">Nenhum agente encontrado. Crie um agente primeiro.</p>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {agents.map(agent => {
                                        const isSelected = selected.includes(agent.name);
                                        return (
                                            <button
                                                key={agent.name}
                                                onClick={() => toggleAgent(agent.name)}
                                                className={`text-left p-3 rounded-xl border transition-all ${isSelected
                                                    ? "border-primary/60 bg-primary/10 text-primary"
                                                    : "border-primary/10 hover:border-primary/30 text-slate-300"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isSelected
                                                        ? <CheckSquare className="w-4 h-4 shrink-0" />
                                                        : <UncheckedSquare className="w-4 h-4 shrink-0 text-slate-500" />
                                                    }
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-sm truncate">{agent.name}</div>
                                                        {agent.description && (
                                                            <div className="text-xs text-slate-500 truncate">{agent.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Selected order (sequential) */}
                        {selected.length > 1 && mode === "sequential" && (
                            <div>
                                <h2 className="text-xs font-semibold text-slate-400 mb-2">Ordem de execução</h2>
                                <div className="flex flex-wrap items-center gap-1">
                                    {selected.map((name, i) => (
                                        <span key={name} className="flex items-center gap-1">
                                            <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">{name}</span>
                                            {i < selected.length - 1 && <ArrowRight className="w-3 h-3 text-slate-500" />}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Task Input */}
                <div>
                    <h2 className="text-sm font-semibold text-slate-300 mb-2">Tarefa</h2>
                    <textarea
                        value={task}
                        onChange={e => setTask(e.target.value)}
                        placeholder="Descreva o que a equipe deve fazer..."
                        rows={3}
                        className="w-full rounded-xl border border-primary/10 bg-background-dark/60 text-slate-200 placeholder-slate-500 text-sm px-4 py-3 resize-none focus:outline-none focus:border-primary/40 transition-colors"
                    />
                </div>

                {/* Run / Stop */}
                <div className="flex gap-3">
                    <button
                        onClick={handleRun}
                        disabled={!canRun}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-background-dark font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(15,240,146,0.25)]"
                    >
                        <Play className="w-4 h-4" />
                        Executar Equipe
                    </button>
                    {running && (
                        <button
                            onClick={handleStop}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm transition-all"
                        >
                            <Square className="w-4 h-4" />
                            Parar
                        </button>
                    )}
                </div>
            </div>

            {/* Tab selector for results */}
            {(results.length > 0 || graphData) && (
                <div className="flex items-center gap-4 border-b border-primary/10 pb-2 mb-4">
                    <button
                        onClick={() => setActiveTab("console")}
                        className={`flex items-center gap-2 pb-2 px-2 text-sm font-medium transition-all border-b-2 -mb-[9px] ${activeTab === "console" ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-slate-300"}`}
                    >
                        <Terminal className="w-4 h-4" />
                        Console Logs
                    </button>
                    {graphData && (
                        <button
                            onClick={() => setActiveTab("graph")}
                            className={`flex items-center gap-2 pb-2 px-2 text-sm font-medium transition-all border-b-2 -mb-[9px] ${activeTab === "graph" ? "text-primary border-primary" : "text-slate-400 border-transparent hover:text-slate-300"}`}
                        >
                            <GitMerge className="w-4 h-4" />
                            Flow View
                        </button>
                    )}
                </div>
            )}

            {/* Results */}
            {activeTab === "graph" && graphData ? (
                <div className="border border-primary/10 rounded-2xl overflow-hidden bg-background-dark/20" style={{ height: "600px" }}>
                    <UniverseGraph {...(graphData as any)} />
                </div>
            ) : (
                results.length > 0 && (
                    <div className="flex flex-col gap-4">
                        {results.map((r, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl border p-4 transition-all ${r.error
                                    ? "border-red-500/30 bg-red-500/5"
                                    : r.running
                                        ? "border-primary/30 bg-primary/5 animate-pulse"
                                        : "border-primary/10 bg-background-dark/40"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{r.agent}</span>
                                    {r.running && <span className="text-xs text-slate-400 animate-pulse">Processando...</span>}
                                    {r.error && <span className="text-xs text-red-400">Erro</span>}
                                </div>
                                {r.error ? (
                                    <p className="text-sm text-red-400">{r.error}</p>
                                ) : r.running ? (
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map(d => (
                                            <div key={d} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                                        ))}
                                    </div>
                                ) : (
                                    <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{r.text}</pre>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div >
    );
}
