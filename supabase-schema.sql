-- Team Fit Brothers - portail client + suivi coach
-- 1. Ouvrez Supabase > SQL Editor
-- 2. Remplacez CHANGE_THIS_COACH_WRITE_SECRET par votre vrai secret coach
-- 3. Executez ce script

create extension if not exists pgcrypto;

create table if not exists public.tfb_clients (
  client_slug text primary key,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  birth_date text,
  gender text,
  start_date_label text,
  start_date_short text,
  coach_name text,
  objective text,
  level text,
  objective_detail text,
  height_label text,
  weight_label text,
  age_label text,
  activity_label text,
  frequency_label text,
  constraints text,
  habits text,
  notes text,
  updated_at timestamptz not null default now()
);

create table if not exists public.tfb_client_portal_links (
  client_slug text primary key references public.tfb_clients (client_slug) on delete cascade,
  access_token text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_issued_at timestamptz not null default now()
);

create table if not exists public.tfb_client_weekly_checkins (
  id uuid primary key default gen_random_uuid(),
  client_slug text not null references public.tfb_clients (client_slug) on delete cascade,
  iso_year integer not null,
  iso_week integer not null,
  weight numeric,
  shoulder numeric,
  chest numeric,
  arm_right numeric,
  arm_left numeric,
  navel numeric,
  hip numeric,
  glute numeric,
  thigh_left numeric,
  thigh_right numeric,
  calf_right numeric,
  calf_left numeric,
  client_comment text,
  coach_comment text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_slug, iso_year, iso_week)
);

alter table public.tfb_clients enable row level security;
alter table public.tfb_client_portal_links enable row level security;
alter table public.tfb_client_weekly_checkins enable row level security;

drop policy if exists "tfb_no_direct_clients" on public.tfb_clients;
drop policy if exists "tfb_no_direct_links" on public.tfb_client_portal_links;
drop policy if exists "tfb_no_direct_checkins" on public.tfb_client_weekly_checkins;

create policy "tfb_no_direct_clients"
on public.tfb_clients
for all
to anon, authenticated
using (false)
with check (false);

create policy "tfb_no_direct_links"
on public.tfb_client_portal_links
for all
to anon, authenticated
using (false)
with check (false);

create policy "tfb_no_direct_checkins"
on public.tfb_client_weekly_checkins
for all
to anon, authenticated
using (false)
with check (false);

