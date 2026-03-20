"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { RefreshCw, Trash2, Circle } from "lucide-react";
import "@xterm/xterm/css/xterm.css";

export interface TerminalViewRef {
    clear: () => void;
    reconnect: () => void;
}

interface TerminalViewProps {
    terminalId: string;
    onConnectedChange?: (connected: boolean) => void;
}

export const TerminalView = forwardRef<TerminalViewRef, TerminalViewProps>(
    ({ terminalId, onConnectedChange }, ref) => {
        const termRef = useRef<HTMLDivElement>(null);
        const wsRef = useRef<WebSocket | null>(null);
        const termInstanceRef = useRef<any>(null);

        useImperativeHandle(ref, () => ({
            clear: () => {
                if (termInstanceRef.current) {
                    termInstanceRef.current.clear();
                }
            },
            reconnect: () => {
                connect();
            }
        }));

        const connect = async () => {
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
                // Force a small delay to let the canvas render before fitting
                requestAnimationFrame(() => {
                    fitAddon.fit();
                    term.focus();
                });
            }

            termInstanceRef.current = term;

            // Connect WebSocket
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${protocol}//localhost:7730/api/terminal/ws?id=${terminalId}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            // Helper to send resize event to backend PTY
            const sendResize = () => {
                if (ws.readyState === WebSocket.OPEN) {
                    const dims = { type: "resize", cols: term.cols, rows: term.rows };
                    ws.send(JSON.stringify(dims));
                }
            };

            ws.onopen = () => {
                onConnectedChange?.(true);
                term.writeln("\x1b[1;36m⬢ deepH Terminal conectado\x1b[0m");
                term.writeln("\x1b[90mDigite comandos do sistema ou use 'deeph help' para começar.\x1b[0m");
                term.writeln("");
                // Send initial size so PTY matches the visible terminal
                sendResize();
            };

            ws.binaryType = "arraybuffer";

            ws.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    term.write(new Uint8Array(event.data));
                } else {
                    term.write(event.data);
                }
            };

            ws.onclose = () => {
                onConnectedChange?.(false);
                term.writeln("\r\n\x1b[1;31m⬢ Conexão encerrada\x1b[0m");
            };

            ws.onerror = () => {
                onConnectedChange?.(false);
                term.writeln("\r\n\x1b[1;31m✕ Erro de conexão — o servidor está rodando?\x1b[0m");
            };

            // Send keystrokes to WebSocket
            term.onData((data: string) => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(data);
                }
            });

            // Resize handler — fit terminal and notify backend PTY
            const handleResize = () => {
                fitAddon.fit();
                sendResize();
            };
            termInstanceRef.current._handleResize = handleResize;
        };

        useEffect(() => {
            connect();

            const resizeListener = () => {
                if (termInstanceRef.current?._handleResize) {
                    termInstanceRef.current._handleResize();
                }
            };
            window.addEventListener("resize", resizeListener);

            return () => {
                if (wsRef.current) wsRef.current.close();
                if (termInstanceRef.current) termInstanceRef.current.dispose();
                window.removeEventListener("resize", resizeListener);
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [terminalId]);

        return (
            <div className="flex flex-col h-full w-full">
                <div
                    ref={termRef}
                    className="flex-1 w-full"
                    style={{
                        background: "#1a1e24",
                        padding: "8px",
                    }}
                />
            </div>
        );
    }
);
TerminalView.displayName = "TerminalView";
