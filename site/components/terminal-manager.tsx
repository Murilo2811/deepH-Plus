"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X, RefreshCw, Trash2, Circle } from "lucide-react";
import { TerminalView, TerminalViewRef } from "./terminal-view";

type Tab = {
    id: string;
    label: string;
    connected: boolean;
};

const fetchTerminals = async () => {
    try {
        const res = await fetch("http://localhost:7730/api/terminals");
        if (!res.ok) throw new Error("Failed to fetch terminals");
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
};

const createTerminal = async (label?: string) => {
    try {
        const res = await fetch("http://localhost:7730/api/terminals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
        });
        if (!res.ok) throw new Error("Failed to create terminal");
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
};

const killTerminal = async (id: string) => {
    try {
        await fetch(`http://localhost:7730/api/terminals/${id}`, {
            method: "DELETE",
        });
    } catch (e) {
        console.error(e);
    }
};

export function TerminalManager() {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const terminalRefs = useRef<Record<string, TerminalViewRef | null>>({});

    const [editingTabId, setEditingTabId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const loadSessions = async () => {
        const sessions = await fetchTerminals();

        if (sessions && sessions.length > 0) {
            setTabs(
                sessions.map((s: any) => ({
                    id: s.id,
                    label: s.label || "terminal",
                    connected: false,
                }))
            );
            if (!activeId || !sessions.find((s: any) => s.id === activeId)) {
                setActiveId(sessions[0].id);
            }
        } else {
            handleCreateTab();
        }
    };

    useEffect(() => {
        loadSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCreateTab = async () => {
        if (tabs.length >= 8) return;
        const newSession = await createTerminal(`terminal-${tabs.length + 1}`);
        if (newSession) {
            setTabs((prev) => [
                ...prev,
                { id: newSession.id, label: newSession.label, connected: false },
            ]);
            setActiveId(newSession.id);
        }
    };

    const handleCloseTab = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await killTerminal(id);

        setTabs((prev) => {
            const nextTabs = prev.filter((t) => t.id !== id);
            if (activeId === id) {
                if (nextTabs.length > 0) {
                    setActiveId(nextTabs[nextTabs.length - 1].id);
                } else {
                    setActiveId(null);
                    setTimeout(handleCreateTab, 50);
                }
            }
            return nextTabs;
        });

        delete terminalRefs.current[id];
    };

    const setConnected = (id: string, connected: boolean) => {
        setTabs((prev) =>
            prev.map((t) => (t.id === id ? { ...t, connected } : t))
        );
    };

    const handleClear = () => {
        if (activeId && terminalRefs.current[activeId]) {
            terminalRefs.current[activeId]?.clear();
        }
    };

    const handleReconnect = () => {
        if (activeId && terminalRefs.current[activeId]) {
            terminalRefs.current[activeId]?.reconnect();
        }
    };

    const activeTab = tabs.find((t) => t.id === activeId);

    const startRename = (id: string, currentLabel: string) => {
        setEditingTabId(id);
        setEditValue(currentLabel);
    };

    const saveRename = async (id: string) => {
        setEditingTabId(null);
        if (!editValue.trim()) return;

        setTabs((prev) =>
            prev.map((t) => (t.id === id ? { ...t, label: editValue } : t))
        );
    };

    return (
        <div className="flex flex-col h-full w-full overflow-hidden bg-[#222B31]">
            {/* Tab Bar Container */}
            <div className="flex items-center w-full min-h-[40px] border-b border-[#2d363d] overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', background: "#1a1e24" }}>
                <div className="flex items-end h-full px-2 pt-1 gap-1 min-w-max">
                    {tabs.map((tab) => {
                        const isActive = tab.id === activeId;
                        return (
                            <div
                                key={tab.id}
                                onClick={() => setActiveId(tab.id)}
                                onDoubleClick={() => startRename(tab.id, tab.label)}
                                className={`group flex items-center gap-2 px-3 py-[6px] min-w-[120px] max-w-[200px] rounded-t-md cursor-pointer transition-colors relative border border-b-0 border-[#2d363d] ${
                                    isActive
                                        ? "bg-[#222B31] text-[#e0e4e8] shadow-sm z-10"
                                        : "bg-[#1f262b] text-[#8899a6] hover:bg-[#2d363d] z-0"
                                }`}
                                style={{
                                    marginBottom: isActive ? "-1px" : "0",
                                    paddingBottom: isActive ? "7px" : "6px",
                                }}
                            >
                                <Circle
                                    className="w-2 h-2 shrink-0"
                                    fill={tab.connected ? "#26C2B9" : "#e55a5a"}
                                    stroke="none"
                                />

                                {editingTabId === tab.id ? (
                                    <input
                                        autoFocus
                                        className="bg-transparent border-none outline-none text-xs font-mono w-full"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => saveRename(tab.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") saveRename(tab.id);
                                            if (e.key === "Escape") setEditingTabId(null);
                                        }}
                                    />
                                ) : (
                                    <span className="text-xs font-mono truncate select-none flex-1">
                                        {tab.label}
                                    </span>
                                )}

                                <button
                                    onClick={(e) => handleCloseTab(tab.id, e)}
                                    className={`ml-auto rounded-sm p-0.5 transition-all ${
                                        isActive
                                            ? "opacity-100 text-[#8899a6] hover:bg-[#2d363d] hover:text-white"
                                            : "opacity-0 text-[#8899a6] group-hover:opacity-100 hover:bg-[#43515c] hover:text-white"
                                    }`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>

                                {/* Active Indicator Line */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#26C2B9] rounded-t-sm" />
                                )}
                            </div>
                        );
                    })}

                    <button
                        onClick={handleCreateTab}
                        disabled={tabs.length >= 8}
                        className="flex items-center justify-center p-1.5 ml-1 mb-1.5 text-[#8899a6] hover:text-[#26C2B9] hover:bg-[#2d363d] rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#8899a6]"
                        title={
                            tabs.length >= 8
                                ? "Máximo de 8 terminais atingido"
                                : "Novo terminal"
                        }
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Terminal Windows Area */}
            <div className="flex-1 relative bg-[#1a1e24] w-full">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeId;
                    return (
                        <div
                            key={tab.id}
                            className={`absolute inset-0 transition-opacity duration-200 ${
                                isActive
                                    ? "opacity-100 z-10 pointer-events-auto"
                                    : "opacity-0 z-0 pointer-events-none"
                            }`}
                        >
                            {/* Make it render but hidden when inactive to keep WS alive */}
                            <TerminalView
                                ref={(el: TerminalViewRef | null) => {
                                    terminalRefs.current[tab.id] = el;
                                }}
                                terminalId={tab.id}
                                onConnectedChange={(connected) =>
                                    setConnected(tab.id, connected)
                                }
                            />
                        </div>
                    );
                })}
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#222B31] border-t-2 border-[#2d363d]">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors text-[#8899a6] hover:bg-[#2d363d] hover:text-[#e0e4e8]"
                        title="Limpar terminal"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Limpar
                    </button>

                    <button
                        onClick={handleReconnect}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors text-[#8899a6] hover:bg-[#2d363d] hover:text-[#26C2B9]"
                        title="Reconectar"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reconectar
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-end gap-1.5">
                        <Circle
                            className="w-2.5 h-2.5 flex-shrink-0"
                            fill={activeTab?.connected ? "#26C2B9" : "#e55a5a"}
                            stroke="none"
                        />
                        <span
                            className="text-xs font-mono"
                            style={{
                                color: activeTab?.connected ? "#26C2B9" : "#e55a5a",
                            }}
                        >
                            {activeTab?.connected ? "conectado" : "desconectado"}
                        </span>
                    </div>

                    <div className="w-[1px] h-3 bg-[#43515c]"></div>

                    <span className="text-xs font-mono text-[#8899a6]">
                        {tabs.length} sessão{tabs.length !== 1 ? "ões" : "ão"}{" "}
                        ativa{tabs.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>
        </div>
    );
}
