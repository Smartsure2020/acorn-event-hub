import { useMemo, useState } from "react";
import { useTasks, useUpdateTaskStatus, TaskRow } from "@/hooks/useProjectData";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge, TaskStatusBadge, CPBadge } from "@/components/StatusBadges";
import { PHASES } from "@/lib/templates";
import { dayToWeek } from "@/lib/format";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ALL = "__all";

export function TasksTab({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateStatus = useUpdateTaskStatus();

  const [phase, setPhase] = useState<string>(ALL);
  const [owner, setOwner] = useState<string>(ALL);
  const [priority, setPriority] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);

  const owners = useMemo(() => {
    const set = new Set<string>();
    tasks?.forEach((t) => t.owner && set.add(t.owner));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = useMemo(() => {
    return (tasks ?? []).filter((t) =>
      (phase === ALL || t.phase === phase) &&
      (owner === ALL || t.owner === owner) &&
      (priority === ALL || t.priority === priority) &&
      (status === ALL || t.status === status)
    );
  }, [tasks, phase, owner, priority, status]);

  if (isLoading) {
    return (
      <div className="mt-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect label="Phase" value={phase} onValue={setPhase} options={PHASES} />
        <FilterSelect label="Owner" value={owner} onValue={setOwner} options={owners} />
        <FilterSelect label="Priority" value={priority} onValue={setPriority} options={["High", "Medium", "Low"]} />
        <FilterSelect label="Status" value={status} onValue={setStatus} options={["Not Started", "In Progress", "Complete", "Blocked"]} />
        <div className="flex-1" />
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info("Add task — coming soon")}>
          <Plus className="h-3.5 w-3.5" /> Add task
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-striped">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                      No tasks match the selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => <TaskRowItem key={t.id} task={t} onChangeStatus={(s) => updateStatus.mutate({ id: t.id, status: s })} />)
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterSelect({
  label, value, onValue, options,
}: { label: string; value: string; onValue: (v: string) => void; options: readonly string[] }) {
  return (
    <Select value={value} onValueChange={onValue}>
      <SelectTrigger className="h-9 w-[150px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{label}: All</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function TaskRowItem({
  task,
  onChangeStatus,
}: {
  task: TaskRow;
  onChangeStatus: (s: TaskRow["status"]) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-mono text-xs text-muted-foreground">{task.task_code}</TableCell>
      <TableCell className="font-medium">{task.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{task.phase}</TableCell>
      <TableCell className="text-sm">{task.owner ?? "—"}</TableCell>
      <TableCell className="text-sm tabular-nums">W{dayToWeek(task.start_day)}</TableCell>
      <TableCell className="text-sm tabular-nums">{task.duration_days}d</TableCell>
      <TableCell><PriorityBadge value={task.priority} /></TableCell>
      <TableCell>
        <Select value={task.status} onValueChange={(v) => onChangeStatus(v as TaskRow["status"])}>
          <SelectTrigger className="h-8 w-[140px] border-transparent bg-transparent px-2 hover:bg-muted/50">
            <TaskStatusBadge value={task.status} />
          </SelectTrigger>
          <SelectContent>
            {(["Not Started", "In Progress", "Complete", "Blocked"] as const).map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{task.critical_path && <CPBadge />}</TableCell>
    </TableRow>
  );
}
