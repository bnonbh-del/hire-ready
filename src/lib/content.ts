import type { Locale } from "@/lib/i18n";

/**
 * The company's final, approved text. Pages take their copy from here (or from
 * the database for anything editable in /admin: services, founders, contact
 * details, partner companies). Don't add slogans, numbers or claims that aren't
 * in this file.
 */

export const COMPANY = {
  name: "Hire Ready",
  nameFull: "Hire Ready | HR & PR Solutions",
  descriptor: "HR & PR Solutions",
  founded: 2025,
  tagline: {
    en: "Building Better Teams. Creating Better Businesses.",
    ar: "نبني فرق أفضل، لشركات أنجح.",
  },
  fields: ["HR", "التوظيف", "PR", "التدريب"],
} as const;

export const ABOUT = {
  paragraphs: [
    "في Hire Ready نربط احتياجات الشركات بالكفاءات المناسبة، من خلال التوظيف والموارد البشرية والتدريب والعلاقات العامة. نبدي بفهم احتياج كل شركة، لأن اللي يناسب جهة ممكن ما يناسب غيرها.",
    "شغلنا يبدي من الاستقطاب والتقييم والتوظيف، ويوصل للتدريب والاستشارات. وكل حل نصممه حسب طبيعة الشركة واحتياجها.",
  ],
  goal: "نكون شريك حقيقي للشركات ببناء فرق أكفأ وبيئة عمل أفضل.",
} as const;

/** Shown under the services list. The services themselves are in the database. */
export const SERVICES_NOTE = "ما عدنا خدمة وحدة للكل، نصمم الحل حسب احتياج كل شركة.";

/** "شلون نشتغل" (services page): four stages on a timeline. */
export const PROCESS = [
  { title: "نفهم احتياج الشركة", text: "نحدد متطلبات الوظيفة والمهارات المطلوبة وطبيعة العمل." },
  { title: "نبحث عن المرشحين", text: "نستقطب الأشخاص اللي تتوافق خبراتهم ومهاراتهم ويا متطلبات الوظيفة." },
  { title: "نراجع ونقيّم", text: "نراجع السير الذاتية ونسوي المقابلات والتقييمات." },
  { title: "ننسّق ونتابع", text: "ننسّق المقابلات ويا الشركة ونتابع بعد التعيين." },
] as const;

export const WHY_US = {
  points: [
    { title: "فهم دقيق", text: "نحدد احتياجك ومتطلبات الوظيفة." },
    { title: "فلترة احترافية", text: "نختار المرشحين حسب معايير واضحة." },
    { title: "تقييم حقيقي", text: "نشوف المهارات والخبرة والملاءمة." },
    { title: "تأهيل ومتابعة", text: "نجهّز المرشح ونتابع تجربة التوظيف." },
  ],
  note: "نقدم حلول مبنية على فهم احتياج الشركة، مو بس ترشيح أسماء.",
} as const;

/** Small section aimed at companies. */
export const PARTNERSHIP = {
  title: "شراكتنا ويّاك",
  text: "علاقتنا ما تخلص عند تقديم المرشح. نشتغل وياك حتى تكون تجربة التوظيف أكفأ ونتايجها تدوم.",
  steps: ["نفهم احتياجك", "نقدم الحل", "نتابع النتائج"],
} as const;

/*
 * The same content in both languages, for pages that have an English version.
 * English is a translation of the approved Arabic above: nothing added.
 */

