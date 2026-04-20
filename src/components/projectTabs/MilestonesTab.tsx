import { useMilestones, MilestoneRow } from "@/hooks/useProjectData";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MilestoneStatusBadge } from "@/components/StatusBadges";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MilestonesTab({ projectId }: { projectId: string }) {
  const { data: milestones, isLoading } = useMilestones(projectId);

  if (isLoading) return <Skeleton className="mt-4 h-64 w-full" />;

  return (
    <div className="mt-4">
      <Card>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {(milestones ?? []).map((m) => <MilestoneItem key={m.id} m={m} />)}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function MilestoneItem({ m }: { m: MilestoneRow }) {
  const dotColour =
    m.status === "Complete" ? "bg-success"
      : m.status === "At Risk" ? "bg-secondary"
        : "bg-muted-foreground/40";

  return (
    <li className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20">
      <div className={cn("h-3 w-3 shrink-0 rounded-full", dotColour)} />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{m.code}</span>
          <span className="font-medium text-foreground">{m.name}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {m.phase} • Target W{m.target_week ?? "—"} • Sign-off: {m.sign_off ?? "—"}
        </div>
      </div>
      <div className="text-right text-xs text-muted-foreground">
        <div>Target: {formatDate(m.target_date)}</div>
        <div>Actual: {formatDate(m.actual_date)}</div>
      </div>
      <MilestoneStatusBadge value={m.status} />
    </li>
  );
}
