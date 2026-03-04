"use client";

import { useEffect, useState } from "react";
import { fetchSkills, createOrUpdateSkill, deleteSkill, type Skill } from "@/lib/api";
import { Wrench, Plus, Trash2, Save, XCircle, Pencil, Code2 } from "lucide-react";

export default function SkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [editingSkillName, setEditingSkillName] = useState<string | null>(null);
    const [yamlStr, setYamlStr] = useState(`name: nova_skill\ntype: file_read\ndescription: "Minha nova skill personalizada"\nparams:\n  max_bytes: 32768\n`);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                    <Wrench className="w-8 h-8" /> Skills (Ferramentas)
                </h1>
                <p className="text-sm text-slate-400 mt-1">Desenvolva habilidades personalizadas para seus agentes em formato YAML. As skills locais são salvas na pasta <code className="bg-primary/10 text-primary px-1 rounded">skills/</code>.</p>
            </div>

            <div className="grid md:grid-cols-[1fr_320px] gap-6">
                {/* Editor */}
                <div className="rounded-2xl border border-primary/10 bg-background-dark/40 p-5 flex flex-col gap-5">
                    <div className="flex justify-between items-center mb-1">
                        <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Code2 className="w-4 h-4 text-primary" />
                            {editingSkillName ? `Editando: ${editingSkillName}` : "Criar Nova Skill YAML"}
                        </h2>
                    </div>

                    <div className="flex-1 flex flex-col gap-2 min-h-[450px]">
                        <div className="flex rounded-xl overflow-hidden border border-primary/10 bg-background-dark/60 flex-1">
                            <div className="py-3 px-2 bg-black/40 select-none border-r border-primary/10 min-w-[2.5rem] text-right">
                                {yamlStr.split("\n").map((_, idx) => (
                                    <div key={idx} className="text-slate-500 text-[11px] font-mono leading-[1.625rem]">
                                        {idx + 1}
                                    </div>
                                ))}
                            </div>
                            <textarea
                                value={yamlStr}
                                onChange={e => { setYamlStr(e.target.value); setError(""); }}
                                spellCheck={false}
                                className="flex-1 bg-transparent text-primary p-3 font-mono text-xs leading-[1.625rem] resize-y focus:outline-none min-h-[450px] w-full"
                                style={{ tabSize: 2 }}
                            />
                        </div>
                        <p className="text-[11px] text-slate-500 text-center mt-1">
                            ✏️ Você deve especificar o tipo da skill: bash, cmd, pwsh, python, javascript, node, ou http.
                        </p>
                    </div>

                    {error && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 p-2 rounded">{error}</p>}
                    {success && <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/30 p-2 rounded">{success}</p>}

                    <div className="flex gap-2 mt-auto">
                        <button
                            onClick={resetForm}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-slate-400 text-sm hover:border-slate-400 hover:text-slate-200 transition-all"
                        >
                            {editingSkillName ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            {editingSkillName ? "Cancelar Edição" : "Nova Skill"}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !yamlStr.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-background-dark font-semibold text-sm disabled:opacity-40 hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(15,240,146,0.2)]"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Salvando..." : editingSkillName ? "Atualizar Skill" : "Salvar Skill"}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="rounded-2xl border border-primary/10 bg-background-dark/40 p-5 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-primary" />
                        Skills Disponíveis ({skills.length})
                    </h2>
                    {skills.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Wrench className="w-10 h-10 text-primary/20 mb-3" />
                            <p className="text-sm text-slate-500">Nenhuma skill encontrada.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[600px] pr-2">
                            {skills.map(skill => {
                                const isLocal = skill.content && skill.content.trim() !== "";
                                return (
                                    <div
                                        key={skill.name}
                                        className={`rounded-xl border p-3 transition-all cursor-pointer ${editingSkillName === skill.name
                                            ? "border-primary/60 bg-primary/5"
                                            : "border-primary/10 hover:border-primary/30"
                                            }`}
                                        onClick={() => {
                                            setEditingSkillName(skill.name);
                                            setYamlStr(skill.content || `name: ${skill.name}\ndescription: "${skill.description}"\n# Essa skill está em código nativo e não pode ser editada aqui.\n`);
                                            setError("");
                                            setSuccess("");
                                        }}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-slate-200">{skill.name}</div>
                                                {skill.description && <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{skill.description}</div>}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 flex-col">
                                                <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-lg border ${isLocal ? 'bg-primary/10 text-primary border-primary/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                    {isLocal ? "Local" : "Nativo"}
                                                </span>
                                                <div className="flex gap-1 mt-1">
                                                    {isLocal && (
                                                        <button
                                                            onClick={(e) => handleDelete(skill.name, e)}
                                                            disabled={deleting === skill.name}
                                                            title="Excluir skill local"
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-40"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
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
