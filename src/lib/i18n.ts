/**
 * Site languages. Arabic lives at /…, English at /en/… (proxy.ts rewrites
 * Arabic URLs to the [lang] folder internally). Every fixed UI string of the
 * public site is here, in both languages; the company's own copy is in
 * content.ts and job ads come from the database (Arabic + optional *_en).
 * /admin stays Arabic and doesn't use this file.
 */
import type { Department, Gender, Governorate, JobType } from "@/lib/constants";

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The route's [lang] value as a Locale (anything unexpected counts as Arabic). */
export function localeOf(value: string): Locale {
  return isLocale(value) ? value : "ar";
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** "/jobs" -> "/jobs" (ar) or "/en/jobs" (en). */
export function localePath(locale: Locale, path: string): string {
  if (locale === "ar") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** "/en/jobs", "/ar/jobs" or "/jobs" -> "/jobs" (the path without its language). */
export function barePath(pathname: string): string {
  const m = pathname.match(/^\/(ar|en)(\/.*)?$/);
  return m ? m[2] || "/" : pathname;
}

/** The same page in the other language, from the current URL. */
export function switchLocalePath(pathname: string, to: Locale): string {
  return localePath(to, barePath(pathname));
}

/** Metadata `alternates` for a page that exists in both languages (canonical + hreflang). */
export function alternatesFor(locale: Locale, path: string) {
  return {
    canonical: localePath(locale, path),
    languages: { ar: localePath("ar", path), en: localePath("en", path), "x-default": localePath("ar", path) },
  };
}

/* ---------- Plural-aware counts ---------- */

/** Arabic: يوم واحد / يومين / 3 أيام / 11 يوماً. English: 1 day / 3 days. */
export function daysText(n: number, locale: Locale = "ar"): string {
  if (locale === "en") return n === 1 ? "1 day" : `${n} days`;
  if (n === 1) return "يوم واحد";
  if (n === 2) return "يومين";
  if (n >= 3 && n <= 10) return `${n} أيام`;
  return `${n} يوماً`;
}

/** Arabic: وظيفة وحدة / وظيفتين / 3 وظائف / 11 وظيفة. English: 1 job / 3 jobs. */
export function jobsCountText(n: number, locale: Locale = "ar"): string {
  if (locale === "en") return n === 1 ? "1 job" : `${n} jobs`;
  if (n === 1) return "وظيفة وحدة";
  if (n === 2) return "وظيفتين";
  if (n >= 3 && n <= 10) return `${n} وظائف`;
  return `${n} وظيفة`;
}

/* ---------- Fixed lists ---------- */

const LISTS = {
  ar: {
    departments: {
      sales: "مبيعات",
      accounting: "محاسبة",
      engineering: "هندسة",
      hr: "موارد بشرية",
      tech: "تقنية",
      marketing: "تسويق",
      management: "إدارة",
      other: "أخرى",
    } satisfies Record<Department, string>,
    jobTypes: { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" } satisfies Record<JobType, string>,
    genders: { male: "ذكر", female: "أنثى", any: "ذكر أو أنثى" } satisfies Record<Gender, string>,
    experience: { 0: "أقل من سنة", 6: "6-10", 11: "أكثر من 10" } as Record<number, string>,
  },
  en: {
    departments: {
      sales: "Sales",
      accounting: "Accounting",
      engineering: "Engineering",
      hr: "Human resources",
      tech: "Technology",
      marketing: "Marketing",
      management: "Management",
      other: "Other",
    } satisfies Record<Department, string>,
    jobTypes: { full_time: "Full time", part_time: "Part time", contract: "Contract", internship: "Internship" } satisfies Record<JobType, string>,
    genders: { male: "Male", female: "Female", any: "Male or female" } satisfies Record<Gender, string>,
    experience: { 0: "Less than a year", 6: "6-10", 11: "More than 10" } as Record<number, string>,
  },
};

export const GOVERNORATES_EN: Record<Governorate, string> = {
  بغداد: "Baghdad",
  البصرة: "Basra",
  نينوى: "Nineveh",
  أربيل: "Erbil",
  النجف: "Najaf",
  كربلاء: "Karbala",
  كركوك: "Kirkuk",
  الأنبار: "Anbar",
  ديالى: "Diyala",
  "صلاح الدين": "Salah al-Din",
  بابل: "Babylon",
  واسط: "Wasit",
  "ذي قار": "Dhi Qar",
  ميسان: "Maysan",
  المثنى: "Muthanna",
  القادسية: "Al-Qadisiyyah",
  دهوك: "Duhok",
  السليمانية: "Sulaymaniyah",
  حلبجة: "Halabja",
};

export function governorateLabel(governorate: string, locale: Locale): string {
  return locale === "en" ? (GOVERNORATES_EN[governorate as Governorate] ?? governorate) : governorate;
}
export const departmentLabel = (d: Department, locale: Locale) => LISTS[locale].departments[d];
export const jobTypeLabel = (j: JobType, locale: Locale) => LISTS[locale].jobTypes[j];
export const genderLabel = (g: Gender, locale: Locale) => LISTS[locale].genders[g];
export const departmentLabels = (locale: Locale) => LISTS[locale].departments;
export const jobTypeLabels = (locale: Locale) => LISTS[locale].jobTypes;
/** Years-of-experience option label ("1".."5" are just the number). */
export const experienceOptionLabel = (value: number, locale: Locale) => LISTS[locale].experience[value] ?? String(value);

export const HIDDEN_COMPANY_LABEL_EN = "A Hire Ready client";

/* ---------- UI strings ---------- */

const DICTIONARY = {
  ar: {
    nav: { home: "الرئيسية", jobs: "الوظائف", services: "خدماتنا", about: "من نحن", partners: "شركاؤنا", contact: "تواصل ويانا" },
    navLabel: "القائمة الرئيسية",
    openMenu: "افتح القائمة",
    closeMenu: "سد القائمة",
    /** The header's main button: the site is for job seekers. */
    jobsCta: "الوظائف المتاحة",
    /** Ready WhatsApp message for companies (only linked from the services page). */
    hiringMessage: "مرحباً، نحتاج نوظف بشركتنا وأريد أعرف تفاصيل خدمة التوظيف عند Hire Ready.",
    theme: { toDark: "الوضع الليلي", toLight: "الوضع النهاري" },
    languageSwitch: { label: "English", short: "EN" },
    footer: { pages: "الصفحات", contact: "تواصل ويانا", follow: "تابعنا", admin: "دخول الإدارة" },
    social: { instagram: "إنستغرام", linkedin: "لينكدإن", whatsapp: "واتساب", telegram: "قناة التلكرام" },
    notFound: { title: "ما لكينا هالصفحة", text: "يمكن الرابط غلط، أو الوظيفة انشالت.", home: "ارجع للرئيسية", jobs: "شوف الوظائف المتاحة" },
    home: {
      latestJobs: "آخر الفرص",
      latestIntro: "كل يوم تنزل وظائف جديدة، فلا تفوّتها.",
      allJobs: "كل الوظائف",
      noJobs: "ماكو وظائف مفتوحة هسه، بس تنزل وظائف جديدة باستمرار. تابع قناتنا حتى توصلك أول ما تنزل.",
      howToApply: "شلون تقدّم؟",
      process: "شلون نشتغل",
      partners: "شركات تشتغل ويانا",
      allPartners: "كل الشركات",
      telegramTitle: "خلي الوظائف توصلك أول بأول",
      telegramText: "تابع قناتنا على تلكرام، وكل وظيفة جديدة توصلك أول ما تنزل.",
      telegramButton: "تابع القناة",
      instagramText: "تابعنا على إنستغرام، وكل وظيفة جديدة توصلك أول ما تنزل.",
      instagramButton: "تابعنا على إنستغرام",
      founders: "منو ورا Hire Ready",
      aboutMore: "تعرف علينا أكثر",
      faq: "عندك سؤال؟",
      freeBadge: "التقديم مجاني",
    },
    search: {
      title: "شنو الوظيفة اللي تدور عليها؟",
      titleExample: "مثلاً: محاسب",
      governorate: "المحافظة",
      allGovernorates: "كل المحافظات",
      department: "القسم",
      allDepartments: "كل الأقسام",
      jobType: "نوع الدوام",
      allJobTypes: "كل الأنواع",
      submit: "دوّر",
      clear: "شيل الفلاتر",
    },
    jobCard: { details: "شوف التفاصيل", posted: "نزلت" },
    /** Shown on a job that has no version in the page's language. */
    otherLanguageOnly: "متوفرة بالإنكليزي بس",
    jobs: {
      metaTitle: "الوظائف",
      metaDescription: "وظائف حقيقية بشركات عراقية، دوّر بالمسمى أو المحافظة أو القسم وقدّم بدقيقتين.",
      heading: "الوظائف المتاحة",
      intro: "دوّر بالمسمى أو المحافظة أو القسم، واقرا التفاصيل، وقدّم من صفحة الوظيفة مباشرة.",
      results: "نتائج البحث",
      emptyPage: "هالصفحة ما بيها وظائف.",
      emptyFiltered: "ما لكينا وظائف تطابق بحثك. جرّب كلمة ثانية، أو شيل بعض الفلاتر.",
      empty: "ماكو وظائف مفتوحة هسه، بس تنزل وظائف جديدة باستمرار.",
      clearAll: "شيل الفلاتر وشوف كل الوظائف",
      pages: "الصفحات",
      pageOf: (page: number, pages: number) => `صفحة ${page} من ${pages}`,
      previous: "السابقة",
      next: "التالية",
    },
    job: {
      factsLabel: "معلومات الوظيفة",
      location: "الموقع",
      hours: "أوقات الدوام",
      salary: "الراتب",
      type: "نوع الدوام",
      gender: "الجنس",
      deadline: "آخر يوم للتقديم",
      about: "عن الوظيفة",
      responsibilities: "شنو راح تسوي",
      requirements: "شنو نحتاج منك",
      benefits: "شنو تحصّل",
      apply: "قدّم الآن",
      closed: "التقديم على هالوظيفة تسكّر.",
      deadlinePassed: "فات آخر يوم للتقديم على هالوظيفة.",
      share: { copy: "انسخ الرابط", copied: "تم النسخ", telegram: "شاركها بتلكرام", whatsapp: "شاركها بواتساب" },
    },
    apply: {
      metaTitle: (title: string) => `قدّم على ${title}`,
      heading: "قدّم على وظيفة",
      summaryLabel: "عن الوظيفة",
      respondWithin: (days: string) => `نرد عليك خلال ${days}`,
      stages: "شلون يمشي التوظيف",
      then: " ثم ",
      offerWithin: (days: string) => `العرض يوصلك خلال ${days} بعد المقابلة`,
      back: "ارجع لتفاصيل الوظيفة",
    },
    form: {
      requiredNote: ["الخانات اللي جنبها", "لازم تتعبى."],
      requiredSr: " (لازم تتعبى)",
      optional: "(اختياري)",
      fullName: "اسمك الكامل",
      phone: "رقم موبايلك",
      phoneHint: "رقم عراقي، والأحسن يكون عليه واتساب.",
      email: "إيميلك",
      governorate: "محافظتك",
      chooseGovernorate: "اختار محافظتك",
      experience: "سنوات خبرتك",
      choose: "اختار",
      cv: "سيرتك الذاتية",
      cvMark: "(أو اكتب نبذة تحت)",
      cvHint: "ملف PDF بس، وأقصى حجم 5 ميغابايت.",
      chooseFile: "اختار الملف من جهازك",
      about: "نبذة عنك",
      aboutMark: "(إذا ما رفعت سيرة)",
      aboutHint: "ما عندك سيرة ذاتية؟ عادي، احجيلنا هنا عن خبرتك وأماكن شغلك السابقة وسنوات خبرتك.",
      submit: "أرسل طلبي",
      uploading: "دا نرفع سيرتك...",
      saving: "دا نرسل طلبك...",
      doneTitle: "وصلنا طلبك!",
      doneText: (title: string) =>
        `شكراً لأنك قدّمت على وظيفة ${title}. راح نراجع طلبك، وإذا ملفك يناسب الوظيفة نتصل بيك على رقمك.`,
      backToJob: "ارجع لصفحة الوظيفة",
      close: "سد",
      consent: "بإرسال طلبك، توافق إن فريق Hire Ready يحتفظ بيه ويشاركه ويا الشركة صاحبة الوظيفة، وممكن نتواصل وياك لوظائف ثانية تناسبك.",
      errors: {
        fullName: "نسيت تكتب اسمك.",
        fullNameLong: "الاسم طويل شوية، اكتبه أقصر.",
        phone: "نسيت تكتب رقمك.",
        phoneInvalid: "الرقم مو مضبوط. اكتب رقم موبايل عراقي، مثل 07701234567.",
        email: "نسيت تكتب إيميلك.",
        emailInvalid: "الإيميل مو مضبوط، تأكد منه.",
        governorate: "اختار محافظتك.",
        experience: "اختار سنوات خبرتك.",
        aboutLong: (max: number) => `النبذة طويلة شوية، خليها أقل من ${max} حرف.`,
        cvOrAbout: "ارفع سيرتك الذاتية، أو اكتب نبذة عنك. واحد منهم يكفي.",
        cvNotPdf: "السيرة لازم تكون ملف PDF.",
        cvTooBig: "الملف أكبر من 5 ميغابايت، جرّب ملف أصغر.",
        cvInvalid: "الملف مو PDF سليم، جرّب ملف ثاني.",
        cvMissing: "الملف ما وصلنا، ارفعه مرة ثانية.",
        cvAgain: "ارفع سيرتك مرة ثانية لو سمحت.",
        uploadFailed: "الملف ما انرفع. تأكد من الإنترنت وجرّب مرة ثانية.",
        closed: "التقديم على هالوظيفة تسكّر.",
        alreadyApplied: "إنت مقدّم على هالوظيفة من قبل، وطلبك واصلنا.",
        generic: "صار خلل من عدنا، جرّب بعد شوية.",
        network: "يبين الإنترنت مقطوع. تأكد منه وجرّب مرة ثانية.",
        fixFields: "باقي كم خانة تحتاج تصليح، مأشرة بالأحمر.",
      },
    },
    about: {
      metaTitle: "من نحن",
      heading: "من نحن",
      goal: "هدفنا",
      founded: "تأسست",
      fields: "المجالات",
      founders: "المؤسسين",
      linkedin: "لينكدإن",
    },
    services: {
      metaTitle: "خدماتنا",
      metaDescription: "التوظيف واستقطاب المواهب، حلول الموارد البشرية، التدريب والتطوير، والعلاقات العامة والاتصال المؤسسي.",
      heading: "خدماتنا",
      why: "ليش Hire Ready",
      contact: "تواصل ويانا",
      /** The one place on the site that speaks to companies. */
      forCompanies: "تمثل شركة وتحتاج موظفين؟",
      forCompaniesLink: "راسلنا على واتساب",
    },
    contact: {
      metaTitle: "تواصل ويانا",
      metaDescription: "أرقام Hire Ready والإيميل والعنوان وحسابات التواصل.",
      heading: "تواصل ويانا",
      intro: "عندك سؤال عن وظيفة أو عن طلبك؟ راسلنا على واتساب، هي أسرع طريقة توصلنا.",
      whatsappTitle: "راسلنا على واتساب",
      whatsappNumber: "رقم واتساب: ",
      openWhatsapp: "افتح واتساب",
      applicantWhatsapp: "استفسار عن وظيفة",
      applicantMessage: "مرحباً، عندي استفسار عن وظيفة: ",
      phone: "الهاتف",
      email: "الإيميل",
      address: "العنوان",
      openMap: "افتح الخريطة",
      accounts: "حساباتنا",
    },
    partners: {
      metaTitle: "شركاؤنا",
      heading: "شركات تشتغل ويانا",
      text: "هذني الشركات اللي نوظّف إلها، ووظائفها تنزل عدنا.",
      noLogo: "بدون شعار",
    },
  },
  en: {
    nav: { home: "Home", jobs: "Jobs", services: "Services", about: "About", partners: "Partners", contact: "Contact" },
    navLabel: "Main menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    jobsCta: "Open jobs",
    hiringMessage: "Hello, we're looking to hire for our company and would like to know more about Hire Ready's recruitment service.",
    theme: { toDark: "Dark mode", toLight: "Light mode" },
    languageSwitch: { label: "العربية", short: "ع" },
    footer: { pages: "Pages", contact: "Get in touch", follow: "Follow us", admin: "Staff login" },
    social: { instagram: "Instagram", linkedin: "LinkedIn", whatsapp: "WhatsApp", telegram: "Telegram channel" },
    notFound: { title: "We couldn't find that page", text: "The link may be wrong, or the job may have been taken down.", home: "Back to home", jobs: "See open jobs" },
    home: {
      latestJobs: "Latest openings",
      latestIntro: "New jobs are posted regularly. Don't miss them.",
      allJobs: "All jobs",
      noJobs: "No open jobs right now, but new ones come up regularly. Follow our channel to hear first.",
      howToApply: "How to apply",
      process: "How we work",
      partners: "Companies we work with",
      allPartners: "All companies",
      telegramTitle: "Get new jobs as soon as they're posted",
      telegramText: "Follow our Telegram channel, and every new job reaches you the moment it's posted.",
      telegramButton: "Follow the channel",
      instagramText: "Follow us on Instagram, and every new job reaches you the moment it's posted.",
      instagramButton: "Follow us on Instagram",
      founders: "The people behind Hire Ready",
      aboutMore: "Learn more about us",
      faq: "Got questions?",
      freeBadge: "Applying is free",
    },
    search: {
      title: "What job are you looking for?",
      titleExample: "e.g. Accountant",
      governorate: "Governorate",
      allGovernorates: "All governorates",
      department: "Department",
      allDepartments: "All departments",
      jobType: "Job type",
      allJobTypes: "All types",
      submit: "Search",
      clear: "Clear filters",
    },
    jobCard: { details: "See details", posted: "Posted" },
    otherLanguageOnly: "Available in Arabic only",
    jobs: {
      metaTitle: "Jobs",
      metaDescription: "Real jobs at Iraqi companies. Search by title, governorate or department, and apply in two minutes.",
      heading: "Open jobs",
      intro: "Search by title, governorate or department, read the details, and apply straight from the job page.",
      results: "Search results",
      emptyPage: "There are no jobs on this page.",
      emptyFiltered: "No jobs match your search. Try another word or clear some filters.",
      empty: "No open jobs right now, but new ones come up regularly.",
      clearAll: "Clear filters and see all jobs",
      pages: "Pages",
      pageOf: (page: number, pages: number) => `Page ${page} of ${pages}`,
      previous: "Previous",
      next: "Next",
    },
    job: {
      factsLabel: "Job details",
      location: "Location",
      hours: "Working hours",
      salary: "Salary",
      type: "Job type",
      gender: "Gender",
      deadline: "Apply by",
      about: "About the job",
      responsibilities: "What you'll do",
      requirements: "What we're looking for",
      benefits: "What you get",
      apply: "Apply now",
      closed: "Applications for this job have closed.",
      deadlinePassed: "The deadline for this job has passed.",
      share: { copy: "Copy link", copied: "Copied", telegram: "Share on Telegram", whatsapp: "Share on WhatsApp" },
    },
    apply: {
      metaTitle: (title: string) => `Apply for ${title}`,
      heading: "Apply for",
      summaryLabel: "About the job",
      respondWithin: (days: string) => `We'll get back to you within ${days}`,
      stages: "How hiring works",
      then: ", then ",
      offerWithin: (days: string) => `You'll get an offer within ${days} after the interview`,
      back: "Back to the job details",
    },
    form: {
      requiredNote: ["Fields marked", "are required."],
      requiredSr: " (required)",
      optional: "(optional)",
      fullName: "Your full name",
      phone: "Your mobile number",
      phoneHint: "An Iraqi number, ideally one with WhatsApp.",
      email: "Your email",
      governorate: "Your governorate",
      chooseGovernorate: "Pick your governorate",
      experience: "Years of experience",
      choose: "Pick one",
      cv: "Your CV",
      cvMark: "(or write a summary below)",
      cvHint: "PDF only, up to 5 MB.",
      chooseFile: "Choose a file from your device",
      about: "About you",
      aboutMark: "(if you don't upload a CV)",
      aboutHint: "No CV? No problem. Tell us about your experience, previous jobs and years of experience here.",
      submit: "Send my application",
      uploading: "Uploading your CV...",
      saving: "Sending your application...",
      doneTitle: "We've got your application!",
      doneText: (title: string) => `Thanks for applying for ${title}. We'll review it, and if your profile fits the role, we'll call you.`,
      backToJob: "Back to the job page",
      close: "Close",
      consent: "By submitting, you agree that Hire Ready may keep your application, share it with the hiring company, and contact you about other suitable jobs.",
      errors: {
        fullName: "Don't forget your full name.",
        fullNameLong: "That name is a bit long, please shorten it.",
        phone: "Don't forget your phone number.",
        phoneInvalid: "That number doesn't look right. Use an Iraqi mobile, e.g. 07701234567.",
        email: "Don't forget your email.",
        emailInvalid: "That email doesn't look right. Mind checking it?",
        governorate: "Pick your governorate.",
        experience: "Pick your years of experience.",
        aboutLong: (max: number) => `Your summary is a bit long. Keep it under ${max} characters.`,
        cvOrAbout: "Upload your CV or write a short summary. Either one is enough.",
        cvNotPdf: "Your CV needs to be a PDF.",
        cvTooBig: "The file is over 5 MB. Try a smaller one.",
        cvInvalid: "That file isn't a valid PDF. Try another one.",
        cvMissing: "We didn't receive the file. Please upload it again.",
        cvAgain: "Please upload your CV again.",
        uploadFailed: "The file didn't upload. Check your connection and try again.",
        closed: "Applications for this job have closed.",
        alreadyApplied: "You've already applied for this job, and we have your application.",
        generic: "Something went wrong on our side. Please try again in a bit.",
        network: "Looks like you're offline. Check your connection and try again.",
        fixFields: "A few fields need a quick fix. They're marked in red.",
      },
    },
    about: {
      metaTitle: "About us",
      heading: "About us",
      goal: "Our goal",
      founded: "Founded",
      fields: "Fields",
      founders: "Founders",
      linkedin: "LinkedIn",
    },
    services: {
      metaTitle: "Services",
      metaDescription: "Recruitment and talent acquisition, HR solutions, training and development, and PR and corporate communication.",
      heading: "Our services",
      why: "Why Hire Ready",
      contact: "Get in touch",
      forCompanies: "Representing a company and need to hire?",
      forCompaniesLink: "Message us on WhatsApp",
    },
    contact: {
      metaTitle: "Contact",
      metaDescription: "Hire Ready's phone numbers, email, address and social accounts.",
      heading: "Get in touch",
      intro: "Got a question about a job or your application? Message us on WhatsApp, it's the fastest way to reach us.",
      whatsappTitle: "Message us on WhatsApp",
      whatsappNumber: "WhatsApp number: ",
      openWhatsapp: "Open WhatsApp",
      applicantWhatsapp: "Ask about a job",
      applicantMessage: "Hello, I have a question about a job: ",
      phone: "Phone",
      email: "Email",
      address: "Address",
      openMap: "Open map",
      accounts: "Our accounts",
    },
    partners: {
      metaTitle: "Partners",
      heading: "Companies we work with",
      text: "These are the companies we hire for. Their jobs are posted here.",
      noLogo: "No logo",
    },
  },
};

export type Dictionary = (typeof DICTIONARY)["ar"];

export function t(locale: Locale): Dictionary {
  return DICTIONARY[locale];
}
