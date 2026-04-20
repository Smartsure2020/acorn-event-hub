import { useTeam, useTasks } from "@/hooks/useProjectData";
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
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

export function TeamTab({ projectId }: { projectId: string }) {
  const { data: team, isLoading } = useTeam(projectId);
  const { data: tasks } = useTasks(projectId);

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
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info("Add team member — coming soon")}>
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
    </div>
  );
}
