"use client";

import { useState, useEffect } from "react";
import { 
    fetchAgents, 
    fetchSkills, 
    fetchCrews, 
    type Agent, 
    type Skill, 
    type Crew 
} from "@/lib/api";
import { 
    Library, 
    Search, 
    Sparkles, 
    Shield, 
    Users, 
    Brain,
    Box
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { SourceBadge } from "@/components/source-badge";

export default function StandardLibraryPage() {
    const [loading, setLoading] = useState(true);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [crews, setCrews] = useState<Crew[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function load() {
            try {
                const [a, s, c] = await Promise.all([
                    fetchAgents(),
                    fetchSkills(),
                    fetchCrews()
                ]);
                // Filtrar apenas standard
                setAgents(a.filter(x => x.source === "standard"));
                setSkills(s.filter(x => x.source === "standard"));
                setCrews(c.filter(x => x.source === "standard"));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filter = (items: any[]) => items.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) || 
        (i.description?.toLowerCase().includes(search.toLowerCase()))
    );

    const fAgents = filter(agents);
    const fSkills = filter(skills);
    const fCrews = filter(crews);

    return (
        <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Library className="w-8 h-8 text-primary" />
                    Standard Library
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                    Recursos nativos do deepH. Estes componentes são validados pela equipe deepH e estão sempre disponíveis como base para suas automações.
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Buscar na biblioteca padrão..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sketch-input pl-10"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-muted animate-pulse border-2 border-border" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-12">
                    {/* Agents Section */}
                    {fAgents.length > 0 && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Kits (Agentes)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fAgents.map(agent => (
                                    <LibraryCard 
                                        key={agent.name} 
                                        name={agent.name} 
                                        description={agent.description} 
                                        icon={<Shield className="w-4 h-4 text-primary" />}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills Section */}
                    {fSkills.length > 0 && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Box className="w-4 h-4" /> Skills
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fSkills.map(skill => (
                                    <LibraryCard 
                                        key={skill.name} 
                                        name={skill.name} 
                                        description={skill.description} 
                                        icon={<Shield className="w-4 h-4 text-primary" />}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Crews Section */}
                    {fCrews.length > 0 && (
                        <section className="flex flex-col gap-4">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Users className="w-4 h-4" /> Times (Crews)
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {fCrews.map(crew => (
                                    <LibraryCard 
                                        key={crew.name} 
                                        name={crew.name} 
                                        description={crew.description} 
                                        icon={<Shield className="w-4 h-4 text-primary" />}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {fAgents.length === 0 && fSkills.length === 0 && fCrews.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                            <Search className="w-12 h-12 mb-4" />
                            <p className="text-lg">Nenhum recurso padrão encontrado.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function LibraryCard({ name, description, icon }: { name: string; description: string; icon: React.ReactNode }) {
    return (
        <div className="sketch-card group p-5 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-start justify-between gap-3">
                <div className="p-2.5 bg-primary/10 text-primary border-2 border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Brain className="w-5 h-5" />
                </div>
                <SourceBadge source="standard" />
            </div>
            <div className="mt-4">
                <h3 className="font-semibold flex items-center gap-2">
                    {name}
                    {icon}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                    {description || "Sem descrição disponível."}
                </p>
            </div>
        </div>
    );
}
