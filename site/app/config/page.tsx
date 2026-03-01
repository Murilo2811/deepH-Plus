"use client";

import { useEffect, useState } from "react";
import { fetchKeys, saveKeys } from "@/lib/api";
import { Copy, Save, Key, Cpu, Activity, Network } from "lucide-react";
import { motion } from "framer-motion";

interface Provider {
    id: string;
    title: string;
    model: string;
    icon: React.ElementType;
    badge: string;
    placeholder: string;
}

const PROVIDERS: Provider[] = [
    { id: "deepseek", title: "DeepSeek", model: "DeepSeek Chat", icon: Cpu, badge: "Primary", placeholder: "sk-..." },
    { id: "openai", title: "OpenAI", model: "GPT-4 Models", icon: Activity, badge: "Active", placeholder: "sk-proj-..." },
    { id: "anthropic", title: "Anthropic", model: "Claude Família", icon: Network, badge: "Standby", placeholder: "sk-ant-..." },
];

export default function ConfigPage() {
    const [keys, setKeys] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        fetchKeys()
            .then(k => { setKeys(k); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMsg("");
        setIsError(false);
        try {
            await saveKeys(keys);
            setMsg("Configurações salvas com sucesso.");
            setTimeout(() => setMsg(""), 3500);
        } catch (err: any) {
            setIsError(true);
            setMsg(err?.message || "Erro ao salvar.");
        } finally {
            setSaving(false);
        }
    };

    const handleKeyChange = (providerId: string, value: string) => {
        setKeys(prev => ({ ...prev, [providerId]: value }));
    };

    const handlePaste = async (providerId: string) => {
        try {
            const text = await navigator.clipboard.readText();
            handleKeyChange(providerId, text.trim());
        } catch {
            // clipboard not available
        }
    };

    if (loading) return (
        <div className="flex-1 w-full max-w-3xl mx-auto p-4 flex flex-col gap-6 animate-pulse mt-10">
            <div className="h-10 w-48 bg-surface-dark rounded border border-border-accent/30" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-surface-dark rounded border border-border-accent/30" />
                <div className="h-24 bg-surface-dark rounded border border-border-accent/30" />
            </div>
            <div className="h-32 bg-surface-dark rounded border border-border-accent/30" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-8 pb-32"
        >
            <div className="flex flex-col gap-2 pt-2">
                <h2 className="text-3xl font-bold tracking-tight text-white font-display">System Configuration</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    Gerencie suas credenciais para os provedores de inteligência artificial. Essas chaves autorizam o deepH a executar ações no modelo.{" "}
                    <strong className="text-primary font-medium tracking-wide">Mantidas apenas localmente em keys.json.</strong>
                </p>
            </div>

            {/* KPI / Usage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-dark border border-border-accent/50 p-5 rounded-xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Provedores Configurados</span>
                    <span className="text-2xl font-bold text-white mt-1">
                        {Object.values(keys).filter(v => v && v.trim().length > 0).length} / {PROVIDERS.length}
                    </span>
                    <span className="text-xs text-primary flex items-center gap-1 mt-2">
                        <Activity className="w-3.5 h-3.5" /> Verificado localmente
                    </span>
                </div>
                <div className="bg-surface-dark border border-border-accent/50 p-5 rounded-xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Armazenamento Local</span>
                    <span className="text-2xl font-bold text-white mt-1">keys.json</span>
                    <span className="text-xs text-slate-500 mt-2">Salvo em <code className="text-primary/70">seu workspace</code></span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-primary" /> Chaves de API
                </h3>

                <div className="flex flex-col gap-4">
                    {PROVIDERS.map(provider => {
                        const Icon = provider.icon;
                        const currentVal = keys[provider.id] || "";

                        return (
                            <div key={provider.id} className="group relative overflow-hidden rounded-xl bg-surface-dark border border-border-accent/50 p-5 shadow-sm hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-black border border-border-accent/50 text-white shadow-[0_0_10px_rgba(15,240,146,0.05)]">
                                            <Icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-white leading-tight font-display">{provider.title}</h3>
                                            <span className="text-[11px] text-slate-400 uppercase tracking-widest">{provider.model}</span>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center rounded px-2 py-1 text-[10px] font-bold tracking-widest uppercase ring-1 ring-inset ${currentVal ? "bg-primary/10 text-primary ring-primary/20" : "bg-slate-800 text-slate-400 ring-slate-600/40"}`}>
                                        {currentVal ? "Configurado" : provider.badge}
                                    </span>
                                </div>

                                <div className="bg-black/40 rounded border border-border-accent/30 p-2 flex items-center justify-between gap-2 group-hover:bg-black/60 transition-colors focus-within:border-primary/50">
                                    <input
                                        type="password"
                                        placeholder={provider.placeholder}
                                        value={currentVal}
                                        onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                                        className="text-sm font-mono text-slate-300 truncate w-full bg-transparent border-none focus:ring-0 focus:outline-none px-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handlePaste(provider.id)}
                                        className="text-slate-500 hover:text-primary transition-colors p-1"
                                        title="Colar do clipboard"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="h-px bg-border-accent/30 w-full my-6" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className={`text-sm font-bold tracking-wide transition-all duration-300 ${isError ? "text-red-400" : "text-primary bg-primary/10 px-3 py-1.5 rounded"} ${msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                        {msg || "·"}
                    </span>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto h-12 flex items-center justify-center gap-2 px-8 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl shadow-[0_0_20px_rgba(15,240,146,0.2)] hover:shadow-[0_0_30px_rgba(15,240,146,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? "Salvando..." : "Save Settings"}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
