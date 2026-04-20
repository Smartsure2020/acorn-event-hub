import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateProject } from "@/hooks/useProjectData";
import { useNavigate } from "@tanstack/react-router";

export function NewProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const createProject = useCreateProject();
  const [form, setForm] = useState({
    name: "",
    client: "",
    type: "On-ground" as "On-ground" | "Sponsorship" | "Both",
    event_date: "",
    pm: "",
    budget_zar: "",
    location: "",
    notes: "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const project = await createProject.mutateAsync({
      name: form.name.trim(),
      client: form.client.trim() || null,
      type: form.type,
      event_date: form.event_date || null,
      pm: form.pm.trim() || null,
      budget_zar: form.budget_zar ? Number(form.budget_zar) : null,
      location: form.location.trim() || null,
      notes: form.notes.trim() || null,
    });
    onOpenChange(false);
    setForm({ name: "", client: "", type: "On-ground", event_date: "", pm: "", budget_zar: "", location: "", notes: "" });
    navigate({ to: "/project/$id", params: { id: project.id } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Activation Project</DialogTitle>
          <DialogDescription>
            We'll auto-load 44 default tasks across 7 phases, plus 12 milestones and 12 risks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Coca-Cola Summer Roadshow"
              required
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="client">Client / Brand</Label>
            <Input id="client" value={form.client} onChange={(e) => update("client", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={form.type} onValueChange={(v) => update("type", v as typeof form.type)}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="On-ground">On-ground</SelectItem>
                <SelectItem value="Sponsorship">Sponsorship</SelectItem>
                <SelectItem value="Both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="event_date">Event Date</Label>
            <Input id="event_date" type="date" value={form.event_date} onChange={(e) => update("event_date", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pm">Project Manager</Label>
            <Input id="pm" value={form.pm} onChange={(e) => update("pm", e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <Label htmlFor="budget">Budget (ZAR)</Label>
            <Input id="budget" type="number" min="0" step="1000" value={form.budget_zar} onChange={(e) => update("budget_zar", e.target.value)} placeholder="500000" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Cape Town, V&A Waterfront" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createProject.isPending || !form.name.trim()}>
              {createProject.isPending ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
