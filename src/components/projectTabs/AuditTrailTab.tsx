import { useState, useEffect } from "react";
import { ClipboardList, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuditLog, type AuditEntry } from "@/hooks/useAuditLog";
import { format } from "date-fns";

const ACTION_LABELS: Record<string, string> = {
  task_comment_added: "Comment Added",
  task_document_uploaded: "Document Uploaded",
  task_document_removed: "Document Removed",
  task_signed_off: "Task Signed Off",
  project_created: "Project Created",
  task_status_changed: "Status Changed",
  marketing_updated: "Marketing Updated",
  user_signed_in: "User Signed In",
};

const ACTION_COLOURS: Record<string, string> = {
  task_comment_added: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  task_document_uploaded: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  task_document_removed: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  task_signed_off: "bg-green-500/10 text-green-400 border-green-500/20",
  project_created: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  task_status_changed: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  marketing_updated: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  user_signed_in: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function formatTime(iso: string) {
  try {
    return format(new Date(iso), "d MMM yyyy, HH:mm:ss");
  } catch {
    return iso;
  }
}

function ActionBadge({ action }: { action: string }) {
  const label = ACTION_LABELS[action] ?? action.replace(/_/g, " ");
  const cls = ACTION_COLOURS[action] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}>
      {label}
    </span>
  );
}

export function AuditTrailTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("__all");

  function refresh() {
    setEntries(getAuditLog());
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  const uniqueActions = Array.from(new Set(entries.map((e) => e.action)));

  const filtered = entries.filter((e) => {
    const matchAction = filterAction === "__all" || e.action === filterAction;
    const matchSearch =
      !search ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(e.payload).toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  return (
    <div className="mt-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search audit log…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 w-[220px]"
          />
        </div>

        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all">All actions</SelectItem>
            {uniqueActions.map((a) => (
              <SelectItem key={a} value={a}>{ACTION_LABELS[a] ?? a}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={refresh} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Log entries */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? "No audit events recorded yet. Activity will appear here as you use the system."
                : "No events match your filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-start gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3"
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <ActionBadge action={entry.action} />
                  <span className="text-sm font-medium">{entry.actor}</span>
                  <Badge variant="outline" className="text-[10px] py-0 h-4">{entry.actorRole}</Badge>
                </div>
                {Object.keys(entry.payload).length > 0 && (
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {Object.entries(entry.payload)
                      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                {formatTime(entry.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
