"use client";

import { useEffect, useState } from "react";
import { fetchKits, installKit, type Kit } from "@/lib/api";
import { Download, Bot, Layers, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface KitGalleryProps {
    onInstallSuccess?: () => void;
    searchQuery?: string;
}

export function KitGallery({ onInstallSuccess, searchQuery = "" }: KitGalleryProps) {
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
                setTimeout(onInstallSuccess, 1500);
            }
        } catch (e: any) {
            alert(`Erro ao instalar kit: ${e.message}`);
        } finally {
            setInstalling(null);
        }
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 text-sm font-bold"
                 style={{ borderRadius: '8px 10px 9px 11px' }}>
                {error}
            </div>
        );
    }

    const filtered = kits.filter(kit => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return kit.name.toLowerCase().includes(q) || kit.description.toLowerCase().includes(q);
    });

    if (kits.length > 0 && filtered.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers className="w-10 h-10 text-sketch-charcoal/20 mb-3" />
                <p className="text-sm text-sketch-charcoal/50 font-bold">Nenhum kit encontrado para &quot;{searchQuery}&quot;</p>
            </div>
        );
    }

    if (kits.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((kit, i) => {
                const isInstalling = installing === kit.name;
                const isInstalled = installed.includes(kit.name);

                return (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                        key={kit.name}
                        className="sketch-card group relative flex flex-col gap-4 p-5 h-full"
                    >
                        {/* Decorative background icon */}
                        <div className="absolute top-2 right-2 p-2 opacity-[0.06] pointer-events-none group-hover:opacity-[0.12] transition-opacity">
                            <Layers className="w-14 h-14 text-sketch-teal-dark" />
                        </div>

                        <div>
                            <h4 className="font-bold text-sketch-charcoal flex items-center justify-between text-base">
                                {kit.name}
                                <span className="sketch-badge text-[9px] py-0.5 px-2 ml-2" style={{ boxShadow: 'none', border: '2px solid var(--sketch-charcoal)' }}>
                                    {kit.provider_type}
                                </span>
                            </h4>
                            <p className="text-xs text-sketch-charcoal/50 mt-2 line-clamp-2 h-8">
                                {kit.description}
                            </p>
                        </div>

                        <div className="flex gap-4 text-xs font-mono text-sketch-charcoal/40 mt-auto">
                            <span className="flex items-center gap-1">
                                <Bot className="w-3 h-3" /> {kit.files_count - 1} Agentes
                            </span>
                            <span className="flex items-center gap-1">
                                <Layers className="w-3 h-3" /> {kit.skills_count} Skills
                            </span>
                        </div>

                        <button
                            onClick={() => handleInstall(kit)}
                            disabled={isInstalling || isInstalled}
                            className={`w-full py-2.5 text-sm font-black flex items-center justify-center gap-2 transition-all duration-150 uppercase tracking-wider ${
                                isInstalled
                                    ? "bg-green-50 text-green-700 border-2 border-green-300"
                                    : "sketch-btn-primary py-2.5 text-sm"
                            }`}
                            style={isInstalled ? { borderRadius: '10px 12px 11px 13px' } : {}}
                        >
                            {isInstalling ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-2 border-sketch-teal/30 border-t-sketch-teal animate-spin" />
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
    );
}
