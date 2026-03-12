"use client";

import { useEffect, useState } from "react";
import { fetchKeys, saveKeys } from "@/lib/api";
import { Copy, Save, Key, Cpu, Activity, Network, Loader2, Sparkles } from "lucide-react";
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
            <div className="h-10 w-48 bg-sketch-bg-off rounded-xl border-2 border-sketch-charcoal/10" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-sketch-bg-off rounded-xl border-2 border-sketch-charcoal/10" />
                <div className="h-24 bg-sketch-bg-off rounded-xl border-2 border-sketch-charcoal/10" />
            </div>
            <div className="h-32 bg-sketch-bg-off rounded-xl border-2 border-sketch-charcoal/10" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-8 pb-32 bg-sketch-paper/20 rounded-[40px]"
        >
            <div className="flex flex-col gap-2 pt-2">
                <h2 className="text-4xl font-black tracking-tight text-sketch-charcoal font-display uppercase transition-all hover:rotate-[-0.5deg]">
                    Configurações do <span className="text-sketch-teal-dark">Sistema</span>
                </h2>
                <div className="h-1.5 w-32 bg-sketch-yellow/40 mt-[-10px] ml-1 rounded-full" />
                <p className="text-sketch-charcoal/70 text-sm leading-relaxed max-w-xl font-bold mt-4">
                    Gerencie suas credenciais para os provedores de inteligência artificial. Essas chaves autorizam o deepH a executar ações.{" "}
                    <span className="bg-sketch-charcoal text-white py-0.5 px-2 inline-flex align-middle ml-1 text-[10px] font-black rounded rotate-1">keys.json</span>
                </p>
            </div>

            {/* Usage Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="sketch-card bg-sketch-paper-cool group">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sketch-charcoal/40">Provedores Configurados</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-sketch-charcoal">
                                {Object.values(keys).filter(v => v && v.trim().length > 0).length}
                            </span>
                            <span className="text-sm font-bold text-sketch-charcoal/40">/ {PROVIDERS.length}</span>
                        </div>
                        <span className="text-[10px] text-sketch-teal-dark font-black flex items-center gap-1 mt-2 tracking-widest uppercase">
                            <Activity className="w-3 h-3" /> Verificado
                        </span>
                    </div>
                </div>
                <div className="sketch-card bg-sketch-yellow-pale/40 group">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-sketch-charcoal/40">Armazenamento Local</span>
                        <span className="text-xl font-black text-sketch-charcoal mt-1 uppercase">keys.json</span>
                        <div className="flex items-center gap-2 mt-2">
                             <div className="w-2.5 h-2.5 rounded-full bg-sketch-teal shadow-sketch-sm" />
                             <span className="text-[10px] text-sketch-charcoal/60 font-black uppercase tracking-tight">
                                Sincronizado com o Core
                             </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <h3 className="text-2xl font-black text-sketch-charcoal font-display uppercase flex items-center gap-3 mb-2">
                    <Key className="w-6 h-6 text-sketch-teal-dark" /> 
                    API Provider Keys
                </h3>

                <div className="flex flex-col gap-8">
                    {PROVIDERS.map(provider => {
                        const Icon = provider.icon;
                        const currentVal = keys[provider.id] || "";

                        return (
                            <div key={provider.id} className="sketch-card group relative p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-5">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white border-4 border-sketch-charcoal text-sketch-charcoal shadow-sketch-sm group-hover:scale-110 transition-transform rotate-[-5deg]">
                                            <Icon className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-sketch-charcoal leading-tight font-display uppercase tracking-tight">{provider.title}</h3>
                                            <span className="text-[10px] text-sketch-teal uppercase tracking-widest font-black">{provider.model}</span>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full border-2 border-sketch-charcoal flex items-center gap-2 font-black text-[10px] uppercase tracking-tighter shadow-sketch-sm transition-colors ${currentVal ? "bg-sketch-teal-dark text-white" : "bg-sketch-yellow-pale text-sketch-charcoal"}`}>
                                        {currentVal ? "Ativo" : "Pendente"}
                                    </div>
                                </div>

                                <div className="relative">
                                    <input
                                        type="password"
                                        placeholder={provider.placeholder}
                                        value={currentVal}
                                        onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                                        className="sketch-input pr-12 font-mono h-14 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handlePaste(provider.id)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sketch-charcoal/30 hover:text-sketch-teal transition-all hover:scale-125"
                                        title="Colar"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                    <Sparkles className="w-12 h-12 text-sketch-teal" />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <hr className="sketch-divider" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-10 pb-20">
                    <div className="flex flex-col gap-1 min-h-[40px]">
                        {msg && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-xs font-black tracking-widest px-6 py-3 uppercase border-4 shadow-sketch-md rounded-2xl ${
                                    isError ? "text-white border-sketch-charcoal bg-red-400" : "text-sketch-charcoal border-sketch-charcoal bg-sketch-yellow-pale"
                                }`}
                            >
                                {msg}
                            </motion.span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="sketch-btn-primary px-12 h-16 shadow-sketch-lg group no-overflow"
                    >
                        {saving ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Save className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-lg font-black uppercase tracking-tighter">{saving ? "Gravando..." : "Sincronizar"}</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
