import { ProjectRow } from "@/hooks/useProjectData";
import { Card, CardContent } from "@/components/ui/card";
import { PhaseTracker } from "@/components/PhaseTracker";
import { formatDate, formatZAR } from "@/lib/format";
import { Activity } from "lucide-react";

export function OverviewTab({ project }: { project: ProjectRow }) {
  return (
    <div className="mt-4 space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Client" value={project.client ?? "—"} />
        <InfoCard label="Budget" value={formatZAR(project.budget_zar)} />
        <InfoCard label="Location" value={project.location ?? "—"} />
        <InfoCard label="Event Type" value={project.type} />
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Phase Progress
          </h3>
          <PhaseTracker current={project.phase} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Activity className="h-4 w-4" /> Recent Activity
          </h3>
          <ul className="space-y-3 text-sm">
            <ActivityItem
              text="Project created and template loaded"
              time={formatDate(project.created_at)}
            />
            <ActivityItem
              text={`Status set to ${project.status}`}
              time={formatDate(project.updated_at)}
            />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="mt-1 truncate text-base font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      <div className="flex-1">
        <div className="text-foreground">{text}</div>
        <div className="text-xs text-muted-foreground">{time}</div>
      </div>
    </li>
  );
}
