import { useMemo } from "react";
import { TaskRow } from "@/hooks/useProjectData";
import { PHASES, Phase } from "@/lib/templates";
import { Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_WEEKS = 12;
const MAX_WEEKS = 52;

export function GanttChart({ tasks }: { tasks: TaskRow[] }) {
  if (!tasks.length) {
    return <p className="text-sm text-muted-foreground">No tasks yet.</p>;
  }

  // Derive the timeline width from actual task extents
  const totalWeeks = useMemo(() => {
    const maxDay = tasks.reduce((acc, t) => {
      const end = t.start_day + (t.is_milestone ? 0 : t.duration_days);
      return Math.max(acc, end);
    }, 1);
    const weeksNeeded = Math.ceil(maxDay / 7) + 1; // +1 for breathing room
    return Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, weeksNeeded));
  }, [tasks]);

  const totalDays = totalWeeks * 7;

  const grouped = PHASES.map((phase) => ({
    phase,
    items: tasks.filter((t) => t.phase === phase),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <div style={{ minWidth: `${Math.max(900, 260 + totalWeeks * 60)}px` }}>
        {/* Header */}
        <div className="grid grid-cols-[260px_1fr] border-b border-border bg-muted/30">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Task
          </div>
          <div
            className="grid"
            style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: totalWeeks }).map((_, i) => (
              <div
                key={i}
                className="border-l border-border px-2 py-2 text-center text-xs font-medium text-muted-foreground"
              >
                W{i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Rows by phase */}
        {grouped.map((g) => (
          <div key={g.phase}>
            <PhaseHeader phase={g.phase} />
            {g.items.map((t) => (
              <GanttRow key={t.id} task={t} totalDays={totalDays} totalWeeks={totalWeeks} />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-sm bg-primary" /> Standard
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-6 rounded-sm bg-destructive" /> Critical Path
        </span>
        <span className="flex items-center gap-1.5">
          <Diamond className="h-3.5 w-3.5 fill-secondary text-secondary" /> Milestone
        </span>
        <span className="ml-auto tabular-nums">{totalWeeks}w timeline</span>
      </div>
    </div>
  );
}

function PhaseHeader({ phase }: { phase: Phase }) {
  return (
    <div className="grid grid-cols-[260px_1fr] border-b border-border bg-sidebar">
      <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sidebar-foreground">
        {phase}
      </div>
      <div />
    </div>
  );
}

function GanttRow({
  task,
  totalDays,
  totalWeeks,
}: {
  task: TaskRow;
  totalDays: number;
  totalWeeks: number;
}) {
  const start = task.start_day;
  const dur = Math.max(task.is_milestone ? 0 : task.duration_days, 0);

  const leftPct = ((start - 1) / totalDays) * 100;
  const widthPct = Math.max((dur / totalDays) * 100, dur === 0 ? 0 : 0.8);

  return (
    <div className="grid grid-cols-[260px_1fr] border-b border-border last:border-b-0 hover:bg-muted/20">
      <div className="flex items-center gap-2 truncate px-3 py-2 text-sm">
        <span className="w-10 shrink-0 text-xs text-muted-foreground">{task.task_code}</span>
        <span className="truncate text-foreground">{task.name.replace(/^MILESTONE: /, "")}</span>
      </div>
      <div
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalWeeks }).map((_, i) => (
          <div key={i} className="border-l border-border/40" />
        ))}
        {task.is_milestone ? (
          <Diamond
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 fill-secondary text-secondary"
            style={{ left: `${leftPct}%` }}
          />
        ) : (
          <div
            className={cn(
              "absolute top-1/2 h-4 -translate-y-1/2 rounded-sm",
              task.critical_path ? "bg-destructive" : "bg-primary"
            )}
            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
            title={`${task.name} • ${dur}d`}
          />
        )}
      </div>
    </div>
  );
}
