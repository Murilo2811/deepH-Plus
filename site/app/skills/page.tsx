"use client";

import { useEffect, useState } from "react";
import { fetchSkills, createOrUpdateSkill, deleteSkill, type Skill } from "@/lib/api";
import { Wrench, Plus, Trash2, Save, XCircle, Pencil, Code2, Shield } from "lucide-react";
import { SourceBadge } from "@/components/source-badge";

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [editingSkillName, setEditingSkillName] = useState<string | null>(null);
    const [yamlStr, setYamlStr] = useState(`name: nova_skill\ntype: file_read\ndescription: "Minha nova skill personalizada"\nparams:\n  max_bytes: 32768\n`);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const editingSkill = skills.find(s => s.name === editingSkillName);
    const isReadOnly = editingSkill?.source === "standard";

    useEffect(() => {
        loadSkills();
    }, []);

    function loadSkills() {
        fetchSkills().then(setSkills).catch(console.error);
    }

    function resetForm() {
        setEditingSkillName(null);
        setYamlStr(`name: nova_skill\ntype: file_read\ndescription: "Minha nova skill personalizada"\nparams:\n  max_bytes: 32768\n`);
        setError("");
        setSuccess("");
    }

    async function handleSave() {
        setError("");
        setSuccess("");

        let newName = "";
        let newDesc = "";
        for (const line of yamlStr.split('\n')) {
            const m = line.match(/^name:\s*(.*)/);
            if (m) newName = m[1].replace(/['"]/g, "").trim();
            const md = line.match(/^description:\s*(.*)/);
            if (md) newDesc = md[1].replace(/['"]/g, "").trim();
        }

        if (!newName) {
            setError("O YAML deve conter uma chave 'name: <nome>'.");
            return;
        }

        setSaving(true);
        try {
            const payload: Skill = {
                name: newName,
                description: newDesc,
                filename: newName + ".yaml",
                content: yamlStr
            };
            await createOrUpdateSkill(payload);
            setSuccess(`Skill "${newName}" salva com sucesso!`);
            setEditingSkillName(newName);
            loadSkills();
        } catch (e: any) {
            setError(e.message ?? "Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(skillName: string, e: React.MouseEvent) {
        e.stopPropagation();
        if (!window.confirm(`Excluir a skill "${skillName}"? Esta ação não pode ser desfeita e afetará apenas skills locais.`)) return;
        setDeleting(skillName);
        setError("");
        setSuccess("");
        try {
            await deleteSkill(skillName);
            setSuccess(`Skill "${skillName}" excluída com sucesso.`);
            if (editingSkillName === skillName) resetForm();
            loadSkills();
        } catch (e: any) {
            setError(e.message ?? "Erro ao excluir (Pode ser uma skill do catálogo).");
        } finally {
            setDeleting(null);
        }
    }

    return (
        <div className="flex flex-col gap-8 p-6 max-w-6xl mx-auto pt-10 pb-32">
            {/* Header */}
            <div>
                <h1 className="text-4xl md:text-6xl font-display font-black text-charcoal uppercase tracking-tighter drop-shadow-sm flex items-center gap-4 relative z-10 w-fit">
                    <Wrench className="w-10 h-10 text-charcoal md:w-14 md:h-14 rotate-[-10deg]" />
                    Standard <span className="text-charcoal underline decoration-sketch-blue-dark decoration-wavy underline-offset-4">Library</span>
                    <div className="h-4 w-[110%] bg-sketch-yellow/40 absolute bottom-1 -left-2 -z-10 rotate-[-1deg]"></div>
                </h1>
                <p className="text-charcoal bg-sketch-yellow border-2 border-charcoal border-dashed px-4 py-2 mt-6 font-bold tracking-widest text-xs uppercase inline-block shadow-sketch-sm rotate-1">
                    Skills YAML locais salvas em <code className="font-mono bg-paper px-2 py-0.5 rounded border border-charcoal/30">.agent/skills/</code>
                </p>
            </div>

            <div className="grid md:grid-cols-[1fr_380px] gap-8">
                {/* Editor */}
                <div className="sketch-card p-6 md:p-8 flex flex-col gap-6 relative overflow-visible bg-paper z-10">
                    <div className="flex justify-between items-center relative z-10">
                        <h2 className="text-xl font-black text-charcoal font-display uppercase tracking-wider flex items-center gap-3">
                            <div className="p-2 bg-sketch-blue/30 rounded-lg border-2 border-charcoal rotate-[-5deg]">
                                <Code2 className="w-6 h-6 text-charcoal" />
                            </div>
                            {editingSkillName ? `Editando: ${editingSkillName}` : "Criar Nova Skill YAML"}
                        </h2>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 min-h-[450px]">
                        <div className="flex rounded-xl overflow-hidden border-2 border-charcoal bg-white shadow-inner flex-1 group focus-within:ring-4 focus-within:ring-sketch-blue/30 transition-all">
                            <div className="py-4 px-3 bg-pastel-yellow/40 border-r-2 border-charcoal min-w-[3rem] text-right font-bold text-charcoal/50 select-none">
                                {yamlStr.split("\n").map((_, idx) => (
                                    <div key={idx} className="text-[13px] font-mono leading-[1.75re]">
                                        {idx + 1}
                                    </div>
                                ))}
                            </div>
                            <textarea
                                value={yamlStr}
                                onChange={e => { setYamlStr(e.target.value); setError(""); }}
                                spellCheck={false}
                                className="flex-1 bg-transparent text-charcoal font-bold p-4 font-mono text-[14px] leading-[1.75rem] resize-y focus:outline-none min-h-[450px] w-full"
                                style={{ tabSize: 2 }}
                            />
                        </div>
                        {isReadOnly && (
                            <div className="text-xs font-bold text-teal-600 bg-teal-50 border-2 border-teal-200 p-2 rounded-lg flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-top-2">
                                <Shield className="w-4 h-4" />
                                <span>Esta skill faz parte da Standard Library e é somente leitura.</span>
                            </div>
                        )}
                        <p className="text-xs font-bold text-charcoal/60 text-center mt-2 flex items-center justify-center gap-2">
                            <span className="text-base">💡</span> Dica: Defina o tipo (bash, python, http, etc.) para a skill.
                        </p>
                    </div>

                    {error && <div className="text-sm font-bold text-charcoal bg-sketch-pink/80 border-2 border-charcoal p-4 rounded-xl rotate-1 shadow-sketch-sm">{error}</div>}
                    {success && <div className="text-sm font-bold text-charcoal bg-sketch-green/80 border-2 border-charcoal p-4 rounded-xl -rotate-1 shadow-sketch-sm">{success}</div>}

                    <div className="flex gap-4 mt-auto">
                        <button
                            onClick={resetForm}
                            className="sketch-button bg-paper flex items-center justify-center gap-2 px-6 py-4 text-charcoal font-black"
                        >
                            {editingSkillName ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            <span className="hidden sm:inline">{editingSkillName ? "Cancelar" : "Novo"}</span>
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !yamlStr.trim() || isReadOnly}
                            className="sketch-button bg-sketch-blue flex-1 flex items-center justify-center gap-3 px-8 py-4 text-charcoal font-black disabled:opacity-50 text-lg group"
                        >
                            <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {saving ? "Salvando..." : editingSkillName ? "Atualizar Skill" : "Salvar Skill"}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="sketch-card p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden bg-white z-10 h-fit">
                    <h2 className="text-xl font-black text-charcoal font-display uppercase tracking-wider flex items-center gap-3">
                        <div className="p-2 bg-pastel-yellow/50 rounded-lg border-2 border-charcoal rotate-3">
                            <Wrench className="w-6 h-6 text-charcoal" />
                        </div>
                        Catálogo ({skills.length})
                    </h2>
                    {skills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-pastel-yellow/10 border-4 border-dashed border-charcoal/20 rounded-2xl">
                            <Wrench className="w-16 h-16 text-charcoal/20 mb-6 rotate-12" />
                            <p className="text-lg font-bold text-charcoal/50">O catálogo está vazio.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                            {skills.map(skill => {
                                const isLocal = skill.source === "user";
                                return (
                                    <div
                                        key={skill.name}
                                        className={`group relative rounded-xl border-2 transition-all cursor-pointer p-4 overflow-hidden ${
                                            editingSkillName === skill.name
                                                ? "border-charcoal bg-sketch-yellow/40 shadow-none translate-y-0.5"
                                                : "border-charcoal/30 bg-paper hover:border-charcoal hover:bg-pastel-yellow/20 hover:-translate-y-1 hover:shadow-sketch-sm"
                                        }`}
                                        onClick={() => {
                                            setEditingSkillName(skill.name);
                                            setYamlStr(skill.content || `name: ${skill.name}\ndescription: "${skill.description}"\n# Essa skill está em código nativo e não pode ser editada aqui.\n`);
                                            setError("");
                                            setSuccess("");
                                        }}
                                    >
                                        <div className="flex justify-between items-start gap-4 relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-lg font-black font-display text-charcoal group-hover:text-sketch-blue-dark transition-colors">{skill.name}</div>
                                                {skill.description && <div className="text-sm font-medium text-charcoal/70 mt-1.5 line-clamp-2 leading-snug">{skill.description}</div>}
                                            </div>
                                            <div className="flex items-end gap-3 shrink-0 flex-col">
                                                <SourceBadge source={skill.source || "user"} />
                                                {isLocal && (
                                                    <button
                                                        onClick={(e) => handleDelete(skill.name, e)}
                                                        disabled={deleting === skill.name}
                                                        title="Excluir skill local"
                                                        className="p-2.5 rounded-xl bg-paper text-charcoal border-2 border-charcoal hover:border-charcoal hover:bg-sketch-pink shadow-sm hover:shadow-sketch-sm transition-all disabled:opacity-40 mt-1 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
