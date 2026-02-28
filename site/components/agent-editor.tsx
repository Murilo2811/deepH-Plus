"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Agent, createOrUpdateAgent, fetchSkills, fetchProviders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, ChevronLeft, Command } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

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
    }, [mode]);

    const toggleSkill = (s: string) => {
        setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            setError("O nome do agente é obrigatório.");
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
            setError(err.message || "Erro ao salvar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-4xl"
        >
            <div className="flex items-center justify-between pb-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <button className="flex items-center justify-center w-10 h-10 rounded-sm bg-neutral-bg1 border border-border text-text-secondary hover:text-text-primary hover:bg-neutral-bg2 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                            {initialAgent ? `Editar ${initialAgent.name}` : "Novo Agente"}
                        </h1>
                        <p className="text-sm text-text-muted mt-1">Configuração estrutural e comportamental</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {error && <span className="text-sm text-status-error font-medium">{error}</span>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm text-sm font-semibold transition-all duration-200 bg-brand hover:bg-brand-hover text-brand-foreground shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? "Registrando..." : "Salvar Agente"}
                    </button>
                </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="bg-neutral-bg2 border border-border p-1 rounded-sm">
                    <TabsTrigger value="visual" className="data-[state=active]:bg-neutral-bg3 data-[state=active]:text-text-primary text-text-secondary rounded-sm px-4">Visual</TabsTrigger>
                    <TabsTrigger value="yaml" className="data-[state=active]:bg-neutral-bg3 data-[state=active]:text-text-primary text-text-secondary rounded-sm px-4 font-mono text-xs">YAML</TabsTrigger>
                </TabsList>

                <Card className="mt-6 glass-card p-8 bg-neutral-bg1/40">
                    <TabsContent value="visual" className="m-0 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-text-secondary font-medium">Name</Label>
                                <Input
                                    placeholder="ex: security-auditor"
                                    value={name} onChange={e => setName(e.target.value)}
                                    disabled={!!initialAgent}
                                    className="glass-input h-11"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-text-secondary font-medium">Description</Label>
                                <Input
                                    placeholder="O que este agente faz?"
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    className="glass-input h-11"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-text-secondary font-medium">Provider</Label>
                                <Select value={provider} onValueChange={setProvider}>
                                    <SelectTrigger className="glass-input h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-neutral-bg2 border-border text-text-primary">
                                        {allProviders.map(p => (
                                            <SelectItem key={p} value={p} className="focus:bg-neutral-bg3 focus:text-brand">{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-text-secondary font-medium">Model</Label>
                                <Input
                                    placeholder="ex: deepseek-chat"
                                    value={model} onChange={e => setModel(e.target.value)}
                                    className="glass-input h-11"
                                />
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="space-y-3">
                            <Label className="text-text-secondary font-medium">System Prompt</Label>
                            <Textarea
                                placeholder="Defina o comportamento e restrições do agente..."
                                className="min-h-[180px] glass-input font-mono text-[13px] leading-relaxed p-4 resize-y"
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                            />
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="space-y-4">
                            <Label className="text-text-secondary font-medium flex items-center gap-2">
                                Skills
                                <span className="bg-neutral-bg3 text-text-muted text-[10px] px-2 py-0.5 rounded-sm">{selectedSkills.length} ativas</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {allSkills.map(skill => {
                                    const isSelected = selectedSkills.includes(skill.name);
                                    return (
                                        <div
                                            key={skill.name}
                                            onClick={() => toggleSkill(skill.name)}
                                            className={`cursor-pointer border rounded-sm p-4 text-sm transition-all flex flex-col gap-2 ${isSelected
                                                    ? 'bg-brand/5 border-brand/40 text-brand'
                                                    : 'bg-neutral-bg2/50 border-border hover:border-text-muted text-text-secondary'
                                                }`}
                                        >
                                            <span className="font-semibold flex items-center gap-2 line-clamp-1 font-mono text-[13px]">
                                                <Command className={`w-3.5 h-3.5 ${isSelected ? 'text-brand' : 'text-text-muted'}`} />
                                                {skill.name}
                                            </span>
                                            <span className={`text-[12px] line-clamp-2 leading-relaxed ${isSelected ? 'text-brand/70' : 'text-text-muted'}`}>
                                                {skill.description}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="yaml" className="m-0 space-y-4">
                        <div className="space-y-3">
                            <Label className="text-text-secondary font-medium flex justify-between">
                                <span className="flex items-center gap-2"><Command className="w-3.5 h-3.5" /> Source Preview (Read-only)</span>
                            </Label>
                            <Textarea
                                value={yamlStr}
                                readOnly
                                className="min-h-[400px] bg-neutral-bg1 border border-border text-brand font-mono text-[13px] leading-relaxed p-5 rounded-sm"
                            />
                            <p className="text-xs text-text-muted">Nesta versão as edições diretas pelo YAML estão desativadas. Use a aba Visual.</p>
                        </div>
                    </TabsContent>
                </Card>
            </Tabs>
        </motion.div>
    );
}
