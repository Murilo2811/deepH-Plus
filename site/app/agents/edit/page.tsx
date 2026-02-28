"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AgentEditor } from "@/components/agent-editor";
import { Agent, fetchAgents } from "@/lib/api";

function EditAgentInner() {
    const searchParams = useSearchParams();
    const name = searchParams.get("name");

    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!name) {
            setError("Nome do agente não especificado.");
            setLoading(false);
            return;
        }
        fetchAgents().then(agents => {
            const found = agents.find(a => a.name === name);
            if (found) {
                setAgent(found);
            } else {
                setError("Agente não encontrado.");
            }
        }).catch(err => {
            setError(err.message);
        }).finally(() => {
            setLoading(false);
        });
    }, [name]);

    if (loading) return <div className="animate-pulse">Carregando agente {name}...</div>;
    if (error) return <div className="text-red-400 p-6 bg-red-950/20 rounded-xl border border-red-900/50">{error}</div>;
    if (!agent) return <div className="text-zinc-400">Agente não encontrado.</div>;

    return <AgentEditor initialAgent={agent} />;
}

export default function EditAgentPage() {
    return (
        <Suspense fallback={<div className="animate-pulse">Carregando rota...</div>}>
            <EditAgentInner />
        </Suspense>
    )
}
