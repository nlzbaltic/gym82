-- Visits: one row each time a member opens the gym door from their profile.
-- Rows are written only server-side (the future door Edge Function uses the
-- service role after checking the membership), never from the browser.
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  opened_at timestamptz not null default now(),
  source text not null default 'door_button' check (source in ('door_button', 'staff'))
);

create index if not exists visits_user_opened_idx on public.visits (user_id, opened_at desc);

alter table public.visits enable row level security;

create policy "Visits: read own" on public.visits
  for select to authenticated using ((select auth.uid()) = user_id);

revoke all on public.visits from anon, authenticated;
grant select on public.visits to authenticated;

-- Training stats for the signed-in member. Several door openings on the same
-- day (Riga time) count as one training.
create or replace function public.my_visit_stats()
returns table (visits_last_year integer, last_visit timestamptz)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (select count(distinct (v.opened_at at time zone 'Europe/Riga')::date)::integer
       from public.visits v
      where v.user_id = (select auth.uid())
        and v.opened_at >= now() - interval '1 year'),
    (select max(v.opened_at)
       from public.visits v
      where v.user_id = (select auth.uid()));
$$;

revoke execute on function public.my_visit_stats() from public, anon;
grant execute on function public.my_visit_stats() to authenticated;

-- Copy the name entered at registration into the profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
