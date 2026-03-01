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

export async function fetchSkills(): Promise<{ name: string; description: string }[]> {
    const res = await fetch(`${API_BASE}/api/skills`);
    if (!res.ok) return [];
    return res.json();
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
