-- =============================================================================
-- Hire Ready: one application per phone number per job.
-- Phones are stored normalized (07XXXXXXXXX), so "+964 770..." and "0770..."
-- count as the same number.
-- Run after 0003_applications_cv_unique.sql.
-- =============================================================================

alter table public.applications
  add constraint applications_job_phone_key unique (job_id, phone);
