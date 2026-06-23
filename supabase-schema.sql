create table if not exists public.planner_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.planner_sync enable row level security;

grant select, insert, update, delete on table public.planner_sync to authenticated;

create policy "Users can read their own planner"
on public.planner_sync for select
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can create their own planner"
on public.planner_sync for insert
to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can update their own planner"
on public.planner_sync for update
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Users can delete their own planner"
on public.planner_sync for delete
to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
