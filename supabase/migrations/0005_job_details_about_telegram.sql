-- =============================================================================
-- Hire Ready: richer job details, "about me" instead of a CV, Telegram link.
-- Run after 0004_applications_one_per_phone.sql.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. New job fields
-- -----------------------------------------------------------------------------

alter table public.jobs
  add column area           text,                            -- e.g. "الكرخ", shown as "بغداد - الكرخ"
  add column work_hours     text,                            -- e.g. "8:00 - 4:00 / 6 أيام في الأسبوع"
  add column gender         text check (gender in ('male', 'female', 'any')),
  add column hide_company   boolean not null default false,  -- show "لأحد عملاء Hire Ready" instead of the name
  add column company_blurb  text,                            -- e.g. "إحدى الوكالات الرائدة في قطاع المواد الغذائية"
  add column intro          text,                            -- two lines under the title
  add column response_days  int check (response_days between 1 and 60),
  add column hiring_stages  text[] not null default '{}',    -- e.g. {مكالمة هاتفية, مقابلة حضورية}
  add column offer_days     int check (offer_days between 1 and 60);

-- -----------------------------------------------------------------------------
-- 2. What visitors can read about a job
--
-- When hide_company is on, the company's name must not reach visitors at all,
-- not even through the database API. So visitors no longer read the jobs table
-- directly: they read this view, which blanks the name and the partner link for
-- hidden jobs and only shows published (open or closed) jobs. The admin still
-- reads and edits the full table.
-- -----------------------------------------------------------------------------

drop policy "jobs: public read published" on public.jobs;
create policy "jobs: admin read" on public.jobs
  for select to authenticated using (public.is_admin());

create view public.jobs_public as
select
  id, slug, title,
  case when hide_company then null else company_name end as company_name,
  case when hide_company then null else company_id end as company_id,
  hide_company, company_blurb,
  department, governorate, area, job_type, work_hours, salary, gender, deadline,
  intro, description, responsibilities, requirements, benefits,
  response_days, hiring_stages, offer_days,
  cover_path, status, published_at, created_at, updated_at
from public.jobs
where status in ('open', 'closed');

-- The view runs with its owner's rights (it has to, to read past the admin-only
-- policy above), which is why it filters status itself.
grant select on public.jobs_public to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 3. Applications: a short "about me" can replace the CV
-- -----------------------------------------------------------------------------

alter table public.applications
  add column about text check (about is null or length(about) <= 3000),
  alter column cv_path drop not null,
  add constraint applications_cv_or_about check (cv_path is not null or length(trim(coalesce(about, ''))) > 0);

-- -----------------------------------------------------------------------------
-- 4. Telegram channel link in the site settings
-- -----------------------------------------------------------------------------

alter table public.settings add column telegram_url text;
