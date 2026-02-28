"use client";

import { useEffect, useState } from "react";
import { Agent, fetchAgents } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings2, Plus, Bot, Command, Sparkles, ArrowRight, Cpu, PlusSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-card group overflow-hidden"
    >
      <div className="p-6">
        {/* Top row: icon + provider badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-lg bg-neutral-bg3 border border-border flex items-center justify-center transition-all duration-300 group-hover:border-brand/30 group-hover:bg-brand/5 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Bot className="w-6 h-6 text-brand" />
          </div>
          {agent.provider && (
            <span className="text-[10px] font-mono font-semibold text-text-secondary bg-neutral-bg2 border border-border px-2 py-1 flex items-center rounded-sm">
              <Cpu className="w-3 h-3 mr-1 inline" />
              {agent.provider.toUpperCase()}
            </span>
          )}
        </div>

        {/* Name + Description */}
        <h3 className="font-semibold text-text-primary text-xl leading-snug mb-2 tracking-tight">
          {agent.name}
        </h3>
        <p className="text-sm text-text-muted line-clamp-2 leading-relaxed min-h-[40px]">
          {agent.description || "Nenhuma descrição detalhada disponível para este agente."}
        </p>

        {/* Skills pills */}
        {agent.skills && agent.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {agent.skills.slice(0, 3).map(skill => (
              <span key={skill} className="flex items-center gap-1.5 text-xs text-text-secondary bg-neutral-bg2 px-2.5 py-1 rounded-sm border border-border font-mono">
                <Command className="w-3 h-3 text-text-muted" />
                {skill}
              </span>
            ))}
            {agent.skills.length > 3 && (
              <span className="text-xs text-text-muted px-2 py-1 font-mono">+{agent.skills.length - 3}</span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border my-5" />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href={`/chat?agent=${agent.name}`} className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 bg-brand hover:bg-brand-hover text-brand-foreground shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              Conversar
            </button>
          </Link>
          <Link href={`/agents/edit?name=${agent.name}`}>
            <button className="w-10 h-10 rounded-sm bg-neutral-bg3 border border-border text-text-secondary hover:text-text-primary hover:bg-neutral-bg4 transition-all cursor-pointer flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-lg bg-neutral-bg3" />
        <div className="w-20 h-6 rounded-sm bg-neutral-bg2" />
      </div>
      <div className="w-1/2 h-5 rounded-sm bg-neutral-bg3 mt-4" />
      <div className="space-y-2 mt-2">
        <div className="w-full h-4 rounded-sm bg-neutral-bg2" />
        <div className="w-3/4 h-4 rounded-sm bg-neutral-bg2" />
      </div>
      <div className="h-px bg-border my-5" />
      <div className="w-full h-10 rounded-sm bg-neutral-bg3" />
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
    <div className="space-y-10 animate-in pt-4 pb-20">
      {/* Header Minimalista */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-brand mb-3 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Sistema Ativo
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-primary m-0">
            Agentes Operacionais
          </h1>
          <p className="text-base text-text-secondary max-w-xl">
            Selecione uma IA especializada para iniciar uma conversa ou configure um novo assistente no painel de controle.
          </p>
        </div>

        <Link href="/agents/new">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-neutral-bg1 text-text-primary border border-border hover:border-brand/40 hover:bg-neutral-bg2 transition-all rounded-sm font-medium shadow-sm">
            <PlusSquare className="w-4 h-4 text-brand" />
            Instanciar Agente
          </button>
        </Link>
      </div>

      {/* Grid de Agentes com Framer Motion */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : agents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-lg bg-neutral-bg1/50"
            >
              <div className="w-16 h-16 rounded-xl bg-neutral-bg2 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary">Nenhum agente configurado</h3>
              <p className="text-sm text-text-secondary mt-1 mb-6">O diretório de agentes está vazio no momento.</p>
              <Link href="/agents/new">
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold transition-all duration-200 bg-brand hover:bg-brand-hover text-brand-foreground">
                  <Plus className="w-4 h-4" />
                  Criar Primeiro Agente
                </button>
              </Link>
            </motion.div>
          ) : (
            agents.map((agent, i) => (
              <AgentCard key={agent.name} agent={agent} index={i} />
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
