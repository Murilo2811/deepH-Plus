import { TerminalView } from "@/components/terminal-view";

export const metadata = {
    title: "Terminal — deepH Plus",
    description: "Terminal integrado para executar comandos deepH diretamente no browser",
};

export default function TerminalPage() {
    return (
        <div className="flex flex-col h-full w-full overflow-hidden">
            <TerminalView />
        </div>
    );
}
