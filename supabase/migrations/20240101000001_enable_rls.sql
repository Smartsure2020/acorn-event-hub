-- Enable Row Level Security on all tables.
-- Run this in the Supabase SQL editor or via `supabase db push`.
--
-- Policy summary:
--   • Unauthenticated requests are blocked on every table.
--   • Any authenticated user can read and write all project data.
--     (Future: tighten with per-project membership once a project_members
--      table is added.)
--   • user_roles: only admins can insert/update; anyone authenticated can
--     read their own row (needed for role resolution at sign-in).

-- ──────────────── projects ────────────────
alter table public.projects enable row level security;

create policy "authenticated_read_projects"
  on public.projects for select
  to authenticated using (true);

create policy "authenticated_insert_projects"
  on public.projects for insert
  to authenticated with check (true);

create policy "authenticated_update_projects"
  on public.projects for update
  to authenticated using (true);

create policy "authenticated_delete_projects"
  on public.projects for delete
  to authenticated using (true);

-- ──────────────── tasks ────────────────
alter table public.tasks enable row level security;

create policy "authenticated_read_tasks"
  on public.tasks for select
  to authenticated using (true);

create policy "authenticated_insert_tasks"
  on public.tasks for insert
  to authenticated with check (true);

create policy "authenticated_update_tasks"
  on public.tasks for update
  to authenticated using (true);

create policy "authenticated_delete_tasks"
  on public.tasks for delete
  to authenticated using (true);

-- ──────────────── milestones ────────────────
alter table public.milestones enable row level security;

create policy "authenticated_read_milestones"
  on public.milestones for select
  to authenticated using (true);

create policy "authenticated_insert_milestones"
  on public.milestones for insert
  to authenticated with check (true);

create policy "authenticated_update_milestones"
  on public.milestones for update
  to authenticated using (true);

create policy "authenticated_delete_milestones"
  on public.milestones for delete
  to authenticated using (true);

-- ──────────────── risks ────────────────
alter table public.risks enable row level security;

create policy "authenticated_read_risks"
  on public.risks for select
  to authenticated using (true);

create policy "authenticated_insert_risks"
  on public.risks for insert
  to authenticated with check (true);

create policy "authenticated_update_risks"
  on public.risks for update
  to authenticated using (true);

create policy "authenticated_delete_risks"
  on public.risks for delete
  to authenticated using (true);

-- ──────────────── team_members ────────────────
alter table public.team_members enable row level security;

create policy "authenticated_read_team_members"
  on public.team_members for select
  to authenticated using (true);

create policy "authenticated_insert_team_members"
  on public.team_members for insert
  to authenticated with check (true);

create policy "authenticated_update_team_members"
  on public.team_members for update
  to authenticated using (true);

create policy "authenticated_delete_team_members"
  on public.team_members for delete
  to authenticated using (true);

-- ──────────────── user_roles ────────────────
alter table public.user_roles enable row level security;

-- Every authenticated user can read their own role (used at sign-in)
create policy "users_read_own_role"
  on public.user_roles for select
  to authenticated using (auth.uid() = user_id);

-- Only admins can assign/change roles
create policy "admins_manage_roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role('admin', auth.uid()))
  with check (public.has_role('admin', auth.uid()));
