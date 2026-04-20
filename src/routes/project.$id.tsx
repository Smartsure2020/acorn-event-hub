import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks/useProjectData";
import { ProjectStatusBadge } from "@/components/StatusBadges";
import { formatDate, formatZAR } from "@/lib/format";
import { OverviewTab } from "@/components/projectTabs/OverviewTab";
import { TasksTab } from "@/components/projectTabs/TasksTab";
import { GanttTab } from "@/components/projectTabs/GanttTab";
import { RisksTab } from "@/components/projectTabs/RisksTab";
import { MilestonesTab } from "@/components/projectTabs/MilestonesTab";
import { TeamTab } from "@/components/projectTabs/TeamTab";

export const Route = createFileRoute("/project/$id")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: project, isLoading } = useProject(id);

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
              <Button variant="outline" size="sm" className="gap-1.5">
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
          </TabsList>
          <TabsContent value="overview"><OverviewTab project={project} /></TabsContent>
          <TabsContent value="tasks"><TasksTab projectId={project.id} /></TabsContent>
          <TabsContent value="gantt"><GanttTab projectId={project.id} /></TabsContent>
          <TabsContent value="risks"><RisksTab projectId={project.id} /></TabsContent>
          <TabsContent value="milestones"><MilestonesTab projectId={project.id} /></TabsContent>
          <TabsContent value="team"><TeamTab projectId={project.id} /></TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
