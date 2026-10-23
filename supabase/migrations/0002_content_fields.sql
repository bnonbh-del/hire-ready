-- =============================================================================
-- Hire Ready: fields needed by the final company content
-- Run after 0001_init.sql (Dashboard -> SQL Editor -> paste -> Run).
-- =============================================================================

-- Each service has an English name shown under the Arabic title,
-- e.g. "التوظيف واستقطاب المواهب" / "Recruitment & Talent Acquisition".
alter table public.services add column if not exists title_en text;

-- The company only uses Instagram, LinkedIn and WhatsApp.
alter table public.settings drop column if exists facebook_url;
alter table public.settings drop column if exists tiktok_url;
