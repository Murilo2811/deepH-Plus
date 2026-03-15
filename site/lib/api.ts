export const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:7730' : '';

export interface IOPort {
    name: string;
    accepts?: string[];
    produces?: string[];
    required?: boolean;
    merge_policy?: string;
    max_tokens?: number;
    description?: string;
}

export interface AgentIO {
    inputs?: IOPort[];
    outputs?: IOPort[];
}

export interface SkillCall {
    skill: string;
    args?: Record<string, any>;
}

export interface Agent {
    name: string;
    description?: string;
    provider?: string;
    model?: string;
    system_prompt?: string;
    skills?: string[];
    depends_on?: string[];
    io?: AgentIO;
    startup_calls?: SkillCall[];
    timeout_ms?: number;
    metadata?: Record<string, string>;
    source?: "standard" | "user";
}

export async function fetchAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_BASE}/api/agents`);
    if (!res.ok) throw new Error("Failed to fetch agents");
    return res.json();
}

export async function createOrUpdateAgent(agent: Agent): Promise<Agent> {
    const isUpdate = !!agent.name; // In our API, POST and PUT expect similar JSON, but we can just use POST/PUT
    const method = isUpdate ? 'PUT' : 'POST';
    const url = isUpdate ? `${API_BASE}/api/agents/${agent.name}` : `${API_BASE}/api/agents`;

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
    });
    if (!res.ok) throw new Error("Failed to save agent");
    return res.json();
}

export async function deleteAgent(name: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/agents/${name}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete agent");
}

export interface Skill {
    name: string;
    description: string;
    filename: string;
    content: string;
    source?: "standard" | "user";
}

export async function fetchSkills(): Promise<Skill[]> {
    const res = await fetch(`${API_BASE}/api/skills`);
    if (!res.ok) return [];
    return res.json();
}

export async function createOrUpdateSkill(skill: Skill): Promise<Skill> {
    const isUpdate = !!skill.name && !skill.content.includes("name: \"\"");
    // Usually we update via PUT if skill already exists, but the user is creating a new yaml or editing
    // Actually the server allows POST to /api/skills and PUT to /api/skills/:name
    const method = skill.name ? 'PUT' : 'POST';
    const url = skill.name ? `${API_BASE}/api/skills/${encodeURIComponent(skill.name)}` : `${API_BASE}/api/skills`;

    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skill)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to save skill: ${text}`);
    }
    return res.json();
}

export async function deleteSkill(name: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/skills/${encodeURIComponent(name)}`, {
        method: 'DELETE'
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to delete skill: ${text}`);
    }
}

export async function fetchProviders(): Promise<string[]> {
    const res = await fetch(`${API_BASE}/api/providers`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchConfig(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error("Failed to fetch config");
    return res.json();
}

export async function saveConfig(config: any): Promise<any> {
    const res = await fetch(`${API_BASE}/api/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error("Failed to save config");
    return res.json();
}

// Keys are stored separately in keys.json via /api/config/keys
export async function fetchKeys(): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE}/api/config/keys`);
    if (!res.ok) return {};
    return res.json();
}

export async function saveKeys(keys: Record<string, string>): Promise<void> {
    const res = await fetch(`${API_BASE}/api/config/keys`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to save keys: ${text}`);
    }
}

// ─── Kits ─────────────────────────────────────────────────────────────────────
export interface Kit {
    name: string;
    description: string;
    provider_type: string;
    skills_count: number;
    files_count: number;
}

export async function fetchKits(): Promise<Kit[]> {
    const res = await fetch(`${API_BASE}/api/kits`);
    if (!res.ok) return [];
    return res.json();
}

export async function installKit(kitName: string, force = false): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/api/kits/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kit_name: kitName, force })
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to install kit: ${text}`);
    }
    return res.json();
}

// ─── Universes ────────────────────────────────────────────────────────────────
export interface Universe {
    name: string;
    spec: string;
    depends_on?: string[];
    input_port?: string;
    output_port?: string;
    output_kind?: string;
    merge_policy?: string;
    handoff_max_chars?: number;
    input_prefix?: string;
    input_suffix?: string;
}

// ─── Crews ────────────────────────────────────────────────────────────────────
export interface Crew {
    name: string;
    description?: string;
    spec: string;
    universes?: Universe[];
    source?: "standard" | "user";
}

export async function fetchCrews(): Promise<Crew[]> {
    const res = await fetch(`${API_BASE}/api/crews`);
    if (!res.ok) return [];
    return res.json();
}

export async function fetchCrewByName(name: string): Promise<Crew> {
    const res = await fetch(`${API_BASE}/api/crews/${encodeURIComponent(name)}`);
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to fetch crew: ${text}`);
    }
    return res.json();
}

export async function saveCrew(crew: Crew): Promise<Crew> {
    const res = await fetch(`${API_BASE}/api/crews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crew)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to save crew: ${text}`);
    }
    return res.json();
}

export async function updateCrew(originalName: string, crew: Crew): Promise<Crew> {
    const res = await fetch(`${API_BASE}/api/crews/${encodeURIComponent(originalName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(crew)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to update crew: ${text}`);
    }
    return res.json();
}

export async function deleteCrew(name: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/crews/${encodeURIComponent(name)}`, {
        method: 'DELETE',
    });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`Failed to delete crew: ${text}`);
    }
}

