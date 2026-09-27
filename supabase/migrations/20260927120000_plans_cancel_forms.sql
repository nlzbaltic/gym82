-- Plan line-up: Pirmais solis, Vienreizējs apmeklējums, Rīts, Ultra.
insert into public.plans (slug, name, price_cents, visits_limit, valid_days, access_start, access_end, one_time, sort_order) values
  ('vienreizejs', 'Vienreizējs apmeklējums', 400, 1, 30, '05:00', '24:00', false, 2)
on conflict (slug) do update set name = excluded.name, price_cents = excluded.price_cents, visits_limit = excluded.visits_limit,
  valid_days = excluded.valid_days, sort_order = excluded.sort_order, active = true;
update public.plans set sort_order = 3 where slug = 'rits';
update public.plans set sort_order = 4 where slug = 'ultra';
update public.plans set active = false where slug = 'aktivais';   -- existing Aktīvais memberships keep working until they end

-- Members can cancel their own active membership. Access ends immediately.
create or replace function public.cancel_membership(p_id uuid)
returns public.memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.memberships;
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  update public.memberships
     set status = 'cancelled'
   where id = p_id and user_id = auth.uid() and status = 'active'
  returning * into v_row;
  if not found then raise exception 'not_found'; end if;
  return v_row;
end;
$$;

revoke execute on function public.cancel_membership(uuid) from public, anon;
grant execute on function public.cancel_membership(uuid) to authenticated;

-- Questions from the contact page. Anyone may submit; only staff read them in Supabase.
create table if not exists public.contact_messages (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (char_length(phone) <= 40),
  message text not null check (char_length(message) between 1 and 3000),
  user_id uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
create policy "Contact messages: anyone can submit" on public.contact_messages
  for insert to anon, authenticated with check (true);
revoke all on public.contact_messages from anon, authenticated;
grant insert (name, email, phone, message) on public.contact_messages to anon, authenticated;

-- Applications from people who want to work as trainers at GYM82.
create table if not exists public.trainer_applications (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text not null check (char_length(phone) between 3 and 40),
  specialty text check (char_length(specialty) <= 200),
  message text check (char_length(message) <= 3000),
  created_at timestamptz not null default now()
);

alter table public.trainer_applications enable row level security;
create policy "Trainer applications: anyone can submit" on public.trainer_applications
  for insert to anon, authenticated with check (true);
revoke all on public.trainer_applications from anon, authenticated;
grant insert (name, email, phone, specialty, message) on public.trainer_applications to anon, authenticated;