create or replace function public.tfb_sync_client_profile(
  p_admin_secret text,
  p_client_slug text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_birth_date text,
  p_gender text,
  p_start_date_label text,
  p_start_date_short text,
  p_coach_name text,
  p_objective text,
  p_level text,
  p_objective_detail text,
  p_height_label text,
  p_weight_label text,
  p_age_label text,
  p_activity_label text,
  p_frequency_label text,
  p_constraints text,
  p_habits text,
  p_notes text
)
returns public.tfb_clients
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.tfb_clients;
begin
  if p_admin_secret <> 'CHANGE_THIS_COACH_WRITE_SECRET' then
    raise exception 'Unauthorized';
  end if;

  insert into public.tfb_clients (
    client_slug, first_name, last_name, email, phone, birth_date, gender,
    start_date_label, start_date_short, coach_name, objective, level,
    objective_detail, height_label, weight_label, age_label, activity_label,
    frequency_label, constraints, habits, notes, updated_at
  )
  values (
    p_client_slug, p_first_name, p_last_name, p_email, p_phone, p_birth_date, p_gender,
    p_start_date_label, p_start_date_short, p_coach_name, p_objective, p_level,
    p_objective_detail, p_height_label, p_weight_label, p_age_label, p_activity_label,
    p_frequency_label, p_constraints, p_habits, p_notes, now()
  )
  on conflict (client_slug) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    phone = excluded.phone,
    birth_date = excluded.birth_date,
    gender = excluded.gender,
    start_date_label = excluded.start_date_label,
    start_date_short = excluded.start_date_short,
    coach_name = excluded.coach_name,
    objective = excluded.objective,
    level = excluded.level,
    objective_detail = excluded.objective_detail,
    height_label = excluded.height_label,
    weight_label = excluded.weight_label,
    age_label = excluded.age_label,
    activity_label = excluded.activity_label,
    frequency_label = excluded.frequency_label,
    constraints = excluded.constraints,
    habits = excluded.habits,
    notes = excluded.notes,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.tfb_issue_portal_link(
  p_admin_secret text,
  p_client_slug text,
  p_token text,
  p_rotate boolean default true
)
returns table (
  client_slug text,
  token text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_secret <> 'CHANGE_THIS_COACH_WRITE_SECRET' then
    raise exception 'Unauthorized';
  end if;

  insert into public.tfb_client_portal_links (
    client_slug,
    access_token,
    created_at,
    updated_at,
    last_issued_at
  )
  values (
    p_client_slug,
    p_token,
    now(),
    now(),
    now()
  )
  on conflict (client_slug) do update set
    access_token = case when p_rotate then excluded.access_token else public.tfb_client_portal_links.access_token end,
    updated_at = now(),
    last_issued_at = now();

  return query
  select
    tfb_client_portal_links.client_slug,
    tfb_client_portal_links.access_token,
    tfb_client_portal_links.updated_at
  from public.tfb_client_portal_links
  where tfb_client_portal_links.client_slug = p_client_slug;
end;
$$;

create or replace function public.tfb_get_client_portal(
  p_token text
)
returns table (
  client_slug text,
  first_name text,
  last_name text,
  objective text,
  coach_name text,
  start_date_label text,
  level text,
  email text
)
language sql
security definer
set search_path = public
as $$
  select
    c.client_slug,
    c.first_name,
    c.last_name,
    c.objective,
    c.coach_name,
    c.start_date_label,
    c.level,
    c.email
  from public.tfb_client_portal_links l
  join public.tfb_clients c on c.client_slug = l.client_slug
  where l.access_token = p_token
  limit 1;
$$;

create or replace function public.tfb_list_client_checkins(
  p_token text
)
returns table (
  iso_year integer,
  iso_week integer,
  weight numeric,
  shoulder numeric,
  chest numeric,
  arm_right numeric,
  arm_left numeric,
  navel numeric,
  hip numeric,
  glute numeric,
  thigh_left numeric,
  thigh_right numeric,
  calf_right numeric,
  calf_left numeric,
  client_comment text,
  coach_comment text,
  submitted_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    w.iso_year,
    w.iso_week,
    w.weight,
    w.shoulder,
    w.chest,
    w.arm_right,
    w.arm_left,
    w.navel,
    w.hip,
    w.glute,
    w.thigh_left,
    w.thigh_right,
    w.calf_right,
    w.calf_left,
    w.client_comment,
    w.coach_comment,
    w.submitted_at
  from public.tfb_client_portal_links l
  join public.tfb_client_weekly_checkins w on w.client_slug = l.client_slug
  where l.access_token = p_token
  order by w.iso_year asc, w.iso_week asc;
$$;

create or replace function public.tfb_upsert_client_checkin(
  p_token text,
  p_iso_year integer,
  p_iso_week integer,
  p_weight numeric,
  p_shoulder numeric,
  p_chest numeric,
  p_arm_right numeric,
  p_arm_left numeric,
  p_navel numeric,
  p_hip numeric,
  p_glute numeric,
  p_thigh_left numeric,
  p_thigh_right numeric,
  p_calf_right numeric,
  p_calf_left numeric,
  p_client_comment text,
  p_coach_comment text default null
)
returns setof public.tfb_client_weekly_checkins
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_slug text;
begin
  select client_slug
  into v_client_slug
  from public.tfb_client_portal_links
  where access_token = p_token
  limit 1;

  if v_client_slug is null then
    raise exception 'Invalid token';
  end if;

  return query
  insert into public.tfb_client_weekly_checkins (
    client_slug,
    iso_year,
    iso_week,
    weight,
    shoulder,
    chest,
    arm_right,
    arm_left,
    navel,
    hip,
    glute,
    thigh_left,
    thigh_right,
    calf_right,
    calf_left,
    client_comment,
    coach_comment,
    submitted_at,
    updated_at
  )
  values (
    v_client_slug,
    p_iso_year,
    p_iso_week,
    p_weight,
    p_shoulder,
    p_chest,
    p_arm_right,
    p_arm_left,
    p_navel,
    p_hip,
    p_glute,
    p_thigh_left,
    p_thigh_right,
    p_calf_right,
    p_calf_left,
    coalesce(p_client_comment, ''),
    coalesce(p_coach_comment, ''),
    now(),
    now()
  )
  on conflict (client_slug, iso_year, iso_week) do update set
    weight = excluded.weight,
    shoulder = excluded.shoulder,
    chest = excluded.chest,
    arm_right = excluded.arm_right,
    arm_left = excluded.arm_left,
    navel = excluded.navel,
    hip = excluded.hip,
    glute = excluded.glute,
    thigh_left = excluded.thigh_left,
    thigh_right = excluded.thigh_right,
    calf_right = excluded.calf_right,
    calf_left = excluded.calf_left,
    client_comment = excluded.client_comment,
    updated_at = now(),
    submitted_at = now()
  returning *;
end;
$$;

create or replace function public.tfb_list_client_checkins_for_coach(
  p_admin_secret text,
  p_client_slug text
)
returns setof public.tfb_client_weekly_checkins
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_secret <> 'CHANGE_THIS_COACH_WRITE_SECRET' then
    raise exception 'Unauthorized';
  end if;

  return query
  select *
  from public.tfb_client_weekly_checkins
  where client_slug = p_client_slug
  order by iso_year asc, iso_week asc;
end;
$$;

create or replace function public.tfb_save_coach_note(
  p_admin_secret text,
  p_client_slug text,
  p_iso_year integer,
  p_iso_week integer,
  p_coach_comment text
)
returns setof public.tfb_client_weekly_checkins
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_admin_secret <> 'CHANGE_THIS_COACH_WRITE_SECRET' then
    raise exception 'Unauthorized';
  end if;

  return query
  insert into public.tfb_client_weekly_checkins (
    client_slug,
    iso_year,
    iso_week,
    coach_comment,
    submitted_at,
    updated_at
  )
  values (
    p_client_slug,
    p_iso_year,
    p_iso_week,
    coalesce(p_coach_comment, ''),
    now(),
    now()
  )
  on conflict (client_slug, iso_year, iso_week) do update set
    coach_comment = excluded.coach_comment,
    updated_at = now()
  returning *;
end;
$$;

grant execute on all functions in schema public to anon, authenticated;
