"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Agent, createOrUpdateAgent, fetchSkills, fetchProviders } from "@/lib/api";
import { Settings2, Terminal, Blocks, ChevronLeft, Save, Loader2, Code2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AgentEditor({ initialAgent }: { initialAgent?: Agent }) {
    const router = useRouter();
    const [mode, setMode] = useState<"visual" | "yaml">("visual");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [name, setName] = useState(initialAgent?.name || "");
    const [description, setDescription] = useState(initialAgent?.description || "");
    const [provider, setProvider] = useState(initialAgent?.provider || "deepseek");
    const [model, setModel] = useState(initialAgent?.model || "deepseek-chat");
    const [systemPrompt, setSystemPrompt] = useState(initialAgent?.system_prompt || "");
    const [selectedSkills, setSelectedSkills] = useState<string[]>(initialAgent?.skills || []);

    const [allSkills, setAllSkills] = useState<{ name: string, description: string }[]>([]);
    const [allProviders, setAllProviders] = useState<string[]>([]);
    const [yamlStr, setYamlStr] = useState("");

    useEffect(() => {
        fetchSkills().then(setAllSkills).catch(console.error);
        fetchProviders().then(setAllProviders).catch(console.error);
    }, []);

    useEffect(() => {
        if (mode === "yaml") {
            const lines = [];
            lines.push(`name: "${name}"`);
            if (description) lines.push(`description: "${description}"`);
            if (provider) lines.push(`provider: ${provider}`);
            if (model) lines.push(`model: ${model}`);
            if (selectedSkills.length > 0) {
                lines.push(`skills:`);
                selectedSkills.forEach(s => lines.push(`  - ${s}`));
            }
            if (systemPrompt) {
                lines.push(`system_prompt: |`);
                systemPrompt.split("\n").forEach(line => lines.push(`  ${line}`));
            }
            setYamlStr(lines.join("\n"));
        }
    }, [mode, name, description, provider, model, selectedSkills, systemPrompt]);

    const toggleSkill = (s: string) => {
        setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Agent Name is required.");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const ag: Agent = {
                name: name.trim(),
                description: description.trim() || undefined,
                provider: provider,
                model: model,
                system_prompt: systemPrompt || undefined,
                skills: selectedSkills
            };

            await createOrUpdateAgent(ag);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Error saving");
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 w-full max-w-4xl mx-auto pb-24 px-6 pt-6"
        >
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border-accent/30">
                <Link href="/">
                    <button className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer hover:bg-primary/10 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-slate-100 text-2xl font-bold font-display leading-tight tracking-tight">
                        {initialAgent ? `Edit Agent: ${initialAgent.name}` : "Agent Configuration Panel"}
                    </h1>
                </div>
                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="bg-slate-panel rounded p-1 border border-border-accent">
                    <TabsList className="bg-transparent h-8">
                        <TabsTrigger value="visual" className="data-[state=active]:bg-background-dark data-[state=active]:text-primary text-slate-400 text-xs">Visual</TabsTrigger>
                        <TabsTrigger value="yaml" className="data-[state=active]:bg-background-dark data-[state=active]:text-primary text-slate-400 text-xs">YAML</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {error && (
                <div className="mb-4 p-4 rounded bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {mode === "visual" ? (
                    <motion.div key="visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {/* General Info */}
                        <section className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings2 className="text-primary w-5 h-5" />
                                <h2 className="text-slate-100 text-xl font-bold tracking-tight font-display">General Information</h2>
                            </div>
                            <div className="space-y-4">
                                <label className="flex flex-col w-full">
                                    <p className="text-slate-300 text-sm font-medium pb-1.5 px-1">Agent Name</p>
                                    <input
                                        type="text"
                                        disabled={!!initialAgent}
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="form-input flex w-full rounded border-border-accent bg-slate-panel focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 h-12 px-4 placeholder:text-slate-500 disabled:opacity-50"
                                        placeholder="e.g. Research Assistant"
                                    />
                                </label>
                                <label className="flex flex-col w-full">
                                    <p className="text-slate-300 text-sm font-medium pb-1.5 px-1">Description</p>
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        className="form-input flex w-full rounded border-border-accent bg-slate-panel focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 h-12 px-4 placeholder:text-slate-500"
                                        placeholder="Short description of the agent's purpose"
                                    />
                                </label>
                            </div>
                        </section>

                        {/* System Prompt */}
                        <section className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Terminal className="text-primary w-5 h-5" />
                                <h2 className="text-slate-100 text-xl font-bold tracking-tight font-display">System Prompt</h2>
                            </div>
                            <label className="flex flex-col w-full">
                                <textarea
                                    value={systemPrompt}
                                    onChange={e => setSystemPrompt(e.target.value)}
                                    className="form-textarea flex w-full min-h-[180px] rounded border-border-accent bg-slate-panel focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 p-4 font-mono text-sm leading-relaxed placeholder:text-slate-500"
                                    placeholder="Enter core instructions for the AI behavior..."
                                />
                            </label>
                        </section>

                        {/* LLM Routing */}
                        <section className="grid grid-cols-2 gap-4 mb-8">
                            <label className="flex flex-col">
                                <p className="text-slate-300 text-sm font-medium pb-1.5 px-1">Provider</p>
                                <div className="relative">
                                    <select
                                        value={provider}
                                        onChange={e => setProvider(e.target.value)}
                                        className="form-select w-full rounded border-border-accent bg-slate-panel focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 h-12 px-4 appearance-none"
                                    >
                                        <option value="deepseek">DeepSeek</option>
                                        <option value="openai">OpenAI</option>
                                        <option value="anthropic">Anthropic</option>
                                        <option value="local">Local (Ollama)</option>
                                    </select>
                                </div>
                            </label>
                            <label className="flex flex-col">
                                <p className="text-slate-300 text-sm font-medium pb-1.5 px-1">Model</p>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    className="form-input flex w-full rounded border-border-accent bg-slate-panel focus:ring-1 focus:ring-primary focus:border-primary text-slate-100 h-12 px-4 placeholder:text-slate-500"
                                    placeholder="e.g. gpt-4o, deepseek-chat"
                                />
                            </label>
                        </section>

                        {/* Skills */}
                        <section className="mb-0">
                            <div className="flex items-center gap-2 mb-4">
                                <Blocks className="text-primary w-5 h-5" />
                                <h2 className="text-slate-100 text-xl font-bold tracking-tight font-display">Skills & Capabilities</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {allSkills.map(skill => {
                                    const isSelected = selectedSkills.includes(skill.name);
                                    return (
                                        <div key={skill.name} className="relative">
                                            <input
                                                type="checkbox"
                                                className="hidden peer"
                                                id={`skill-${skill.name}`}
                                                checked={isSelected}
                                                onChange={() => toggleSkill(skill.name)}
                                            />
                                            <label
                                                htmlFor={`skill-${skill.name}`}
                                                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all duration-200 border ${isSelected ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(16,183,127,0.3)]' : 'border-border-accent/50 bg-slate-panel/40 hover:bg-slate-panel/80'
                                                    }`}
                                            >
                                                <Code2 className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-slate-400'}`} />
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-medium ${isSelected ? 'text-slate-100' : 'text-slate-300'}`}>{skill.name}</span>
                                                    <span className="text-[10px] text-slate-500 line-clamp-1">{skill.description}</span>
                                                </div>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <motion.div key="yaml" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-4">
                            <textarea
                                value={yamlStr}
                                readOnly
                                className="w-full min-h-[400px] rounded border border-border-accent bg-slate-panel text-primary p-4 font-mono text-[13px] leading-relaxed resize-y focus:outline-none"
                            />
                            <p className="text-xs text-slate-500 text-center">Para alterar este conteúdo, volte para a aba Visual.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Actions Fixed Footer */}
            <div className="fixed bottom-0 left-0 md:left-24 right-0 p-4 border-t border-primary/10 bg-background-dark/80 backdrop-blur-xl flex justify-end gap-4 z-40">
                <div className="max-w-4xl w-full flex gap-4 mx-auto">
                    <Link href="/" className="flex-1">
                        <button className="w-full h-12 rounded border border-border-accent text-slate-300 font-bold hover:bg-slate-panel transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] h-12 rounded bg-primary text-background-dark font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? "Deploying..." : "Deploy Agent"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
