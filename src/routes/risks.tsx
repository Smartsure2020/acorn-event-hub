import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/risks")({
  component: RisksPage,
});

function RisksPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Risk Register</h2>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-base font-semibold">Cross-project risk register — coming soon</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Open any project's Risks tab to see its register. We'll aggregate risks across all projects in the next iteration.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
