"use client";

import { useEffect, useState } from "react";
import { fetchConfig, saveConfig } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg("");
        try {
            await saveConfig(config);
            setMsg("Configurações salvas e aplicadas.");
            setTimeout(() => setMsg(""), 3500);
        } catch (err) {
            setMsg("Erro ao salvar o arquivo.");
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
        <div className="animate-pulse flex flex-col gap-6 max-w-2xl mt-10">
            <div className="h-10 w-48 bg-neutral-bg3 rounded-sm" />
            <div className="h-64 w-full bg-neutral-bg2 rounded-sm" />
        </div>
    );

    const providers = ["deepseek", "openai", "anthropic", "xai"];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 max-w-3xl pb-20"
        >
            <div className="flex items-center gap-4 pb-6 border-b border-border/50">
                <div className="w-12 h-12 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
                    <Settings className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-text-primary">Configurações Globais</h1>
                    <p className="text-text-secondary mt-1">Gerenciamento de chaves de API e preferências do runtime.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="glass-card bg-neutral-bg1/40">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2 text-text-primary">
                            <KeyRound className="w-5 h-5 text-text-muted" />
                            Credenciais de API (Providers)
                        </CardTitle>
                        <CardDescription className="text-text-secondary">
                            As chaves inseridas abaixo são salvas exclusivamente no seu disco local <span className="font-mono text-zinc-400 bg-neutral-bg3 px-1 rounded">config.json</span>.
                            Nunca as compartilharemos com serviços externos além dos próprios provedores que você utilizar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {providers.map(provider => (
                            <div key={provider} className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:items-center">
                                <Label className="text-text-secondary font-medium tracking-wide uppercase text-xs">
                                    {provider}
                                </Label>
                                <Input
                                    type="password"
                                    placeholder={`sk-... (${provider} api key)`}
                                    value={config?.providers?.[provider]?.api_key || ""}
                                    onChange={e => handleProviderChange(provider, 'api_key', e.target.value)}
                                    className="glass-input font-mono text-sm w-full"
                                />
                            </div>
                        ))}
                    </CardContent>

                    <div className="h-px bg-border/50 w-full" />

                    <CardFooter className="bg-neutral-bg2/30 py-5 flex items-center justify-between rounded-b-md">
                        <span className={`text-sm font-medium transition-opacity ${msg.includes("Erro") ? "text-status-error" : "text-brand"} ${msg ? "opacity-100" : "opacity-0"}`}>
                            {msg || "Placeholder"}
                        </span>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-sm font-semibold transition-all duration-200 bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? "Registrando no disco..." : "Salvar Configuração"}
                        </button>
                    </CardFooter>
                </Card>
            </form>
        </motion.div>
    );
}
