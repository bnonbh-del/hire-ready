-- =============================================================================
-- Hire Ready: an optional English version of every job ad.
-- Run after 0006_english.sql.
--
-- Replaces the single "ad language" (jobs.language from 0006): each job now
-- has its Arabic text (required, the existing columns) and an optional English
-- copy (the *_en columns). A job "has English" when title_en is filled in.
-- English pages show the English copy, or the Arabic text with an
-- "Available in Arabic only" note when there is none.
-- =============================================================================

alter table public.jobs
  add column title_en            text,
  add column intro_en            text,
  add column company_blurb_en    text,
  add column description_en      text not null default '',
  add column responsibilities_en text[] not null default '{}',
  add column requirements_en     text[] not null default '{}',
  add column benefits_en         text[] not null default '{}',
  add column salary_en           text,
  add column work_hours_en       text,
  add column area_en             text,
  add column hiring_stages_en    text[] not null default '{}';

-- The public view: same rules as before (hidden company names blanked, only
-- open/closed jobs), plus the English columns, minus `language`.
-- It has to be dropped and recreated because a column is removed.
drop view public.jobs_public;

alter table public.jobs drop column language;

create view public.jobs_public as
select
  id, slug, title,
  case when hide_company then null else company_name end as company_name,
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
