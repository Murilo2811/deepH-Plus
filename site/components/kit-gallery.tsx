"use client";

import { useEffect, useState } from "react";
import { fetchKits, installKit, type Kit } from "@/lib/api";
import { Download, Bot, Layers, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function KitGallery({ onInstallSuccess }: { onInstallSuccess?: () => void }) {
    const [kits, setKits] = useState<Kit[]>([]);
    const [installing, setInstalling] = useState<string | null>(null);
    const [installed, setInstalled] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchKits().then(setKits).catch(e => setError(e.message));
    }, []);

    async function handleInstall(kit: Kit) {
        setInstalling(kit.name);
        try {
            await installKit(kit.name, false);
            setInstalled(prev => [...prev, kit.name]);
            if (onInstallSuccess) {
                setTimeout(onInstallSuccess, 1500); // Give time to show success state before refresh
            }
        } catch (e: any) {
            alert(`Erro ao instalar kit: ${e.message}`);
        } finally {
            setInstalling(null);
        }
    }

    if (error) {
        return <div className="text-red-400 text-sm p-4 border border-red-500/20 rounded-xl bg-red-500/5">{error}</div>;
    }

    if (kits.length === 0) return null;

    return (
        <div className="w-full mt-6">
            <div className="text-left mb-6">
                <h3 className="text-xl font-bold text-primary mb-2 flex items-center justify-center md:justify-start gap-2">
                    <Layers className="w-5 h-5" /> Quick Start: Instale um Kit
                </h3>
                <p className="text-sm text-slate-400">
                    Kits são conjuntos prontos de agentes, skills e configurações de time (crews) para você começar rapidamente.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                {kits.map((kit, i) => {
                    const isInstalling = installing === kit.name;
                    const isInstalled = installed.includes(kit.name);

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={kit.name}
                            className="rounded-2xl border border-primary/20 bg-background-dark/50 p-5 flex flex-col gap-4 hover:border-primary/40 transition-colors"
                        >
                            <div>
                                <h4 className="font-bold text-slate-100 flex items-center justify-between">
                                    {kit.name}
                                    <span className="text-[10px] uppercase font-mono tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        {kit.provider_type}
                                    </span>
                                </h4>
                                <p className="text-xs text-slate-400 mt-2 line-clamp-2 h-8">
                                    {kit.description}
                                </p>
                            </div>

                            <div className="flex gap-4 text-xs font-mono text-slate-500 mt-auto">
                                <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> {kit.files_count - 1} Agentes</span>
                                <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {kit.skills_count} Skills</span>
                            </div>

                            <button
                                onClick={() => handleInstall(kit)}
                                disabled={isInstalling || isInstalled}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${isInstalled
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                        : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                    }`}
                            >
                                {isInstalling ? (
                                    <>
                                        <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                                        Instalando...
                                    </>
                                ) : isInstalled ? (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" /> Instalado
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" /> Instalar Kit
                                    </>
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
