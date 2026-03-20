import { TerminalManager } from "@/components/terminal-manager";

export const metadata = {
    title: "Terminal — deepH Plus",
    description: "Terminal integrado para executar comandos deepH diretamente no browser",
};

export default function TerminalPage() {
    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <TerminalManager />
        </div>
    );
}
