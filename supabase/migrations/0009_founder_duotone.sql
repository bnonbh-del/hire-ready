-- =============================================================================
-- Hire Ready: a second founder photo in the brand colours (duotone).
-- Run after 0008_english_names.sql.
--
-- The founder cards show the duotone photo and fade to the real one on hover
-- (or when the card reaches the middle of the screen on phones). Both are
-- uploaded from /admin/founders; empty duotone = the real photo only.
-- =============================================================================

alter table public.founders add column if not exists photo_duotone_path text;

-- The new 800x1000 photos in web/public/founders (replacing the old 400x400 ones).
update public.founders
  set photo_path = '/founders/ismail.jpg', photo_duotone_path = '/founders/ismail_duotone.jpg'
  where name = 'إسماعيل العبيدي';

update public.founders
  set photo_path = '/founders/zainab.jpg', photo_duotone_path = '/founders/zainab_duotone.jpg'
  where name = 'زينب الحسيني';
