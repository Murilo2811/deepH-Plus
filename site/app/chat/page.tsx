"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, Bot, User, Share, Copy, RefreshCcw, Paperclip, Mic, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";

type Message = {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
};

export default function ChatPage() {
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
        <div className="flex flex-col h-full bg-[#0a0c0b]">
            {/* Context Header */}
            <div className="px-6 py-4 border-b border-primary/10 bg-background-dark flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                        <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-100 font-display tracking-tight">{agentName}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] text-primary uppercase tracking-widest font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            Neural Link Active
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 min-h-0 bg-transparent">
                {messages.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-surface-dark border border-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(15,240,146,0.05)]">
                            <Bot className="w-8 h-8 text-primary/50" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-slate-100 font-display">Inicie a Sessão</h3>
                            <p className="text-sm mt-1 max-w-sm">O agente <strong>{agentName}</strong> está aguardando suas diretrizes.</p>
                        </div>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((m: any, index: number) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-4 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border ${m.role === 'user'
                                ? 'bg-slate-800 border-slate-700'
                                : 'bg-primary/10 border-primary/20'
                                }`}>
                                {m.role === 'user' ? (
                                    <User className="w-5 h-5 text-slate-300" />
                                ) : (
                                    <Bot className="w-5 h-5 text-primary" />
                                )}
                            </div>

                            {/* Message Bubble container */}
                            <div className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : ''}`}>
                                <div className="flex items-center gap-2">
                                    {m.role === 'user' ? (
                                        <>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Você</span>
                                            <span className="text-sm font-bold">Admin</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-sm font-bold text-primary">{agentName}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Assistant</span>
                                        </>
                                    )}
                                </div>

                                <div className={`p-5 text-[15px] leading-relaxed max-w-[85vw] md:max-w-2xl overflow-hidden ${m.role === 'user'
                                    ? 'bg-primary text-background-dark rounded-xl rounded-tr-none shadow-[0_4px_20px_rgba(15,240,146,0.15)] font-medium'
                                    : 'glass dark:bg-primary/5 rounded-xl rounded-tl-none border border-primary/10 text-slate-200'
                                    }`}>
                                    <div className={`prose prose-sm overflow-hidden ${m.role === 'user' ? 'prose-invert prose-p:text-background-dark max-w-none' : 'dark:prose-invert max-w-none prose-pre:bg-background-dark/50 prose-pre:border prose-pre:border-primary/20 text-slate-200 prose-p:text-slate-200 prose-a:text-primary'} break-words whitespace-pre-wrap`}>
                                        <Markdown>
                                            {m.content}
                                        </Markdown>
                                    </div>
                                </div>

                                {m.role === 'assistant' && index === messages.length - 1 && (
                                    <div className="flex gap-4 mt-1">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(m.content)}
                                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copiar
                                        </button>
                                        <button
                                            onClick={() => reload()}
                                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors"
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
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center border border-primary/20">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-primary">{agentName}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Processando</span>
                            </div>
                            <div className="glass dark:bg-primary/5 p-5 rounded-xl rounded-tl-none border border-primary/10 flex items-center gap-2 h-14">
                                <div className="flex gap-1">
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-background-dark/95 backdrop-blur-xl shrink-0 z-20 sticky bottom-0">
                <div className="max-w-4xl mx-auto relative">
                    <form onSubmit={handleSubmit} className="flex items-end gap-3 p-4 bg-surface-dark border border-primary/10 rounded-xl focus-within:border-primary/50 transition-colors shadow-sm relative">
                        <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center shrink-0">
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
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 text-[15px] resize-none py-2 min-h-[44px] max-h-48 outline-none w-full"
                            placeholder={`Message ${agentName} Core...`}
                            rows={1}
                        />

                        <div className="flex items-center gap-2 shrink-0 h-10">
                            <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center">
                                <Mic className="w-5 h-5" />
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="bg-primary text-background-dark w-10 h-10 rounded flex items-center justify-center shadow-[0_0_15px_rgba(15,240,146,0.2)] hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                            >
                                <ArrowUp className="w-5 h-5 font-bold" />
                            </button>
                        </div>
                    </form>
                    <p className="text-[10px] text-center mt-3 text-slate-500 uppercase tracking-widest font-medium">
                        System Status: Optimal | Encrypted Local Session
                    </p>
                </div>
            </div>
        </div>
    );
}
