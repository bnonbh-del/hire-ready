-- =============================================================================
-- Hire Ready: English site + per-job ad language.
-- Run after 0005_job_details_about_telegram.sql.
-- =============================================================================

-- 1. Each job ad is written in one language and always shown in it
--    (page direction, link preview image, channel post), whatever the site language.
alter table public.jobs
  add column language text not null default 'ar' check (language in ('ar', 'en'));

-- The public view gets the new column too (same definition as 0005, plus `language`).
create or replace view public.jobs_public as
select
  id, slug, title,
  case when hide_company then null else company_name end as company_name,
  case when hide_company then null else company_id end as company_id,
  hide_company, company_blurb,
  department, governorate, area, job_type, work_hours, salary, gender, deadline,
  intro, description, responsibilities, requirements, benefits,
  response_days, hiring_stages, offer_days,
  cover_path, status, published_at, created_at, updated_at,
  language
from public.jobs
where status in ('open', 'closed');

-- 2. English versions of the content edited in /admin.
alter table public.services add column if not exists description_en text;
alter table public.founders add column if not exists role_en text;
alter table public.founders add column if not exists bio_en text not null default '';
alter table public.settings add column if not exists address_en text;

update public.services set description_en = case title_en
  when 'Recruitment & Talent Acquisition' then 'We connect companies with the right candidates, after careful screening and assessment.'
  when 'HR Solutions & Consulting' then 'Practical consulting and solutions that improve HR systems and procedures.'
  when 'Training & Development' then 'Training programs that build employee skills and raise performance.'
  when 'PR & Corporate Solutions' then 'We help companies build a stronger presence and strengthen their relationships and reputation.'
  else description_en
end;

update public.founders set role_en = 'Co-Founder & CEO' where name = 'إسماعيل العبيدي';
update public.founders set role_en = 'Co-Founder & COO' where name = 'زينب الحسيني';

update public.settings set address_en = 'Baghdad, Iraq' where id = 1 and address = 'بغداد، العراق';
