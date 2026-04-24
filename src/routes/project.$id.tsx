import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProject, useUpdateProject, ProjectRow } from "@/hooks/useProjectData";
import { ProjectStatusBadge } from "@/components/StatusBadges";
import { formatDate, formatZAR } from "@/lib/format";
import { OverviewTab } from "@/components/projectTabs/OverviewTab";
import { TasksTab } from "@/components/projectTabs/TasksTab";
import { GanttTab } from "@/components/projectTabs/GanttTab";
import { RisksTab } from "@/components/projectTabs/RisksTab";
import { MilestonesTab } from "@/components/projectTabs/MilestonesTab";
import { TeamTab } from "@/components/projectTabs/TeamTab";
import { MarketingTab } from "@/components/projectTabs/MarketingTab";
import { AIBudgetTab } from "@/components/projectTabs/AIBudgetTab";
import { AuditTrailTab } from "@/components/projectTabs/AuditTrailTab";

export const Route = createFileRoute("/project/$id")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Project not found.</p>
            <Button asChild variant="link" className="mt-2">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 mb-2 gap-1 text-muted-foreground"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{project.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span>{project.type}</span>
                <span>•</span>
                <span>Event: {formatDate(project.event_date)}</span>
                <span>•</span>
                <span>PM: {project.pm ?? "—"}</span>
                <span>•</span>
                <span>{formatZAR(project.budget_zar)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ProjectStatusBadge value={project.status} />
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditOpen(true)}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="gantt">Gantt</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="budget-ai">Budget AI</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><OverviewTab project={project} /></TabsContent>
          <TabsContent value="tasks"><TasksTab projectId={project.id} /></TabsContent>
          <TabsContent value="gantt"><GanttTab projectId={project.id} /></TabsContent>
          <TabsContent value="risks"><RisksTab projectId={project.id} /></TabsContent>
          <TabsContent value="milestones"><MilestonesTab projectId={project.id} /></TabsContent>
          <TabsContent value="team"><TeamTab projectId={project.id} /></TabsContent>
          <TabsContent value="marketing">
            <MarketingTab projectId={project.id} projectName={project.name} />
          </TabsContent>
          <TabsContent value="budget-ai">
            <AIBudgetTab project={project} />
          </TabsContent>
          <TabsContent value="audit">
            <AuditTrailTab />
          </TabsContent>
        </Tabs>
      </div>

      <EditProjectModal
        project={project}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </AppShell>
  );
}

function EditProjectModal({
  project,
  open,
  onClose,
}: {
  project: ProjectRow;
  open: boolean;
  onClose: () => void;
}) {
  const updateProject = useUpdateProject();
  const [form, setForm] = useState({
    name: project.name,
    client: project.client ?? "",
    type: project.type,
    event_date: project.event_date ?? "",
    pm: project.pm ?? "",
    budget_zar: project.budget_zar != null ? String(project.budget_zar) : "",
    location: project.location ?? "",
    notes: project.notes ?? "",
    status: project.status,
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    await updateProject.mutateAsync({
      id: project.id,
      name: form.name.trim(),
      client: form.client.trim() || null,
      type: form.type,
      event_date: form.event_date || null,
      pm: form.pm.trim() || null,
      budget_zar: form.budget_zar ? Number(form.budget_zar) : null,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
      status: form.status,
    });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Project name *</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-client">Client</Label>
              <Input
                id="edit-client"
                placeholder="Client name"
                value={form.client}
                onChange={(e) => update("client", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => update("type", v as ProjectRow["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["On-ground", "Sponsorship", "Both"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-date">Event date</Label>
              <Input
                id="edit-date"
                type="date"
                value={form.event_date}
                onChange={(e) => update("event_date", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v as ProjectRow["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Planning", "Active", "On Hold", "Complete", "Cancelled"] as const).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-pm">PM</Label>
              <Input
                id="edit-pm"
                placeholder="Project manager name"
                value={form.pm}
                onChange={(e) => update("pm", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-budget">Budget (ZAR)</Label>
              <Input
                id="edit-budget"
                type="number"
                min={0}
                placeholder="e.g. 150000"
                value={form.budget_zar}
                onChange={(e) => update("budget_zar", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-location">Location</Label>
            <Input
              id="edit-location"
              placeholder="City or venue"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              placeholder="Additional notes…"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="min-h-[70px] resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
