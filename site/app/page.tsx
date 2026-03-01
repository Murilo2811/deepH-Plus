"use client";

import { useEffect, useState } from "react";
import { KitGallery } from "@/components/kit-gallery";
import { type Agent, fetchAgents } from "@/lib/api";
import {
  Bot,
  Cpu,
  PlusSquare,
  Brain,
  Settings2,
  Filter,
  MessageSquare,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function AgentCard({ agent, index, onDelete }: { agent: Agent; index: number; onDelete: (name: string) => void }) {
  // Mock sparkline heights for visual effect
  const sparklines = [40, 60, 35, 80, 55, 90, 75];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-card p-4 rounded-xl flex flex-col gap-4 relative overflow-hidden group cursor-default"
    >
      <div className="absolute top-0 right-0 p-2 opacity-20 pointer-events-none">
        <Brain className="w-12 h-12 text-primary" />
      </div>

      <div className="flex items-start justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100">{agent.name}</h3>
            <p className="text-[10px] text-primary flex items-center gap-1 font-mono uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse"></span>
              {agent.provider || "Local"}
            </p>
          </div>
        </div>
        <div className="text-right z-10">
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Tools</p>
          <p className="text-sm font-bold text-slate-200">{agent.skills?.length || 0}</p>
        </div>
      </div>

      <div className="text-xs text-slate-400 line-clamp-2 h-8 z-10">
        {agent.description || "Agente base sem descrição definida na configuração."}
      </div>

      {/* Simple Sparkline SVG Replacement */}
      <div className="h-12 w-full flex items-end gap-1 z-10 mt-auto">
        {sparklines.map((height, i) => (
          <div
            key={i}
            className="w-full bg-gradient-to-t from-primary/20 to-transparent rounded-t-sm transition-all duration-500 group-hover:from-primary/40"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {/* Overlay Actions on Hover */}
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-md opacity-0 group-hover:opacity-100 flex flex-col md:flex-row items-center justify-center gap-3 transition-opacity duration-300 z-50">
        <Link href={`/chat?agent=${agent.name}`}>
          <button className="flex items-center gap-2 bg-primary text-background-dark px-4 py-2 rounded-lg text-xs font-bold hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
            Conversar
          </button>
        </Link>
        <Link href={`/agents/edit?name=${agent.name}`}>
          <button className="flex items-center gap-2 border border-primary/30 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/10 transition-all">
            <Settings2 className="w-4 h-4" />
          </button>
        </Link>
        <button onClick={() => { if (window.confirm(`Tem certeza que deseja excluir o agente ${agent.name}?`)) onDelete(agent.name); }} className="flex items-center gap-2 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/10 transition-all">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-4 rounded-xl flex flex-col gap-4 relative animate-pulse h-48">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-dark border border-slate-800" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-surface-dark rounded-sm" />
            <div className="w-16 h-2 bg-surface-dark rounded-sm" />
          </div>
        </div>
      </div>
      <div className="w-full h-8 bg-surface-dark mt-2 rounded-sm" />
      <div className="h-12 w-full flex items-end gap-1 mt-auto opacity-30">
        {[20, 30, 40, 20, 60, 40, 20].map((h, i) => (
          <div key={i} className="w-full bg-surface-dark rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents()
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (name: string) => {
    try {
      // Import missing deleteAgent and run
      const { deleteAgent } = await import('@/lib/api');
      await deleteAgent(name);
      setAgents(prev => prev.filter(a => a.name !== name));
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir o agente");
    }
  };

  return (
    <div className="px-6 pb-24 animate-in">
      {/* Header Minimalista - O topo do Layout ja tem. Adicionando controles extras aqui */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-100">Painel Operacional</h1>
          <p className="text-sm text-slate-400 mt-1">Gerencie os sistemas e ferramentas de Inteligência Artificial.</p>
        </div>
        <Link href="/agents/new">
          <button className="bg-primary hover:bg-primary/90 text-background-dark px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2">
            <PlusSquare className="w-4 h-4" />
            Instanciar Agente
          </button>
        </Link>
      </div>

      {/* Stats Summary from Stitch HTML */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-primary/5 mb-8">
        <div className="glass-card p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-medium mb-1 tracking-wide uppercase">Carga do Sistema</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display">12%</span>
            <span className="text-[10px] text-primary font-bold">Estável</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-medium mb-1 tracking-wide uppercase">Tempo de Execução</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display">128h</span>
            <span className="text-[10px] text-primary font-bold">12m</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <p className="text-slate-400 text-xs font-medium mb-1 tracking-wide uppercase">Agentes Ativos</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display">{agents.length}</span>
            <span className="text-[10px] text-primary font-bold">Em disco</span>
          </div>
        </div>
      </section>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-100 font-display">Neural Agents</h2>
        <button className="p-2 hover:bg-primary/5 rounded-md transition-colors text-slate-400 hover:text-primary">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Agents Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : agents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-24 text-center border border-dashed border-primary/20 rounded-xl bg-primary/5"
            >
              <div className="w-16 h-16 rounded-xl bg-surface-dark flex items-center justify-center mb-4 border border-primary/10">
                <Bot className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-lg font-medium text-slate-100 font-display">Sem instâncias no servidor</h3>
              <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm">Nenhum agente pôde ser encontrado na pasta <code>agents/</code> do diretório root.</p>
              <Link href="/agents/new">
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 bg-primary hover:bg-primary/90 text-background-dark">
                  <PlusSquare className="w-4 h-4" />
                  Inicializar Core Artificial
                </button>
              </Link>
            </motion.div>
          ) : (
            agents.map((agent, i) => (
              <AgentCard key={agent.name} agent={agent} index={i} onDelete={handleDelete} />
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
