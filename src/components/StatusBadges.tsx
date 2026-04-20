import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Variant =
  | "high" | "medium" | "low"
  | "not_started" | "in_progress" | "complete" | "blocked"
  | "at_risk"
  | "rating_critical" | "rating_high" | "rating_medium" | "rating_low"
  | "status_active" | "status_planning" | "status_hold" | "status_complete" | "status_cancelled"
  | "cp";

const styles: Record<Variant, string> = {
  high:        "bg-destructive/15 text-destructive border-destructive/40",
  medium:      "bg-secondary/15 text-secondary border-secondary/40",
  low:         "bg-muted text-muted-foreground border-border",

  not_started: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-primary/15 text-primary border-primary/40",
  complete:    "bg-success/15 text-success border-success/40",
  blocked:     "bg-destructive/15 text-destructive border-destructive/40",
  at_risk:     "bg-secondary/15 text-secondary border-secondary/40",

  rating_critical: "bg-destructive text-destructive-foreground border-transparent",
  rating_high:     "bg-secondary text-secondary-foreground border-transparent",
  rating_medium:   "bg-secondary/30 text-secondary border-secondary/40",
  rating_low:      "bg-success/20 text-success border-success/40",

  status_active:    "bg-primary/15 text-primary border-primary/40",
  status_planning:  "bg-secondary/15 text-secondary border-secondary/40",
  status_hold:      "bg-muted text-muted-foreground border-border",
  status_complete:  "bg-success/15 text-success border-success/40",
  status_cancelled: "bg-destructive/15 text-destructive border-destructive/40",

  cp: "bg-destructive text-destructive-foreground border-transparent text-[10px] px-1.5",
};

export function PriorityBadge({ value }: { value: "High" | "Medium" | "Low" }) {
  const v: Variant = value === "High" ? "high" : value === "Medium" ? "medium" : "low";
  return <Badge variant="outline" className={cn("font-medium", styles[v])}>{value}</Badge>;
}

export function TaskStatusBadge({ value }: { value: "Not Started" | "In Progress" | "Complete" | "Blocked" }) {
  const map: Record<string, Variant> = {
    "Not Started": "not_started",
    "In Progress": "in_progress",
    Complete: "complete",
    Blocked: "blocked",
  };
  return <Badge variant="outline" className={cn("font-medium", styles[map[value]])}>{value}</Badge>;
}

export function MilestoneStatusBadge({ value }: { value: "Not Started" | "Complete" | "At Risk" }) {
  const map: Record<string, Variant> = {
    "Not Started": "not_started",
    Complete: "complete",
    "At Risk": "at_risk",
  };
  return <Badge variant="outline" className={cn("font-medium", styles[map[value]])}>{value}</Badge>;
}

export function RiskRatingBadge({ value }: { value: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }) {
  const map: Record<string, Variant> = {
    LOW: "rating_low",
    MEDIUM: "rating_medium",
    HIGH: "rating_high",
    CRITICAL: "rating_critical",
  };
  return <Badge variant="outline" className={cn("font-bold tracking-wide", styles[map[value]])}>{value}</Badge>;
}

export function ProjectStatusBadge({ value }: { value: "Planning" | "Active" | "On Hold" | "Complete" | "Cancelled" }) {
  const map: Record<string, Variant> = {
    Planning: "status_planning",
    Active: "status_active",
    "On Hold": "status_hold",
    Complete: "status_complete",
    Cancelled: "status_cancelled",
  };
  return <Badge variant="outline" className={cn("font-medium", styles[map[value]])}>{value}</Badge>;
}

export function CPBadge() {
  return <Badge variant="outline" className={styles.cp}>CP</Badge>;
}
