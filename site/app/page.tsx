"use client";

import { useEffect, useState } from "react";
import { Agent, fetchAgents } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings2, Plus, Bot, Command, Sparkles, ArrowRight, Cpu } from "lucide-react";
import Link from "next/link";

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const colors = [
    { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", glow: "group-hover:shadow-emerald-500/10" },
    { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", glow: "group-hover:shadow-blue-500/10" },
    { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", glow: "group-hover:shadow-violet-500/10" },
    { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", glow: "group-hover:shadow-amber-500/10" },
  ];
  const color = colors[index % colors.length];

  return (
    <div className={`relative group rounded-2xl border bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 cursor-pointer overflow-hidden ${color.border} hover:shadow-xl ${color.glow}`}>
      {/* Hover gradient overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${color.bg}`} />

      <div className="relative p-5">
        {/* Top row: icon + provider badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${color.bg} border ${color.border} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
            <Bot className={`w-5 h-5 ${color.text}`} />
          </div>
          {agent.provider && (
            <span className="text-[10px] font-mono font-medium text-zinc-500 bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded-lg">
              {agent.provider}
            </span>
          )}
        </div>

        {/* Name + Description */}
        <h3 className="font-semibold text-zinc-100 text-base leading-tight mb-1.5 tracking-tight">
          {agent.name}
        </h3>
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed min-h-[40px]">
          {agent.description || "Nenhuma descrição fornecida."}
        </p>

        {/* Skills pills */}
        {agent.skills && agent.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {agent.skills.slice(0, 3).map(skill => (
              <span key={skill} className="flex items-center gap-1 text-[11px] text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.07] font-mono">
                <Command className="w-2.5 h-2.5" />
                {skill}
              </span>
            ))}
            {agent.skills.length > 3 && (
              <span className="text-[11px] text-zinc-600 px-2 py-0.5">+{agent.skills.length - 3}</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/[0.05] my-4" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href={`/chat?agent=${agent.name}`} className="flex-1">
            <button className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${color.bg} ${color.text} border ${color.border} hover:opacity-80 cursor-pointer`}>
              <MessageSquare className="w-3.5 h-3.5" />
              Conversar
              <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-60" />
            </button>
          </Link>
          <Link href={`/agents/edit?name=${agent.name}`}>
            <button className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.07] text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-5 space-y-3 animate-shimmer">
      <div className="flex justify-between items-start">
        <div className="w-10 h-10 rounded-xl bg-white/[0.05]" />
        <div className="w-20 h-6 rounded-lg bg-white/[0.04]" />
      </div>
      <div className="w-28 h-4 rounded bg-white/[0.06]" />
      <div className="w-full h-3 rounded bg-white/[0.04]" />
      <div className="w-3/4 h-3 rounded bg-white/[0.04]" />
      <div className="h-px bg-white/[0.05] !mt-4" />
      <div className="w-full h-9 rounded-xl bg-white/[0.05]" />
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-2">
            <Cpu className="w-3.5 h-3.5" />
            deepH runtime • {agents.length} agente{agents.length !== 1 ? "s" : ""} carregado{agents.length !== 1 ? "s" : ""}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Seus Agentes
          </h1>
          <p className="text-sm text-zinc-500">
            Escolha um assistente para começar ou crie um personalizado.
          </p>
        </div>
        <Link href="/agents/new">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold gap-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all h-10">
            <Plus className="w-4 h-4" />
            Novo Agente
          </Button>
        </Link>
      </div>

      {/* Stats bar */}
      {!loading && agents.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">Sistema ativo</span>
          </div>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {agents.length} agentes configurados
          </div>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="text-sm text-zinc-500 font-mono">
            {agents[0]?.provider && `provider padrão: ${agents[0].provider}`}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
          : agents.length === 0
            ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800/60 border border-white/[0.07] flex items-center justify-center">
                  <Bot className="w-7 h-7 text-zinc-600" />
                </div>
                <div>
                  <p className="text-zinc-400 font-medium">Nenhum agente encontrado</p>
                  <p className="text-sm text-zinc-600 mt-1">Crie seu primeiro agente para começar.</p>
                </div>
                <Link href="/agents/new">
                  <Button className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold gap-2 rounded-xl mt-2">
                    <Plus className="w-4 h-4" />
                    Criar Agente
                  </Button>
                </Link>
              </div>
            )
            : agents.map((agent, i) => (
              <AgentCard key={agent.name} agent={agent} index={i} />
            ))
        }
      </div>
    </div>
  );
}
