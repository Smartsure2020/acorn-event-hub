import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TASK_TEMPLATE, MILESTONE_TEMPLATE, RISK_TEMPLATE } from "@/lib/templates";
import { toast } from "sonner";

export type ProjectRow = {
  id: string;
  name: string;
  client: string | null;
  type: "On-ground" | "Sponsorship" | "Both";
  event_date: string | null;
  pm: string | null;
  budget_zar: number | null;
  location: string | null;
  notes: string | null;
  status: "Planning" | "Active" | "On Hold" | "Complete" | "Cancelled";
  phase:
    | "Initiation"
    | "Planning"
    | "Creative"
    | "Procurement"
    | "Execution Prep"
    | "Activation"
    | "Post-Activation";
  created_at: string;
  updated_at: string;
};

export type TaskRow = {
  id: string;
  project_id: string;
  task_code: string;
  name: string;
  phase: ProjectRow["phase"];
  owner: string | null;
  start_day: number;
  duration_days: number;
  priority: "High" | "Medium" | "Low";
  status: "Not Started" | "In Progress" | "Complete" | "Blocked";
  critical_path: boolean;
  is_milestone: boolean;
  sort_order: number;
};

export type MilestoneRow = {
  id: string;
  project_id: string;
  code: string;
  name: string;
  phase: string | null;
  target_week: number | null;
  target_date: string | null;
  actual_date: string | null;
  status: "Not Started" | "Complete" | "At Risk";
  sign_off: string | null;
  sort_order: number;
};

export type RiskRow = {
  id: string;
  project_id: string;
  risk_number: number;
  description: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  rating: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  mitigation: string | null;
  owner: string | null;
  status: "Open" | "Mitigated" | "Closed";
};

export type TeamMemberRow = {
  id: string;
  project_id: string | null;
  name: string;
  role: "PM" | "Marketing" | "Executor" | "Client" | "Other";
  contact: string | null;
};

// ---------- Projects ----------

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async (): Promise<ProjectRow[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProjectRow[];
    },
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    enabled: !!id,
    queryFn: async (): Promise<ProjectRow | null> => {
      const { data, error } = await supabase.from("projects").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return (data ?? null) as ProjectRow | null;
    },
  });
}

export type NewProjectInput = {
  name: string;
  client: string | null;
  type: ProjectRow["type"];
  event_date: string | null;
  pm: string | null;
  budget_zar: number | null;
  location: string | null;
  notes: string | null;
};

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewProjectInput): Promise<ProjectRow> => {
      // 1. Insert project
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          name: input.name,
          client: input.client,
          type: input.type,
          event_date: input.event_date,
          pm: input.pm,
          budget_zar: input.budget_zar,
          location: input.location,
          notes: input.notes,
        })
        .select()
        .single();
      if (pErr) throw pErr;
      const projectId = (project as ProjectRow).id;

      // 2. Seed tasks
      const taskRows = TASK_TEMPLATE.map((t, i) => ({
        project_id: projectId,
        task_code: t.task_code,
        name: t.name,
        phase: t.phase,
        owner: t.owner,
        start_day: t.start_day,
        duration_days: t.duration_days,
        priority: t.priority,
        critical_path: t.critical_path,
        is_milestone: t.is_milestone,
        sort_order: i,
      }));
      const { error: tErr } = await supabase.from("tasks").insert(taskRows);
      if (tErr) throw tErr;

      // 3. Seed milestones
      const msRows = MILESTONE_TEMPLATE.map((m, i) => ({
        project_id: projectId,
        code: m.code,
        name: m.name,
        phase: m.phase,
        target_week: m.target_week,
        sign_off: m.sign_off,
        sort_order: i,
      }));
      const { error: mErr } = await supabase.from("milestones").insert(msRows);
      if (mErr) throw mErr;

      // 4. Seed risks
      const riskRows = RISK_TEMPLATE.map((r) => ({
        project_id: projectId,
        risk_number: r.risk_number,
        description: r.description,
        likelihood: r.likelihood,
        impact: r.impact,
        rating: r.rating,
        mitigation: r.mitigation,
      }));
      const { error: rErr } = await supabase.from("risks").insert(riskRows);
      if (rErr) throw rErr;

      return project as ProjectRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created with default template loaded");
    },
    onError: (e: Error) => toast.error(e.message ?? "Failed to create project"),
  });
}

// ---------- Tasks ----------

