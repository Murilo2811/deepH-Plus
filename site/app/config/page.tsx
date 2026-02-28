"use client";

import { useEffect, useState } from "react";
import { fetchConfig, saveConfig } from "@/lib/api";
import { Copy, Plus, Save, Key, Shield, AlertTriangle, CloudRain, Cpu, Activity, Info, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ConfigPage() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        fetchConfig().then(c => {
            setConfig(c);
            setLoading(false);
        }).catch(console.error);
    }, []);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMsg("");
        try {
            await saveConfig(config);
            setMsg("Configurations deployed successfully.");
            setTimeout(() => setMsg(""), 3500);
        } catch (err) {
            setMsg("Failed to synchronize with core config.");
        } finally {
            setSaving(false);
        }
    };

    const handleProviderChange = (providerName: string, field: string, value: string) => {
        setConfig((prev: any) => {
            const next = { ...prev };
            if (!next.providers) next.providers = {};
            if (!next.providers[providerName]) next.providers[providerName] = {};
            next.providers[providerName][field] = value;
            return next;
        });
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

    const providers = [
        { id: "deepseek", title: "DeepSeek", model: "DeepSeek Chat", icon: Cpu, badge: "Primary" },
        { id: "openai", title: "OpenAI", model: "GPT-4 Models", icon: Activity, badge: "Active" },
        { id: "anthropic", title: "Anthropic", model: "Claude Familia", icon: Network, badge: "Standby" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-8 pb-32"
        >
            <div className="flex flex-col gap-2 pt-2">
                <h2 className="text-3xl font-bold tracking-tight text-white font-display">System Configuration</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                    Gerencie suas credenciais para os provedores de inteligência artificial. Essas chaves autorizam o deepH a executar ações no modelo. <strong className="text-primary font-medium tracking-wide">Mantidas apenas localmente.</strong>
                </p>
            </div>

            {/* KPI / Usage Summary (Visual Interest Mock) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-dark border border-border-accent/50 p-5 rounded-xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Inferences</span>
                    <span className="text-2xl font-bold text-white mt-1">2,410</span>
                    <span className="text-xs text-primary flex items-center gap-1 mt-2">
                        <Activity className="w-3.5 h-3.5" /> Normal rate
                    </span>
                </div>
                <div className="bg-surface-dark border border-border-accent/50 p-5 rounded-xl flex flex-col gap-1 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Local Config Size</span>
                    <span className="text-2xl font-bold text-white mt-1">4.2 KB</span>
                    <span className="text-xs text-slate-500 mt-2">Stored at <code className="text-primary/70">config.json</code></span>
                </div>
            </div>

            <form className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-white font-display flex items-center gap-2 mb-2">
                    <Key className="w-5 h-5 text-primary" /> Active Keys
                </h3>

                <div className="flex flex-col gap-4">
                    {providers.map(provider => {
                        const Icon = provider.icon;
                        const defaultVal = config?.providers?.[provider.id]?.api_key || "";

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
                                    <span className="inline-flex items-center rounded bg-primary/10 px-2 py-1 text-[10px] font-bold tracking-widest text-primary ring-1 ring-inset ring-primary/20 uppercase">
                                        {provider.badge}
                                    </span>
                                </div>

                                <div className="bg-black/40 rounded border border-border-accent/30 p-2 flex items-center justify-between gap-2 mb-4 group-hover:bg-black/60 transition-colors focus-within:border-primary/50">
                                    <input
                                        type="password"
                                        placeholder={`sk-proj...${provider.id}...`}
                                        value={defaultVal}
                                        onChange={(e) => handleProviderChange(provider.id, 'api_key', e.target.value)}
                                        className="text-sm font-mono text-slate-300 truncate w-full bg-transparent border-none focus:ring-0 focus:outline-none px-2"
                                    />
                                    <button type="button" className="text-slate-500 hover:text-primary transition-colors p-1" title="Paste/Replace">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="h-px bg-border-accent/30 w-full my-6"></div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className={`text-sm font-bold tracking-wide transition-all ${msg.includes("Failed") ? "text-red-400" : "text-primary bg-primary/10 px-3 py-1.5 rounded"} ${msg ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                        {msg || "Placeholder"}
                    </span>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto h-12 flex items-center justify-center gap-2 px-8 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-xl shadow-[0_0_20px_rgba(15,240,146,0.2)] hover:shadow-[0_0_30px_rgba(15,240,146,0.4)] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{saving ? "Deploying Schema..." : "Save Settings"}</span>
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
