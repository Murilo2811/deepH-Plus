"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Agent, IOPort, createOrUpdateAgent, deleteAgent, fetchSkills, fetchProviders } from "@/lib/api";
import { Settings2, Terminal, Blocks, ChevronLeft, Save, Loader2, Code2, Plus, Trash2, Network, Search } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// YAML serializer (Agent → YAML string)
// ─────────────────────────────────────────────────────────────────────────────

function serializeToYaml(agent: Agent): string {
    const lines: string[] = [];

    const push = (line: string) => lines.push(line);
    const indented = (text: string, indent: string) =>
        text.split("\n").forEach(l => push(`${indent}${l}`));

    push(`name: ${agent.name || '""'}`);
    if (agent.description) push(`description: "${agent.description}"`);
    if (agent.provider) push(`provider: ${agent.provider}`);
    if (agent.model) push(`model: ${agent.model}`);

    if (agent.system_prompt) {
        push(`system_prompt: |`);
        indented(agent.system_prompt, "  ");
    }

    if (agent.skills && agent.skills.length > 0) {
        push(`skills:`);
        agent.skills.forEach(s => push(`  - ${s}`));
    }

    if (agent.depends_on && agent.depends_on.length > 0) {
        push(`depends_on:`);
        agent.depends_on.forEach(d => push(`  - ${d}`));
    }

    if (agent.startup_calls && agent.startup_calls.length > 0) {
        push(`startup_calls:`);
        agent.startup_calls.forEach(sc => {
            push(`  - skill: ${sc.skill}`);
            if (sc.args && Object.keys(sc.args).length > 0) {
                push(`    args:`);
                Object.entries(sc.args).forEach(([k, v]) => push(`      ${k}: "${v}"`));
            }
        });
    }

    const io = agent.io;
    if (io && ((io.inputs && io.inputs.length > 0) || (io.outputs && io.outputs.length > 0))) {
        push(`io:`);
        if (io.inputs && io.inputs.length > 0) {
            push(`  inputs:`);
            io.inputs.forEach(inp => {
                push(`    - name: ${inp.name}`);
                if (inp.accepts && inp.accepts.length > 0) push(`      accepts: [${inp.accepts.join(", ")}]`);
                if (inp.required !== undefined) push(`      required: ${inp.required}`);
                if (inp.merge_policy) push(`      merge_policy: ${inp.merge_policy}`);
                if (inp.max_tokens) push(`      max_tokens: ${inp.max_tokens}`);
                if (inp.description) push(`      description: "${inp.description}"`);
            });
        }
        if (io.outputs && io.outputs.length > 0) {
            push(`  outputs:`);
            io.outputs.forEach(out => {
                push(`    - name: ${out.name}`);
                if (out.produces && out.produces.length > 0) push(`      produces: [${out.produces.join(", ")}]`);
                if (out.description) push(`      description: "${out.description}"`);
            });
        }
    }

    if (agent.metadata && Object.keys(agent.metadata).length > 0) {
        push(`metadata:`);
        Object.entries(agent.metadata).forEach(([k, v]) => push(`  ${k}: ${v}`));
    }

    if (agent.timeout_ms) push(`timeout_ms: ${agent.timeout_ms}`);

    return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// YAML parser (YAML string → Agent) – simple line-by-line parser
// ─────────────────────────────────────────────────────────────────────────────

function parseYaml(yaml: string): Agent {
    const result: Agent = { name: "" };
    const lines = yaml.split("\n");
    let i = 0;

    const peek = () => lines[i] || "";
    const indent = (line: string) => line.match(/^(\s*)/)?.[1].length ?? 0;

    const parseListOfStrings = (baseIndent: number): string[] => {
        const items: string[] = [];
        while (i < lines.length) {
            const line = lines[i];
            const li = indent(line);
            const trimmed = line.trim();
            if (trimmed === "" || (li <= baseIndent && !trimmed.startsWith("-"))) break;
            if (trimmed.startsWith("- ")) items.push(trimmed.slice(2).trim());
            i++;
        }
        return items;
    };

    while (i < lines.length) {
        const line = peek();
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) { i++; continue; }

        const m = trimmed.match(/^(\w+):\s*(.*)/);
        if (!m) { i++; continue; }
        const [, key, val] = m;
        const valTrimmed = val.trim().replace(/^["']|["']$/g, "");

        switch (key) {
            case "name": result.name = valTrimmed; i++; break;
            case "description": result.description = valTrimmed; i++; break;
            case "provider": result.provider = valTrimmed; i++; break;
            case "model": result.model = valTrimmed; i++; break;
            case "timeout_ms": result.timeout_ms = Number(valTrimmed) || undefined; i++; break;
            case "system_prompt": {
                i++;
                const slines: string[] = [];
                const base = indent(line);
                while (i < lines.length && (lines[i].trim() === "" || indent(lines[i]) > base)) {
                    slines.push(lines[i].replace(/^  /, ""));
                    i++;
                }
                result.system_prompt = slines.join("\n").trimEnd();
                break;
            }
            case "skills": { i++; result.skills = parseListOfStrings(indent(line)); break; }
            case "depends_on": { i++; result.depends_on = parseListOfStrings(indent(line)); break; }
            case "metadata": {
                i++;
                const meta: Record<string, string> = {};
                const base = indent(line);
                while (i < lines.length) {
                    const ml = lines[i]; const mt = ml.trim();
                    if (!mt || indent(ml) <= base) break;
                    const mm = mt.match(/^(\w+):\s*(.*)/);
                    if (mm) meta[mm[1]] = mm[2].replace(/^["']|["']$/g, "");
                    i++;
                }
                result.metadata = meta;
                break;
            }
            case "startup_calls": {
                i++;
                const calls: Agent["startup_calls"] = [];
                const base = indent(line);
                while (i < lines.length) {
                    const sl = lines[i]; const st = sl.trim();
                    if (!st || (indent(sl) <= base && !st.startsWith("-"))) break;
                    if (st.startsWith("- skill:")) {
                        const skillName = st.slice(8).trim();
                        const call: NonNullable<Agent["startup_calls"]>[number] = { skill: skillName, args: {} };
                        i++;
                        if (i < lines.length && lines[i].trim().startsWith("args:")) {
                            i++;
                            while (i < lines.length && indent(lines[i]) > indent(sl)) {
                                const al = lines[i].trim().match(/^(\w+):\s*(.*)/);
                                if (al) (call.args as any)[al[1]] = al[2].replace(/^["']|["']$/g, "");
                                i++;
                            }
                        }
                        calls.push(call);
                    } else { i++; }
                }
                result.startup_calls = calls;
                break;
            }
            case "io": {
                i++;
                result.io = { inputs: [], outputs: [] };
                const base = indent(line);
                while (i < lines.length) {
                    const il = lines[i]; const it = il.trim();
                    if (!it || indent(il) <= base) break;
                    if (it === "inputs:") {
                        i++;
                        while (i < lines.length && lines[i].trim().startsWith("-")) {
                            const portM = lines[i].trim().match(/^- name:\s*(.*)/);
                            if (portM) {
                                const port: IOPort = { name: portM[1] };
                                i++;
                                while (i < lines.length && indent(lines[i]) > indent(il) + 2) {
                                    const pl = lines[i].trim();
                                    if (pl.startsWith("accepts:")) port.accepts = pl.slice(8).replace(/[\[\]]/g, "").split(",").map(s => s.trim()).filter(Boolean);
                                    else if (pl.startsWith("produces:")) port.produces = pl.slice(9).replace(/[\[\]]/g, "").split(",").map(s => s.trim()).filter(Boolean);
                                    else if (pl.startsWith("required:")) port.required = pl.slice(9).trim() === "true";
                                    else if (pl.startsWith("merge_policy:")) port.merge_policy = pl.slice(13).trim();
                                    else if (pl.startsWith("max_tokens:")) port.max_tokens = Number(pl.slice(11).trim());
                                    else if (pl.startsWith("description:")) port.description = pl.slice(12).trim().replace(/^["']|["']$/g, "");
                                    i++;
                                }
                                result.io!.inputs!.push(port);
                            } else { i++; }
                        }
                    } else if (it === "outputs:") {
                        i++;
                        while (i < lines.length && lines[i].trim().startsWith("-")) {
                            const portM = lines[i].trim().match(/^- name:\s*(.*)/);
                            if (portM) {
                                const port: IOPort = { name: portM[1] };
                                i++;
                                while (i < lines.length && indent(lines[i]) > indent(il) + 2) {
                                    const pl = lines[i].trim();
                                    if (pl.startsWith("produces:")) port.produces = pl.slice(9).replace(/[\[\]]/g, "").split(",").map(s => s.trim()).filter(Boolean);
                                    else if (pl.startsWith("accepts:")) port.accepts = pl.slice(8).replace(/[\[\]]/g, "").split(",").map(s => s.trim()).filter(Boolean);
                                    else if (pl.startsWith("description:")) port.description = pl.slice(12).trim().replace(/^["']|["']$/g, "");
                                    i++;
                                }
                                result.io!.outputs!.push(port);
                            } else { i++; }
                        }
                    } else { i++; }
                }
                break;
            }
            default: i++; break;
        }
    }
    return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

import { KitGallery } from "@/components/kit-gallery";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_YAML = `name: ""
description: ""
provider: deepseek
model: deepseek-chat
system_prompt: |
  Você é um agente especialista.
skills: []
io:
  inputs:
    - name: context
      accepts: [text/plain, text/markdown]
      required: false
      merge_policy: append
      max_tokens: 800
  outputs:
    - name: result
      produces: [text/markdown, summary/text]
metadata:
  context_moment: discovery
`;

function agentToYaml(a: Agent): string {
    return serializeToYaml(a);
}

export function AgentEditor({ initialAgent }: { initialAgent?: Agent }) {
    const router = useRouter();
    const [mode, setMode] = useState<"visual" | "yaml" | "templates">(initialAgent ? "yaml" : "templates");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [yamlStr, setYamlStr] = useState(() =>
        initialAgent ? agentToYaml(initialAgent) : DEFAULT_YAML
    );
    const [yamlError, setYamlError] = useState("");
    const [skillsFilter, setSkillsFilter] = useState("");

    const [allSkills, setAllSkills] = useState<{ name: string; description: string }[]>([]);
    const [allProviders, setAllProviders] = useState<string[]>([]);

    // Parsed agent from YAML
    const [agent, setAgent] = useState<Agent>(() =>
        initialAgent ?? parseYaml(DEFAULT_YAML)
    );

    const filteredSkills = allSkills.filter(s =>
        s.name.toLowerCase().includes(skillsFilter.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(skillsFilter.toLowerCase())
    );

    useEffect(() => {
        fetchSkills().then(setAllSkills).catch(console.error);
        fetchProviders().then(setAllProviders).catch(console.error);
    }, []);

    // When switching to visual, parse YAML → agent
    const switchMode = (newMode: "visual" | "yaml") => {
        if (newMode === "visual" && mode === "yaml") {
            try {
                const parsed = parseYaml(yamlStr);
                if (!parsed.name && !parsed.provider) throw new Error("YAML inválido ou vazio demais.");
                setAgent(parsed);
                setYamlError("");
            } catch (e: any) {
                setYamlError(e.message);
                return;
            }
        }
        if (newMode === "yaml" && mode === "visual") {
            setYamlStr(agentToYaml(agent));
        }
        setMode(newMode);
    };

    const handleSave = async () => {
        let agentToSave: Agent;
        if (mode === "yaml") {
            try {
                agentToSave = parseYaml(yamlStr);
            } catch (e: any) {
                setError("YAML inválido: " + e.message);
                return;
            }
        } else {
            agentToSave = agent;
        }
        if (!agentToSave.name?.trim()) {
            setError("O campo 'name' é obrigatório no YAML.");
            return;
        }
        setSaving(true);
        setError("");
        try {
            await createOrUpdateAgent(agentToSave);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!initialAgent || !initialAgent.name) return;
        if (!window.confirm(`Tem certeza que deseja excluir o agente ${initialAgent.name}?`)) return;

        setSaving(true);
        setError("");
        try {
            await deleteAgent(initialAgent.name);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Erro ao excluir agente.");
            setSaving(false);
        }
    };

    const setAgentField = (patch: Partial<Agent>) => setAgent(prev => ({ ...prev, ...patch }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full max-w-4xl mx-auto pb-24 px-6 pt-6"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border-accent/30">
                <Link href="/">
                    <button className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-primary/10 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-slate-800 text-2xl font-bold font-display leading-tight tracking-tight">
                        {initialAgent ? `Edit Agent: ${initialAgent.name}` : "Agent Configuration Panel"}
                    </h1>
                </div>

                {/* Mode switcher */}
                <div className="flex bg-slate-50 rounded border border-border-accent p-0.5">
                    {(!initialAgent ? ["templates", "visual", "yaml"] : ["visual", "yaml"]).map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m as any)}
                            className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors ${mode === m
                                ? "bg-white text-primary"
                                : "text-slate-400 hover:text-slate-700"
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            {(error || yamlError) && (
                <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                    {error || yamlError}
                </div>
            )}

            <AnimatePresence mode="wait">
                {mode === "templates" ? (
                    <motion.div key="templates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <KitGallery onInstallSuccess={() => router.push("/")} />
                    </motion.div>
                ) : mode === "yaml" ? (
                    <motion.div key="yaml" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="relative">
                            {/* Line numbers + editor */}
                            <div className="flex rounded-xl overflow-hidden border border-border-accent/70 shadow-[0_0_30px_rgba(15,240,146,0.04)]">
                                {/* Gutter */}
                                <div className="py-4 px-3 bg-slate-100 select-none border-r border-border-accent/30 min-w-[2.5rem] text-right">
                                    {yamlStr.split("\n").map((_, idx) => (
                                        <div key={idx} className="text-slate-500 text-[11px] font-mono leading-[1.625rem]">
                                            {idx + 1}
                                        </div>
                                    ))}
                                </div>

                                {/* Textarea */}
                                <textarea
                                    value={yamlStr}
                                    onChange={e => { setYamlStr(e.target.value); setYamlError(""); }}
                                    spellCheck={false}
                                    className="flex-1 bg-[#0a110d] text-primary p-4 font-mono text-[13px] leading-[1.625rem] resize-y focus:outline-none min-h-[500px] w-full"
                                    style={{ tabSize: 2 }}
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 mt-2 text-center">
                                ✏️ Editor YAML completo — edite diretamente e clique em <strong className="text-primary">Deploy Agent</strong>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        {/* General */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Settings2 className="text-primary w-5 h-5" />
                                <h2 className="text-slate-800 text-xl font-bold tracking-tight font-display">General Information</h2>
                            </div>
                            <div className="space-y-4">
                                <label className="flex flex-col w-full">
                                    <p className="text-slate-500 text-sm font-medium pb-1.5 px-1">Agent Name</p>
                                    <input type="text" disabled={!!initialAgent} value={agent.name}
                                        onChange={e => setAgentField({ name: e.target.value })}
                                        className="form-input flex w-full rounded border-border-accent bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 h-12 px-4 placeholder:text-slate-400 disabled:opacity-50"
                                        placeholder="e.g. synth_universe" />
                                </label>
                                <label className="flex flex-col w-full">
                                    <p className="text-slate-500 text-sm font-medium pb-1.5 px-1">Description</p>
                                    <input type="text" value={agent.description || ""}
                                        onChange={e => setAgentField({ description: e.target.value })}
                                        className="form-input flex w-full rounded border-border-accent bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 h-12 px-4 placeholder:text-slate-400"
                                        placeholder="Short description of the agent's purpose" />
                                </label>
                            </div>
                        </section>

                        {/* System Prompt */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Terminal className="text-primary w-5 h-5" />
                                <h2 className="text-slate-800 text-xl font-bold tracking-tight font-display">System Prompt</h2>
                            </div>
                            <textarea value={agent.system_prompt || ""}
                                onChange={e => setAgentField({ system_prompt: e.target.value })}
                                className="form-textarea flex w-full min-h-[180px] rounded border-border-accent bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 p-4 font-mono text-sm leading-relaxed placeholder:text-slate-400"
                                placeholder="Enter core instructions for the AI behavior..." />
                        </section>

                        {/* LLM Routing */}
                        <section className="grid grid-cols-2 gap-4">
                            <label className="flex flex-col">
                                <p className="text-slate-500 text-sm font-medium pb-1.5 px-1">Provider</p>
                                <select value={agent.provider || "deepseek"} onChange={e => setAgentField({ provider: e.target.value })}
                                    className="form-select w-full rounded border-border-accent bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 h-12 px-4 appearance-none">
                                    <option value="deepseek">DeepSeek</option>
                                    <option value="openai">OpenAI</option>
                                    <option value="anthropic">Anthropic</option>
                                    <option value="xai">xAI (Grok)</option>
                                    <option value="local_mock">Local Mock</option>
                                </select>
                            </label>
                            <label className="flex flex-col">
                                <p className="text-slate-500 text-sm font-medium pb-1.5 px-1">Model</p>
                                <input type="text" value={agent.model || ""}
                                    onChange={e => setAgentField({ model: e.target.value })}
                                    className="form-input flex w-full rounded border-border-accent bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 h-12 px-4 placeholder:text-slate-400"
                                    placeholder="e.g. deepseek-chat, gpt-4o" />
                            </label>
                        </section>

                        {/* IO Ports */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Network className="text-primary w-5 h-5" />
                                <h2 className="text-slate-800 text-xl font-bold tracking-tight font-display">I/O Ports</h2>
                                <span className="text-xs text-slate-400 ml-auto">Conecta agentes em pipeline</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Inputs */}
                                <div className="space-y-2">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Inputs</p>
                                    {(agent.io?.inputs || []).map((inp, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-border-accent/40 rounded-lg p-3 space-y-2 relative">
                                            <button onClick={() => {
                                                const next = [...(agent.io?.inputs || [])];
                                                next.splice(idx, 1);
                                                setAgentField({ io: { ...agent.io, inputs: next } });
                                            }} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <input value={inp.name} onChange={e => {
                                                const next = [...(agent.io?.inputs || [])];
                                                next[idx] = { ...next[idx], name: e.target.value };
                                                setAgentField({ io: { ...agent.io, inputs: next } });
                                            }} className="form-input w-full rounded border-border-accent bg-white text-slate-800 h-8 px-2 text-xs placeholder:text-slate-500" placeholder="Input name" />
                                            <input value={(inp.accepts || []).join(", ")} onChange={e => {
                                                const next = [...(agent.io?.inputs || [])];
                                                next[idx] = { ...next[idx], accepts: e.target.value.split(",").map(s => s.trim()).filter(Boolean) };
                                                setAgentField({ io: { ...agent.io, inputs: next } });
                                            }} className="form-input w-full rounded border-border-accent bg-white text-slate-800 h-8 px-2 text-xs placeholder:text-slate-500" placeholder="accepts: text/plain, text/markdown" />
                                        </div>
                                    ))}
                                    <button onClick={() => setAgentField({ io: { ...agent.io, inputs: [...(agent.io?.inputs || []), { name: "context", accepts: ["text/plain"] }] } })}
                                        className="w-full flex items-center justify-center gap-1 h-8 rounded border border-dashed border-border-accent/50 text-slate-400 hover:text-primary hover:border-primary/50 text-xs transition-colors">
                                        <Plus className="w-3 h-3" /> Add Input
                                    </button>
                                </div>
                                {/* Outputs */}
                                <div className="space-y-2">
                                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Outputs</p>
                                    {(agent.io?.outputs || []).map((out, idx) => (
                                        <div key={idx} className="bg-slate-50 border border-border-accent/40 rounded-lg p-3 space-y-2 relative">
                                            <button onClick={() => {
                                                const next = [...(agent.io?.outputs || [])];
                                                next.splice(idx, 1);
                                                setAgentField({ io: { ...agent.io, outputs: next } });
                                            }} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <input value={out.name} onChange={e => {
                                                const next = [...(agent.io?.outputs || [])];
                                                next[idx] = { ...next[idx], name: e.target.value };
                                                setAgentField({ io: { ...agent.io, outputs: next } });
                                            }} className="form-input w-full rounded border-border-accent bg-white text-slate-800 h-8 px-2 text-xs placeholder:text-slate-500" placeholder="Output name" />
                                            <input value={(out.produces || []).join(", ")} onChange={e => {
                                                const next = [...(agent.io?.outputs || [])];
                                                next[idx] = { ...next[idx], produces: e.target.value.split(",").map(s => s.trim()).filter(Boolean) };
                                                setAgentField({ io: { ...agent.io, outputs: next } });
                                            }} className="form-input w-full rounded border-border-accent bg-white text-slate-800 h-8 px-2 text-xs placeholder:text-slate-500" placeholder="produces: text/markdown" />
                                        </div>
                                    ))}
                                    <button onClick={() => setAgentField({ io: { ...agent.io, outputs: [...(agent.io?.outputs || []), { name: "result", produces: ["text/markdown"] }] } })}
                                        className="w-full flex items-center justify-center gap-1 h-8 rounded border border-dashed border-border-accent/50 text-slate-400 hover:text-primary hover:border-primary/50 text-xs transition-colors">
                                        <Plus className="w-3 h-3" /> Add Output
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Metadata */}
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <Code2 className="text-primary w-5 h-5" />
                                <h2 className="text-slate-800 text-xl font-bold tracking-tight font-display">Metadata</h2>
                            </div>
                            <div className="space-y-2">
                                {Object.entries(agent.metadata || {}).map(([k, v]) => (
                                    <div key={k} className="flex gap-2 items-center">
                                        <input value={k} readOnly className="form-input w-1/3 rounded border-border-accent bg-slate-50 text-slate-500 h-9 px-3 text-xs" />
                                        <span className="text-slate-500">:</span>
                                        <input value={v} onChange={e => {
                                            const next = { ...(agent.metadata || {}), [k]: e.target.value };
                                            setAgentField({ metadata: next });
                                        }} className="form-input flex-1 rounded border-border-accent bg-slate-50 text-slate-800 h-9 px-3 text-xs" />
                                        <button onClick={() => {
                                            const next = { ...(agent.metadata || {}) };
                                            delete next[k];
                                            setAgentField({ metadata: next });
                                        }} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const key = `key_${Date.now()}`;
                                    setAgentField({ metadata: { ...(agent.metadata || {}), [key]: "" } });
                                }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-primary transition-colors">
                                    <Plus className="w-3 h-3" /> Add metadata key
                                </button>
                            </div>
                        </section>

                        {/* Skills */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Blocks className="text-primary w-5 h-5" />
                                <h2 className="text-slate-800 text-xl font-bold tracking-tight font-display">Skills & Capabilities</h2>
                            </div>

                            <div className="relative mb-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter skills by name or description..."
                                    value={skillsFilter}
                                    onChange={(e) => setSkillsFilter(e.target.value)}
                                    className="form-input flex w-full rounded border-border-accent bg-slate-50 focus:ring-1 focus:ring-primary focus:border-primary text-slate-800 h-10 pl-10 pr-4 text-sm placeholder:text-slate-400"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {filteredSkills.map(skill => {
                                    const isSelected = (agent.skills || []).includes(skill.name);
                                    return (
                                        <label key={skill.name} onClick={() => {
                                            const skills = agent.skills || [];
                                            setAgentField({ skills: isSelected ? skills.filter(s => s !== skill.name) : [...skills, skill.name] });
                                        }} className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all duration-200 border ${isSelected ? "bg-primary/20 border-primary" : "border-border-accent/50 bg-slate-50/40 hover:bg-slate-50/80"}`}>
                                            <Code2 className={`w-5 h-5 ${isSelected ? "text-primary" : "text-slate-400"}`} />
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${isSelected ? "text-slate-800" : "text-slate-500"}`}>{skill.name}</span>
                                                <span className="text-[10px] text-slate-400 line-clamp-1">{skill.description}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                                {filteredSkills.length === 0 && (
                                    <div className="col-span-2 text-center text-slate-400 text-sm py-4">
                                        Nenhuma skill encontrada para o filtro informado.
                                    </div>
                                )}
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 md:left-24 right-0 p-4 border-t border-primary/10 bg-white/80 backdrop-blur-xl flex justify-end gap-4 z-40">
                <div className="max-w-4xl w-full flex gap-4 mx-auto">
                    <Link href="/" className="flex-1">
                        <button className="w-full h-12 rounded border border-border-accent text-slate-500 font-bold hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    {initialAgent && (
                        <button onClick={handleDelete} disabled={saving} type="button"
                            className="flex-1 h-12 rounded border border-red-500/30 text-red-500 font-bold hover:bg-red-500/10 transition-colors">
                            Delete
                        </button>
                    )}
                    {mode !== "templates" && (
                        <button onClick={handleSave} disabled={saving}
                            className="flex-[2] h-12 rounded bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {saving ? "Deploying..." : "Deploy Agent"}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
