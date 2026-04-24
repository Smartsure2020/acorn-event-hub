import { useState } from "react";
import { useTeam, useTasks, useAddTeamMember, TeamMemberRow } from "@/hooks/useProjectData";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus } from "lucide-react";
import { useMemo } from "react";

const TEAM_ROLES = ["PM", "Marketing", "Executor", "Client", "Other"] as const;

export function TeamTab({ projectId }: { projectId: string }) {
  const { data: team, isLoading } = useTeam(projectId);
  const { data: tasks } = useTasks(projectId);
  const [addOpen, setAddOpen] = useState(false);

  const taskCountByOwner = useMemo(() => {
    const map = new Map<string, number>();
    tasks?.forEach((t) => {
      if (!t.owner) return;
      map.set(t.owner, (map.get(t.owner) ?? 0) + 1);
    });
    return map;
  }, [tasks]);

  if (isLoading) return <Skeleton className="mt-4 h-48 w-full" />;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Add member
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {!team?.length ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">No team members yet</p>
              <p className="text-xs text-muted-foreground">Add PMs, marketers and executors to this project.</p>
            </div>
          ) : (
            <Table className="table-striped">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Tasks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.role}</TableCell>
                    <TableCell className="text-sm">{m.contact ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{taskCountByOwner.get(m.name) ?? 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddMemberDialog projectId={projectId} open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddMemberDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const addMember = useAddTeamMember();
  const [form, setForm] = useState({
    name: "",
    role: "PM" as TeamMemberRow["role"],
    contact: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addMember.mutateAsync({
      project_id: projectId,
      name: form.name.trim(),
      role: form.role,
      contact: form.contact.trim() || null,
    });
    setForm({ name: "", role: "PM", contact: "" });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="member-name">Name *</Label>
            <Input
              id="member-name"
              placeholder="e.g. Sarah Dlamini"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => update("role", v as TeamMemberRow["role"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEAM_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="member-contact">Contact (email or phone)</Label>
            <Input
              id="member-contact"
              placeholder="e.g. sarah@agency.co.za"
              value={form.contact}
              onChange={(e) => update("contact", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? "Adding…" : "Add member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
