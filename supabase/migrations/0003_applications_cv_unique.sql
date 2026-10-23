-- =============================================================================
-- Hire Ready: each uploaded CV file belongs to exactly one application.
-- Run after 0002_content_fields.sql.
-- =============================================================================

alter table public.applications
  add constraint applications_cv_path_key unique (cv_path);
