import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { SignInPage } from "@/components/SignInPage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

// Parse the URL hash immediately — before any React renders
function parseAuthHash(): { accessToken: string; refreshToken: string; type: string } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.replace("#", ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type") ?? "";
  if (accessToken && refreshToken) return { accessToken, refreshToken, type };
  return null;
}

const initialHashTokens = parseAuthHash();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Acorn Activations — Field Activation PM" },
      { name: "description", content: "Project management for on-ground field activations and sponsorship events." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sessionReady, setSessionReady] = useState(!initialHashTokens);
  const [flowType, setFlowType] = useState<string | null>(initialHashTokens?.type ?? null);

  useEffect(() => {
    if (!initialHashTokens) return;

    supabase.auth.setSession({
      access_token: initialHashTokens.accessToken,
      refresh_token: initialHashTokens.refreshToken,
    }).then(({ error }) => {
      if (!error) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      setSessionReady(true);
    });
  }, []);

  if (loading || !sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (flowType === "recovery" || flowType === "invite") {
    return <SetPasswordPage onDone={() => setFlowType(null)} />;
  }

  if (!user) return <SignInPage />;

  return <>{children}</>;
}

function SetPasswordPage({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setTimeout(() => onDone(), 1500);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Set your password</h1>
          {user?.email && (
            <p className="text-sm text-muted-foreground mt-1">for {user.email}</p>
          )}
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-xl">
          {done ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-green-400 font-semibold text-lg">✓ Password set!</p>
              <p className="text-sm text-muted-foreground">Taking you to the dashboard…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">New password</label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  required
                  autoFocus
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  required
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Saving…" : "Set password & sign in"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster richColors theme={theme} position="top-right" />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <Outlet />
          </AuthGate>
          <ThemedToaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}