"use client";

import { useSearchParams } from "next/navigation";
import { useChat } from "@/lib/useChat";
import { Suspense, useEffect, useRef } from "react";
import { Bot, User, Send, SquareSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

function ChatInner() {
    const searchParams = useSearchParams();
    const agentQuery = searchParams.get("agent") || "guide";

    const { messages, input, setInput, sendMessage, isLoading, stop } = useChat(agentQuery);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)] max-w-5xl mx-auto"
        >
            <div className="mb-6 px-2">
                <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
                    <div className="w-10 h-10 rounded-sm bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="opacity-60 text-lg font-normal">Sessão com</span>{" "}
                        <span className="text-brand">{agentQuery}</span>
                    </div>
                </h1>
            </div>

            <div className="flex-1 glass-card overflow-hidden flex flex-col shadow-2xl shadow-black/50">
                <ScrollArea className="flex-1 p-2 md:p-6 relative bg-neutral-bg1/50">
                    <AnimatePresence>
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center h-full text-text-muted gap-4 mt-20"
                            >
                                <div className="w-16 h-16 rounded-full bg-neutral-bg2 flex items-center justify-center mb-2">
                                    <Bot className="w-8 h-8 opacity-40" />
                                </div>
                                <p className="text-sm">Envie uma mensagem para iniciar o link neural com {agentQuery}.</p>
                            </motion.div>
                        )}
                        <div className="space-y-8 pb-4">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    key={msg.id}
                                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-9 h-9 rounded-sm bg-neutral-bg3 border border-border flex items-center justify-center text-brand flex-shrink-0 mt-1 shadow-sm">
                                            <Bot className="w-4 h-4" />
                                        </div>
                                    )}
                                    <div className={`p-5 rounded-md max-w-3xl leading-relaxed text-[0.95rem] ${msg.role === 'user'
                                            ? 'bg-neutral-bg3 text-text-primary rounded-tr-none shadow-sm'
                                            : 'bg-neutral-bg2/50 border border-border text-text-secondary rounded-tl-none shadow-sm'
                                        }`}
                                    >
                                        {msg.isStreaming && !msg.content ? (
                                            <span className="flex items-center gap-2 text-brand">
                                                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                                Processando...
                                            </span>
                                        ) : (
                                            <div className="whitespace-pre-wrap font-sans">
                                                {msg.content}
                                            </div>
                                        )}
                                        {msg.agent && msg.agent !== agentQuery && (
                                            <div className="mt-4 text-[11px] text-text-muted font-mono flex items-center gap-1.5 border-t border-border/80 pt-3">
                                                <span className="uppercase tracking-wider">Sub-rotina executada por:</span>
                                                <span className="text-brand">{msg.agent}</span>
                                            </div>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-emerald-950 flex-shrink-0 mt-1 font-bold text-sm shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                            U
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            <div ref={endOfMessagesRef} />
                        </div>
                    </AnimatePresence>
                </ScrollArea>

                <div className="p-4 bg-neutral-bg2 border-t border-border">
                    <form onSubmit={sendMessage} className="flex gap-3 max-w-4xl mx-auto">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Mande uma instrução para ${agentQuery}...`}
                            disabled={isLoading}
                            className="glass-input h-14 text-base rounded-sm px-5"
                        />
                        {isLoading ? (
                            <button type="button" onClick={stop} className="flex items-center justify-center h-14 w-14 rounded-sm bg-status-error/10 text-status-error border border-status-error/20 hover:bg-status-error/20 transition-all cursor-pointer flex-shrink-0">
                                <SquareSquare className="w-5 h-5 fill-current" />
                            </button>
                        ) : (
                            <button type="submit" disabled={!input.trim()} className="flex items-center justify-center h-14 w-14 rounded-sm bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                                <Send className="w-5 h-5" />
                            </button>
                        )}
                    </form>
                </div>
            </div>
        </motion.div>
    );
}

export default function ChatView() {
    return (
        <Suspense fallback={
            <div className="animate-pulse flex flex-col items-center justify-center h-[60vh] text-text-muted gap-4">
                <div className="w-12 h-12 rounded-lg bg-neutral-bg3 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-text-muted" />
                </div>
                Inicializando interface neural...
            </div>
        }>
            <ChatInner />
        </Suspense>
    );
}
