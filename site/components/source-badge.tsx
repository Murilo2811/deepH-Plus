import { Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SourceBadge({ source }: { source?: string }) {
  if (source === "standard") {
    return (
      <Badge variant="secondary" className="bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/20 shadow-none px-1.5 py-0 gap-1 rounded-sm text-[10px] font-medium transition-colors">
        <Shield className="w-3 h-3" />
        Standard
      </Badge>
    );
  }

  // Default to user, or if source is missing (legacy) it's considered user.
  return (
    <Badge variant="outline" className="text-amber-600 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 px-1.5 py-0 gap-1 rounded-sm text-[10px] font-medium transition-colors">
      <User className="w-3 h-3" />
      User
    </Badge>
  );
}