export function useTasks(projectId: string | undefined) {
  return useQuery({
    queryKey: ["tasks", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<TaskRow[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", projectId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TaskRow[];
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskRow["status"] }) => {
      const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success(`Status updated to ${vars.status}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type UpdateTaskInput = {
  id: string;
  project_id: string;
  name: string;
  phase: ProjectRow["phase"];
  owner: string | null;
  start_day: number;
  duration_days: number;
  priority: "High" | "Medium" | "Low";
  critical_path: boolean;
};

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id: _, ...rest }: UpdateTaskInput): Promise<TaskRow> => {
      const { data, error } = await supabase
        .from("tasks")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as TaskRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks", vars.project_id] });
      toast.success("Task updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- Milestones ----------

export function useMilestones(projectId: string | undefined) {
  return useQuery({
    queryKey: ["milestones", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<MilestoneRow[]> => {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as MilestoneRow[];
    },
  });
}

export function useUpdateMilestoneStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: MilestoneRow["status"]; project_id: string }) => {
      const { error } = await supabase.from("milestones").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["milestones", vars.project_id] });
      toast.success(`Milestone marked as ${vars.status}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ---------- Risks ----------

export function useRisks(projectId: string | undefined) {
  return useQuery({
    queryKey: ["risks", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<RiskRow[]> => {
      const { data, error } = await supabase
        .from("risks")
        .select("*")
        .eq("project_id", projectId!)
        .order("risk_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RiskRow[];
    },
  });
}

// ---------- Team ----------

export function useTeam(projectId: string | undefined) {
  return useQuery({
    queryKey: ["team", projectId],
    enabled: !!projectId,
    queryFn: async (): Promise<TeamMemberRow[]> => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("project_id", projectId!)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TeamMemberRow[];
    },
  });
}

// ---------- Mutations ----------

export type NewTaskInput = {
  project_id: string;
  name: string;
  phase: ProjectRow["phase"];
  owner: string | null;
  start_day: number;
  duration_days: number;
  priority: "High" | "Medium" | "Low";
  critical_path: boolean;
};

export function useAddTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewTaskInput): Promise<TaskRow> => {
      const { count } = await supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("project_id", input.project_id);
      const nextNum = (count ?? 0) + 1;
      const taskCode = `T-${nextNum.toString().padStart(3, "0")}`;

      const { data: last } = await supabase
        .from("tasks")
        .select("sort_order")
        .eq("project_id", input.project_id)
        .order("sort_order", { ascending: false })
        .limit(1);
      const nextSort = last?.length ? last[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          project_id: input.project_id,
          task_code: taskCode,
          name: input.name,
          phase: input.phase,
          owner: input.owner,
          start_day: input.start_day,
          duration_days: input.duration_days,
          priority: input.priority,
          critical_path: input.critical_path,
          sort_order: nextSort,
        })
        .select()
        .single();
      if (error) throw error;
      return data as TaskRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tasks", vars.project_id] });
      toast.success("Task added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function computeRiskRating(
  likelihood: "Low" | "Medium" | "High",
  impact: "Low" | "Medium" | "High"
): RiskRow["rating"] {
  const matrix: Record<string, RiskRow["rating"]> = {
    "Low-Low": "LOW", "Low-Medium": "LOW", "Low-High": "MEDIUM",
    "Medium-Low": "LOW", "Medium-Medium": "MEDIUM", "Medium-High": "HIGH",
    "High-Low": "MEDIUM", "High-Medium": "HIGH", "High-High": "CRITICAL",
  };
  return matrix[`${likelihood}-${impact}`] ?? "MEDIUM";
}

export type NewRiskInput = {
  project_id: string;
  description: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigation: string | null;
  owner: string | null;
};

export function useAddRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewRiskInput): Promise<RiskRow> => {
      const { count } = await supabase
        .from("risks")
        .select("id", { count: "exact", head: true })
        .eq("project_id", input.project_id);
      const risk_number = (count ?? 0) + 1;
      const rating = computeRiskRating(input.likelihood, input.impact);

      const { data, error } = await supabase
        .from("risks")
        .insert({
          project_id: input.project_id,
          risk_number,
          description: input.description,
          likelihood: input.likelihood,
          impact: input.impact,
          rating,
          mitigation: input.mitigation,
          owner: input.owner,
        })
        .select()
        .single();
      if (error) throw error;
      return data as RiskRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["risks", vars.project_id] });
      toast.success("Risk added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type NewTeamMemberInput = {
  project_id: string;
  name: string;
  role: TeamMemberRow["role"];
  contact: string | null;
};

export function useAddTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewTeamMemberInput): Promise<TeamMemberRow> => {
      const { data, error } = await supabase
        .from("team_members")
        .insert({ project_id: input.project_id, name: input.name, role: input.role, contact: input.contact })
        .select()
        .single();
      if (error) throw error;
      return data as TeamMemberRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["team", vars.project_id] });
      toast.success("Team member added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type UpdateProjectInput = {
  id: string;
  name: string;
  client: string | null;
  type: ProjectRow["type"];
  event_date: string | null;
  pm: string | null;
  budget_zar: number | null;
  location: string | null;
  notes: string | null;
  status: ProjectRow["status"];
};

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateProjectInput): Promise<ProjectRow> => {
      const { data, error } = await supabase
        .from("projects")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ProjectRow;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["project", vars.id] });
      toast.success("Project updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
