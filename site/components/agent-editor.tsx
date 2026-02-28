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
// A simple yaml parser just for demonstration if we wanted. 
// For pure simplicity, we'll map fields manually in the Visual form, and if user uses YAML, we parse it naively or ask backend to parse.
// Next.js standard doesn't have a built in yaml parser, so we will keep the YAML editor as basic string representation for now.

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

    // Basic YAML string representation
    const [yamlStr, setYamlStr] = useState("");

    useEffect(() => {
        fetchSkills().then(setAllSkills).catch(console.error);
        fetchProviders().then(setAllProviders).catch(console.error);
    }, []);

    // Sync state to YAML when visual tab changes to yaml
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

            // If we are in yaml mode, we would parse yaml here. For now we assume visual controls authority.
            // In a robust implementation, we'd use js-yaml.

            await createOrUpdateAgent(ag);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Erro ao salvar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-zinc-800 text-zinc-400">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
                        {initialAgent ? `Editar ${initialAgent.name}` : "Novo Agente"}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-red-400">{error}</span>
                    <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold gap-2">
                        <Save className="w-4 h-4" />
                        {saving ? "Salvando..." : "Salvar Agente"}
                    </Button>
                </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="visual" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50">Visual</TabsTrigger>
                    <TabsTrigger value="yaml" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-50 font-mono text-xs">YAML</TabsTrigger>
                </TabsList>

                <Card className="mt-4 bg-zinc-900/40 border-zinc-800/50 p-6">
                    <TabsContent value="visual" className="m-0 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Name</Label>
                                <Input
                                    placeholder="ex: my-designer"
                                    value={name} onChange={e => setName(e.target.value)}
                                    disabled={!!initialAgent}
                                    className="bg-zinc-950 border-zinc-800 disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Description</Label>
                                <Input
                                    placeholder="O que este agente faz?"
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Provider</Label>
                                <Select value={provider} onValueChange={setProvider}>
                                    <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                        {allProviders.map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-300">Model</Label>
                                <Input
                                    placeholder="ex: deepseek-chat"
                                    value={model} onChange={e => setModel(e.target.value)}
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-300">System Prompt</Label>
                            <Textarea
                                placeholder="Instruções para o agente..."
                                className="min-h-[160px] bg-zinc-950 border-zinc-800 font-mono text-sm leading-relaxed"
                                value={systemPrompt}
                                onChange={e => setSystemPrompt(e.target.value)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-zinc-300">Skills ({selectedSkills.length} selecionadas)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {allSkills.map(skill => {
                                    const isSelected = selectedSkills.includes(skill.name);
                                    return (
                                        <div
                                            key={skill.name}
                                            onClick={() => toggleSkill(skill.name)}
                                            className={`cursor-pointer border rounded-lg p-3 text-sm transition-all flex flex-col gap-1 ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'
                                                }`}
                                        >
                                            <span className="font-semibold flex items-center gap-1.5 line-clamp-1">
                                                <Command className="w-3.5 h-3.5" />
                                                {skill.name}
                                            </span>
                                            <span className="text-opacity-70 text-xs line-clamp-2">{skill.description}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="yaml" className="m-0 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300 flex justify-between">
                                <span>Source (Read-only preview)</span>
                            </Label>
                            <Textarea
                                value={yamlStr}
                                readOnly
                                className="min-h-[400px] bg-[#0d1117] border-zinc-800 text-emerald-300 font-mono text-sm leading-relaxed p-4"
                            />
                            <p className="text-xs text-zinc-500">Nesta versão demo, edições diretas pelo YAML estão desativadas no frontend. Use a aba Visual.</p>
                        </div>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    );
}
