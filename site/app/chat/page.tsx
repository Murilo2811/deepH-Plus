"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Bot, User, Share, Copy, RefreshCcw, Paperclip, Mic, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";

type Message = {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
};

function ChatInterface() {
    const searchParams = useSearchParams();
    const agentName = searchParams.get("agent") || "guide";

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput("");

        setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ agent: agentName, message: userMsg })
            });

            if (!res.ok) throw new Error("Erro na comunicação");
            if (!res.body) return;

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            const assistantId = "msg-" + Date.now();

            setMessages(prev => [...prev, { id: assistantId, role: "assistant", content: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        try {
                            const data = JSON.parse(line.slice(5));
                            if (data.text) {
                                setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.text } : m));
                            }
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const reload = () => { /* Regenerar última msg (opcional no stub) */ };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Context Header */}
            <div className="px-6 py-3 border-b-2 border-sketch-charcoal/10 bg-white/40 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sketch-teal-dark/10 rounded-lg flex items-center justify-center border-2 border-sketch-teal-dark/30 sketch-card shadow-sketch-sm">
                        <Bot className="w-5 h-5 text-sketch-teal-dark" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-sketch-charcoal font-display tracking-tight leading-tight">{agentName}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] text-sketch-teal-dark uppercase tracking-widest font-semibold">
                            <span className="w-2 h-2 rounded-full bg-sketch-teal-dark animate-pulse shadow-[0_0_5px_rgba(38,194,185,0.5)]"></span>
                            Link Ativo
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-sketch-charcoal/40 hover:text-sketch-teal-dark transition-colors">
                        <Share className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-sketch-charcoal/40 hover:text-sketch-teal-dark transition-colors">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 custom-scrollbar">
                {messages.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-sketch-charcoal/40 space-y-6"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-white sketch-card border-2 border-sketch-charcoal/10 flex items-center justify-center shadow-sketch-md">
                            <Bot className="w-10 h-10 text-sketch-teal-dark/50" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-sketch-charcoal font-display">Olá! Como posso ajudar hoje?</h3>
                            <p className="text-sm mt-2 max-w-sm text-sketch-charcoal/60 leading-relaxed font-medium">
                                Estou pronto para colaborar. Digite sua mensagem abaixo para começar.
                            </p>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((m: any, index: number) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 15, rotate: m.role === 'user' ? 0.5 : -0.5 }}
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={`flex gap-4 max-w-4xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border-2 shadow-sketch-sm ${m.role === 'user'
                                ? 'bg-sketch-yellow/20 border-sketch-yellow/40'
                                : 'bg-sketch-teal-dark/10 border-sketch-teal-dark/30'
                                }`}>
                                {m.role === 'user' ? (
                                    <User className="w-5 h-5 text-sketch-charcoal" />
                                ) : (
                                    <Bot className="w-5 h-5 text-sketch-teal-dark" />
                                )}
                            </div>

                            {/* Message Container */}
                            <div className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : ''}`}>
                                <div className="flex items-center gap-2 px-1">
                                    {m.role === 'user' ? (
                                        <>
                                            <span className="text-[10px] text-sketch-charcoal/40 uppercase tracking-wider font-bold">Você</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-bold text-sketch-teal-dark">{agentName}</span>
                                        </>
                                    )}
                                </div>

                                <div className={`p-5 text-[15px] leading-relaxed shadow-sketch-sm border-2 ${m.role === 'user'
                                    ? 'bg-sketch-yellow/10 border-sketch-yellow/50 rounded-2xl rounded-tr-none'
                                    : 'bg-white border-sketch-charcoal/10 rounded-2xl rounded-tl-none'
                                    }`}>
                                    <div className={`prose prose-sm overflow-hidden ${m.role === 'user' ? 'prose-p:text-sketch-charcoal' : 'prose-p:text-sketch-charcoal prose-pre:bg-sketch-teal-dark/5 prose-pre:border-2 prose-pre:border-sketch-teal-dark/10'} max-w-none break-words whitespace-pre-wrap font-medium`}>
                                        <Markdown>
                                            {m.content}
                                        </Markdown>
                                    </div>
                                </div>

                                {m.role === 'assistant' && index === messages.length - 1 && (
                                    <div className="flex gap-4 px-2 mt-1">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(m.content)}
                                            className="flex items-center gap-1.5 text-xs text-sketch-charcoal/40 hover:text-sketch-teal-dark transition-colors font-bold"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copiar
                                        </button>
                                        <button
                                            onClick={() => reload()}
                                            className="flex items-center gap-1.5 text-xs text-sketch-charcoal/40 hover:text-sketch-teal-dark transition-colors font-bold"
                                        >
                                            <RefreshCcw className="w-3.5 h-3.5" /> Regenerar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl">
                        <div className="w-10 h-10 rounded-xl bg-sketch-teal-dark/10 flex-shrink-0 flex items-center justify-center border-2 border-sketch-teal-dark/30 shadow-sketch-sm">
                            <Bot className="w-5 h-5 text-sketch-teal-dark" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="glass-sketch p-5 rounded-2xl rounded-tl-none border-2 border-sketch-teal-dark/20 flex items-center gap-2 h-14 bg-white/40">
                                <div className="flex gap-1.5">
                                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 bg-sketch-teal-dark rounded-full" />
                                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-sketch-teal-dark/60 rounded-full" />
                                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-sketch-teal-dark/30 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-sm shrink-0 z-20 sticky bottom-0">
                <div className="max-w-4xl mx-auto relative group">
                    <form onSubmit={handleSubmit} className="flex items-end gap-3 p-4 bg-white border-2 border-sketch-charcoal/30 rounded-2xl shadow-sketch-md group-focus-within:border-sketch-teal group-focus-within:rotate-[-0.2deg] transition-all duration-300 relative">
                        <button type="button" className="p-2.5 text-sketch-charcoal/40 hover:text-sketch-teal-dark transition-colors flex items-center justify-center shrink-0 hover:rotate-6">
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (input.trim()) handleSubmit(e as any);
                                }
                            }}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sketch-charcoal placeholder-sketch-charcoal/30 text-[15px] resize-none py-2 min-h-[44px] max-h-48 outline-none w-full font-medium"
                            placeholder={`Escreva para ${agentName}...`}
                            rows={1}
                        />

                        <div className="flex items-center gap-3 shrink-0 h-10">
                            <button type="button" className="p-2.5 text-sketch-charcoal/40 hover:text-sketch-teal-dark transition-colors flex items-center justify-center hover:rotate-[-6deg]">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-sketch-teal text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-sketch-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed shrink-0 border-2 border-sketch-teal hover:rotate-[2deg]"
                            >
                                <ArrowUp className="w-5 h-5 font-black stroke-[3px]" />
                            </button>
                        </div>
                    </form>
                    <p className="text-[9px] text-center mt-3 text-sketch-charcoal/30 uppercase tracking-[0.2em] font-black">
                        Status: Operando em Fluxo Criativo | Sessão Segura
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-white text-sketch-teal-dark font-display font-bold text-xl animate-pulse">
                Desenhando Interface...
            </div>
        }>
            <ChatInterface />
        </Suspense>
    );
}
