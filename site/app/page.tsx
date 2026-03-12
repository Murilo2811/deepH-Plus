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
  Database,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { StatCard } from "@/components/stat-card";

function AgentCard({ agent, index, onDelete }: { agent: Agent; index: number; onDelete: (name: string) => void }) {
  const sparklines = [40, 60, 35, 80, 55, 90, 75];

  return (
    <motion.div
      initial={{ opacity: 0, rotate: index % 2 === 0 ? -1 : 1, y: 10 }}
      animate={{ opacity: 1, rotate: 0, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, type: "spring" }}
      whileHover={{ y: -6, rotate: -1, scale: 1.02 }}
      className="sketch-card group relative flex flex-col gap-4 p-6 transition-all duration-300 cursor-default h-[260px] overflow-visible"
    >
      <div className="absolute -top-3 -right-3 p-3 opacity-20 pointer-events-none group-hover:scale-110 group-hover:opacity-40 transition-all duration-500 rotate-12">
        <Brain className="w-16 h-16 text-sketch-blue-dark" />
      </div>

      <div className="flex items-start justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-pastel-yellow/30 border-2 border-charcoal/80 flex items-center justify-center shadow-sketch-sm group-hover:shadow-sketch-md transition-all rotate-[-5deg]">
            <Bot className="w-6 h-6 text-charcoal" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-charcoal leading-tight group-hover:text-sketch-teal-dark transition-colors duration-300">{agent.name}</h3>
            <p className="text-[10px] text-charcoal flex items-center gap-1 font-bold uppercase tracking-wider mt-1">
              <span className="w-2 h-2 rounded-full bg-sketch-green inline-block border border-charcoal/50 shadow-sketch-sm"></span>
              Neural Active
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-16 w-full mt-auto px-1 z-10 overflow-hidden">
        {sparklines.map((height, i) => (
          <div
            key={i}
            className={`w-full rounded-t-sm border-t-2 border-x-2 border-charcoal transition-all duration-500 group-hover:opacity-100 ${
              i % 3 === 0 ? 'bg-sketch-blue' : i % 3 === 1 ? 'bg-sketch-pink' : 'bg-sketch-yellow'
            } opacity-80`}
            style={{ height: `${height}%`, transform: `rotate(${(i % 3 - 1) * 2}deg)` }}
          />
        ))}
      </div>

      {/* Overlay Actions on Hover */}
      <div className="absolute inset-0 bg-paper/95 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 z-50 border-2 border-charcoal border-dashed shadow-sketch-lg p-4">
        <Link href={`/chat?agent=${agent.name}`} className="w-full">
          <button className="sketch-button bg-sketch-blue w-full flex items-center justify-center gap-2 py-3 text-charcoal font-black">
            <MessageSquare className="w-5 h-5" />
            Conversar
          </button>
        </Link>
        <div className="flex gap-2 w-full">
            <Link href={`/agents/edit?name=${agent.name}`} className="flex-1">
                <button className="sketch-button bg-sketch-yellow w-full flex items-center justify-center py-2 h-full text-charcoal">
                    <Settings2 className="w-5 h-5" />
                </button>
            </Link>
            <button 
                onClick={() => { if (window.confirm(`Tem certeza que deseja excluir o agente ${agent.name}?`)) onDelete(agent.name); }} 
                className="sketch-button bg-sketch-pink flex-1 flex items-center justify-center py-2 text-charcoal"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      {/* Decorative Scribble */}
      <div className="absolute -bottom-2 -left-2 w-8 h-8 opacity-40 group-hover:opacity-80 transition-opacity">
        <Sparkles className="w-full h-full text-pastel-yellow rotate-12" />
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="sketch-card p-6 flex flex-col gap-4 relative animate-pulse h-[260px] opacity-50">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-charcoal/10" />
          <div className="space-y-2">
            <div className="w-24 h-5 bg-charcoal/10 rounded" />
            <div className="w-16 h-3 bg-charcoal/10 rounded" />
          </div>
        </div>
      </div>
      <div className="w-full h-12 bg-charcoal/5 mt-4 rounded" />
      <div className="h-14 w-full flex items-end gap-1.5 mt-auto opacity-30 px-2">
        {[20, 30, 40, 20, 60, 40, 20].map((h, i) => (
          <div key={i} className="w-full bg-charcoal/20 rounded-t-lg" style={{ height: `${h}%` }} />
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
    <div className="px-8 pb-32 pt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
        <div className="relative">
          <div className="absolute -top-12 -left-8 w-16 h-16 opacity-10 pointer-events-none rotate-[-15deg]">
             <Brain className="w-full h-full text-charcoal" />
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black text-charcoal uppercase tracking-tighter relative z-10">
            deepH <span className="text-charcoal underline decoration-sketch-blue-dark decoration-wavy underline-offset-4">Plus</span>
            <div className="h-4 w-full bg-sketch-yellow/40 absolute bottom-2 left-0 -z-10 rotate-[-1deg]"></div>
          </h1>
          <div className="inline-flex items-center gap-3 bg-charcoal text-paper px-4 py-1.5 rounded-full mt-6 shadow-sketch-sm rotate-[-1deg]">
            <Activity className="w-4 h-4 text-sketch-green" />
            <span className="font-bold tracking-tighter text-xs uppercase">Emerald Engine v4.0 — Neural Interface</span>
          </div>
        </div>
        
        <Link href="/agents/new">
          <button className="sketch-button bg-sketch-green flex items-center gap-3 px-8 py-4 text-lg font-black group">
            <PlusSquare className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            <span>Instanciar Agente</span>
          </button>
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 relative">
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
      <div className="flex items-center justify-between mb-12 px-2">
        <div className="relative">
            <h2 className="text-3xl font-black text-charcoal font-display uppercase tracking-widest flex items-center gap-4">
                Agentes Ativos
            </h2>
            <div className="h-2 w-full bg-sketch-pink/30 absolute -bottom-1 left-0 rounded-full"></div>
        </div>
        <button className="sketch-button bg-paper p-3 hover:bg-pastel-yellow/20 transition-all">
          <Filter className="w-6 h-6 text-charcoal" />
        </button>
      </div>

      {/* Agents Grid */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : agents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-24 text-center sketch-card bg-pastel-yellow/5 border-dashed border-4 p-12"
            >
              <div className="w-24 h-24 rounded-full bg-paper flex items-center justify-center mb-8 border-4 border-charcoal shadow-sketch-lg rotate-[-10deg]">
                <Bot className="w-12 h-12 text-charcoal" />
              </div>
              <h3 className="text-3xl font-black text-charcoal font-display tracking-tight mb-4 uppercase">Ops! O multiverso está vazio</h3>
              <p className="text-lg font-medium text-charcoal/80 mb-10 max-w-lg italic">
                Nenhum agente foi detectado nas redes locais. Que tal inicializar um novo núcleo agora mesmo?
              </p>
              <Link href="/agents/new">
                <button className="sketch-button bg-sketch-blue px-10 py-5 text-xl font-black flex items-center gap-4 shadow-sketch-xl">
                  <PlusSquare className="w-7 h-7" />
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
      
      {/* Background Doodles */}
      <div className="fixed bottom-10 right-10 opacity-10 pointer-events-none select-none z-0 rotate-12">
        <Sparkles className="w-64 h-64 text-charcoal" />
      </div>
    </div>
  );
}
