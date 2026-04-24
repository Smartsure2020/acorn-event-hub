import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "manager" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveRole(email: string): UserRole {
  // Simple role derivation — in prod this would come from Supabase user_metadata or a roles table
  if (email.includes("+admin@") || email.startsWith("admin.")) return "admin";
  if (email.includes("+manager@") || email.startsWith("manager.")) return "manager";
  // Acorn Activations org domain → default manager
  if (email.endsWith("@acornactivations.co.za")) return "manager";
  return "viewer";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveRole(supaUser: User): Promise<UserRole> {
    // 1. Check user_roles table (set explicitly by admins)
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", supaUser.id)
      .maybeSingle();
    if (data?.role) return data.role as UserRole;

    // 2. Check user_metadata (set at invite/signup time)
    const metaRole = supaUser.user_metadata?.role as UserRole | undefined;
    if (metaRole && ["admin", "manager", "viewer"].includes(metaRole)) return metaRole;

    // 3. Fall back to email-pattern heuristic
    return deriveRole(supaUser.email ?? "");
  }

  async function buildUser(supaUser: User): Promise<AuthUser> {
    const meta = supaUser.user_metadata ?? {};
    const email = supaUser.email ?? "";
    const role = await resolveRole(supaUser);
    return {
      id: supaUser.id,
      email,
      name: meta.full_name ?? meta.name ?? email.split("@")[0],
      role,
      avatarUrl: meta.avatar_url,
    };
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? await buildUser(data.session.user) : null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_ev, s) => {
      setSession(s);
      setUser(s?.user ? await buildUser(s.user) : null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRole() {
  const { user } = useAuth();
  return {
    role: user?.role ?? "viewer",
    isAdmin: user?.role === "admin",
    isManager: user?.role === "admin" || user?.role === "manager",
    isViewer: user?.role === "viewer",
  };
}
