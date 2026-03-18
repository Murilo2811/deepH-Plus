"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, Trash2, Circle } from "lucide-react";

export function TerminalView() {
    const termRef = useRef<HTMLDivElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const termInstanceRef = useRef<any>(null);
    const [connected, setConnected] = useState(false);

    const connect = useCallback(async () => {
        // Dynamic imports to avoid SSR issues with xterm
        const { Terminal } = await import("@xterm/xterm");
        const { FitAddon } = await import("@xterm/addon-fit");

        // Cleanup previous instance
        if (termInstanceRef.current) {
            termInstanceRef.current.dispose();
        }
        if (wsRef.current) {
            wsRef.current.close();
        }

        const term = new Terminal({
            cursorBlink: true,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontSize: 14,
            lineHeight: 1.35,
            theme: {
                background: "#1a1e24",
                foreground: "#e0e4e8",
                cursor: "#26C2B9",
                cursorAccent: "#1a1e24",
                selectionBackground: "rgba(38, 194, 185, 0.3)",
                black: "#1a1e24",
                red: "#e55a5a",
                green: "#26C2B9",
                yellow: "#F9E05E",
                blue: "#5b9bd5",
                magenta: "#c27adb",
                cyan: "#56d4c8",
                white: "#e0e4e8",
                brightBlack: "#5c6370",
                brightRed: "#ff6b6b",
                brightGreen: "#5af0e4",
                brightYellow: "#ffe066",
                brightBlue: "#7cc4fa",
                brightMagenta: "#d9a0ef",
                brightCyan: "#80ede4",
                brightWhite: "#ffffff",
            },
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        if (termRef.current) {
            termRef.current.innerHTML = "";
            term.open(termRef.current);
            fitAddon.fit();
        }

        termInstanceRef.current = term;

        // Connect WebSocket
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//localhost:7730/api/terminal/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            term.writeln("\x1b[1;36m⬢ deepH Terminal conectado\x1b[0m");
            term.writeln("\x1b[90mDigite comandos do sistema ou use 'deeph help' para começar.\x1b[0m");
            term.writeln("");
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            setConnected(false);
            term.writeln("\r\n\x1b[1;31m⬢ Conexão encerrada\x1b[0m");
        };

        ws.onerror = () => {
            setConnected(false);
            term.writeln("\r\n\x1b[1;31m✕ Erro de conexão — o servidor está rodando?\x1b[0m");
        };

        // Send keystrokes to WebSocket
        term.onData((data: string) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        // Resize handler
        const handleResize = () => fitAddon.fit();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        // Load xterm CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/@xterm/xterm@5/css/xterm.css";
        document.head.appendChild(link);

        connect();

        return () => {
            if (wsRef.current) wsRef.current.close();
            if (termInstanceRef.current) termInstanceRef.current.dispose();
            link.remove();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleClear = () => {
        if (termInstanceRef.current) {
            termInstanceRef.current.clear();
        }
    };

    const handleReconnect = () => {
        connect();
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div
                className="flex items-center justify-between px-4 py-2"
                style={{
                    background: "#222B31",
                    borderBottom: "2.5px solid #2d363d",
                }}
            >
                <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold" style={{ color: "#26C2B9" }}>
                        ⬢ deepH Terminal
                    </span>

                    <div className="flex items-center gap-1.5">
                        <Circle
                            className="w-2.5 h-2.5"
                            fill={connected ? "#26C2B9" : "#e55a5a"}
                            stroke="none"
                        />
                        <span className="text-xs font-mono" style={{ color: connected ? "#26C2B9" : "#e55a5a" }}>
                            {connected ? "conectado" : "desconectado"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors"
                        style={{ color: "#8899a6", background: "transparent" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#2d363d";
                            (e.currentTarget as HTMLElement).style.color = "#e0e4e8";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#8899a6";
                        }}
                        title="Limpar terminal"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar
                    </button>

                    <button
                        onClick={handleReconnect}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors"
                        style={{ color: "#8899a6", background: "transparent" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#2d363d";
                            (e.currentTarget as HTMLElement).style.color = "#26C2B9";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#8899a6";
                        }}
                        title="Reconectar"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reconectar
                    </button>
                </div>
            </div>

            {/* Terminal container */}
            <div
                ref={termRef}
                className="flex-1"
                style={{
                    background: "#1a1e24",
                    padding: "8px",
                    minHeight: 0,
                }}
            />
        </div>
    );
}
