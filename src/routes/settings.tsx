import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Settings</h2>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-base font-semibold">Settings — coming soon</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Team management and default-template editing land in the next iteration along with auth.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
