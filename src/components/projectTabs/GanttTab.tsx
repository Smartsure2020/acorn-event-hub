import { useTasks } from "@/hooks/useProjectData";
import { GanttChart } from "@/components/GanttChart";
import { Skeleton } from "@/components/ui/skeleton";

export function GanttTab({ projectId }: { projectId: string }) {
  const { data: tasks, isLoading } = useTasks(projectId);
  if (isLoading) return <Skeleton className="mt-4 h-96 w-full" />;
  return (
    <div className="mt-4">
      <GanttChart tasks={tasks ?? []} />
    </div>
  );
}
