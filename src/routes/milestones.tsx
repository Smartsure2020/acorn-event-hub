import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";

export const Route = createFileRoute("/milestones")({
  component: MilestonesPage,
});

function MilestonesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Milestones</h2>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/15">
              <Flag className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="text-base font-semibold">Cross-project milestones — coming soon</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              For now, open a project to view its milestones. We'll roll up all milestones across projects in the next iteration.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
