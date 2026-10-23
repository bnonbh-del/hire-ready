-- =============================================================================
-- Hire Ready: starting content (the company's final, approved content)
-- Run after 0001_init.sql and 0002_content_fields.sql.
-- Safe to run again: it resets founders and services to this content, so don't
-- re-run it after editing those from /admin.
-- =============================================================================

-- Founders. Photos live in web/public/founders/. Bios and LinkedIn links stay
-- empty on purpose: they are filled from /admin with the real text.
delete from public.founders;
insert into public.founders (name, role, bio, photo_path, linkedin_url, sort_order) values
  ('إسماعيل العبيدي', 'شريك مؤسس والرئيس التنفيذي', '', '/founders/ismail-alobaidi.jpg', null, 1),
  ('زينب الحسيني', 'شريكة مؤسسة ورئيسة العمليات', '', '/founders/zainab-alhusseini.jpg', null, 2);

-- Services.
delete from public.services;
insert into public.services (title, title_en, description, sort_order) values
  ('التوظيف واستقطاب المواهب', 'Recruitment & Talent Acquisition',
   'نوصل الشركات للمرشحين المناسبين، بعد فلترة وتقييم احترافي.', 1),
  ('حلول الموارد البشرية', 'HR Solutions & Consulting',
   'استشارات وحلول عملية لتطوير أنظمة وإجراءات الموارد البشرية.', 2),
  ('التدريب والتطوير', 'Training & Development',
   'برامج تدريبية لتطوير مهارات الموظفين ورفع الأداء.', 3),
  ('العلاقات العامة والاتصال المؤسسي', 'PR & Corporate Solutions',
   'نساعد الشركات تبني حضور أقوى وتعزز علاقاتها وصورتها.', 4);

-- Contact details. WhatsApp is stored in international format, digits only.
update public.settings
set phone_primary   = '07734448817',
    phone_secondary = null,
    whatsapp        = '9647734448817',
    email           = 'hireeready@gmail.com',
    address         = 'بغداد، العراق',
    map_url         = null,
    instagram_url   = 'https://www.instagram.com/hireready.iq/',
    linkedin_url    = 'https://www.linkedin.com/company/hiree-ready/'
where id = 1;

-- Companies: no rows on purpose. The partners section stays hidden until real
-- contracted companies are added from /admin.

-- -----------------------------------------------------------------------------
-- Making Ismail an admin (run AFTER creating his user in
-- Authentication -> Users -> Add user). Replace the email with his real one.
-- -----------------------------------------------------------------------------
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'ismail@example.com';
