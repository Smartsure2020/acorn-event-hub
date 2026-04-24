import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { SignInPage } from "@/components/SignInPage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

// Parse the URL hash IMMEDIATELY at module load time — before any React renders.
// This is the fix for the race condition: we capture tokens before AuthProvider
// calls getSession() and wins the race.
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

// Supabase v2 PKCE flow delivers a ?code= query param instead of hash tokens.
// Capture it at module load time on the /reset-password path.
const initialCode = (() => {
  if (typeof window === "undefined") return null;
  if (window.location.pathname !== "/reset-password") return null;
  return new URLSearchParams(window.location.search).get("code");
})();

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
      { title: "Acorn Activations" },
      { name: "description", content: "Project management for on-ground field activations and sponsorship events." },
      { property: "og:title", content: "Acorn Activations" },
      { name: "twitter:title", content: "Acorn Activations" },
      { property: "og:description", content: "Project management for on-ground field activations and sponsorship events." },
      { name: "twitter:description", content: "Project management for on-ground field activations and sponsorship events." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/d1ac33bf-bdc8-4f5e-b676-8a61ca246055" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/d1ac33bf-bdc8-4f5e-b676-8a61ca246055" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
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
  // Start as NOT ready if we have hash tokens or a PKCE code — we must set the session first
  const [sessionReady, setSessionReady] = useState(!initialHashTokens && !initialCode);
  const [flowType, setFlowType] = useState<string | null>(
    initialHashTokens?.type ?? (initialCode ? "recovery" : null)
  );

  useEffect(() => {
    if (initialHashTokens) {
      // Implicit flow: set the session from hash tokens BEFORE AuthProvider's getSession() fires
      supabase.auth.setSession({
        access_token: initialHashTokens.accessToken,
        refresh_token: initialHashTokens.refreshToken,
      }).then(({ error }) => {
        if (!error) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setSessionReady(true);
      });
    } else if (initialCode) {
      // PKCE flow: exchange the code for a session
      supabase.auth.exchangeCodeForSession(initialCode).then(({ error }) => {
        if (!error) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setSessionReady(true);
      });
    }
  }, []);

  // Show spinner while auth is loading or while we're setting the session
  if (loading || !sessionReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Password reset or invite — show set-password form
  if (flowType === "recovery" || flowType === "invite") {
    return <SetPasswordPage onDone={() => setFlowType(null)} />;
  }

  // Not logged in — show sign-in page
  // (forgot-password and reset-password routes are handled by Lovable's routes
  //  which render outside this gate via their own route components)
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