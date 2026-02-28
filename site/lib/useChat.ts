import { useState, useRef, useEffect, useCallback } from "react";
import { API_BASE } from "./api";

export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    agent?: string;
    isStreaming?: boolean;
}

export function useChat(agent: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const sessionIdRef = useRef<string | undefined>(undefined);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
        };

        const assistantPlaceholderId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
            id: assistantPlaceholderId,
            role: "assistant",
            content: "",
            isStreaming: true,
        };

        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setInput("");
        setIsLoading(true);

        abortControllerRef.current = new AbortController();

        try {
            const res = await fetch(`${API_BASE}/api/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent: agent,
                    message: userMessage.content,
                    session_id: sessionIdRef.current,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!res.ok) throw new Error("Request failed");
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const parts = buffer.split("\n\n");
                    buffer = parts.pop() || "";

                    for (const part of parts) {
                        const eventMatch = part.match(/event:\s*(.*?)\n/);
                        const dataMatch = part.match(/data:\s*(.*)/);

                        if (eventMatch && dataMatch) {
                            const eventInfo = eventMatch[1];
                            const dataPayload = JSON.parse(dataMatch[1]);

                            if (eventInfo === "status") {
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantPlaceholderId
                                            ? { ...msg, content: `_Status: ${dataPayload.message}..._` }
                                            : msg
                                    )
                                );
                            } else if (eventInfo === "message") {
                                if (dataPayload.session_id) sessionIdRef.current = dataPayload.session_id;
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantPlaceholderId
                                            ? { ...msg, content: dataPayload.text, agent: dataPayload.agent }
                                            : msg
                                    )
                                );
                            } else if (eventInfo === "error") {
                                setMessages((prev) =>
                                    prev.map((msg) =>
                                        msg.id === assistantPlaceholderId
                                            ? { ...msg, content: `Error: ${dataPayload.error}` }
                                            : msg
                                    )
                                );
                            }
                        }
                    }
                }
            }
        } catch (err: any) {
            if (err.name !== "AbortError") {
                console.error(err);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantPlaceholderId
                            ? { ...msg, content: "Request failed to complete." }
                            : msg
                    )
                );
            }
        } finally {
            setIsLoading(false);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantPlaceholderId
                        ? { ...msg, isStreaming: false }
                        : msg
                )
            );
        }
    }, [input, agent]);

    const stop = useCallback(() => {
        abortControllerRef.current?.abort();
    }, []);

    return { messages, input, setInput, sendMessage, isLoading, stop };
}
