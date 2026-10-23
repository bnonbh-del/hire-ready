# موقع Hire Ready — HR & PR Solutions

موقع توظيف عربي مبني بـ Next.js وTailwind CSS، وقاعدة بياناته على Supabase، وينشر على Vercel.

## التشغيل على جهازك

```bash
npm install        # مرة وحدة: ينزّل المكتبات
npm run dev        # يشغّل الموقع على http://localhost:3000
npm run build      # يتأكد إنو المشروع يبنى بدون أخطاء (نفس اللي يسويه Vercel)
npm run lint       # يفحص الكود من الأخطاء الشائعة
```

## ربط Supabase (مرة وحدة)

1. سوّي حساب ومشروع جديد على [supabase.com](https://supabase.com). اختاري أقرب منطقة (مثلاً Frankfurt).
2. من **SQL Editor** افتحي استعلام جديد، الصقي محتوى `supabase/migrations/0001_init.sql` كامل، واضغطي **Run**.
3. بنفس الطريقة نفّذي باقي ملفات `supabase/migrations/` بالترتيب من `0002` لحد `0009`.
4. وبعده `supabase/seed.sql` (محتوى الشركة: المؤسسين، الخدمات الأربع، معلومات التواصل).
5. من **Project Settings ← API Keys** انسخي:
   - رابط المشروع (Project URL)
   - المفتاح العام **Publishable key** (يبدي بـ `sb_publishable_`)
   - المفتاح السري **Secret key** (يبدي بـ `sb_secret_`)
6. سوّي نسخة من الملف `.env.example` وسميها `.env.local`، وحطي بيها القيم الثلاث.
7. شغّلي `npm run dev` وافتحي http://localhost:3000. صفحة الفحص لازم تطلع كل الأسطر بالأخضر.

### حساب الأستاذ إسماعيل (لوحة التحكم)

1. من **Authentication ← Users ← Add user** سوّي مستخدم بإيميله وكلمة سر قوية.
2. من **Authentication ← Sign In / Providers** طفّي **Allow new users to sign up**، حتى محد غيره يكدر يسوي حساب.
3. بـ **SQL Editor** نفّذي (بدّلي الإيميل بإيميله):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'ismail@example.com';
```

## النشر على Vercel (مجاني)

1. ارفعي المشروع على GitHub (مستودع خاص Private).
2. ادخلي [vercel.com](https://vercel.com) بحساب GitHub، واضغطي **Add New ← Project** واختاري المستودع.
3. بـ **Environment Variables** حطي نفس القيم الأربع اللي بـ `.env.local`، وبدّلي `NEXT_PUBLIC_SITE_URL` برابط الموقع على Vercel.
4. اضغطي **Deploy**. كل ما ترفعين تعديل جديد على GitHub، Vercel ينشره وحده.
5. بـ Supabase، من **Authentication ← URL Configuration** حطي رابط الموقع الجديد بـ **Site URL**.

## تنظيم الملفات

| المكان | شنو بيه |
| --- | --- |
| `src/app/` | صفحات الموقع. كل مجلد = رابط (مثلاً `src/app/jobs` = `/jobs`) |
| `src/lib/supabase/` | طرق الاتصال بـ Supabase (من السيرفر، من المتصفح، وبالمفتاح السري) |
| `src/lib/content.ts` | نصوص الشركة الثابتة: من نحن، مراحل الشغل، ليش Hire Ready، شراكتنا |
| `src/lib/constants.ts` | القوائم الثابتة: الأقسام، المحافظات، أنواع الدوام، حالات المتقدمين |
| `src/lib/types.ts` | شكل بيانات كل جدول |
| `src/app/admin/` | لوحة التحكم: الدخول، المتقدمين، الوظائف، الشركات، المؤسسين، الإعدادات |
| `src/lib/admin/` | فحص صلاحية الأدمن، البحث بالمتقدمين، ورفع الصور من اللوحة |
| `src/proxy.ts` | يحمي روابط `/admin` ويحدّث جلسة الدخول |
| `supabase/migrations/` | ملفات بناء قاعدة البيانات |
| `src/app/[lang]/` | صفحات الموقع العامة بالعربي والإنكليزي (الرئيسية، الوظائف، من نحن، خدماتنا، شركاؤنا، تواصل معنا). العربي بدون بادئة بالرابط، والإنكليزي يبدي بـ `/en`. `layout.tsx` بداخله يحط الهيدر والفوتر لكل الصفحات |
| `src/app/sitemap.ts` و `robots.ts` | خريطة الموقع لـ Google، ومنع محركات البحث من `/admin` |
| `src/app/[lang]/jobs/[slug]/` | صفحة الوظيفة، صورة الغلاف (`cover`)، وفورم التقديم (`apply`) |
| `src/lib/public-data.ts` | قراءة الوظائف والشركاء والمؤسسين والخدمات للصفحات العامة |
| `src/assets/fonts/` | خط IBM Plex Sans Arabic لرسم صورة الغلاف |
| `public/` | الشعار وصور المؤسسين |

## قواعد مهمة

- المفتاح السري (`SUPABASE_SECRET_KEY`) ينحط بس بـ `.env.local` وبإعدادات Vercel. لا ينرسل لأحد ولا ينرفع على GitHub.
- الألوان معرّفة بـ `src/app/globals.css` وهي ألوان الشعار فقط. ألوان Tailwind الجاهزة محذوفة عمداً.
- أي تغيير بالجداول ينكتب بملف SQL جديد بـ `supabase/migrations/` (مثلاً `0002_...sql`)، مو تعديل على الملف القديم.
