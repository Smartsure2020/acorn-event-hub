-- Updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Enums
CREATE TYPE public.project_type AS ENUM ('On-ground', 'Sponsorship', 'Both');
CREATE TYPE public.project_status AS ENUM ('Planning', 'Active', 'On Hold', 'Complete', 'Cancelled');
CREATE TYPE public.project_phase AS ENUM ('Initiation', 'Planning', 'Creative', 'Procurement', 'Execution Prep', 'Activation', 'Post-Activation');
CREATE TYPE public.task_priority AS ENUM ('High', 'Medium', 'Low');
CREATE TYPE public.task_status AS ENUM ('Not Started', 'In Progress', 'Complete', 'Blocked');
CREATE TYPE public.milestone_status AS ENUM ('Not Started', 'Complete', 'At Risk');
CREATE TYPE public.risk_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE public.risk_rating AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE public.risk_status AS ENUM ('Open', 'Mitigated', 'Closed');
CREATE TYPE public.team_role AS ENUM ('PM', 'Marketing', 'Executor', 'Client', 'Other');

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client TEXT,
  type project_type NOT NULL DEFAULT 'On-ground',
  event_date DATE,
  pm TEXT,
  budget_zar NUMERIC(14,2),
  location TEXT,
  notes TEXT,
  status project_status NOT NULL DEFAULT 'Planning',
  phase project_phase NOT NULL DEFAULT 'Initiation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "public insert projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "public update projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "public delete projects" ON public.projects FOR DELETE USING (true);
CREATE TRIGGER projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_code TEXT NOT NULL,
  name TEXT NOT NULL,
  phase project_phase NOT NULL,
  owner TEXT,
  start_day INT NOT NULL DEFAULT 1,
  duration_days NUMERIC(5,1) NOT NULL DEFAULT 1,
  priority task_priority NOT NULL DEFAULT 'Medium',
  status task_status NOT NULL DEFAULT 'Not Started',
  critical_path BOOLEAN NOT NULL DEFAULT false,
  is_milestone BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_project ON public.tasks(project_id);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "public insert tasks" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "public update tasks" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "public delete tasks" ON public.tasks FOR DELETE USING (true);
CREATE TRIGGER tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Milestones
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  phase TEXT,
  target_week INT,
  target_date DATE,
  actual_date DATE,
  status milestone_status NOT NULL DEFAULT 'Not Started',
  sign_off TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_milestones_project ON public.milestones(project_id);
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "public insert milestones" ON public.milestones FOR INSERT WITH CHECK (true);
CREATE POLICY "public update milestones" ON public.milestones FOR UPDATE USING (true);
CREATE POLICY "public delete milestones" ON public.milestones FOR DELETE USING (true);
CREATE TRIGGER milestones_updated BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Risks
CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  risk_number INT NOT NULL,
  description TEXT NOT NULL,
  likelihood risk_level NOT NULL DEFAULT 'Medium',
  impact risk_level NOT NULL DEFAULT 'Medium',
  rating risk_rating NOT NULL DEFAULT 'MEDIUM',
  mitigation TEXT,
  owner TEXT,
  status risk_status NOT NULL DEFAULT 'Open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_risks_project ON public.risks(project_id);
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read risks" ON public.risks FOR SELECT USING (true);
CREATE POLICY "public insert risks" ON public.risks FOR INSERT WITH CHECK (true);
CREATE POLICY "public update risks" ON public.risks FOR UPDATE USING (true);
CREATE POLICY "public delete risks" ON public.risks FOR DELETE USING (true);
CREATE TRIGGER risks_updated BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role team_role NOT NULL DEFAULT 'Other',
  contact TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_team_project ON public.team_members(project_id);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read team" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "public insert team" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "public update team" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "public delete team" ON public.team_members FOR DELETE USING (true);
CREATE TRIGGER team_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();