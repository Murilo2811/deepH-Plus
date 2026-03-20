import { create } from 'zustand';

export interface TerminalSession {
    id: string;
    title: string;
    createdAt: string;
}

interface TerminalState {
    sessions: TerminalSession[];
    activeSessionId: string | null;
    isLoading: boolean;
    error: string | null;

    fetchSessions: () => Promise<void>;
    createSession: () => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    setActiveSession: (id: string) => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
    sessions: [],
    activeSessionId: null,
    isLoading: false,
    error: null,

    fetchSessions: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('/api/terminals');
            if (!res.ok) throw new Error('Failed to fetch terminals');
            const data = await res.json();
            set({ sessions: data, isLoading: false });
            
            // Set active if none selected and we have sessions
            const currentActive = get().activeSessionId;
            if (data.length > 0 && (!currentActive || !data.find((s: TerminalSession) => s.id === currentActive))) {
                set({ activeSessionId: data[0].id });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    createSession: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch('/api/terminals', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to create terminal');
            const newSession = await res.json();
            
            set(state => ({
                sessions: [...state.sessions, newSession],
                activeSessionId: newSession.id,
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    deleteSession: async (id: string) => {
        try {
            const res = await fetch(`/api/terminals/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete terminal');
            
            set(state => {
                const newSessions = state.sessions.filter(s => s.id !== id);
                let newActive = state.activeSessionId;
                if (state.activeSessionId === id) {
                    newActive = newSessions.length > 0 ? newSessions[newSessions.length - 1].id : null;
                }
                return {
                    sessions: newSessions,
                    activeSessionId: newActive
                };
            });
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    setActiveSession: (id: string) => {
        set({ activeSessionId: id });
    }
}));
