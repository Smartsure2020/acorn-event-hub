import { useRisks } from "@/hooks/useProjectData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskRatingBadge } from "@/components/StatusBadges";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function RisksTab({ projectId }: { projectId: string }) {
  const { data: risks, isLoading } = useRisks(projectId);

  if (isLoading) return <Skeleton className="mt-4 h-64 w-full" />;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.info("Add risk — coming soon")}>
          <Plus className="h-3.5 w-3.5" /> Add risk
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="table-striped">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Likelihood</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Mitigation</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(risks ?? []).map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.risk_number}</TableCell>
                    <TableCell className="font-medium">{r.description}</TableCell>
                    <TableCell className="text-sm">{r.likelihood}</TableCell>
                    <TableCell className="text-sm">{r.impact}</TableCell>
                    <TableCell><RiskRatingBadge value={r.rating} /></TableCell>
                    <TableCell className="max-w-[300px] text-sm text-muted-foreground">{r.mitigation ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.owner ?? "—"}</TableCell>
                    <TableCell className="text-sm">{r.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
