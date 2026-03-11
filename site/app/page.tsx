"use client";

import { useEffect, useState } from "react";
import { type Agent, fetchAgents } from "@/lib/api";
import {
  Bot,
  PlusSquare,
  Brain,
  Settings2,
  Filter,
  MessageSquare,
  Trash2,
  Activity,
  Clock,
  Database
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "@/components/stat-card";

function AgentCard({ agent, index, onDelete }: { agent: Agent; index: number; onDelete: (name: string) => void }) {
  // Mock sparkline heights for visual effect
  const sparklines = [40, 60, 35, 80, 55, 90, 75];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col gap-4 rounded-xl border border-white/5 bg-background-surface/30 p-5 backdrop-blur-md transition-all duration-300 hover:border-cyan/30 hover:bg-background-surface/50 overflow-hidden cursor-default h-[220px]"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
        <Brain className="w-16 h-16 text-cyan" />
      </div>

      <div className="flex items-start justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.05)] group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all">
            <Bot className="w-5 h-5 text-cyan" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 group-hover:text-cyan transition-colors duration-300">{agent.name}</h3>
            <p className="text-[10px] text-cyan flex items-center gap-1 font-mono uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan inline-block shadow-[0_0_5px_rgba(0,240,255,0.8)] animate-pulse"></span>
              {agent.provider || "Local"}
            </p>
          </div>
        </div>
        <div className="text-right z-10">
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Tools</p>
          <p className="text-sm font-bold text-slate-200">{agent.skills?.length || 0}</p>
        </div>
      </div>

      <div className="text-xs text-slate-400 line-clamp-2 h-8 z-10 group-hover:text-slate-300 transition-colors">
        {agent.description || "Agente base sem descrição definida na configuração."}
      </div>

      {/* Simple Sparkline SVG Replacement */}
      <div className="h-12 w-full flex items-end gap-[2px] z-10 mt-auto">
        {sparklines.map((height, i) => (
          <div
            key={i}
            className="w-full bg-gradient-to-t from-cyan/10 to-transparent rounded-t-sm transition-all duration-500 group-hover:from-cyan/30"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>

      {/* Overlay Actions on Hover */}
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col md:flex-row items-center justify-center gap-3 transition-opacity duration-300 z-50">
        <Link href={`/chat?agent=${agent.name}`}>
          <button className="flex items-center gap-2 bg-gradient-to-r from-cyan/80 to-blue-500/80 hover:from-cyan hover:to-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all transform hover:scale-105">
            <MessageSquare className="w-4 h-4" />
            Conversar
          </button>
        </Link>
        <Link href={`/agents/edit?name=${agent.name}`}>
          <button className="flex items-center gap-2 border border-white/20 hover:border-cyan hover:text-cyan text-slate-300 px-4 py-2 rounded-lg text-xs font-bold bg-background-dark/50 hover:bg-cyan/10 transition-all">
            <Settings2 className="w-4 h-4" />
          </button>
        </Link>
        <button onClick={() => { if (window.confirm(`Tem certeza que deseja excluir o agente ${agent.name}?`)) onDelete(agent.name); }} className="flex items-center gap-2 border border-red-500/30 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20 hover:border-red-500 transition-all bg-background-dark/50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan to-blue-500 group-hover:w-full transition-all duration-700"></div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/5 bg-background-surface/20 p-5 flex flex-col gap-4 relative animate-pulse h-[220px]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-white/5 rounded-sm" />
            <div className="w-16 h-2 bg-white/5 rounded-sm" />
          </div>
        </div>
      </div>
      <div className="w-full h-8 bg-white/5 mt-2 rounded-sm" />
      <div className="h-12 w-full flex items-end gap-1 mt-auto opacity-30">
        {[20, 30, 40, 20, 60, 40, 20].map((h, i) => (
          <div key={i} className="w-full bg-white/10 rounded-t-sm" style={{ height: `${h}%` }} />
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-50 uppercase tracking-tighter drop-shadow-md">
            deepH <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-500">Plus</span>
          </h1>
          <p className="text-cyan border border-cyan/20 bg-cyan/5 px-2 py-0.5 rounded-full mt-2 font-medium tracking-widest text-[10px] uppercase inline-block">
            Emerald Engine v4.0 — Neural Interface
          </p>
        </div>
        <Link href="/agents/new">
          <button className="relative group overflow-hidden bg-transparent border border-cyan/50 text-cyan px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:border-cyan">
            <div className="absolute inset-0 bg-cyan/10 group-hover:bg-cyan/20 transition-colors"></div>
            <PlusSquare className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Instanciar Agente</span>
          </button>
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-white/5 mb-10 relative">
        {/* Subtle background glow behind stats */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-cyan/5 blur-3xl -z-10 rounded-full"></div>
        
        <StatCard 
            title="Carga do Sistema"
            value="12%"
            subtitle="Estável"
            icon={<Activity className="w-5 h-5" />}
        />
        <StatCard 
            title="Tempo de Execução"
            value="128h"
            subtitle="12m"
            icon={<Clock className="w-5 h-5" />}
        />
        <StatCard 
            title="Agentes Ativos"
            value={agents.length}
            subtitle="Em disco"
            icon={<Database className="w-5 h-5" />}
        />
      </section>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-slate-100 font-display uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan to-blue-500 rounded-full"></div>
          Agentes Ativos
        </h2>
        <button className="p-2 border border-white/10 bg-background-surface/30 backdrop-blur-sm rounded-lg transition-all text-slate-400 hover:text-cyan hover:border-cyan/30 hover:bg-cyan/5">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Agents Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              className="col-span-full flex flex-col items-center justify-center py-24 text-center border px-4 border-dashed border-cyan/20 rounded-xl bg-cyan/5 backdrop-blur-sm relative overflow-hidden group"
            >
              <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan/20 to-transparent -translate-y-full group-hover:animate-[scan_3s_ease-in-out_infinite]"></div>
              
              <div className="w-16 h-16 rounded-2xl bg-background-dark/80 flex items-center justify-center mb-6 border border-cyan/20 shadow-[0_0_30px_rgba(0,240,255,0.1)] relative">
                <div className="absolute inset-0 bg-cyan/10 blur-md rounded-2xl"></div>
                <Bot className="w-8 h-8 text-cyan relative z-10" />
              </div>
              <h3 className="text-xl font-medium text-slate-100 font-display tracking-wide mb-2">Sem instâncias no servidor</h3>
              <p className="text-sm text-slate-400 mb-8 max-w-md">Nenhum agente pôde ser encontrado na pasta <code className="text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">agents/</code> do diretório raiz.</p>
              <Link href="/agents/new">
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 bg-gradient-to-r from-cyan/80 to-blue-500/80 hover:from-cyan hover:to-blue-500 text-white shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-105">
                  <PlusSquare className="w-5 h-5" />
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
