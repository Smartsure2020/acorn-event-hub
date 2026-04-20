import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FolderOpen, Calendar, AlertCircle, Activity } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/useProjectData";
import { ProjectStatusBadge } from "@/components/StatusBadges";
import { NewProjectModal } from "@/components/NewProjectModal";
import { formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [open, setOpen] = useState(false);
  const { data: projects, isLoading } = useProjects();

  // Pull task aggregates for the visible projects
  const projectIds = useMemo(() => projects?.map((p) => p.id) ?? [], [projects]);
  const { data: taskAgg } = useQuery({
    queryKey: ["task-agg", projectIds],
    enabled: projectIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("project_id,status")
        .in("project_id", projectIds);
      if (error) throw error;
      const byProj = new Map<string, { total: number; complete: number }>();
      for (const r of data ?? []) {
        const cur = byProj.get(r.project_id) ?? { total: 0, complete: 0 };
        cur.total += 1;
        if (r.status === "Complete") cur.complete += 1;
        byProj.set(r.project_id, cur);
      }
      return byProj;
    },
  });

  const stats = useMemo(() => {
    const list = projects ?? [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = list.filter((p) => {
      if (!p.event_date) return false;
      const d = new Date(p.event_date);
      return d >= today;
    }).length;
    return {
      total: list.length,
      active: list.filter((p) => p.status === "Active").length,
      upcoming,
      overdue: list.filter((p) => {
        if (!p.event_date || p.status === "Complete" || p.status === "Cancelled") return false;
        return new Date(p.event_date) < today;
      }).length,
    };
  }, [projects]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground">All your activations at a glance.</p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <StatCard label="Total Projects" value={stats.total} icon={<FolderOpen className="h-5 w-5 text-primary" />} />
          <StatCard label="Active Projects" value={stats.active} icon={<Activity className="h-5 w-5 text-success" />} />
          <StatCard label="Upcoming Events" value={stats.upcoming} icon={<Calendar className="h-5 w-5 text-secondary" />} />
          <StatCard label="Overdue" value={stats.overdue} icon={<AlertCircle className="h-5 w-5 text-destructive" />} />
        </div>

        {/* Projects table */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Projects</h3>
            </div>
            {isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !projects?.length ? (
              <EmptyState onCreate={() => setOpen(true)} />
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-striped">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Event Date</TableHead>
                      <TableHead>PM</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[180px]">Progress</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((p) => {
                      const agg = taskAgg?.get(p.id);
                      const pct = agg && agg.total > 0 ? Math.round((agg.complete / agg.total) * 100) : 0;
                      return (
                        <TableRow key={p.id}>
                          <TableCell>
                            <Link
                              to="/project/$id"
                              params={{ id: p.id }}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              {p.name}
                            </Link>
                            {p.client && (
                              <div className="text-xs text-muted-foreground">{p.client}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{p.type}</TableCell>
                          <TableCell className="text-sm">{formatDate(p.event_date)}</TableCell>
                          <TableCell className="text-sm">{p.pm ?? "—"}</TableCell>
                          <TableCell><ProjectStatusBadge value={p.status} /></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-2" />
                              <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link to="/project/$id" params={{ id: p.id }}>Open</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <NewProjectModal open={open} onOpenChange={setOpen} />
    </AppShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-bold text-foreground tabular-nums">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <FolderOpen className="h-6 w-6 text-primary" />
      </div>
      <h4 className="text-base font-semibold text-foreground">No projects yet</h4>
      <p className="max-w-sm text-sm text-muted-foreground">
        Create your first activation. We'll auto-load 44 tasks across 7 phases plus milestones and a risk register.
      </p>
      <Button onClick={onCreate} className="mt-2 gap-2">
        <Plus className="h-4 w-4" /> Create your first activation
      </Button>
    </div>
  );
}
