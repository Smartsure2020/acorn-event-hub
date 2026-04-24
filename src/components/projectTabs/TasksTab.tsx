import { useMemo, useState } from "react";
import { useTasks, useUpdateTaskStatus, useAddTask, TaskRow } from "@/hooks/useProjectData";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { PriorityBadge, TaskStatusBadge, CPBadge } from "@/components/StatusBadges";
import { PHASES } from "@/lib/templates";
import { dayToWeek } from "@/lib/format";
import { Plus, ChevronRight, Download } from "lucide-react";
import { TaskDetailDrawer } from "@/components/TaskDetailDrawer";

function exportTasksCSV(tasks: TaskRow[], projectName = "project") {
  const headers = ["Code", "Task", "Phase", "Owner", "Start Day", "Duration (days)", "Priority", "Status", "Critical Path"];
  const lines = tasks.map((t) =>
    [
      t.task_code,
      `"${t.name.replace(/"/g, '""')}"`,
      t.phase,
      t.owner ?? "",
      t.start_day,
      t.duration_days,
      t.priority,
      t.status,
      t.critical_path ? "Yes" : "No",
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const ALL = "__all";

const OWNERS = ["PM", "Marketing", "Executor", "Client", "All"];

export function TasksTab({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  const updateStatus = useUpdateTaskStatus();

  const [phase, setPhase] = useState<string>(ALL);
  const [owner, setOwner] = useState<string>(ALL);
  const [priority, setPriority] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);

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
    <>
      <div className="mt-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Phase" value={phase} onValue={setPhase} options={PHASES} />
          <FilterSelect label="Owner" value={owner} onValue={setOwner} options={owners} />
          <FilterSelect label="Priority" value={priority} onValue={setPriority} options={["High", "Medium", "Low"]} />
          <FilterSelect label="Status" value={status} onValue={setStatus} options={["Not Started", "In Progress", "Complete", "Blocked"]} />
          <div className="flex-1" />
          {filtered.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => exportTasksCSV(filtered)}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddOpen(true)}>
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
                    <TableHead className="w-[40px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-8 text-center text-sm text-muted-foreground">
                        No tasks match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((t) => (
                      <TaskRowItem
                        key={t.id}
                        task={t}
                        onChangeStatus={(s) => updateStatus.mutate({ id: t.id, status: s })}
                        onOpen={() => setSelectedTask(t)}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskDetailDrawer
        task={selectedTask}
        open={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      <AddTaskDialog
        projectId={projectId}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existingOwners={owners}
      />
    </>
  );
}

function AddTaskDialog({
  projectId,
  open,
  onClose,
  existingOwners,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
  existingOwners: string[];
}) {
  const addTask = useAddTask();
  const [form, setForm] = useState({
    name: "",
    phase: "Initiation" as TaskRow["phase"],
    owner: "",
    start_day: "1",
    duration_days: "1",
    priority: "Medium" as TaskRow["priority"],
    critical_path: false,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addTask.mutateAsync({
      project_id: projectId,
      name: form.name.trim(),
      phase: form.phase,
      owner: form.owner.trim() || null,
      start_day: Math.max(1, Number(form.start_day) || 1),
      duration_days: Math.max(1, Number(form.duration_days) || 1),
      priority: form.priority,
      critical_path: form.critical_path,
    });
    setForm({ name: "", phase: "Initiation", owner: "", start_day: "1", duration_days: "1", priority: "Medium", critical_path: false });
    onClose();
  }

  const ownerOptions = Array.from(new Set([...OWNERS, ...existingOwners])).sort();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="task-name">Task name *</Label>
            <Input
              id="task-name"
              placeholder="e.g. Book venue"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phase</Label>
              <Select value={form.phase} onValueChange={(v) => update("phase", v as TaskRow["phase"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHASES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select value={form.owner} onValueChange={(v) => update("owner", v)}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {ownerOptions.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-day">Start day</Label>
              <Input
                id="start-day"
                type="number"
                min={1}
                value={form.start_day}
                onChange={(e) => update("start_day", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={form.duration_days}
                onChange={(e) => update("duration_days", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => update("priority", v as TaskRow["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["High", "Medium", "Low"] as const).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="critical-path"
              checked={form.critical_path}
              onCheckedChange={(v) => update("critical_path", !!v)}
            />
            <Label htmlFor="critical-path" className="cursor-pointer font-normal">Critical path task</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addTask.isPending}>
              {addTask.isPending ? "Adding…" : "Add task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  onOpen,
}: {
  task: TaskRow;
  onChangeStatus: (s: TaskRow["status"]) => void;
  onOpen: () => void;
}) {
  return (
    <TableRow className="group cursor-pointer hover:bg-muted/40" onClick={onOpen}>
      <TableCell className="font-mono text-xs text-muted-foreground">{task.task_code}</TableCell>
      <TableCell className="font-medium">{task.name}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{task.phase}</TableCell>
      <TableCell className="text-sm">{task.owner ?? "—"}</TableCell>
      <TableCell className="text-sm tabular-nums">W{dayToWeek(task.start_day)}</TableCell>
      <TableCell className="text-sm tabular-nums">{task.duration_days}d</TableCell>
      <TableCell><PriorityBadge value={task.priority} /></TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
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
      <TableCell>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </TableCell>
    </TableRow>
  );
}
