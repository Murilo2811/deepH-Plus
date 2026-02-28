export const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:7730' : '';

export interface Agent {
    name: string;
    description?: string;
    provider?: string;
    model?: string;
    system_prompt?: string;
    skills?: string[];
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
