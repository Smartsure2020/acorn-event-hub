import { PHASES, Phase } from "@/lib/templates";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhaseTracker({ current }: { current: Phase }) {
  const currentIdx = PHASES.indexOf(current);

  return (
    <div className="flex w-full items-center overflow-x-auto pb-2">
      {PHASES.map((phase, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={phase} className="flex flex-1 items-center min-w-[120px]">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-semibold transition",
                  done && "border-success bg-success text-success-foreground",
                  active && "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30",
                  !done && !active && "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[11px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {phase}
              </span>
            </div>
            {i < PHASES.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 -translate-y-3",
                  done ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
