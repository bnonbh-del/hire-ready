-- =============================================================================
-- Hire Ready: English names (founders, partner companies, a job's company).
-- Run after 0007_job_english_fields.sql.
-- All optional: when an English name is empty, the original name is shown.
-- =============================================================================

alter table public.founders  add column if not exists name_en text;
alter table public.companies add column if not exists name_en text;
alter table public.jobs      add column if not exists company_name_en text;

update public.founders set name_en = 'Ismail Al-Obaidi'   where name = 'إسماعيل العبيدي' and name_en is null;
update public.founders set name_en = 'Zainab Al-Husseini' where name = 'زينب الحسيني'   and name_en is null;

-- The public view again, now also blanking the English company name of
-- hidden-company jobs (the real name must never reach visitors).
drop view public.jobs_public;

create view public.jobs_public as
select
  id, slug, title,
  case when hide_company then null else company_name end as company_name,
  case when hide_company then null else company_name_en end as company_name_en,
  case when hide_company then null else company_id end as company_id,
  hide_company, company_blurb,
  department, governorate, area, job_type, work_hours, salary, gender, deadline,
  intro, description, responsibilities, requirements, benefits,
  response_days, hiring_stages, offer_days,
  title_en, intro_en, company_blurb_en, description_en,
  responsibilities_en, requirements_en, benefits_en,
  salary_en, work_hours_en, area_en, hiring_stages_en,
  cover_path, status, published_at, created_at, updated_at
from public.jobs
where status in ('open', 'closed');

grant select on public.jobs_public to anon, authenticated;