const CONTENT_BY_LOCALE = {
  ar: {
    /** The tagline split so the middle part can carry the logo gradient (footer only). */
    tagline: { before: "نبني ", highlight: "فرق أفضل", after: "، لشركات أنجح." },
    /** Home page hero, written for job seekers. `highlight` is shown in the accent colour. */
    hero: {
      before: "",
      highlight: "وظيفتك الجاية",
      after: " تبدي من هنا",
      text: "وظائف حقيقية بشركات عراقية، نتابعها بنفسنا من أول اتصال لحد يوم المباشرة. دوّر على اللي يناسبك، وقدّم بدقيقتين.",
    },
    /** "شلون تقدّم؟" on the home page. */
    applySteps: [
      { title: "اختار الوظيفة", text: "دوّر بالمسمى أو المحافظة، واقرا التفاصيل كاملة." },
      { title: "قدّم بدقيقتين", text: "ارفع سيرتك الذاتية، وإذا ما عندك، اكتب نبذة عن خبرتك." },
      { title: "نتواصل وياك", text: "إذا ملفك يناسب الوظيفة، نتصل بيك ونرتب المقابلة." },
    ],
    fields: COMPANY.fields,
    about: ABOUT,
    servicesNote: SERVICES_NOTE,
    process: PROCESS,
    whyUs: WHY_US,
    partnership: PARTNERSHIP,
    /** Questions applicants ask (home page + contact page). Approved wording; don't edit. */
    faq: [
      { q: "هل التقديم مجاني؟", a: "إي، التقديم على كل الوظائف مجاني بالكامل، وما ناخذ أي مبلغ من المتقدمين." },
      { q: "ما عندي سيرة ذاتية، أكدر أقدّم؟", a: "إي، اكتب نبذة عن خبرتك وأماكن شغلك السابقة بخانة \"نبذة عنك\"، وتوصلنا نفس الشي." },
      { q: "شكد ياخذ الرد؟", a: "كل وظيفة مكتوب بيها مدة الرد. نراجع كل الطلبات، ونتصل بالمرشحين اللي ملفهم يناسب الوظيفة." },
      {
        q: "ما اتصلتوا بيه، شنو يعني؟",
        a: "يعني ما ترشحت لهالوظيفة بالذات. بس طلبك يبقى محفوظ عدنا، وممكن نتواصل وياك إذا طلعت وظيفة ثانية تناسبك.",
      },
      { q: "أكدر أقدّم على أكثر من وظيفة؟", a: "إي، قدّم على كل وظيفة تناسبك، بس مرة وحدة لكل وظيفة." },
      { q: "منو يشوف معلوماتي؟", a: "طلبك يوصل لفريق Hire Ready أول. وإذا ترشحت، نشاركه ويا الشركة صاحبة الوظيفة." },
    ],
  },
  en: {
    tagline: { before: "Building ", highlight: "Better Teams", after: ". Creating Better Businesses." },
    hero: {
      before: "Your ",
      highlight: "next job",
      after: " starts here",
      text: "Real jobs at Iraqi companies, followed up by our team from the first call to your first day. Find what fits you and apply in two minutes.",
    },
    applySteps: [
      { title: "Pick a job", text: "Search by title or governorate, and read all the details." },
      { title: "Apply in two minutes", text: "Upload your CV. No CV? Write a short summary of your experience instead." },
      { title: "We get in touch", text: "If your profile fits the role, we'll call you and set up the interview." },
    ],
    fields: ["HR", "Recruitment", "PR", "Training"],
    about: {
      paragraphs: [
        "At Hire Ready, we connect companies' needs with the right talent through recruitment, HR, training and public relations. We start by understanding each company's needs, because what fits one organization may not fit another.",
        "Our work starts with sourcing, assessment and hiring, and extends to training and consulting. Every solution is designed around the company's nature and needs.",
      ],
      goal: "To be a real partner for companies in building more capable teams and a better work environment.",
    },
    servicesNote: "There's no one-size-fits-all service. We design the solution around each company's needs.",
    process: [
      { title: "Understand the company's needs", text: "We define the job's requirements, the skills it needs and the nature of the work." },
      { title: "Find candidates", text: "We source people whose experience and skills match the job's requirements." },
      { title: "Review and assess", text: "We review CVs and run interviews and assessments." },
      { title: "Coordinate and follow up", text: "We arrange interviews with the company and follow up after the hire." },
    ],
    whyUs: {
      points: [
        { title: "Clear understanding", text: "We define your needs and the job's requirements." },
        { title: "Professional screening", text: "We select candidates against clear criteria." },
        { title: "Real assessment", text: "We look at skills, experience and fit." },
        { title: "Preparation and follow-up", text: "We prepare the candidate and follow the hiring experience." },
      ],
      note: "Our solutions are built on understanding what the company needs, not just sending names.",
    },
    partnership: {
      title: "Our partnership with you",
      text: "Our work doesn't end when we present a candidate. We work with you so hiring is more efficient and the results last.",
      steps: ["Understand your needs", "Deliver the solution", "Follow up on results"],
    },
    faq: [
      { q: "Is applying free?", a: "Yes, applying to any job is completely free. We never charge applicants." },
      { q: "I don't have a CV. Can I still apply?", a: "Yes. Write a short summary of your experience and previous jobs in the \"About you\" field." },
      {
        q: "How long until I hear back?",
        a: "Each job shows its expected response time. We review every application and contact candidates whose profile fits the role.",
      },
      {
        q: "You didn't contact me. What does that mean?",
        a: "It means you weren't shortlisted for this specific role. Your application stays with us, and we may reach out if another suitable job comes up.",
      },
      { q: "Can I apply to more than one job?", a: "Yes, apply to every job that fits you, once per job." },
      { q: "Who sees my information?", a: "Your application goes to the Hire Ready team first. If you're shortlisted, we share it with the hiring company." },
    ],
  },
} as const;

export function content(locale: Locale) {
  return CONTENT_BY_LOCALE[locale];
}
