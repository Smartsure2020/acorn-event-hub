import { useState } from "react";
import { useRisks, useAddRisk, RiskRow } from "@/hooks/useProjectData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskRatingBadge } from "@/components/StatusBadges";
import { Plus, Download } from "lucide-react";

function exportRisksCSV(risks: RiskRow[]) {
  const headers = ["#", "Description", "Likelihood", "Impact", "Rating", "Mitigation", "Owner", "Status"];
  const lines = risks.map((r) =>
    [
      r.risk_number,
      `"${r.description.replace(/"/g, '""')}"`,
      r.likelihood,
      r.impact,
      r.rating,
      `"${(r.mitigation ?? "").replace(/"/g, '""')}"`,
      r.owner ?? "",
      r.status,
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `risk-register-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const RISK_LEVELS = ["Low", "Medium", "High"] as const;

export function RisksTab({ projectId }: { projectId: string }) {
  const { data: risks, isLoading } = useRisks(projectId);
  const [addOpen, setAddOpen] = useState(false);

  if (isLoading) return <Skeleton className="mt-4 h-64 w-full" />;

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-end gap-2">
        {(risks ?? []).length > 0 && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => exportRisksCSV(risks ?? [])}
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        )}
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddOpen(true)}>
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

      <AddRiskDialog projectId={projectId} open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddRiskDialog({
  projectId,
  open,
  onClose,
}: {
  projectId: string;
  open: boolean;
  onClose: () => void;
}) {
  const addRisk = useAddRisk();
  const [form, setForm] = useState({
    description: "",
    likelihood: "Medium" as RiskRow["likelihood"],
    impact: "Medium" as RiskRow["impact"],
    mitigation: "",
    owner: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) return;
    await addRisk.mutateAsync({
      project_id: projectId,
      description: form.description.trim(),
      likelihood: form.likelihood,
      impact: form.impact,
      mitigation: form.mitigation.trim() || null,
      owner: form.owner.trim() || null,
    });
    setForm({ description: "", likelihood: "Medium", impact: "Medium", mitigation: "", owner: "" });
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add risk</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="risk-desc">Description *</Label>
            <Input
              id="risk-desc"
              placeholder="e.g. Venue double-booking"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Likelihood</Label>
              <Select value={form.likelihood} onValueChange={(v) => update("likelihood", v as RiskRow["likelihood"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Impact</Label>
              <Select value={form.impact} onValueChange={(v) => update("impact", v as RiskRow["impact"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mitigation">Mitigation strategy</Label>
            <Textarea
              id="mitigation"
              placeholder="e.g. Confirm venue booking in writing 8 weeks before event"
              value={form.mitigation}
              onChange={(e) => update("mitigation", e.target.value)}
              className="min-h-[70px] resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="risk-owner">Owner</Label>
            <Input
              id="risk-owner"
              placeholder="e.g. PM"
              value={form.owner}
              onChange={(e) => update("owner", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={addRisk.isPending}>
              {addRisk.isPending ? "Adding…" : "Add risk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
