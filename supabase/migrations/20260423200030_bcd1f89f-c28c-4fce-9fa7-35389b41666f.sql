-- 1. Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'viewer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Security definer helper to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3. Policies on user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 4. Replace all permissive public policies with authenticated-only policies

-- projects
DROP POLICY IF EXISTS "public read projects" ON public.projects;
DROP POLICY IF EXISTS "public insert projects" ON public.projects;
DROP POLICY IF EXISTS "public update projects" ON public.projects;
DROP POLICY IF EXISTS "public delete projects" ON public.projects;

CREATE POLICY "Authenticated users can read projects"
  ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- tasks
DROP POLICY IF EXISTS "public read tasks" ON public.tasks;
DROP POLICY IF EXISTS "public insert tasks" ON public.tasks;
DROP POLICY IF EXISTS "public update tasks" ON public.tasks;
DROP POLICY IF EXISTS "public delete tasks" ON public.tasks;

CREATE POLICY "Authenticated users can read tasks"
  ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert tasks"
  ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tasks"
  ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tasks"
  ON public.tasks FOR DELETE TO authenticated USING (true);

-- milestones
DROP POLICY IF EXISTS "public read milestones" ON public.milestones;
DROP POLICY IF EXISTS "public insert milestones" ON public.milestones;
DROP POLICY IF EXISTS "public update milestones" ON public.milestones;
DROP POLICY IF EXISTS "public delete milestones" ON public.milestones;

CREATE POLICY "Authenticated users can read milestones"
  ON public.milestones FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert milestones"
  ON public.milestones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update milestones"
  ON public.milestones FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete milestones"
  ON public.milestones FOR DELETE TO authenticated USING (true);

-- risks
DROP POLICY IF EXISTS "public read risks" ON public.risks;
DROP POLICY IF EXISTS "public insert risks" ON public.risks;
DROP POLICY IF EXISTS "public update risks" ON public.risks;
DROP POLICY IF EXISTS "public delete risks" ON public.risks;

CREATE POLICY "Authenticated users can read risks"
  ON public.risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert risks"
  ON public.risks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update risks"
  ON public.risks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete risks"
  ON public.risks FOR DELETE TO authenticated USING (true);

-- team_members
DROP POLICY IF EXISTS "public read team" ON public.team_members;
DROP POLICY IF EXISTS "public insert team" ON public.team_members;
DROP POLICY IF EXISTS "public update team" ON public.team_members;
DROP POLICY IF EXISTS "public delete team" ON public.team_members;

CREATE POLICY "Authenticated users can read team_members"
  ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert team_members"
  ON public.team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update team_members"
  ON public.team_members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete team_members"
  ON public.team_members FOR DELETE TO authenticated USING (true);