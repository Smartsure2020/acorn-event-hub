import { useState } from "react";
import { Ticket, ImageIcon, ExternalLink, PlusCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";

type TicketStatus = "not_listed" | "listed" | "sold_out" | "event_passed";
type FlyerStatus = "not_started" | "in_design" | "approved" | "distributed";

interface HowlerListing {
  eventUrl: string;
  ticketPrice: number;
  capacity: number;
  sold: number;
  status: TicketStatus;
  notes: string;
}

interface FlyerRecord {
  id: string;
  version: string;
  status: FlyerStatus;
  channels: string[];
  notes: string;
  updatedAt: string;
}

const TICKET_STATUS_OPTS: { value: TicketStatus; label: string }[] = [
  { value: "not_listed", label: "Not listed" },
  { value: "listed", label: "Listed on Howler" },
  { value: "sold_out", label: "Sold out" },
  { value: "event_passed", label: "Event passed" },
];

const FLYER_STATUS_OPTS: { value: FlyerStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_design", label: "In design" },
  { value: "approved", label: "Approved" },
  { value: "distributed", label: "Distributed" },
];

const FLYER_CHANNELS = ["WhatsApp", "Instagram", "Facebook", "Email", "Twitter/X", "Print", "TikTok"];

function statusIcon(status: TicketStatus | FlyerStatus) {
  if (status === "sold_out" || status === "approved" || status === "distributed") {
    return <CheckCircle2 className="h-4 w-4 text-green-400" />;
  }
  if (status === "listed" || status === "in_design") {
    return <Clock className="h-4 w-4 text-amber-400" />;
  }
  return <AlertCircle className="h-4 w-4 text-muted-foreground/40" />;
}

interface MarketingTabProps {
  projectId: string;
  projectName: string;
}

export function MarketingTab({ projectId, projectName }: MarketingTabProps) {
  const { logAction } = useAuditLog();

  const [howler, setHowler] = useState<HowlerListing>({
    eventUrl: "",
    ticketPrice: 0,
    capacity: 0,
    sold: 0,
    status: "not_listed",
    notes: "",
  });

  const [flyers, setFlyers] = useState<FlyerRecord[]>([]);
  const [showFlyerForm, setShowFlyerForm] = useState(false);
  const [newFlyer, setNewFlyer] = useState<Omit<FlyerRecord, "id" | "updatedAt">>({
    version: "v1",
    status: "not_started",
    channels: [],
    notes: "",
  });

  function updateHowler(patch: Partial<HowlerListing>) {
    setHowler((prev) => ({ ...prev, ...patch }));
  }

  function saveHowler() {
    logAction("marketing_updated", { projectId, type: "howler", status: howler.status });
    toast.success("Howler listing saved");
  }

  function toggleChannel(ch: string) {
    setNewFlyer((prev) => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter((c) => c !== ch)
        : [...prev.channels, ch],
    }));
  }

  function addFlyer() {
    const record: FlyerRecord = {
      ...newFlyer,
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    setFlyers((prev) => [...prev, record]);
    logAction("marketing_updated", { projectId, type: "flyer", version: newFlyer.version });
    setNewFlyer({ version: `v${flyers.length + 2}`, status: "not_started", channels: [], notes: "" });
    setShowFlyerForm(false);
    toast.success("Flyer record added");
  }

  function updateFlyerStatus(id: string, status: FlyerStatus) {
    setFlyers((prev) => prev.map((f) => f.id === id ? { ...f, status, updatedAt: new Date().toISOString() } : f));
    logAction("marketing_updated", { projectId, type: "flyer_status", status });
    toast.success("Flyer status updated");
  }

  const soldPct = howler.capacity > 0 ? Math.min(100, Math.round((howler.sold / howler.capacity) * 100)) : 0;

  return (
    <div className="mt-4 space-y-6">
      {/* ---- Ticket Sales — Howler ---- */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Ticket className="h-4 w-4 text-primary" />
            Ticket Sales — Howler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status & URL row */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <Label>Howler event URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://howler.co.za/events/…"
                  value={howler.eventUrl}
                  onChange={(e) => updateHowler({ eventUrl: e.target.value })}
                />
                {howler.eventUrl && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={howler.eventUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={howler.status} onValueChange={(v) => updateHowler({ status: v as TicketStatus })}>
                <SelectTrigger className="w-[170px]">
                  <div className="flex items-center gap-2">
                    {statusIcon(howler.status)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {TICKET_STATUS_OPTS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financials */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1.5">
              <Label>Ticket price (ZAR)</Label>
              <Input
                type="number"
                min={0}
                value={howler.ticketPrice || ""}
                onChange={(e) => updateHowler({ ticketPrice: Number(e.target.value) })}
                className="w-[140px]"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input
                type="number"
                min={0}
                value={howler.capacity || ""}
                onChange={(e) => updateHowler({ capacity: Number(e.target.value) })}
                className="w-[120px]"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tickets sold</Label>
              <Input
                type="number"
                min={0}
                value={howler.sold || ""}
                onChange={(e) => updateHowler({ sold: Number(e.target.value) })}
                className="w-[120px]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Revenue summary */}
          {howler.capacity > 0 && (
            <div className="rounded-lg bg-muted/40 p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sales progress</span>
                <span className="font-medium">{howler.sold} / {howler.capacity} ({soldPct}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${soldPct}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue to date</span>
                <span className="font-semibold text-primary">
                  R {(howler.sold * howler.ticketPrice).toLocaleString("en-ZA")}
                </span>
              </div>
              {howler.capacity > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projected (full house)</span>
                  <span className="font-medium">
                    R {(howler.capacity * howler.ticketPrice).toLocaleString("en-ZA")}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              placeholder="Promo codes, early-bird details, restrictions…"
              value={howler.notes}
              onChange={(e) => updateHowler({ notes: e.target.value })}
              className="min-h-[60px] resize-none"
            />
          </div>

          <Button size="sm" onClick={saveHowler}>Save Howler details</Button>
        </CardContent>
      </Card>

      {/* ---- Flyer Distribution ---- */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4 text-primary" />
              Flyers &amp; Promotion
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowFlyerForm(true)} className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" /> Add flyer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add flyer form */}
          {showFlyerForm && (
            <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
              <p className="text-sm font-medium">New flyer record</p>
              <div className="flex flex-wrap gap-3">
                <div className="space-y-1.5">
                  <Label>Version / Name</Label>
                  <Input
                    value={newFlyer.version}
                    onChange={(e) => setNewFlyer((p) => ({ ...p, version: e.target.value }))}
                    className="w-[120px]"
                    placeholder="v1"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={newFlyer.status} onValueChange={(v) => setNewFlyer((p) => ({ ...p, status: v as FlyerStatus }))}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLYER_STATUS_OPTS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Distribution channels</Label>
                <div className="flex flex-wrap gap-2">
                  {FLYER_CHANNELS.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        newFlyer.channels.includes(ch)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Input
                  placeholder="Any notes about this flyer…"
                  value={newFlyer.notes}
                  onChange={(e) => setNewFlyer((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={addFlyer}>Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowFlyerForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {flyers.length === 0 && !showFlyerForm ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
              <ImageIcon className="h-8 w-8 opacity-30" />
              <p className="text-sm">No flyer records yet. Add the first one to track distribution.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {flyers.map((f) => (
                <div key={f.id} className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {statusIcon(f.status)}
                      <span className="font-medium text-sm">Flyer {f.version}</span>
                    </div>
                    <Select value={f.status} onValueChange={(v) => updateFlyerStatus(f.id, v as FlyerStatus)}>
                      <SelectTrigger className="h-7 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FLYER_STATUS_OPTS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {f.channels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {f.channels.map((ch) => (
                        <Badge key={ch} variant="secondary" className="text-[11px] py-0 h-5">{ch}</Badge>
                      ))}
                    </div>
                  )}

                  {f.notes && (
                    <p className="text-xs text-muted-foreground">{f.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
