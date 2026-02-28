"use client";

import { useSearchParams } from "next/navigation";
import { useChat } from "@/lib/useChat";
import { Suspense, useEffect, useRef } from "react";
import { Bot, User, Send, SquareSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

function ChatInner() {
    const searchParams = useSearchParams();
    const agentQuery = searchParams.get("agent") || "guide"; // fallback routeador padrão

    const { messages, input, setInput, sendMessage, isLoading, stop } = useChat(agentQuery);
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
            <div className="mb-4">
                <h1 className="text-2xl font-semibold text-zinc-50 flex items-center gap-2">
                    <Bot className="w-6 h-6 text-emerald-400" /> Conversando com <span className="text-emerald-400">{agentQuery}</span>
                </h1>
            </div>

            <div className="flex-1 bg-zinc-950/20 rounded-xl border border-border/40 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4 px-6 relative">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-3 mt-20">
                            <Bot className="w-12 h-12 opacity-50" />
                            <p>Envie uma mensagem para começar a interagir com {agentQuery}.</p>
                        </div>
                    )}
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                )}
                                <div className={`p-4 rounded-xl max-w-prose ${msg.role === 'user'
                                        ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm'
                                        : 'bg-zinc-900/50 border border-zinc-800/80 text-zinc-300 rounded-tl-sm'
                                    }`}>
                                    {msg.isStreaming && !msg.content ? (
                                        <span className="animate-pulse">Pensando...</span>
                                    ) : (
                                        <div className="whitespace-pre-wrap font-sans text-[0.95rem] leading-relaxed">
                                            {msg.content}
                                        </div>
                                    )}
                                    {msg.agent && msg.agent !== agentQuery && (
                                        <div className="mt-2 text-xs text-zinc-500 font-mono flex items-center gap-1 border-t border-zinc-800 pt-2">
                                            Respondido por sub-agente: <span className="text-emerald-500/80">{msg.agent}</span>
                                        </div>
                                    )}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-1">
                                        <User className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={endOfMessagesRef} />
                    </div>
                </ScrollArea>

                <div className="p-4 bg-zinc-900/40 border-t border-border/40">
                    <form onSubmit={sendMessage} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Mande uma mensagem para ${agentQuery}...`}
                            disabled={isLoading}
                            className="bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500/20 h-12 text-base rounded-xl"
                        />
                        {isLoading ? (
                            <Button type="button" onClick={stop} variant="destructive" size="icon" className="h-12 w-12 rounded-xl">
                                <SquareSquare className="w-5 h-5 fill-current" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={!input.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 h-12 w-12 rounded-xl">
                                <Send className="w-5 h-5" />
                            </Button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function ChatView() {
    return (
        <Suspense fallback={<div className="animate-pulse flex items-center justify-center h-full">Carregando Chat...</div>}>
            <ChatInner />
        </Suspense>
    );
}
