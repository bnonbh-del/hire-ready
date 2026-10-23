-- =============================================================================
-- Hire Ready: initial schema
-- Run once in Supabase: Dashboard -> SQL Editor -> paste this file -> Run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums (fixed lists of allowed values)
-- -----------------------------------------------------------------------------

create type public.department as enum (
  'sales',        -- مبيعات
  'accounting',   -- محاسبة
  'engineering',  -- هندسة
  'hr',           -- موارد بشرية
  'tech',         -- تقنية
  'marketing',    -- تسويق
  'management',   -- إدارة
  'other'         -- أخرى
);

create type public.job_type as enum (
  'full_time',    -- دوام كامل
  'part_time',    -- دوام جزئي
  'contract',     -- عقد
  'internship'    -- تدريب
);

create type public.job_status as enum (
  'draft',        -- مسودة: لا تظهر للزوار
  'open',         -- مفتوحة: تظهر ويُقبل التقديم
  'closed'        -- مغلقة: صفحتها تبقى، بس التقديم متوقف
);

create type public.application_status as enum (
  'new',          -- جديد
  'contacted',    -- تم التواصل
  'interview',    -- مقابلة
  'accepted',     -- مقبول
  'rejected'      -- مرفوض
);

-- Iraq's governorates, used by jobs and applications.
create domain public.governorate as text check (value in (
  'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'كركوك',
  'الأنبار', 'ديالى', 'صلاح الدين', 'بابل', 'واسط', 'ذي قار', 'ميسان',
  'المثنى', 'القادسية', 'دهوك', 'السليمانية', 'حلبجة'
));

-- -----------------------------------------------------------------------------
-- Admins: users allowed into /admin (just Ismail for now)
-- -----------------------------------------------------------------------------

create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- security definer: runs with the owner's rights so RLS policies can call it
-- without the caller needing to read the admins table themselves.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Keeps updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Companies (contracted partners, shown on /partners and on job pages)
-- -----------------------------------------------------------------------------

create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) > 0),
  logo_path   text,                      -- path inside the "public" bucket
  website     text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Jobs
-- -----------------------------------------------------------------------------

create table public.jobs (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null check (length(trim(title)) > 0),
  -- Name shown on the page. Can differ from the partner record
  -- (e.g. "شركة خاصة" when the employer wants to stay anonymous).
  company_name     text not null check (length(trim(company_name)) > 0),
  company_id       uuid references public.companies (id) on delete set null,
  department       public.department not null,
  governorate      public.governorate not null,
  job_type         public.job_type not null,
  salary           text,                 -- free text, e.g. "750,000 - 900,000 د.ع"
  deadline         date,
  description      text not null default '',
  responsibilities text[] not null default '{}',
  requirements     text[] not null default '{}',
  benefits         text[] not null default '{}',
  cover_path       text,                 -- path inside the "public" bucket
  status           public.job_status not null default 'draft',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index jobs_status_published_idx on public.jobs (status, published_at desc);
create index jobs_department_idx on public.jobs (department);

create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

-- Stamp published_at the first time a job is opened.
create or replace function public.jobs_set_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'open' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger jobs_published_at before insert or update on public.jobs
  for each row execute function public.jobs_set_published_at();

-- -----------------------------------------------------------------------------
-- Applications
-- -----------------------------------------------------------------------------

create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  job_id           uuid not null references public.jobs (id) on delete restrict,
  -- Copied from the job by a trigger, so each applicant lands in the right
  -- department tab even if the job is edited later.
  department       public.department not null,
  full_name        text not null check (length(trim(full_name)) between 2 and 120),
  phone            text not null check (phone ~ '^\+?[0-9 ]{7,20}$'),
  email            text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  governorate      public.governorate not null,
  years_experience int  not null check (years_experience between 0 and 60),
  cv_path          text not null,        -- path inside the private "cvs" bucket
  status           public.application_status not null default 'new',
  notes            text,                 -- internal notes, admin only
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index applications_department_created_idx on public.applications (department, created_at desc);
create index applications_job_idx on public.applications (job_id);

create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

create or replace function public.applications_copy_department()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  select j.department into new.department from public.jobs j where j.id = new.job_id;
  return new;
end;
$$;

create trigger applications_department before insert on public.applications
  for each row execute function public.applications_copy_department();

-- -----------------------------------------------------------------------------
-- Site content managed from /admin
-- -----------------------------------------------------------------------------

create table public.founders (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text not null,
  bio          text not null default '',
  photo_path   text,                     -- path inside the "public" bucket, or a /public URL
  linkedin_url text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger founders_updated_at before update on public.founders
  for each row execute function public.set_updated_at();

create table public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- A single row (id = 1) holding contact details and social links.
create table public.settings (
  id              int primary key default 1 check (id = 1),
  phone_primary   text,
  phone_secondary text,
  whatsapp        text,                  -- international format, digits only: 9647XXXXXXXXX
  email           text,
  address         text,
  map_url         text,
  facebook_url    text,
  instagram_url   text,
  linkedin_url    text,
  tiktok_url      text,
  updated_at      timestamptz not null default now()
);

create trigger settings_updated_at before update on public.settings
  for each row execute function public.set_updated_at();

insert into public.settings (id) values (1);

-- =============================================================================
-- Row Level Security
-- With RLS on, a table returns nothing unless a policy allows it.
-- Visitors use the public (publishable) key; the admin uses the same key but is
-- signed in, so is_admin() is true. Applications are inserted by the server
-- with the secret key (after validating the form and the CV), so visitors get
-- no policy at all on that table.
-- =============================================================================

alter table public.admins       enable row level security;
alter table public.companies    enable row level security;
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;
alter table public.founders     enable row level security;
alter table public.services     enable row level security;
alter table public.settings     enable row level security;

-- admins: an admin can see the list; nobody can change it from the site.
create policy "admins: admin read" on public.admins
  for select to authenticated using (public.is_admin());

-- companies
create policy "companies: public read active" on public.companies
  for select to anon, authenticated using (is_active or public.is_admin());
create policy "companies: admin write" on public.companies
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- jobs: visitors see open and closed jobs (closed pages stay reachable from
-- shared links and say applications are closed); drafts are admin only.
create policy "jobs: public read published" on public.jobs
  for select to anon, authenticated using (status in ('open', 'closed') or public.is_admin());
create policy "jobs: admin write" on public.jobs
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- applications: admin only.
create policy "applications: admin read" on public.applications
  for select to authenticated using (public.is_admin());
create policy "applications: admin update" on public.applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "applications: admin delete" on public.applications
  for delete to authenticated using (public.is_admin());

-- founders, services, settings: public read, admin write.
create policy "founders: public read" on public.founders
  for select to anon, authenticated using (true);
create policy "founders: admin write" on public.founders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "services: public read" on public.services
  for select to anon, authenticated using (true);
create policy "services: admin write" on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "settings: public read" on public.settings
  for select to anon, authenticated using (true);
create policy "settings: admin update" on public.settings
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Storage
-- "cvs"    : private. PDFs only, 5 MB max. Only the admin can open files.
-- "public" : job covers, company logos, founder photos. Anyone can view,
--            only the admin can upload or delete.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cvs', 'cvs', false, 5242880, array['application/pdf']),
  ('public', 'public', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);

create policy "cvs: admin read" on storage.objects
  for select to authenticated using (bucket_id = 'cvs' and public.is_admin());
create policy "cvs: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'cvs' and public.is_admin());

create policy "public bucket: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'public' and public.is_admin());
create policy "public bucket: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'public' and public.is_admin());
create policy "public bucket: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'public' and public.is_admin());
