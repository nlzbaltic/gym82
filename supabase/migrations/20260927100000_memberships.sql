-- Membership plans, discount codes, member memberships and the door-open check.
-- Payments are not connected yet: purchase_membership() activates a membership
-- immediately. Before launch it must create a pending membership that only a
-- verified payment webhook activates.

create table if not exists public.plans (
  slug text primary key,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  visits_limit integer check (visits_limit > 0),         -- null = unlimited
  valid_days integer not null check (valid_days > 0),
  access_start time not null default '05:00',
  access_end time not null default '24:00',
  one_time boolean not null default false,               -- e.g. the free first workout
  sort_order integer not null default 0,
  active boolean not null default true
);

insert into public.plans (slug, name, price_cents, visits_limit, valid_days, access_start, access_end, one_time, sort_order) values
  ('pirmais-solis', 'Pirmais solis',    0,    1, 14, '05:00', '24:00', true,  1),
  ('rits',          'Rīts',          2495,   12, 30, '05:00', '13:00', false, 2),
  ('aktivais',      'Aktīvais',      3495,   16, 30, '05:00', '24:00', false, 3),
  ('ultra',         'Ultra',         4495, null, 30, '05:00', '24:00', false, 4)
on conflict (slug) do nothing;

alter table public.plans enable row level security;
create policy "Plans: public read" on public.plans for select to anon, authenticated using (active);
revoke all on public.plans from anon, authenticated;
grant select on public.plans to anon, authenticated;

create table if not exists public.discount_codes (
  code text primary key check (code = upper(code)),
  percent integer not null check (percent between 1 and 100),
  description text,
  active boolean not null default true,
  valid_until timestamptz
);

insert into public.discount_codes (code, percent, description) values
  ('SKOLENS20', 20, 'Skolēnu atlaide')
on conflict (code) do nothing;

alter table public.discount_codes enable row level security;
revoke all on public.discount_codes from anon, authenticated;  -- codes are checked only via check_discount()

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_slug text not null references public.plans (slug),
  status text not null default 'active' check (status in ('pending', 'active', 'cancelled')),
  price_cents integer not null,
  discount_code text,
  discount_percent integer,
  visits_limit integer,
  visits_used integer not null default 0,
  access_start time not null,
  access_end time not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists memberships_user_idx on public.memberships (user_id, ends_at desc);

alter table public.memberships enable row level security;
create policy "Memberships: read own" on public.memberships
  for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.memberships from anon, authenticated;
grant select on public.memberships to authenticated;

alter table public.visits add column if not exists membership_id uuid references public.memberships (id) on delete set null;

-- Returns the discount percent for a valid code, or null.
create or replace function public.check_discount(p_code text)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select d.percent
    from public.discount_codes d
   where d.code = upper(trim(p_code))
     and d.active
     and (d.valid_until is null or d.valid_until > now());
$$;

revoke execute on function public.check_discount(text) from public, anon;
grant execute on function public.check_discount(text) to authenticated;

-- Activates a membership for the signed-in member (no payment yet).
create or replace function public.purchase_membership(p_plan text, p_code text default null)
returns public.memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_plan public.plans;
  v_percent integer;
  v_row public.memberships;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select * into v_plan from public.plans where slug = p_plan and active;
  if not found then raise exception 'unknown_plan'; end if;

  if v_plan.one_time and exists (
    select 1 from public.memberships where user_id = v_uid and plan_slug = v_plan.slug
  ) then raise exception 'trial_used'; end if;

  if exists (
    select 1 from public.memberships m
     where m.user_id = v_uid and m.status = 'active'
       and m.ends_at > now()
       and (m.visits_limit is null or m.visits_used < m.visits_limit)
  ) then raise exception 'active_exists'; end if;

  if nullif(trim(coalesce(p_code, '')), '') is not null then
    v_percent := public.check_discount(p_code);
    if v_percent is null then raise exception 'invalid_code'; end if;
  end if;

  insert into public.memberships (
    user_id, plan_slug, status, price_cents, discount_code, discount_percent,
    visits_limit, access_start, access_end, starts_at, ends_at
  ) values (
    v_uid, v_plan.slug, 'active',
    round(v_plan.price_cents * (100 - coalesce(v_percent, 0)) / 100.0)::integer,
    case when v_percent is null then null else upper(trim(p_code)) end, v_percent,
    v_plan.visits_limit, v_plan.access_start, v_plan.access_end,
    now(), now() + make_interval(days => v_plan.valid_days)
  ) returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.purchase_membership(text, text) from public, anon;
grant execute on function public.purchase_membership(text, text) to authenticated;

-- Checks whether the member may enter now and logs the visit. The first
-- opening on a given day (Riga time) uses one visit from the membership.
-- The door hardware is not connected yet: this only validates and records.
create or replace function public.open_door()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_m public.memberships;
  v_now_local timestamp := now() at time zone 'Europe/Riga';
  v_first_today boolean;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select * into v_m from public.memberships m
   where m.user_id = v_uid and m.status = 'active'
     and m.starts_at <= now() and m.ends_at > now()
   order by m.ends_at desc
   limit 1
   for update;
  if not found then raise exception 'no_active_membership'; end if;

  if v_now_local::time < v_m.access_start or v_now_local::time >= v_m.access_end then
    raise exception 'outside_hours';
  end if;

  if exists (
    select 1 from public.visits v
     where v.user_id = v_uid and v.opened_at > now() - interval '10 seconds'
  ) then raise exception 'too_soon'; end if;

  v_first_today := not exists (
    select 1 from public.visits v
     where v.membership_id = v_m.id
       and (v.opened_at at time zone 'Europe/Riga')::date = v_now_local::date
  );

  if v_first_today and v_m.visits_limit is not null then
    if v_m.visits_used >= v_m.visits_limit then raise exception 'no_visits_left'; end if;
    update public.memberships set visits_used = visits_used + 1 where id = v_m.id
      returning * into v_m;
  end if;

  insert into public.visits (user_id, membership_id, source) values (v_uid, v_m.id, 'door_button');

  return jsonb_build_object(
    'ok', true,
    'door_connected', false,
    'visits_left', case when v_m.visits_limit is null then null else v_m.visits_limit - v_m.visits_used end
  );
end;
$$;

revoke execute on function public.open_door() from public, anon;
grant execute on function public.open_door() to authenticated;
