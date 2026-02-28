"use client";

import { useEffect, useState } from "react";
import { fetchConfig, saveConfig } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Save, KeyRound } from "lucide-react";

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
            setMsg("Configurações salvas!");
            setTimeout(() => setMsg(""), 3000);
        } catch (err) {
            setMsg("Erro ao salvar.");
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

    if (loading) return <div className="animate-pulse">Carregando...</div>;

    const providers = ["deepseek", "openai", "anthropic", "xai"];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-emerald-400" />
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">Configurações</h1>
                    <p className="text-zinc-400 mt-1">Gerencie suas chaves de API e configurações globais.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                <Card className="bg-zinc-900/40 border-zinc-800/50">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-zinc-400" />
                            Chaves de API
                        </CardTitle>
                        <CardDescription>
                            As chaves são salvas localmente no seu computador (arquivo config.json) e nunca são enviadas para a nuvem do deepH.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {providers.map(provider => (
                            <div key={provider} className="space-y-2">
                                <Label className="text-zinc-300 capitalize">{provider}</Label>
                                <Input
                                    type="password"
                                    placeholder={`sk-...`}
                                    value={config?.providers?.[provider]?.api_key || ""}
                                    onChange={e => handleProviderChange(provider, 'api_key', e.target.value)}
                                    className="font-mono bg-zinc-950 border-zinc-800"
                                />
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="bg-zinc-950/30 border-t border-zinc-800/50 py-4 flex justify-between">
                        <span className="text-sm text-emerald-400">{msg}</span>
                        <Button type="submit" disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold gap-2">
                            <Save className="w-4 h-4" />
                            {saving ? "Salvando..." : "Salvar"}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