// ─── Run (multi-agent SSE) ─────────────────────────────────────────────────────
export type RunMode = 'sequential' | 'parallel' | 'crew';

export interface RunEventCrewStart { crew: string; universes: number; }
export interface RunEventAgentStart { agent: string; }
export interface RunEventAgentResult { agent: string; text: string; duration_ms?: number; }
export interface RunEventAgentError { agent: string; error: string; }
export interface RunEventDone { status: string; }

// DAG topology emitted before crew execution begins.
export interface RunEventDagPlan {
    nodes: Array<{ id: string; label: string; spec: string; depends_on: string[] }>;
    edges: Array<{ from: string; to: string; kind: string; channel: string }>;
}

// Emitted when data flows from one universe to another.
export interface RunEventUniverseHandoff {
    from: string;
    to: string;
    channel: string;
    kind: string;
    chars: number;
}

export function runTeam(
    agents: string[],
    mode: RunMode,
    task: string,
    callbacks: {
        onCrewStart?: (e: RunEventCrewStart) => void;
        onAgentStart?: (e: RunEventAgentStart) => void;
        onAgentResult: (e: RunEventAgentResult) => void;
        onAgentError?: (e: RunEventAgentError) => void;
        onDone?: (e: RunEventDone) => void;
        onDagPlan?: (e: RunEventDagPlan) => void;
        onUniverseHandoff?: (e: RunEventUniverseHandoff) => void;
    },
    crew?: string
): () => void {
    const controller = new AbortController();

    (async () => {
        const res = await fetch(`${API_BASE}/api/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agents, mode, task, crew }),
            signal: controller.signal
        });

        if (!res.body) return;
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const blocks = buffer.split('\n\n');
            buffer = blocks.pop() ?? '';
            for (const block of blocks) {
                let eventType = '';
                let dataLine = '';
                for (const line of block.split('\n')) {
                    if (line.startsWith('event: ')) eventType = line.slice(7).trim();
                    else if (line.startsWith('data: ')) dataLine = line.slice(6).trim();
                }
                if (!dataLine) continue;
                try {
                    const payload = JSON.parse(dataLine);
                    if (eventType === 'crew_start') callbacks.onCrewStart?.(payload);
                    else if (eventType === 'agent_start') callbacks.onAgentStart?.(payload);
                    else if (eventType === 'agent_result') callbacks.onAgentResult(payload);
                    else if (eventType === 'agent_error') callbacks.onAgentError?.(payload);
                    else if (eventType === 'error') callbacks.onAgentError?.({ agent: 'System', error: payload.error || "Unknown Error" });
                    else if (eventType === 'done') callbacks.onDone?.(payload);
                    else if (eventType === 'dag_plan') callbacks.onDagPlan?.(payload);
                    else if (eventType === 'universe_handoff') callbacks.onUniverseHandoff?.(payload);
                } catch { /* ignore parse errors */ }
            }
        }
    })().catch(() => { /* ignore abort */ });

    return () => controller.abort();
}

export interface StandardLibrary {
    agents: Agent[];
    crews: Crew[];
    skills: Skill[];
}

export async function fetchStandardLibrary(): Promise<StandardLibrary> {
    const res = await fetch(`${API_BASE}/api/standard-library`);
    if (!res.ok) throw new Error("Failed to fetch standard library");
    return res.json();
}
