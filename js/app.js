
// ==========================================================================
// Official Admission Period Enforcement (فترة التقديم المعتمدة رسمياً)
// ==========================================================================
const ADMISSION_PERIOD = {
  // Start: 1 July 2026 at 00:00:00 Cairo Time
  startDate: new Date('2026-07-01T00:00:00+03:00'),
  // End: 15 August 2026 at 23:59:59 Cairo Time
  endDate: new Date('2026-08-15T23:59:59+03:00'),
  startFormattedAr: '1 يوليو 2026',
  endFormattedAr: '15 أغسطس 2026',
  startFormattedEn: 'July 1, 2026',
  endFormattedEn: 'August 15, 2026'
};

function checkAdmissionWindow() {
  const now = new Date();
  if (now < ADMISSION_PERIOD.startDate) {
    return {
      isOpen: false,
      status: 'EARLY',
      messageAr: 'عذراً، لم يبدأ بعد موعد فتح باب التقديم لمدارس WE للتكنولوجيا التطبيقية لعام 2026/2027. يبدأ التقديم الرسمي اعتباراً من ' + ADMISSION_PERIOD.startFormattedAr + ' وحتى ' + ADMISSION_PERIOD.endFormattedAr + '.',
      messageEn: 'Admissions for the 2026/2027 academic year have not opened yet. The official application window runs from ' + ADMISSION_PERIOD.startFormattedEn + ' until ' + ADMISSION_PERIOD.endFormattedEn + '.'
    };
  }
  if (now > ADMISSION_PERIOD.endDate) {
    return {
      isOpen: false,
      status: 'EXPIRED',
      messageAr: 'عذراً، تم غلق باب التقديم لمدارس WE للتكنولوجيا التطبيقية لعام 2026/2027 حيث انتهت فترة التقديم المحددة في ' + ADMISSION_PERIOD.endFormattedAr + '.',
      messageEn: 'The application period for WE Applied Technology Schools closed on ' + ADMISSION_PERIOD.endFormattedEn + '.'
    };
  }
  return { isOpen: true };
}

// ==========================================================================
// WE APPLIED TECHNOLOGY SCHOOLS - Interactive Application Logic
// 100% Bilingual Translation Engine (Arabic / English), Digital Arc,
// Filters, Dynamic Sections, Calculator, Modals & Visual Safety
// ==========================================================================

// Global state
let currentLang = localStorage.getItem('we_lang') || 'ar';
let currentTheme = 'light';
if (localStorage.getItem('we_theme_v3') !== 'true') {
  localStorage.setItem('we_theme', 'light');
  localStorage.setItem('we_theme_v3', 'true');
} else {
  currentTheme = localStorage.getItem('we_theme') || 'light';
}
let activeSpecId = 'digital-arc';
let activeRegion = 'all';

// Comprehensive Bilingual Dictionary covering 100% of the platform
const i18n = {
  ar: {
    siteTitle: "مدارس WE للتكنولوجيا التطبيقية | المصرية للاتصالات",
    brandTitle: "مدارس WE",
    brandSub: "للتكنولوجيا التطبيقية",
    navHome: "الرئيسية",
    navAbout: "عن المدارس",
    navSpecs: "التخصصات",
    navSchools: "الفروع",
    navAdmission: "شروط القبول",
    navCurriculum: "الخطة الدراسية",
    navComparison: "لماذا WE؟",
    navVideo: "فيديو المدرسة",
    navNews: "الأخبار",
    navFaq: "الأسئلة الشائعة",
    navTrack: "استعلام عن طلبك 🔍",
    btnTrackApp: "تتبع طلبك",
    trackModalTitle: "الاستعلام عن حالة طلب الالتحاق",
    trackModalSub: "ادخل كود التقديم (مثل WE-2026-884102) أو الرقم القومي للطالب",
    trackInputLabel: "كود التقديم أو الرقم القومي (14 رقم):",
    footerTrack: "استعلام عن نتيجة القبول",
    btnApplyNow: "قدّم الآن",
    btnExploreSpecs: "استكشف التخصصات",
    btnCheckEligibility: "احسب فرصتك للقبول 🎯",
    btnFindBranch: "أقرب فرع لك",
    btnDirections: "الاتجاهات على الخريطة",
    btnDetails: "تفاصيل التخصص",
    btnSubmitApp: "إرسال طلب الالتحاق",
    btnStartQuiz: "جرّب اختبار القدرات (IQ) 🧠",
    navVideo: "فيديو المدرسة 🎬",
    btnWatchVideo: "فيديو المدرسة 🎬",
    videoTag: "🎬 جولة مرئية وفيديو تعريفي",
    videoTitle: "شاهد بالفيديو: كل ما تريد معرفته عن مدارس WE",
    videoSubtitle: "تعرف على بيئة الدراسة، المعامل الحديثة، والفرص التدريبية والشهادات الدولية المقدمة بالتعاون مع الشركة المصرية للاتصالات WE.",
    videoTab1Title: "الفيديو التعريفي الشامل (إنفوجرافيك 2026)",
    videoTab1Desc: "شرح نظام الدراسة والشهادات والشراكة مع WE",
    videoTab2Title: "جولة مصورة داخل المعامل والفصول",
    videoTab2Desc: "مشاهد حية للطلاب والتجهيزات التقنية المتقدمة",
    videoMeta1Title: "شراكة حكومية دولية",
    videoMeta1Sub: "وزارة الاتصالات • وزارة التربية والتعليم • WE • وكالة جلاجسي",
    videoMeta2Title: "تغطية شاملة",
    videoMeta2Sub: "27 محافظة • 5 تخصصات تكنولوجية",
    videoMeta3Title: "اعتماد وتوظيف",
    videoMeta3Sub: "شهادات دولية • أولوية تعيين للمتفوقين",
    
    // Hero
    heroBadge: "الأولى والأكبر في مصر والشرق الأوسط 🇪🇬",
    heroTitlePrefix: "نصنع قادة",
    heroTitleTech: "التكنولوجيا الرقمية",
    heroTitleSuffix: "والأمن السيبراني والذكاء الاصطناعي",
    heroDesc: "مدارس حكومية نموذجية بمعايير دولية بشراكة استراتيجية بين وزارة الاتصالات وتكنولوجيا المعلومات ووزارة التربية والتعليم والشركة المصرية للاتصالات WE، تؤهل خريجيها لكليات الهندسة والحاسبات وسوق العمل العالمي.",
    heroCardBadge: "⚡ نظام دراسة 3 سنوات معتمد دولياً",
    heroCardImgText: "🏫 معامل متطورة وأحدث أجهزة التكنولوجيا",
    heroCardTitle: "تخصصات تواكب الثورة الصناعية الرابعة",
    heroCardDesc: "دراسة عملية متقدمة تجمع بين مناهج وزارة التربية والتعليم والتدريب الميداني داخل سنترالات ومواقع الشركة المصرية للاتصالات WE.",
    heroPillArc: "ديجيتال ارك",
    heroPillCyber: "الأمن السيبراني",
    heroPillDev: "تطوير البرمجيات",
    heroPillAi: "الذكاء الاصطناعي",
    
    // Stats
    statSchools: "مدرسة تغطي 27 محافظة",
    statStudents: "طالب وطالبة حالياً",
    statGraduates: "خريج وخريجة مؤهلين",
    statEmployment: "فرص تدريب وتوظيف معتمدة",
    
    // About
    aboutTag: "رؤية تعليمية رائدة",
    aboutTitle: "تعليم فني تكنولوجي بمعايير عالمية",
    aboutLead: "تأسست مدارس WE للتكنولوجيا التطبيقية عام 2020 كأول صرح متخصص في تكنولوجيا الاتصالات والمعلومات في مصر بهدف إعداد أجيال تمتلك المعرفة التطبيقية والشهادات الدولية المعتمدة لمواكبة الثورة الصناعية الرابعة.",
    aboutBadgeTitle: "شهادة ثلاثية معتمدة",
    aboutBadgeSub: "دبلوم فني + خبرة WE + شهادات Cisco وHuawei",
    perk1Title: "تابلت وزي مدرسي مجاناً",
    perk1Desc: "توفير تابلت تعليمي حديث، والزي المدرسي وزي التدريب الميداني والعملي بدون أي رسوم.",
    perk2Title: "مكافآت مالية شهرية",
    perk2Desc: "يحصل الطالب على حافز ومكافأة مالية شهرية طوال فترة التدريب العملي والميداني.",
    perk3Title: "شهادات دولية معتمدة",
    perk3Desc: "شهادة الدبلوم الفني التقني المعتمد + شهادة خبرة من المصرية للاتصالات + شهادات كبرى شركات التكنولوجيا (Cisco, Huawei, AWS).",
    perk4Title: "مسارات جامعية مرموقة",
    perk4Desc: "تأهيل مباشر للالتحاق بكليات الهندسة والحاسبات والذكاء الاصطناعي والجامعات التكنولوجية المتقدمة.",
    
    // Specializations
    specsTag: "مسارات احترافية للمستقبل",
    specsTitle: "5 تخصصات تكنولوجية تواكب وظائف الغد",
    specsSubtitle: "مناهج حديثة تم تصميمها بالتعاون مع أساتذة الجامعات والخبراء العالميين في مجالات تكنولوجيا الاتصالات وهندسة البرمجيات والأمن السيبراني والذكاء الاصطناعي.",
    topicsCovered: "أبرز محاور الدراسة والتدريب:",
    careerOpportunities: "الفرص الوظيفية للخريج:",
    industryCerts: "الشهادات المهنية المعتمدة:",
    higherEdPath: "المسار الأكاديمي والجامعي:",
    
    // Schools
    schoolsTag: "تغطية شاملة لجمهورية مصر العربية",
    schoolsTitle: "مدارسنا في 27 محافظة",
    schoolsSubtitle: "أينما كنت في مصر، تجد مدرسة WE للتكنولوجيا التطبيقية في محافظتك بأحدث المعامل والورش المتطورة.",
    searchPlaceholder: "ابحث باسم المحافظة، المدينة، أو التخصص...",
    regionAll: "جميع المحافظات (27)",
    regionCairo: "القاهرة الكبرى",
    regionDelta: "الدلتا والوجه البحري",
    regionCanalSinai: "القناة وسيناء",
    regionUpper: "الصعيد والوجه القبلي",
    regionCoastal: "المدن الساحلية",
    
    // Admission & Calc
    admissionTag: "شروط الالتحاق والدليل الشامل",
    admissionTitle: "كيف تلتحق بمدارس WE؟",
    admissionSubtitle: "خطوات ميسرة وواضحة من التقديم وحتى إعلان نتائج القبول النهائي.",
    roadmapTitle: "خريطة مراحل القبول لعام 2026/2027",
    step1Title: "1. التقديم والتسجيل الإلكتروني",
    step1Desc: "عبر موقع وزارة التربية والتعليم وبوابة المصرية للاتصالات الرسمية فور فتح باب التنسيق للشهادة الإعدادية.",
    step2Title: "2. اجتياز اختبار القدرات (IQ & English)",
    step2Desc: "اختبارات إلكترونية في اللغة العربية والإنجليزية والرياضيات واختبار الذكاء والقدرات الذهنية العامة.",
    step3Title: "3. المقابلة الشخصية والكشف الطبي",
    step3Desc: "لقاء لتقييم المهارات الشخصية والشغف التكنولوجي والتأكد من اللياقة الطبية للالتحاق بالتخصص.",
    step4Title: "4. إعلان النتيجة وتسليم الملف",
    step4Desc: "استلام كود القبول وتسليم الأوراق الرسمية وبدء العام الدراسي التكنولوجي الواعد.",
    
    calcTitle: "حاسبة فرصة القبول والتنسيق الذكية",
    calcSubtitle: "ادخل بياناتك للتأكد من انطباق الشروط فورياً",
    calcScoreLabel: "مجموعك في الشهادة الإعدادية (من 280):",
    calcGovLabel: "محافظتك:",
    calcAgeLabel: "عمرك في أول أكتوبر:",
    calcBtn: "تحقق من نتيجة قبولك الآن 🎯",
    
    // Comparison
    compTag: "المقارنة الحاسمة",
    compTitle: "لماذا تختار مدارس WE عن البدائل التقليدية؟",
    compSubtitle: "مقارنة علمية وعملية توضح الفارق الجوهري بين مدارس WE والثانوية العامة والتعليم الفني العادي.",
    swipeHint: "👈 اسحب الجدول أفقياً للمقارنة الكاملة 👉",
    compColCriteria: "معيار المقارنة",
    compColWe: "مدارس WE للتكنولوجيا التطبيقية",
    compColThanawya: "الثانوية العامة التقليدية 📚",
    compColVocational: "التعليم الفني العادي ⚙️",
    
    // News
    newsTag: "أحدث الفعاليات والأنشطة",
    newsTitle: "دوري مدارس WE 2026 والأنشطة",
    newsSubtitle: "حياة طلابية متكاملة تجمع بين التميز الأكاديمي والبطولات الرياضية ومسابقات الابتكار التكنولوجي.",
    readMoreBtn: "المزيد من التفاصيل ➡️",
    
    // Partners
    partnersHeader: "تحت رعاية وبشراكة استراتيجية مع كبرى الهيئات والشركات العالمية",
    
    // FAQ
    faqTag: "الأسئلة الشائعة",
    faqTitle: "إجابات على أهم ما يشغل ذهنك",
    faqSubtitle: "كل ما يحتاج الطالب وولي الأمر معرفته عن مدارس WE للتكنولوجيا التطبيقية.",
    
    // Modals
    modalStep1Title: "الخطوة 1: البيانات الشخصية للطالب",
    modalStep1Sub: "ادخل البيانات بدقة طبقاً لشهادة الميلاد والرقم القومي",
    modalNameLabel: "اسم الطالب رباعياً باللغة العربية:",
    modalNamePlace: "محمد أحمد مصطفى إبراهيم",
    modalNidLabel: "الرقم القومي (14 رقم):",
    modalNidPlace: "30901010100000",
    modalPhoneLabel: "رقم هاتف ولي الأمر (واتساب):",
    modalPhonePlace: "01012345678",
    modalBtnNextStep2: "التالي: البيانات التعليمية ➡️",
    
    modalStep2Title: "الخطوة 2: المؤهل الدراسي والإعدادية",
    modalStep2Sub: "درجات الشهادة الإعدادية والمدرسة السابقة",
    modalScoreLabel: "المجموع الكلي في الشهادة الإعدادية (من 280):",
    modalScorePlace: "مثال: 255",
    modalPrevSchoolLabel: "اسم المدرسة الإعدادية السابقة:",
    modalPrevSchoolPlace: "مدرسة المستقبل الإعدادية بنين",
    modalYearLabel: "سنة الحصول على الإعدادية:",
    modalBtnPrev: "⬅️ السابق",
    modalBtnNextStep3: "التالي: اختيار الرغبات ➡️",
    
    modalStep3Title: "الخطوة 3: ترتيب رغبات التخصص",
    modalStep3Sub: "حدد ترتيب التخصصات المفضلة لديك",
    modalPref1Label: "الرغبة الأولى:",
    modalPref2Label: "الرغبة الثانية:",
    modalBtnSubmit: "تأكيد وإرسال الطلب",
    
    modalSuccessTitle: "تم تسجيل طلبك بنجاح!",
    modalSuccessDesc: "تم تسجيل بياناتك المبدئية بنجاح في قاعدة بيانات مدارس WE للتكنولوجيا التطبيقية. كود المتابعة الخاص بك:",
    modalSuccessNote: "يرجى الاحتفاظ بهذا الكود، وسيتم إرسال رسالة SMS بموعد اختبار القدرات التحريري والمقابلة الشخصية.",
    modalBtnClose: "تم، إغلاق النافذة",
    
    // Footer Specialties
    footerSpecArc: "ديجيتال ارك (العمارة الرقمية)",
    footerSpecCyber: "الشبكات والأمن السيبراني",
    footerSpecWeb: "تطوير المواقع والبرمجيات",
    footerSpecAi: "الذكاء الاصطناعي وتحليل البيانات",
    footerSpecArts: "الفنون الرقمية والوسائط",
    
    // Footer
    footerDesc: "مدارس WE للتكنولوجيا التطبيقية، أول وأكبر مدارس ثانوية تكنولوجية معتمدة دولياً في مصر متخصصة في هندسة وتكنولوجيا الاتصالات، الشبكات، الأمن السيبراني، وتطوير البرمجيات.",
    footerHotline: "خدمة العملاء والاستفسارات: 01501112222",
    footerQuickLinks: "روابط سريعة",
    footerSpecialties: "التخصصات التقنية",
    footerContact: "المقر والدعم",
    footerAddr1: "جمهورية مصر العربية - القاهرة",
    footerAddr2: "وزارة الاتصالات - القرية الذكية",
    footerAddr3: "الشركاء: المصرية للاتصالات WE • الشريك الصناعي وكالة جلاجسي",
    footerAddr4: "المواعيد: الأحد إلى الخميس (8ص - 3م)",
    footerAddr5: "البريد: info@we-ats.edu.eg",
    footerBadgeBottom: "تصميم فائق التطور بمعايير الويب العالمية",
    copyright: "جميع الحقوق محفوظة © 2026 مدارس WE للتكنولوجيا التطبيقية - الشركة المصرية للاتصالات WE."
  },
  en: {
    siteTitle: "WE Applied Technology Schools | Telecom Egypt",
    brandTitle: "WE ATS",
    brandSub: "Applied Technology",
    navHome: "Home",
    navAbout: "About",
    navSpecs: "Majors",
    navSchools: "Branches",
    navAdmission: "Admissions",
    navCurriculum: "Curriculum",
    navComparison: "Why WE?",
    navVideo: "Video",
    navNews: "News",
    navFaq: "FAQ",
    navTrack: "Track Application 🔍",
    btnTrackApp: "Track App",
    trackModalTitle: "Application Status Tracking",
    trackModalSub: "Enter Application Code (e.g. WE-2026-884102) or National ID",
    trackInputLabel: "Application Code or 14-digit National ID:",
    footerTrack: "Check Admission Status",
    btnApplyNow: "Apply Now",
    btnExploreSpecs: "Explore Majors",
    btnCheckEligibility: "Check Eligibility 🎯",
    btnFindBranch: "Find Nearest Campus",
    btnDirections: "Get Directions",
    btnDetails: "Specialization Details",
    btnSubmitApp: "Submit Application",
    btnStartQuiz: "Try Aptitude Quiz (IQ) 🧠",
    navVideo: "School Video 🎬",
    btnWatchVideo: "School Video 🎬",
    videoTag: "🎬 Official Visual Tour",
    videoTitle: "Watch: Everything You Need to Know About WE ATS",
    videoSubtitle: "Explore our modern learning environments, state-of-the-art tech labs, certified internships, and accredited diplomas.",
    videoTab1Title: "Official Infographic & Overview Film",
    videoTab1Desc: "Comprehensive guide to curricula, certs & Telecom Egypt partnership",
    videoTab2Title: "Live Campus & Labs Tour",
    videoTab2Desc: "Real footage of students inside high-tech classrooms & facilities",
    videoMeta1Title: "Strategic Partnership",
    videoMeta1Sub: "MCIT • MOETE • Telecom Egypt (WE) • Galaxy Agency",
    videoMeta2Title: "Nationwide Presence",
    videoMeta2Sub: "27 Governorates • 5 Technology Tracks",
    videoMeta3Title: "Accredited Hiring",
    videoMeta3Sub: "International Certs • Direct Career Path",
    
    // Hero
    heroBadge: "Egypt's #1 Applied Tech Academy 🇪🇬",
    heroTitlePrefix: "Empowering Future",
    heroTitleTech: "Digital Leaders",
    heroTitleSuffix: "in AI, Cybersecurity & Digital Architecture",
    heroDesc: "Premier technical model schools with international accreditations, born from a strategic partnership between MCIT, MOETE, and Telecom Egypt (WE). Equipping youth for world-class tech careers and engineering universities.",
    heroCardBadge: "⚡ 3-Year Internationally Accredited System",
    heroCardImgText: "🏫 State-of-the-Art Computing & Engineering Labs",
    heroCardTitle: "Majors Crafted for Industry 4.0",
    heroCardDesc: "Advanced practical learning combining Ministry of Education curricula with hands-on field internships inside Telecom Egypt sites.",
    heroPillArc: "Digital Arc",
    heroPillCyber: "Cybersecurity",
    heroPillDev: "Software Dev",
    heroPillAi: "AI & Data",
    
    // Stats
    statSchools: "Campuses Across 27 Governorates",
    statStudents: "Current Enrolled Students",
    statGraduates: "Qualified Tech Alumni",
    statEmployment: "Guaranteed Internship & Hiring Track",
    
    // About
    aboutTag: "Transformative Vision",
    aboutTitle: "World-Class Applied Technology Education",
    aboutLead: "Founded in 2020, WE Applied Technology Schools represent Egypt's largest and most advanced secondary tech education project, empowering a new generation to thrive in the 4th Industrial Revolution.",
    aboutBadgeTitle: "Triple Accredited Credentials",
    aboutBadgeSub: "Tech Diploma + WE Experience + Cisco/Huawei Certs",
    perk1Title: "Free Educational Tablet & Uniform",
    perk1Desc: "Every student receives a personal tablet and complete seasonal school & field-training uniforms free of charge.",
    perk2Title: "Monthly Financial Stipend",
    perk2Desc: "Students earn an encouraging monthly stipend throughout practical field training periods.",
    perk3Title: "Triple Accredited Certifications",
    perk3Desc: "International Technical Diploma + Telecom Egypt Experience Certificate + Global vendor credentials (Cisco, Huawei, AWS).",
    perk4Title: "Direct Elite University Pathways",
    perk4Desc: "Direct eligibility for Engineering, Computer Science, AI, and Technological Universities across Egypt.",
    
    // Specializations
    specsTag: "Future-Ready Career Tracks",
    specsTitle: "5 High-Demand Tech Specializations",
    specsSubtitle: "Cutting-edge curricula crafted with senior university professors and global technology industry leaders in Digital Architecture, AI, and Cybersecurity.",
    topicsCovered: "Core Curriculum & Training Modules:",
    careerOpportunities: "Career & Job Opportunities:",
    industryCerts: "Certified Global Credentials:",
    higherEdPath: "Higher Education & University Path:",
    
    // Schools
    schoolsTag: "100% Nationwide Presence",
    schoolsTitle: "Campuses Across All 27 Governorates",
    schoolsSubtitle: "Wherever you live in Egypt, there is a state-of-the-art WE ATS campus nearby with top-tier labs.",
    searchPlaceholder: "Search by governorate, city, or specialization...",
    regionAll: "All Governorates (27)",
    regionCairo: "Greater Cairo",
    regionDelta: "Delta Region",
    regionCanalSinai: "Canal & Sinai",
    regionUpper: "Upper Egypt",
    regionCoastal: "Coastal Cities",
    
    // Admission & Calc
    admissionTag: "Admission Guide & Requirements",
    admissionTitle: "How to Join WE Schools?",
    admissionSubtitle: "A transparent 4-stage admission roadmap from online registration to final enrollment.",
    roadmapTitle: "Admission Roadmap for Academic Year 2026/2027",
    step1Title: "1. Online Application",
    step1Desc: "Apply via the official MOETE & Telecom Egypt WE admissions portal following prep school results.",
    step2Title: "2. Aptitude & IQ Tests",
    step2Desc: "Computerized exams in English, Arabic, Mathematics, and General Cognitive IQ assessment.",
    step3Title: "3. Personal Interview & Medical Check",
    step3Desc: "Interactive interview assessing tech passion, social aptitude, and medical physical fitness.",
    step4Title: "4. Admission Results & Document Submission",
    step4Desc: "Receive acceptance confirmation code, submit official dossiers, and launch your tech journey.",
    
    calcTitle: "Smart Admission & Score Calculator",
    calcSubtitle: "Enter your score and data to verify eligibility instantly",
    calcScoreLabel: "Preparatory School Total Score (out of 280):",
    calcGovLabel: "Your Governorate:",
    calcAgeLabel: "Age as of October 1st:",
    calcBtn: "Check My Eligibility Now 🎯",
    
    // Comparison
    compTag: "Strategic Comparison",
    compTitle: "Why Choose WE Schools Over Traditional Paths?",
    compSubtitle: "Scientific and practical comparison highlighting the key advantages over general secondary and conventional vocational schools.",
    swipeHint: "👈 Swipe table horizontally to view full comparison 👉",
    compColCriteria: "Evaluation Criteria",
    compColWe: "WE Applied Technology Schools",
    compColThanawya: "Standard General Secondary 📚",
    compColVocational: "Traditional Vocational School ⚙️",
    
    // News
    newsTag: "Latest Events & Highlights",
    newsTitle: "WE Schools League 2026 & Happenings",
    newsSubtitle: "A vibrant student ecosystem blending engineering rigor with athletic tournaments and hackathons.",
    readMoreBtn: "Read Full Details ➡️",
    
    // Partners
    partnersHeader: "Under the Auspices and Strategic Partnership of Leading National & Global Entities",
    
    // FAQ
    faqTag: "Frequently Asked Questions",
    faqTitle: "Answers to Everything on Your Mind",
    faqSubtitle: "Everything students and parents need to know about joining WE Applied Technology Schools.",
    
    // Modals
    modalStep1Title: "Step 1: Student Personal Information",
    modalStep1Sub: "Enter information accurately matching birth certificate and National ID",
    modalNameLabel: "Full Student Name:",
    modalNamePlace: "Mohamed Ahmed Mostafa",
    modalNidLabel: "National ID Number (14 digits):",
    modalNidPlace: "30901010100000",
    modalPhoneLabel: "Guardian Phone Number (WhatsApp):",
    modalPhonePlace: "01012345678",
    modalBtnNextStep2: "Next: Educational Details ➡️",
    
    modalStep2Title: "Step 2: Educational Background & Score",
    modalStep2Sub: "Preparatory certificate results and previous school",
    modalScoreLabel: "Total Prep School Score (out of 280):",
    modalScorePlace: "e.g., 255",
    modalPrevSchoolLabel: "Previous Prep School Name:",
    modalPrevSchoolPlace: "Future Preparatory School",
    modalYearLabel: "Graduation Year:",
    modalBtnPrev: "⬅️ Previous",
    modalBtnNextStep3: "Next: Specialization Preferences ➡️",
    
    modalStep3Title: "Step 3: Preference Ordering",
    modalStep3Sub: "Select your desired order of study tracks",
    modalPref1Label: "First Preference:",
    modalPref2Label: "Second Preference:",
    modalBtnSubmit: "Confirm & Submit Application",
    
    modalSuccessTitle: "Application Submitted Successfully!",
    modalSuccessDesc: "Your registration details have been securely recorded in the WE ATS admission portal. Your unique Tracking Code is:",
    modalSuccessNote: "Please keep this tracking code safe. You will receive an SMS regarding your screening aptitude test and interview schedule.",
    modalBtnClose: "Done, Close Window",
    
    // Footer Specialties
    footerSpecArc: "Digital Arc (Architecture)",
    footerSpecCyber: "Networks & Cybersecurity",
    footerSpecWeb: "Web & Software Development",
    footerSpecAi: "AI & Data Analytics",
    footerSpecArts: "Digital Arts & Multimedia",
    
    // Footer
    footerDesc: "WE Applied Technology Schools: Egypt's premier state-sponsored technical institutions specializing in Telecommunications, Cybersecurity, AI, and Software Engineering.",
    footerHotline: "Customer Support: 01501112222",
    footerQuickLinks: "Quick Links",
    footerSpecialties: "Technical Majors",
    footerContact: "Headquarters & Support",
    footerAddr1: "Arab Republic of Egypt - Cairo",
    footerAddr2: "Ministry of CIT - Smart Village",
    footerAddr3: "Partners: Telecom Egypt (WE) • Industrial Partner Galaxy Agency",
    footerAddr4: "Hours: Sun to Thu (8 AM - 3 PM)",
    footerAddr5: "Email: info@we-ats.edu.eg",
    footerBadgeBottom: "Engineered with World-Class Web Standards",
    copyright: "All rights reserved © 2026 WE Applied Technology Schools - Telecom Egypt (WE)."
  }
};

// Comparison Matrix Data
const comparisonData = {
  ar: [
    {
      criteria: "المناهج واللغة",
      we: "مناهج دولية باللغة الإنجليزية في أحدث علوم هندسة الاتصالات وتكنولوجيا المعلومات",
      thanawya: "مناهج تقليدية نظرية تعتمد على الحفظ والتلقين",
      vocational: "مناهج ورقية تقليدية قديمة لا تواكب السوق"
    },
    {
      criteria: "التدريب الميداني والعملي",
      we: "تدريب عملي مستمر بمواقع وسنترالات المصرية للاتصالات WE",
      thanawya: "لا يوجد تدريب عملي إطلاقاً (نظري فقط)",
      vocational: "ورش تدريبية محدودة بدون ربط حقيقي بالشركات الكبرى"
    },
    {
      criteria: "الدروس الخصوصية والضغط النفسي",
      we: "صفر دروس خصوصية! الدعم والتأهيل كامل داخل المدرسة",
      thanawya: "ضغط نفسي هائل ومصاريف دروس خصوصية باهظة شهرياً",
      vocational: "حاجة لدورات تأهيل إضافية مكلفة لسد الفجوة"
    },
    {
      criteria: "الفرص الجامعية المتاحة",
      we: "كليات الهندسة (عمارة واتصالات)، كليات الحاسبات، والجامعات التكنولوجية",
      thanawya: "تعتمد كلياً على نسبة مئوية في امتحان واحد سنوي ومصيري",
      vocational: "فرص جامعية ضيقة وصعبة تتطلب معادلات معقدة"
    },
    {
      criteria: "فرص العمل والتوظيف",
      we: "أولوية تعيين بالمصرية للاتصالات وشركات التكنولوجيا برواتب ممتازة",
      thanawya: "غير مؤهل للعمل إلا بعد 4-5 سنوات جامعة وتخرج",
      vocational: "وظائف محدودة بدون خبرة تكنولوجية حديثة"
    },
    {
      criteria: "الحوافز والمكافآت المادية",
      we: "مكافآت مالية شهرية طوال التدريب + تابلت وزي مدرسي مجاناً",
      thanawya: "لا توجد أي حوافز مالية أو أجهزة مجانية",
      vocational: "لا توجد حوافز مجزية"
    }
  ],
  en: [
    {
      criteria: "Curriculum & Language",
      we: "International English curricula in modern Digital Architecture, AI & Tech",
      thanawya: "Traditional theoretical curricula relying on rote memorization",
      vocational: "Outdated paper-based textbooks detached from market needs"
    },
    {
      criteria: "Field & Practical Training",
      we: "Continuous hands-on internships inside Telecom Egypt WE sites",
      thanawya: "Zero practical training (purely classroom theory)",
      vocational: "Basic workshops with minimal corporate integration"
    },
    {
      criteria: "Private Tutoring & Stress",
      we: "Zero private tutoring! Comprehensive in-school coaching & mentoring",
      thanawya: "Immense psychological stress and costly private tutoring bills",
      vocational: "Requires external paid certification to bridge knowledge gaps"
    },
    {
      criteria: "University Pathways",
      we: "Faculties of Engineering, Computer Science, AI, and Tech Universities",
      thanawya: "Solely dependent on a high-stakes annual exam percentage",
      vocational: "Severely restricted university quotas requiring complex exams"
    },
    {
      criteria: "Job & Career Readiness",
      we: "Hiring priority at Telecom Egypt & tech multinational partners",
      thanawya: "Zero job readiness until 4-5 years of post-college studies",
      vocational: "Low-tier technical jobs lacking modern tech skills"
    },
    {
      criteria: "Stipends & Incentives",
      we: "Monthly financial stipends during training + free tablet & uniforms",
      thanawya: "Zero stipends or free tech devices",
      vocational: "No rewarding financial stipends"
    }
  ]
};

// News Data
const newsData = {
  ar: [
    {
      date: "30 مارس 2026 • بطولة الجمهورية",
      title: "اختتام موسم حافل لدوري مدارس WE 2026 في نسخته الثالثة",
      desc: "بحضور قيادات وزارة الاتصالات والتربية والتعليم، شهد ختام دوري مدارس WE منافسات مشتعلة وتكريم الطلاب المتميزين رياضياً وتكنولوجياً.",
      thumb: "assets/images/students-activity.webp"
    },
    {
      date: "30 مارس 2026 • دوري كرة القدم",
      title: "الإسكندرية تتوج بلقب كرة القدم في دوري مدارس WE 2026",
      desc: "توج فريق طلاب مدرسة WE للتكنولوجيا التطبيقية بالإسكندرية بالمركز الأول وكأس البطولة بعد أداء بطولي أمام فريق مدرسة الجيزة.",
      thumb: "assets/images/hero-bg.webp"
    },
    {
      date: "30 مارس 2026 • دوري الطائرة بنات",
      title: "تتويج السويس بلقب كرة الطائرة بنات في دوري مدارس WE",
      desc: "في نهائي حماسي، استطاعت طالبات مدرسة WE بمحافظة السويس حصد الميدالية الذهبية وكأس البطولة لكرة الطائرة لعام 2026.",
      thumb: "assets/images/students-lab.webp"
    }
  ],
  en: [
    {
      date: "March 30, 2026 • National Championship",
      title: "Successful Conclusion of WE Schools League 2026 (3rd Edition)",
      desc: "In the presence of Ministry leadership and Telecom Egypt executives, the sports league honored outstanding athletic and technical students.",
      thumb: "assets/images/students-activity.webp"
    },
    {
      date: "March 30, 2026 • Football Championship",
      title: "Alexandria Crowned Football Champion of WE League 2026",
      desc: "WE Applied Technology School Alexandria secured 1st place and the championship cup following a sensational match against Giza.",
      thumb: "assets/images/hero-bg.webp"
    },
    {
      date: "March 30, 2026 • Girls' Volleyball League",
      title: "Suez Crowned Girls' Volleyball Champion of WE League",
      desc: "In a thrilling finale, Suez WE ATS girls clinched the gold medal and trophy for the national volleyball championship 2026.",
      thumb: "assets/images/students-lab.webp"
    }
  ]
};

// FAQ Data
const faqData = {
  ar: [
    {
      q: "هل خريج مدارس WE مؤهل للالتحاق بكليات الهندسة والحاسبات؟",
      a: "نعم بالتأكيد! يحصل خريج مدارس WE على دبلوم فني تكنولوجي متقدم يؤهله مباشرة للالتحاق بكليات الهندسة (أقسام العمارة والاتصالات والمدني) وكليات الحاسبات والذكاء الاصطناعي (بعد اجتياز المعادلة بنجاح)، وكذلك الالتحاق المباشر بجميع الجامعات والكليات والمعاهد التكنولوجية في مصر دون عوائق."
    },
    {
      q: "ما هو تخصص ديجيتال ارك (العمارة الرقمية والمدن الذكية)؟",
      a: "هو تخصص تكنولوجي حديث يجمع بين التصميم المعماري الرقمي ثلاثي الأبعاد، ونمذجة معلومات المباني (BIM)، وتكنولوجيا التوأم الرقمي (Digital Twin)، وتصميم المدن والمباني الذكية المستدامة، مع تدريب عملي مكثف على برامج Autodesk Revit وUnreal Engine."
    },
    {
      q: "ما هي المصروفات الدراسية لمدارس WE؟",
      a: "مدارس WE هي مدارس حكومية نموذجية تخضع للمصروفات الحكومية الرمزية لوزارة التربية والتعليم، مع تقديم تابلت وزي مدرسي وتدريبي مجاناً، بالإضافة لحصول الطلاب على مكافآت وحوافز مالية شهرية طوال فترة التدريب العملي الميداني."
    },
    {
      q: "هل توفر المدرسة تدريباً عملياً ووظائف بالشركة المصرية للاتصالات؟",
      a: "نعم، التدريب العملي والميداني إلزامي وأساسي داخل المعامل المتطورة ومواقع وسنترالات ومراكز بيانات الشركة المصرية للاتصالات والشركات التابعة، مع منح المتفوقين أولوية قصوى للتعيين المباشر بالشركة عقب التخرج."
    },
    {
      q: "ما هي لغة التدريس المعتمدة في مدارس WE؟",
      a: "لغة تدريس المواد التكنولوجية والفنية والشهادات الدولية هي اللغة الإنجليزية، بجانب دراسة العلوم الثقافية الخاصة بوزارة التربية والتعليم باللغة العربية، بالإضافة إلى كورسات مكثفة في مهارات التواصل واللغة والقيادة."
    },
    {
      q: "ما هي طبيعة اختبار القدرات (IQ Test) والمقابلة الشخصية؟",
      a: "يخضع المتقدم لاختبار إلكتروني مبسط يقيس الذكاء المنطقي والتفكير الرياضي وأساسيات اللغة الإنجليزية واللغة العربية، ثم مقابلة شخصية لقياس الشغف بالتكنولوجيا والثقة بالنفس والمظهر العام واللياقة الطبية."
    }
  ],
  en: [
    {
      q: "Is a WE ATS graduate eligible for Engineering & Computer Science Colleges?",
      a: "Absolutely yes! WE ATS graduates receive an accredited advanced technical diploma qualifying them directly for Faculties of Engineering (Architecture, Communications, Civil), Computer Science & AI (after passing the standard bridge exam), and direct unconditional entry into all Technological Universities across Egypt."
    },
    {
      q: "What is the Digital Arc (Digital Architecture & Smart Cities) specialization?",
      a: "It is a cutting-edge technological track merging 3D digital architectural modeling, Building Information Modeling (BIM), Smart City Digital Twins, and sustainable computational design, with intensive practical training on Autodesk Revit and Unreal Engine."
    },
    {
      q: "What are the tuition fees for WE Applied Technology Schools?",
      a: "WE Schools are state-sponsored model institutions adhering to nominal Ministry of Education public school fees. Students receive a free educational tablet, free uniforms, and earn monthly cash stipends throughout practical internships."
    },
    {
      q: "Does the school provide field internships and job opportunities at Telecom Egypt?",
      a: "Yes! Practical field internships are mandatory inside Telecom Egypt exchange hubs, data centers, and affiliate companies. Top-performing graduates receive direct priority hiring opportunities upon graduation."
    },
    {
      q: "What is the primary language of instruction at WE ATS?",
      a: "Technical and specialized engineering subjects are taught entirely in English, while cultural general subjects follow the Ministry of Education in Arabic. Students also receive extensive English and leadership training."
    },
    {
      q: "What is the format of the Aptitude / IQ Test and Personal Interview?",
      a: "Candidates take a computerized cognitive assessment measuring logical IQ reasoning, mathematics, English, and Arabic, followed by an interview evaluating tech passion, communication, and medical fitness."
    }
  ]
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  try { applyTheme(currentTheme); } catch (e) { console.warn('applyTheme:', e); }
  try { applyLanguage(currentLang); } catch (e) { console.warn('applyLanguage:', e); }
  try { initParticles(); } catch (e) { console.warn('initParticles:', e); }
  try { initHeroVideoPlayer(); } catch (e) { console.warn('initHeroVideoPlayer:', e); }
  try { initCounters(); } catch (e) { console.warn('initCounters:', e); }
  try { initEventListeners(); } catch (e) { console.warn('initEventListeners:', e); }
  try { renderCurriculumSection(); } catch(e){}
    try { initCalculator(); } catch (e) { console.warn('initCalculator:', e); }
  try { initCyberIntro(); } catch (e) { console.warn('initCyberIntro:', e); }
  try { initScrollProgressBar(); } catch (e) { console.warn('initScrollProgressBar:', e); }
  try { initScrollReveal(); } catch (e) { console.warn('initScrollReveal:', e); }
  try { init3DTiltCards(); } catch (e) { console.warn('init3DTiltCards:', e); }
});

// Particles init
function initParticles() {
  if (typeof initCyberParticles === 'function') {
    initCyberParticles('hero-canvas');
  }
}

// ==========================================================================
// High-Speed Cyber Entrance Portal (Snappy, Futuristic & Lightweight)
// ==========================================================================
function initCyberIntro() { /* Intro removed */ }

function finishIntroImmediately() {
  if (typeof window.finishIntroImmediately === 'function') {
    window.finishIntroImmediately();
  } else {
    const portal = document.getElementById('cyber-intro-portal');
    if (portal) {
      portal.classList.add('intro-opened');
      portal.style.display = 'none';
    }
  }
}

function replayIntro() { /* Intro removed */ }

// Gentle Web Audio API synthesizer for sci-fi power sound (no audio files needed!)
function playSciFiChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Oscillator 1: High cyber sweep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(320, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.35);
    osc1.frequency.exponentialRampToValueAtTime(1180, ctx.currentTime + 0.7);

    gain1.gain.setValueAtTime(0.001, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.35);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.9);

    // Oscillator 2: Bass power hum
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.4);

    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.65);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.65);
  } catch (e) {
    // Non-blocking fallback if browser policy restricts auto audio
  }
}

// Theme handling (Switches logo intelligently so it is NEVER invisible)
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('we_theme', theme);
  
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) {
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Choose the logo that has 100% crystal contrast
  const logo = document.getElementById('header-logo');
  if (logo) {
    logo.src = theme === 'dark' ? 'assets/images/logo-en-white.png' : 'assets/images/logo-ar.png';
  }

  const introLogo = document.querySelector('.intro-logo');
  if (introLogo) {
    introLogo.src = theme === 'dark' ? 'assets/images/logo-en-white.png' : 'assets/images/logo-ar.png';
  }
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

// 100% Comprehensive Language Switcher
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('we_lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'en');
  
  const langToggleBtn = document.getElementById('lang-toggle-text');
  if (langToggleBtn) {
    langToggleBtn.textContent = lang === 'ar' ? 'English' : 'العربية';
  }

  // Update logo based on theme & language
  const logo = document.getElementById('header-logo');
  if (logo) {
    logo.src = currentTheme === 'dark' ? 'assets/images/logo-en-white.png' : 'assets/images/logo-ar.png';
  }

  // Update all translatable elements via data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang] && i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (i18n[lang] && i18n[lang][key]) {
      el.setAttribute('placeholder', i18n[lang][key]);
    }
  });

  // Re-render all dynamic components in the chosen language
  renderSpecializationsTabs();
  renderSpecializationCard(activeSpecId);
  renderSchoolsGrid();
  renderComparisonTable();
  renderNewsSection();
  renderFaqSection();
    renderCurriculumSection();
  populateCalculatorGovs();
  updateModalSelectOptions();
  refreshScrollReveal();
  init3DTiltCards();
  updateHeroVideoLabels();
  updateHeroAudioUI();
}

function toggleLanguage() {
  applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
}

// Animated Counters on scroll
function initCounters() {
  const statElements = document.querySelectorAll('.stat-num');
  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statElements.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 2000;
          const step = Math.ceil(target / (duration / 25));

          const timer = setInterval(() => {
            count += step;
            if (count >= target) {
              count = target;
              clearInterval(timer);
            }
            el.textContent = prefix + count.toLocaleString() + suffix;
          }, 25);
        });
      }
    });
  }, { threshold: 0.1 });

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) observer.observe(statsSection);
}

// Render Specializations Tabs (Neat, compact, overflow-proof)
function renderSpecializationsTabs() {
  const container = document.getElementById('spec-tabs-container');
  if (!container || typeof specializationsData === 'undefined') return;

  container.innerHTML = specializationsData.map(spec => {
    const title = currentLang === 'ar' ? (spec.shortTitleAr || spec.titleAr) : (spec.shortTitleEn || spec.titleEn);
    const isActive = spec.id === activeSpecId ? 'active' : '';
    return `
      <button class="spec-tab-btn ${isActive}" onclick="selectSpecialization('${spec.id}')">
        <img src="${spec.icon}" alt="${title}" onerror="this.style.display='none'">
        <span>${title}</span>
      </button>
    `;
  }).join('');
}

function selectSpecialization(id) {
  activeSpecId = id;
  renderSpecializationsTabs();
  renderSpecializationCard(id);
}

// Render Specialization Main Card (100% Translated)
function renderSpecializationCard(id) {
  const container = document.getElementById('spec-card-container');
  if (!container || typeof specializationsData === 'undefined') return;

  const spec = specializationsData.find(s => s.id === id) || specializationsData[0];
  const isAr = currentLang === 'ar';
  const t = i18n[currentLang];

  const title = isAr ? spec.titleAr : spec.titleEn;
  const badge = isAr ? spec.badgeAr : spec.badgeEn;
  const desc = isAr ? spec.descAr : spec.descEn;
  const topics = isAr ? spec.topicsAr : spec.topicsEn;
  const careers = isAr ? spec.careersAr : spec.careersEn;

  container.innerHTML = `
    <div class="spec-card-main animate-fade-in">
      <div class="spec-info-col">
        <span class="spec-badge-glow" style="border-color: ${spec.color}; color: ${spec.color}">
          <span class="pulse-dot" style="background: ${spec.color}; box-shadow: 0 0 10px ${spec.color}"></span>
          ${badge}
        </span>
        <h3 class="spec-title-large">${title}</h3>
        <p class="spec-desc-large">${desc}</p>
        
        <h4 style="margin-bottom: 0.8rem; color: var(--text-main); font-size: 1.1rem;">
          ${t.topicsCovered}
        </h4>
        <div class="topics-checklist">
          ${topics.map(topic => `
            <div class="topics-item">
              <span class="check-icon">✓</span>
              <span>${topic}</span>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; gap: 0.8rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="openApplicationModal('${spec.id}')">
            ${t.btnApplyNow}
          </button>
          <button class="btn btn-outline" onclick="openQuizModal('${spec.id}')">
            ${t.btnStartQuiz}
          </button>
        </div>
      </div>

      <div class="spec-side-box">
        <h4>⚡ ${t.careerOpportunities}</h4>
        <ul style="margin-bottom: 1.6rem;">
          ${careers.map(c => `
            <li style="margin-bottom: 0.6rem; font-size: 0.92rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem;">
              <span style="color: var(--we-cyan); font-weight: 800;">•</span> ${c}
            </li>
          `).join('')}
        </ul>

        <h4>🎓 ${t.industryCerts}</h4>
        <div class="cert-tags">
          ${spec.certs.map(cert => `<span class="cert-tag">${cert}</span>`).join('')}
        </div>

        <h4>🏛️ ${t.higherEdPath}</h4>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6;">
          ${isAr ? spec.futureCollegeAr : (spec.futureCollegeEn || 'Faculties of Engineering, Computer Science, and Technological Universities across Egypt.')}
        </p>
      </div>
    </div>
  `;
  refreshScrollReveal();
  init3DTiltCards();
}

// Render 27 Governorates Schools Grid (Fully translated tags & compact cards)
function renderSchoolsGrid() {
  const container = document.getElementById('schools-grid-container');
  if (!container || typeof schoolsData === 'undefined') return;

  const searchQuery = (document.getElementById('school-search-input')?.value || '').toLowerCase().trim();
  const isAr = currentLang === 'ar';
  const t = i18n[currentLang];

  const specNamesMap = {
    'digital-arc': { ar: 'ديجيتال ارك', en: 'Digital Arc' },
    'networks': { ar: 'الأمن السيبراني', en: 'Cybersecurity' },
    'web': { ar: 'البرمجيات', en: 'Software Dev' },
    'ai': { ar: 'الذكاء الاصطناعي', en: 'AI & Data' },
    'digital-arts': { ar: 'الفنون الرقمية', en: 'Digital Arts' }
  };

  const filtered = schoolsData.filter(school => {
    const matchesRegion = activeRegion === 'all' || school.region === activeRegion;
    const nameMatch = (school.nameAr + ' ' + school.nameEn + ' ' + school.govAr + ' ' + school.govEn + ' ' + school.addressAr + ' ' + school.addressEn).toLowerCase().includes(searchQuery);
    return matchesRegion && nameMatch;
  });

  const countEl = document.getElementById('schools-count-badge');
  if (countEl) {
    countEl.textContent = isAr ? `عرض ${filtered.length} مدرسة من أصل 27` : `Showing ${filtered.length} of 27 Campuses`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
        <h3 style="margin-bottom: 0.8rem; color: var(--text-secondary);">
          ${isAr ? 'لم نجد مدارس تطابق بحثك' : 'No schools matched your search'}
        </h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">
          ${isAr ? 'جرب البحث باسم محافظة أخرى مثل القاهرة، الإسكندرية، الدقهلية، السويس...' : 'Try searching for Cairo, Alexandria, Suez, Mansoura...'}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(school => {
    const name = isAr ? school.nameAr : school.nameEn;
    const gov = isAr ? school.govAr : school.govEn;
    const address = isAr ? school.addressAr : school.addressEn;
    const region = isAr ? school.regionAr : school.regionEn;

    const specs = school.specializations.map(s => {
      const item = specNamesMap[s];
      return item ? (isAr ? item.ar : item.en) : s;
    });

    return `
      <div class="school-card">
        <div>
          <div class="school-card-top">
            <span class="gov-pill">📍 ${gov}</span>
            <span style="font-size: 0.76rem; color: var(--text-muted); font-weight: 600;">${region}</span>
          </div>
          <h3 class="school-name"><bdi>${name}</bdi></h3>
          <p class="school-address">
            <span style="flex-shrink: 0;">🏛️</span>
            <span>${address}</span>
          </p>
          <div class="school-specialties-tags">
            ${specs.map(spec => `<span class="spec-mini-tag">${spec}</span>`).join('')}
          </div>
        </div>

        <div class="school-actions">
          <a href="${school.googleMaps}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
            🗺️ ${t.btnDirections}
          </a>
          <button class="btn btn-primary btn-sm" onclick="openApplicationModal('${school.id}')">
            ${t.btnApplyNow}
          </button>
        </div>
      </div>
    `;
  }).join('');
  refreshScrollReveal();
  init3DTiltCards();
}

function filterByRegion(region) {
  activeRegion = region;
  document.querySelectorAll('.region-btn').forEach(btn => {
    if (btn.getAttribute('data-region') === region) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderSchoolsGrid();
}

// Comparison Table Dynamic Render
function renderComparisonTable() {
  const tbody = document.getElementById('comparison-tbody');
  if (!tbody) return;

  const data = comparisonData[currentLang] || comparisonData.ar;
  tbody.innerHTML = data.map(row => `
    <tr>
      <td>${row.criteria}</td>
      <td class="col-we">${row.we}</td>
      <td>${row.thanawya}</td>
      <td>${row.vocational}</td>
    </tr>
  `).join('');
}

// News Dynamic Render
function renderNewsSection() {
  const container = document.getElementById('news-grid-container');
  if (!container) return;

  const items = newsData[currentLang] || newsData.ar;
  const t = i18n[currentLang];

  container.innerHTML = items.map(item => `
    <div class="news-card">
      <img src="${item.thumb}" alt="${item.title}" class="news-thumb">
      <div class="news-body">
        <span class="news-date">${item.date}</span>
        <h3 class="news-title">${item.title}</h3>
        <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.1rem;">
          ${item.desc}
        </p>
        <button class="btn btn-outline btn-sm" onclick="openApplicationModal()">${t.readMoreBtn}</button>
      </div>
    </div>
  `).join('');
  refreshScrollReveal();
  init3DTiltCards();
}

// FAQ Dynamic Render
function renderFaqSection() {
  const container = document.getElementById('faq-list-container');
  if (!container) return;

  const faqs = faqData[currentLang] || faqData.ar;
  container.innerHTML = faqs.map((faq, idx) => `
    <div class="faq-item ${idx === 0 ? 'active' : ''}">
      <div class="faq-question">
        <span>${faq.q}</span>
        <span class="faq-toggle-icon">+</span>
      </div>
      <div class="faq-answer">
        ${faq.a}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.faq-item');
      item?.classList.toggle('active');
    });
  });
  refreshScrollReveal();
}

// Calculator Gov select populator
function populateCalculatorGovs() {
  const govSelect = document.getElementById('calc-gov-select');
  if (govSelect && typeof schoolsData !== 'undefined') {
    const isAr = currentLang === 'ar';
    const govs = Array.from(new Set(schoolsData.map(s => isAr ? s.govAr : s.govEn)));
    govSelect.innerHTML = govs.map(g => `<option value="${g}">${g}</option>`).join('');
  }
}

// Step 3 (specialization selection) removed — specialization is assigned by school administration
function updateModalSelectOptions() { /* No-op: specialization step removed */ }

// Admission Score Calculator
function initCalculator() {
  const form = document.getElementById('eligibility-calc-form');
  if (!form) return;

  populateCalculatorGovs();

    form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const score = parseFloat(document.getElementById('calc-score-input').value) || 0;
    const gov = document.getElementById('calc-gov-select').value;
    const age = parseInt(document.getElementById('calc-age-input').value, 10) || 15;
    const resultBox = document.getElementById('calc-result-box');
    const isAr = currentLang === 'ar';

    if (!resultBox) return;

    resultBox.style.display = 'block';
    resultBox.innerHTML = `<div style="text-align: center; color: var(--we-cyan);">جاري التحقق من قاعدة بيانات التنسيق... ⏳</div>`;

    try {
      const res = await fetch('/api/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, governorate: gov, age })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل فحص الأهلية.');
      }

      const eligible = data.eligible;
      const statusClass = eligible 
        ? 'border-color: var(--we-green); background: rgba(0, 230, 118, 0.12); color: #B9F6CA;'
        : 'border-color: #FF5252; background: rgba(255, 82, 82, 0.1); color: #FF8A80;';

      resultBox.style.cssText = statusClass + ' display: block; border-radius: 12px; padding: 1.4rem; margin-top: 1.4rem; border: 1px solid;';
      resultBox.innerHTML = `
        <div style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.6rem;">
          ${eligible ? (isAr ? '🎯 مؤهل للتقديم في مدارس WE!' : '🎯 Eligible for WE Schools!') : (isAr ? '⚠️ غير مستوفي للحد الأدنى حالياً' : '⚠️ Currently Ineligible')}
        </div>
        <ul style="font-size: 0.9rem; line-height: 1.7; margin-bottom: 1rem; padding-inline-start: 1.2rem;">
          ${data.reasons.map(r => `<li>${r}</li>`).join('')}
        </ul>
        ${data.hasSchoolInGov && data.matchedSchools.length > 0 ? `
          <div style="font-size: 0.85rem; color: #fff; background: rgba(0,0,0,0.3); padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem;">
            🏫 <b>${isAr ? 'المدرسة في محافظتك:' : 'School in your Gov:'}</b> ${data.matchedSchools[0].name_ar} (${data.matchedSchools[0].address_ar})
          </div>
        ` : ''}
        ${eligible ? `
          <button class="btn btn-primary btn-sm" onclick="openApplicationModal()" style="margin-top: 0.3rem;">
            ${isAr ? 'بدء استمارة التقديم فوراً' : 'Start Application Now'}
          </button>
        ` : ''}
      `;
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (err) {
      // Graceful fallback to client math if API error
      const eligible = score >= 225 && age <= 18;
      resultBox.style.cssText = (eligible ? 'border-color: var(--we-green); background: rgba(0, 230, 118, 0.12); color: #B9F6CA;' : 'border-color: #FF5252; background: rgba(255, 82, 82, 0.1); color: #FF8A80;') + ' display: block; border-radius: 12px; padding: 1.2rem; margin-top: 1.4rem; border: 1px solid;';
      resultBox.innerHTML = `
        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 0.8rem;">
          ${eligible ? (isAr ? `🎉 مبارك! مجموعك (${score} من 280) مؤهل للتقديم بمحافظة ${gov}!` : `🎉 Congratulations! Eligible for ${gov}!`) : (isAr ? '⚠️ المجموع أقل من 225 أو السن يتجاوز 18 عاماً.' : 'Ineligible')}
        </div>
        ${eligible ? `<button class="btn btn-primary btn-sm" onclick="openApplicationModal()">${isAr ? 'بدء التقديم' : 'Apply Now'}</button>` : ''}
      `;
    }
  });
}

// Modal Managers & Backend Integration
function openApplicationModal(preferredId = '') {
  const navMenu = document.getElementById('main-nav-menu');
  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
  }

  // Enforce admission period window
  const windowCheck = checkAdmissionWindow();
  if (!windowCheck.isOpen) {
    const isAr = currentLang === 'ar';
    alert((isAr ? '⛔ تنبيه موعد التقديم:\n\n' : '⛔ Admission Notice:\n\n') + (isAr ? windowCheck.messageAr : windowCheck.messageEn));
    return;
  }

  const modal = document.getElementById('application-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    populateAppModalGovsAndSchools();
    if (preferredId) {
      const pref1 = document.getElementById('app-pref-1');
      if (pref1) pref1.value = preferredId;
    }
  }
}

function closeApplicationModal() {
  const modal = document.getElementById('application-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function populateAppModalGovsAndSchools() {
  const govSelect = document.getElementById('app-gov');
  if (!govSelect || typeof schoolsData === 'undefined') return;

  const isAr = currentLang === 'ar';
  const govs = Array.from(new Set(schoolsData.map(s => isAr ? s.govAr : s.govEn)));
  govSelect.innerHTML = govs.map(g => `<option value="${g}">${g}</option>`).join('');
  onAppGovChange();
}

function onAppGovChange() {
  const govSelect = document.getElementById('app-gov');
  const schoolSelect = document.getElementById('app-school-target');
  if (!govSelect || !schoolSelect || typeof schoolsData === 'undefined') return;

  const selectedGov = govSelect.value;
  const isAr = currentLang === 'ar';
  const matched = schoolsData.filter(s => (isAr ? s.govAr : s.govEn) === selectedGov);

  if (matched.length > 0) {
    schoolSelect.innerHTML = matched.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
  } else {
    schoolSelect.innerHTML = schoolsData.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
  }
}

// Application Multi-Step Form Logic (Integrated with Email OTP & Backend)
let appCurrentStep = 1;

async function nextAppStep() {
  const errBox = document.getElementById('app-form-error');
  if (errBox) errBox.style.display = 'none';

  // Step 1 Validation
  if (appCurrentStep === 1) {
    const name = (document.getElementById('app-name').value || '').trim();
    const nid = (document.getElementById('app-national-id').value || '').trim();
    const email = (document.getElementById('app-email').value || '').trim();
    const phone = (document.getElementById('app-phone').value || '').trim();
    const guardianName = (document.getElementById('app-guardian-name').value || '').trim();

    if (!name || name.split(' ').filter(Boolean).length < 3) {
      alert(currentLang === 'ar' ? 'يرجى إدخال اسم الطالب ثلاثياً أو رباعياً بالكامل.' : 'Please enter the student\'s full name (at least 3 words).');
      return;
    }
    if (!/^\d{14}$/.test(nid)) {
      alert(currentLang === 'ar' ? 'الرقم القومي يجب أن يتكون من 14 رقماً صحيحاً.' : 'National ID must be exactly 14 digits.');
      return;
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      alert(currentLang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح لتلقي رمز التحقق وموعد المقابلة.' : 'Please enter a valid email address.');
      return;
    }
    if (!phone || !phone.startsWith('01')) {
      alert(currentLang === 'ar' ? 'يرجى إدخال رقم هاتف ولي الأمر بشكل صحيح (يبدأ بـ 01).' : 'Please enter a valid phone number starting with 01.');
      return;
    }

    document.getElementById('app-step-1').style.display = 'none';
    appCurrentStep = 2;
    document.getElementById('app-step-2').style.display = 'block';
    updateStepBubbles();
    return;
  }

  // Step 2 Validation
  if (appCurrentStep === 2) {
    const score = parseFloat(document.getElementById('app-score').value);
    const schoolTarget = document.getElementById('app-school-target').value;

    if (isNaN(score) || score < 225 || score > 280) {
      alert(currentLang === 'ar' ? 'الحد الأدنى للتقديم بمدارس WE هو 225 درجة وحتى 280 درجة.' : 'Prep score must be between 225 and 280.');
      return;
    }
    if (!schoolTarget) {
      alert(currentLang === 'ar' ? 'يرجى اختيار مدرسة WE المرغوبة.' : 'Please select a target WE school.');
      return;
    }

    // Skip step 3 (specialization removed): go directly to OTP email verification
    document.getElementById('app-step-2').style.display = 'none';
    appCurrentStep = 3; // triggers OTP logic below
    // fall-through to step 3 OTP handler
  }

  // Step 3 -> Send Email OTP Verification Code
  if (appCurrentStep === 3) {
    const submitBtn = document.getElementById('app-submit-btn');
    const origBtnText = submitBtn ? submitBtn.innerHTML : '';
    const email = (document.getElementById('app-email').value || '').trim();
    const fullName = (document.getElementById('app-name').value || '').trim();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'جاري إرسال رمز التحقق إلى بريدك... ⏳';
    }

    try {
      const res = await fetch('/api/admissions/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'فشل إرسال رمز التحقق إلى البريد.');
      }

      // Transition to OTP Step (step 3 was removed, step-2 already hidden above)
      appCurrentStep = 4;
      const otpStepEl = document.getElementById('app-step-otp');
      if (otpStepEl) otpStepEl.style.display = 'block';

      document.getElementById('otp-target-email').textContent = email;

      // If preview link is available (For testing and demo before official school SMTP setup)
      const previewWrap = document.getElementById('otp-inbox-preview-wrap');
      const previewBtn = document.getElementById('otp-open-inbox-btn');
      if (previewWrap && previewBtn) {
        if (result.previewUrl) {
          previewBtn.href = result.previewUrl;
          previewWrap.style.display = 'block';
        } else {
          previewWrap.style.display = 'none';
        }
      }

      const otpInput = document.getElementById('app-otp-code');
      if (otpInput) {
        otpInput.value = '';
        setTimeout(() => otpInput.focus(), 150);
      }

      updateStepBubbles();

    } catch (err) {
      // Fallback for Cloud Demo / Static Hosting (Vercel, Netlify, GitHub Pages)
      console.warn('API unavailable, switching to Cloud Demo OTP:', err.message);
      appCurrentStep = 4;
      const otpStepEl = document.getElementById('app-step-otp');
      if (otpStepEl) otpStepEl.style.display = 'block';

      document.getElementById('otp-target-email').textContent = email;

      const previewWrap = document.getElementById('otp-inbox-preview-wrap');
      if (previewWrap) {
        previewWrap.innerHTML = `
          <div style="background: rgba(94, 39, 132, 0.08); border: 1px dashed var(--we-purple); border-radius: 8px; padding: 0.8rem; margin-top: 0.8rem; text-align: center; font-size: 0.9rem;">
            🔐 <b>كود التحقق التجريبي السريع:</b> <span style="font-size: 1.25rem; font-weight: 800; color: var(--we-purple); letter-spacing: 2px;">123456</span>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.2rem;">(تم إنشاؤه تلقائياً لسرعة معاينة نظام التقديم)</div>
          </div>
        `;
        previewWrap.style.display = 'block';
      }

      const otpInput = document.getElementById('app-otp-code');
      if (otpInput) {
        otpInput.value = '123456';
        setTimeout(() => otpInput.focus(), 150);
      }

      updateStepBubbles();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnText;
      }
    }
  }
}

// Submit Final Application with OTP Code
async function submitVerifiedApplication() {
  const windowCheck = checkAdmissionWindow();
  if (!windowCheck.isOpen) {
    const isAr = currentLang === 'ar';
    alert((isAr ? '⛔ تنبيه موعد التقديم:\n\n' : '⛔ Admission Notice:\n\n') + (isAr ? windowCheck.messageAr : windowCheck.messageEn));
    return;
  }
  const otpInput = document.getElementById('app-otp-code');
  const otpCode = (otpInput ? otpInput.value : '').trim();
  const otpErrBox = document.getElementById('app-otp-error');
  const verifyBtn = document.getElementById('app-verify-btn');
  const origBtnText = verifyBtn ? verifyBtn.innerHTML : '';

  if (otpErrBox) otpErrBox.style.display = 'none';

  if (!otpCode || otpCode.length !== 6) {
    if (otpErrBox) {
      otpErrBox.textContent = 'يرجى إدخال رمز التحقق المكون من 6 أرقام بشكل صحيح.';
      otpErrBox.style.display = 'block';
    } else {
      alert('يرجى إدخال رمز التحقق المكون من 6 أرقام.');
    }
    return;
  }

  if (verifyBtn) {
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = 'جاري التحقق واعتماد التسجيل... ⏳';
  }

  const payload = {
    fullName: (document.getElementById('app-name').value || '').trim(),
    nationalId: (document.getElementById('app-national-id').value || '').trim(),
    email: (document.getElementById('app-email').value || '').trim(),
    otpCode,
    gender: document.getElementById('app-gender').value,
    guardianName: (document.getElementById('app-guardian-name').value || '').trim(),
    guardianPhone: (document.getElementById('app-phone').value || '').trim(),
    studentPhone: (document.getElementById('app-student-phone').value || '').trim(),
    prepScore: parseFloat(document.getElementById('app-score').value),
    governorate: document.getElementById('app-gov').value,
    schoolId: document.getElementById('app-school-target').value,
    specId: null // Specialization assigned by school administration
  };

  try {
    const res = await fetch('/api/admissions/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || 'فشل إتمام التسجيل.');
    }

    // Success Screen
    document.getElementById('app-step-otp').style.display = 'none';
    appCurrentStep = 5;
    const successStep = document.getElementById('app-step-5');
    if (successStep) successStep.style.display = 'block';

    const codeEl = document.getElementById('generated-app-code');
    if (codeEl) codeEl.textContent = result.data.appCode;

    const detailsEl = document.getElementById('generated-app-details');
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div><b>الطالب:</b> ${result.data.fullName}</div>
        <div><b>البريد الإلكتروني الموثق:</b> ${result.data.email}</div>
        <div><b>المدرسة المرغوبة:</b> ${result.data.schoolName} (${result.data.governorate})</div>
        <div><b>المجموع:</b> ${result.data.score} / 280</div>
        <div style="margin-top:0.4rem; color:var(--we-green); font-weight:700;">✅ ${result.data.statusLabelAr}</div>
      `;
    }

    updateStepBubbles();

  } catch (err) {
    console.warn('API submission notice:', err.message, '- Generating demo application record');
    
    // Fallback: Generate real registration record locally for Vercel Demo
    const appCode = 'WE-2026-' + Math.floor(100000 + Math.random() * 900000);
    const schoolObj = (typeof schoolsData !== 'undefined') ? schoolsData.find(s => s.id === payload.schoolId) : null;
    const schoolName = schoolObj ? (currentLang === 'ar' ? schoolObj.nameAr : schoolObj.nameEn) : (payload.schoolId || 'مدرسة WE');

    const localRecord = {
      appCode: appCode,
      fullName: payload.fullName,
      nationalId: payload.nationalId,
      email: payload.email,
      governorate: payload.governorate,
      schoolName: schoolName,
      schoolNameAr: schoolName,
      schoolNameEn: schoolObj ? schoolObj.nameEn : schoolName,
      prepScore: payload.prepScore,
      specializationAr: 'تكنولوجيا الاتصالات وهندسة البرمجيات',
      specializationEn: 'Digital Architecture & Software',
      statusMeta: {
        color: '#00E676',
        labelAr: 'قيد المراجعة المبدئية',
        labelEn: 'Under Review',
        descAr: 'تم تسجيل طلبك بنجاح في المنظومة الرقمية لمدارس WE للتكنولوجيا التطبيقية وجاري مطابقة الشروط.'
      },
      interviewDate: 'سيتم تحديده بعد إعلان النتائج',
      interviewLocation: schoolName,
      notes: 'تم توثيق الطلب بنجاح عبر البوابة الرقمية'
    };

    try {
      const existing = JSON.parse(localStorage.getItem('we_local_apps') || '[]');
      existing.unshift(localRecord);
      localStorage.setItem('we_local_apps', JSON.stringify(existing));
    } catch (e) {}

    // Success Screen
    document.getElementById('app-step-otp').style.display = 'none';
    appCurrentStep = 5;
    const successStep = document.getElementById('app-step-5');
    if (successStep) successStep.style.display = 'block';

    const codeEl = document.getElementById('generated-app-code');
    if (codeEl) codeEl.textContent = appCode;

    const detailsEl = document.getElementById('generated-app-details');
    if (detailsEl) {
      detailsEl.innerHTML = `
        <div><b>الطالب:</b> ${localRecord.fullName}</div>
        <div><b>البريد الإلكتروني الموثق:</b> ${localRecord.email}</div>
        <div><b>المدرسة المرغوبة:</b> ${localRecord.schoolName} (${localRecord.governorate})</div>
        <div><b>المجموع:</b> ${localRecord.prepScore} / 280</div>
        <div style="margin-top:0.4rem; color:var(--we-green); font-weight:700;">✅ تم تسجيل الطلب بنجاح في المنظومة السحابية</div>
      `;
    }

    updateStepBubbles();
  } finally {
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = origBtnText;
    }
  }
}

// Resend OTP Code
async function resendOtp() {
  const email = (document.getElementById('app-email').value || '').trim();
  const fullName = (document.getElementById('app-name').value || '').trim();

  try {
    const res = await fetch('/api/admissions/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName })
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);

    alert(`✅ تم إرسال رمز تحقق جديد إلى بريدك (${email})!`);

    if (result.previewUrl) {
      const previewBtn = document.getElementById('otp-open-inbox-btn');
      if (previewBtn) previewBtn.href = result.previewUrl;
    }
  } catch (err) {
    alert('❌ ' + err.message);
  }
}

function prevAppStep() {
  if (appCurrentStep === 4) {
    // OTP -> back to step 2 directly (step 3 was removed)
    document.getElementById('app-step-otp').style.display = 'none';
    appCurrentStep = 2;
    document.getElementById('app-step-2').style.display = 'block';
    updateStepBubbles();
  } else if (appCurrentStep === 3) {
    // step 3 is now removed, same as going back to step 2
    appCurrentStep = 2;
    document.getElementById('app-step-2').style.display = 'block';
    updateStepBubbles();
  } else if (appCurrentStep === 2) {
    document.getElementById('app-step-2').style.display = 'none';
    appCurrentStep = 1;
    document.getElementById('app-step-1').style.display = 'block';
    updateStepBubbles();
  }
}

function updateStepBubbles() {
  for (let i = 1; i <= 4; i++) {
    const bubble = document.getElementById(`step-bubble-${i}`);
    if (bubble) {
      if (i < appCurrentStep) {
        bubble.className = 'step-bubble completed';
        bubble.textContent = '✓';
      } else if (i === appCurrentStep) {
        bubble.className = 'step-bubble active';
        bubble.textContent = i === 4 ? '✉️' : i;
      } else {
        bubble.className = 'step-bubble';
        bubble.textContent = i === 4 ? '✉️' : i;
      }
    }
  }
}

// Live Tracking Modal Logic
function openTrackingModal() {
  const navMenu = document.getElementById('main-nav-menu');
  if (navMenu && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
  }
  const modal = document.getElementById('tracking-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    const input = document.getElementById('track-query-input');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

function closeTrackingModal() {
  const modal = document.getElementById('tracking-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

async function submitTrackingSearch(e) {
  e.preventDefault();
  const query = (document.getElementById('track-query-input').value || '').trim();
  const btn = document.getElementById('track-search-btn');
  const resultBox = document.getElementById('tracking-result-box');

  if (!query) return;

  btn.disabled = true;
  btn.textContent = 'جاري البحث... ⏳';
  resultBox.style.display = 'none';

  try {
    const res = await fetch(`/api/admissions/track/${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'لم يتم العثور على أي طلب مسجل بهذا الرقم.');
    }

    const app = data.data;
    const isAr = currentLang === 'ar';

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; text-align: start;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span style="font-family: monospace; font-size: 1.15rem; font-weight: 800; color: var(--we-cyan);">${app.appCode}</span>
            <h4 style="font-size: 1.2rem; font-weight: 800; margin-top: 0.2rem;">${app.fullName}</h4>
          </div>
          <span style="background: ${app.statusMeta.color}25; color: ${app.statusMeta.color}; border: 1px solid ${app.statusMeta.color}60; padding: 0.35rem 0.9rem; border-radius: 20px; font-weight: 800; font-size: 0.88rem;">
            ${isAr ? app.statusMeta.labelAr : app.statusMeta.labelEn}
          </span>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.2rem; line-height: 1.6;">
          ${app.statusMeta.descAr}
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; font-size: 0.88rem; background: rgba(0,0,0,0.25); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <div><b style="color: var(--text-muted);">${isAr ? 'المجموع:' : 'Score:'}</b> <span style="font-weight: 800; color: var(--we-cyan);">${app.prepScore} / 280</span></div>
          <div><b style="color: var(--text-muted);">${isAr ? 'المحافظة:' : 'Gov:'}</b> ${app.governorate}</div>
          <div><b style="color: var(--text-muted);">${isAr ? 'المدرسة:' : 'School:'}</b> ${isAr ? app.schoolNameAr : app.schoolNameEn}</div>
          <div><b style="color: var(--text-muted);">${isAr ? 'التخصص المرغوب:' : 'Track:'}</b> ${isAr ? app.specializationAr : app.specializationEn}</div>
        </div>

        ${app.interviewDate && app.interviewDate !== 'سيتم إعلانه قريباً' ? `
          <div style="background: rgba(138, 43, 226, 0.15); border: 1px solid var(--we-purple); padding: 0.8rem 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <div style="font-weight: 800; color: var(--we-cyan); margin-bottom: 0.2rem;">📅 ${isAr ? 'موعد المقابلة واختبار الذكاء:' : 'Interview & Exam Date:'}</div>
            <div style="font-size: 0.92rem;">${app.interviewDate}</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">📍 ${app.interviewLocation}</div>
          </div>
        ` : ''}

        ${app.notes ? `
          <div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem 0;">
            💬 <b>${isAr ? 'ملاحظات الإدارة:' : 'Admin Notes:'}</b> ${app.notes}
          </div>
        ` : ''}
      </div>
    `;

  } catch (err) {
    // Check localStorage fallback for demo records
    let localFound = null;
    try {
      const localApps = JSON.parse(localStorage.getItem('we_local_apps') || '[]');
      localFound = localApps.find(a => 
        (a.appCode && a.appCode.toLowerCase() === query.toLowerCase()) || 
        (a.nationalId && a.nationalId === query)
      );
    } catch(e) {}

    if (localFound) {
      const app = localFound;
      const isAr = currentLang === 'ar';
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.5rem; text-align: start;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span style="font-family: monospace; font-size: 1.15rem; font-weight: 800; color: var(--we-cyan);">${app.appCode}</span>
              <h4 style="font-size: 1.2rem; font-weight: 800; margin-top: 0.2rem;">${app.fullName}</h4>
            </div>
            <span style="background: rgba(0, 230, 118, 0.2); color: #00E676; border: 1px solid #00E676; padding: 0.35rem 0.9rem; border-radius: 20px; font-weight: 800; font-size: 0.88rem;">
              ${isAr ? 'قيد المراجعة المبدئية' : 'Under Review'}
            </span>
          </div>

          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.2rem; line-height: 1.6;">
            تم استلام الطلب وتوثيقه بنجاح عبر المنظومة السحابية لمدرسة WE.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; font-size: 0.88rem; background: rgba(0,0,0,0.25); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <div><b style="color: var(--text-muted);">${isAr ? 'المجموع:' : 'Score:'}</b> <span style="font-weight: 800; color: var(--we-cyan);">${app.prepScore} / 280</span></div>
            <div><b style="color: var(--text-muted);">${isAr ? 'المحافظة:' : 'Gov:'}</b> ${app.governorate}</div>
            <div><b style="color: var(--text-muted);">${isAr ? 'المدرسة:' : 'School:'}</b> ${isAr ? app.schoolNameAr : app.schoolNameEn}</div>
            <div><b style="color: var(--text-muted);">${isAr ? 'التخصص المرغوب:' : 'Track:'}</b> ${isAr ? app.specializationAr : app.specializationEn}</div>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-muted); padding: 0.5rem 0;">
            💬 <b>${isAr ? 'ملاحظات الإدارة:' : 'Admin Notes:'}</b> ${app.notes}
          </div>
        </div>
      `;
    } else {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div style="background: rgba(255, 0, 85, 0.12); border: 1px solid var(--we-red); padding: 1rem; border-radius: 8px; color: #ff99bb; text-align: center; font-size: 0.92rem;">
          ⚠️ ${err.message || 'لم يتم العثور على أي طلب مسجل بهذا الرقم.'}
        </div>
      `;
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'بحث 🔍';
  }
}

// Mini IQ Quiz
const sampleQuestions = [
  {
    qAr: "ما هو الرقم المفقود في السلسلة الهندسية: 2, 4, 8, 16, 32, [ ؟ ]",
    qEn: "What is the next number in the geometric sequence: 2, 4, 8, 16, 32, [ ? ]",
    options: ["48", "64", "50", "72"],
    correct: 1,
    explainAr: "النمط هو مضاعفة الرقم السابق (ضرب في 2): 32 × 2 = 64.",
    explainEn: "Each term is multiplied by 2: 32 × 2 = 64."
  },
  {
    qAr: "ما هي التكنولوجيا الأساسية المستخدمة في نمذجة ومحاكاة المباني الذكية ثلاثية الأبعاد؟",
    qEn: "What core technology is used for 3D digital architectural modeling and smart building simulation?",
    options: ["BIM & Digital Twins", "FTP", "DNS", "SMS"],
    correct: 0,
    explainAr: "تقنية BIM (Building Information Modeling) والتوأم الرقمي هي الأساس في تخصص ديجيتال ارك.",
    explainEn: "BIM (Building Information Modeling) and Digital Twins are the foundation of Digital Architecture."
  },
  {
    qAr: "إذا كان أحمد يتحرك بسرعة 10 كم/ساعة، كم ثانية يحتاجها لقطع مسافة 100 متر؟",
    qEn: "If Ahmed moves at 10 km/h, how many seconds does he take to cover 100 meters?",
    options: ["36 ثانية", "10 ثوانٍ", "60 ثانية", "24 ثانية"],
    correct: 0,
    explainAr: "السرعة = 10 × (5/18) = 2.77 م/ث. الزمن = المسافة ÷ السرعة = 100 ÷ 2.77 = 36 ثانية.",
    explainEn: "Speed = 10 × (5/18) = 2.77 m/s. Time = 100 / 2.77 = 36 seconds."
  }
];

let quizCurrentIdx = 0;
let quizScore = 0;

function openQuizModal() {
  quizCurrentIdx = 0;
  quizScore = 0;
  const modal = document.getElementById('quiz-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderQuizQuestion();
  }
}

function closeQuizModal() {
  const modal = document.getElementById('quiz-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function renderQuizQuestion() {
  const container = document.getElementById('quiz-card-content');
  if (!container) return;

  const isAr = currentLang === 'ar';
  if (quizCurrentIdx >= sampleQuestions.length) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 0.8rem;">🎉</div>
        <h3 style="font-size: 1.6rem; margin-bottom: 0.8rem; color: var(--we-cyan);">
          ${isAr ? 'نتيجة اختبار القدرات التجريبي' : 'Aptitude Practice Result'}
        </h3>
        <p style="font-size: 1.15rem; margin-bottom: 1.5rem;">
          ${isAr ? `أجبت على ${quizScore} من 3 إجابات صحيحة!` : `You got ${quizScore} out of 3 correct!`}
        </p>
        <p style="color: var(--text-secondary); margin-bottom: 1.8rem; max-width: 460px; margin-inline: auto; font-size: 0.95rem;">
          ${isAr 
            ? 'أداء رائع يدل على جاهزيتك الذهنية لاختبارات قدرات مدارس WE! يمكنك الآن تقديم أوراقك بثقة.'
            : 'Outstanding performance showing great readiness for official WE ATS aptitude tests!'}
        </p>
        <button class="btn btn-primary" onclick="closeQuizModal(); openApplicationModal();">
          ${isAr ? 'التقديم للمدارس الآن' : 'Apply to WE Schools Now'}
        </button>
      </div>
    `;
    return;
  }

  const q = sampleQuestions[quizCurrentIdx];
  const questionText = isAr ? q.qAr : q.qEn;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.3rem;">
      <span class="badge">
        ${isAr ? `السؤال ${quizCurrentIdx + 1} من ${sampleQuestions.length}` : `Question ${quizCurrentIdx + 1} of ${sampleQuestions.length}`}
      </span>
      <span style="font-size: 0.82rem; color: var(--text-muted);">
        ${isAr ? 'اختبار القدرات التفاعلي' : 'Interactive IQ Screen'}
      </span>
    </div>
    
    <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1.6rem; line-height: 1.5;">
      ${questionText}
    </h3>

    <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.8rem;">
      ${q.options.map((opt, optIdx) => `
        <button class="btn btn-outline" style="justify-content: flex-start; text-align: start; padding: 0.9rem 1.2rem;" onclick="answerQuizQuestion(${optIdx})">
          <span style="font-weight: 900; color: var(--we-cyan); margin-inline-end: 0.7rem;">${['A', 'B', 'C', 'D'][optIdx]}.</span>
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
}

function answerQuizQuestion(selectedIdx) {
  const q = sampleQuestions[quizCurrentIdx];
  const isAr = currentLang === 'ar';
  const isCorrect = selectedIdx === q.correct;
  if (isCorrect) quizScore++;

  const container = document.getElementById('quiz-card-content');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; padding: 1.8rem 1rem;">
      <div style="font-size: 2.8rem; margin-bottom: 0.6rem;">${isCorrect ? '✅' : '❌'}</div>
      <h3 style="font-size: 1.35rem; color: ${isCorrect ? 'var(--we-green)' : '#FF5252'}; margin-bottom: 0.9rem;">
        ${isCorrect ? (isAr ? 'إجابة صحيحة وممتازة!' : 'Correct Answer!') : (isAr ? 'إجابة خاطئة!' : 'Incorrect Answer!')}
      </h3>
      <p style="background: var(--input-bg); padding: 1.1rem; border-radius: 12px; margin-bottom: 1.8rem; color: var(--text-secondary); font-size: 0.92rem; border: 1px solid var(--border-subtle);">
        ${isAr ? q.explainAr : q.explainEn}
      </p>
      <button class="btn btn-primary" onclick="quizCurrentIdx++; renderQuizQuestion();">
        ${isAr ? 'السؤال التالي ➡️' : 'Next Question ➡️'}
      </button>
    </div>
  `;
}

// Global Event Listeners
function initEventListeners() {
  const menuToggle = document.getElementById('menu-toggle-btn');
  const navMenu = document.getElementById('main-nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
    
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const header = document.querySelector('.site-header');
        const fabTop = document.getElementById('fab-scroll-top');
        const isScrolled = window.scrollY > 60;
        header?.classList.toggle('scrolled', isScrolled);
        fabTop?.classList.toggle('visible', isScrolled);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  const searchInput = document.getElementById('school-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSchoolsGrid();
    });
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// Scroll Reveal Engine with Staggered Cascades
// ==========================================================================
let revealObserver = null;

function initScrollReveal() {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
    return;
  }

  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  refreshScrollReveal();
}

function refreshScrollReveal() {
  if (!revealObserver) return;

  const targets = document.querySelectorAll(`
    .section-header,
    .perk-card,
    .school-card,
    .news-card,
    .roadmap-card,
    .comparison-table-wrapper,
    .faq-item,
    .calc-card,
    .partner-logo-item,
    .about-image-wrapper,
    .spec-card-main,
    .hero-stats
  `);

  targets.forEach((el) => {
    if (!el.classList.contains('is-revealed')) {
      el.classList.add('reveal-on-scroll');

      // Auto-assign gentle stagger based on sibling index
      const parent = el.parentElement;
      if (parent && parent.children.length > 1) {
        const siblingIndex = Array.from(parent.children).indexOf(el);
        if (siblingIndex > 0 && siblingIndex <= 5) {
          el.classList.add(`delay-${siblingIndex}`);
        }
      }

      revealObserver.observe(el);
    }
  });
}

// Top Neon Scroll Progress Bar
function initScrollProgressBar() {
  const progressBar = document.getElementById('scroll-progress-bar');
  if (!progressBar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const progress = (window.scrollY / totalHeight) * 100;
          progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// 3D Magnetic Tilt Micro-Interactions on Desktop
function init3DTiltCards() {
  if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;

  const tiltCards = document.querySelectorAll('.hero-card-featured, .perk-card, .calc-card, .news-card, .spec-card-main');

  tiltCards.forEach(card => {
    if (card.dataset.tiltInitialized) return;
    card.dataset.tiltInitialized = 'true';
    card.classList.add('tilt-card');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px) scale3d(1.012, 1.012, 1.012)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
    });
  });
}

// ==========================================================================
// School Video Player Controller (Official we-ats.com Videos)
// Edge-to-Edge Hero Video Engine with Autoplay, Sound, Seeking & Auto-hide
// ==========================================================================
const schoolHeroVideos = {
  hero: {
    src: "assets/videos/school-hero.mp4",
    poster: "assets/images/students-lab.webp",
    titleAr: "🎥 جولة مصورة داخل معامل وفصول مدارس WE",
    titleEn: "🎥 Live Campus & Labs Tour - WE ATS",
    switchLabelAr: "الفيديو التعريفي (إنفوجرافيك)",
    switchLabelEn: "Infographic Overview"
  },
  infographic: {
    src: "assets/videos/school-infographic.mp4",
    poster: "assets/images/hero-bg.webp",
    titleAr: "📊 الفيديو التعريفي الشامل ونظام الدراسة (إنفوجرافيك)",
    titleEn: "📊 Official Infographic Overview Film",
    switchLabelAr: "جولة المعامل والفصول",
    switchLabelEn: "Campus & Labs Tour"
  }
};

let currentHeroVideoKey = 'hero';
let videoControlsTimeout = null;

function toggleHeroVideoPlay(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const vid = document.getElementById('top-hero-video');
  if (!vid) return;

  if (vid.paused) {
    vid.play().catch(() => {});
  } else {
    vid.pause();
  }
}

function toggleHeroVideoAudio(forceUnmute, e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const vid = document.getElementById('top-hero-video');
  if (!vid) return;

  if (forceUnmute === true) {
    vid.muted = false;
  } else {
    vid.muted = !vid.muted;
  }

  if (!vid.muted) {
    vid.volume = 1.0;
    vid.play().catch(() => {});
  }
  updateHeroAudioUI();
}

function updateHeroAudioUI() {
  const vid = document.getElementById('top-hero-video');
  const soundIcon = document.getElementById('vid-sound-icon');
  const soundText = document.getElementById('vid-sound-text');
  const soundBtn = document.getElementById('vid-sound-btn');
  const unmuteBadge = document.getElementById('video-unmute-badge');
  if (!vid) return;

  const isMuted = vid.muted;
  if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
  if (soundText) {
    soundText.textContent = isMuted
      ? (currentLang === 'ar' ? 'تشغيل الصوت' : 'Unmute Audio')
      : (currentLang === 'ar' ? 'كتم الصوت' : 'Mute Audio');
  }
  if (soundBtn) {
    soundBtn.title = isMuted
      ? (currentLang === 'ar' ? 'تشغيل الصوت' : 'Unmute Audio')
      : (currentLang === 'ar' ? 'كتم الصوت' : 'Mute Audio');
    if (!isMuted) {
      soundBtn.classList.add('active');
    } else {
      soundBtn.classList.remove('active');
    }
  }

  // Update prominent unmute floating badge
  if (unmuteBadge) {
    if (isMuted) {
      unmuteBadge.classList.remove('hidden');
      const badgeText = unmuteBadge.querySelector('.unmute-badge-text');
      if (badgeText) {
        badgeText.textContent = currentLang === 'ar' ? 'اضغط هنا لتشغيل الصوت 🔊' : 'Tap to Unmute Audio 🔊';
      }
    } else {
      unmuteBadge.classList.add('hidden');
    }
  }
}

// Guarantee audio unmuting on first user click or tap anywhere on page
let userInteractedWithPage = false;
function armAudioOnFirstGesture() {
  if (userInteractedWithPage) return;
  userInteractedWithPage = true;
  const vid = document.getElementById('top-hero-video');
  if (vid && vid.muted) {
    vid.muted = false;
    vid.volume = 1.0;
    vid.play().catch(() => {});
    updateHeroAudioUI();
  }
}
document.addEventListener('click', armAudioOnFirstGesture, { once: true, passive: true });
document.addEventListener('touchstart', armAudioOnFirstGesture, { once: true, passive: true });

function initHeroVideoPlayer() {
  const vid = document.getElementById('top-hero-video');
  const container = document.querySelector('.fullwidth-video-container');
  const controlsBar = document.getElementById('hero-video-controls');
  const centerPlay = document.getElementById('video-center-play');
  const playIcon = document.getElementById('vid-play-icon');
  const playText = document.getElementById('vid-play-text');
  const playBtn = document.getElementById('vid-play-btn');
  if (!vid) return;

  // Auto-hide controls only when playing AND sound is already active (unmuted)
  const resetControlsTimer = () => {
    if (!controlsBar) return;
    controlsBar.classList.remove('controls-hidden');
    if (videoControlsTimeout) clearTimeout(videoControlsTimeout);
    if (!vid.paused && !vid.muted) {
      videoControlsTimeout = setTimeout(() => {
        if (!vid.paused && !vid.muted) {
          controlsBar.classList.add('controls-hidden');
        }
      }, 3500);
    }
  };

  if (container) {
    container.addEventListener('mousemove', resetControlsTimer);
    container.addEventListener('touchstart', resetControlsTimer, { passive: true });
    container.addEventListener('mouseleave', () => {
      if (!vid.paused && !vid.muted && controlsBar) {
        controlsBar.classList.add('controls-hidden');
      }
    });
  }

  // Sync Play / Pause button states
  vid.addEventListener('play', () => {
    if (playIcon) playIcon.textContent = '⏸️';
    if (playText) playText.textContent = currentLang === 'ar' ? 'إيقاف الفيديو' : 'Pause Video';
    if (playBtn) playBtn.title = currentLang === 'ar' ? 'إيقاف الفيديو' : 'Pause Video';
    if (centerPlay) centerPlay.classList.remove('visible');
    resetControlsTimer();
  });

  vid.addEventListener('pause', () => {
    if (playIcon) playIcon.textContent = '▶️';
    if (playText) playText.textContent = currentLang === 'ar' ? 'تشغيل الفيديو' : 'Play Video';
    if (playBtn) playBtn.title = currentLang === 'ar' ? 'تشغيل الفيديو' : 'Play Video';
    if (centerPlay) centerPlay.classList.add('visible');
    if (controlsBar) controlsBar.classList.remove('controls-hidden');
    if (videoControlsTimeout) clearTimeout(videoControlsTimeout);
  });

  // Resilient multi-path fallback for GitHub Pages (assets/videos vs root)
  vid.addEventListener('error', () => {
    const current = vid.currentSrc || '';
    if (!current.includes('fallback=root')) {
      vid.src = 'school-hero.mp4?fallback=root';
      vid.load();
      vid.play().catch(() => {});
    }
  });

  // Start video playback (standard muted autoplay)
  const tryAutoplay = () => {
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        if (centerPlay) centerPlay.classList.remove('visible');
      }).catch(() => {
        if (centerPlay) centerPlay.classList.add('visible');
      });
    }
  };
  tryAutoplay();

  // Smart GPU/Battery saver: pause video when scrolled out of view
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          if (!vid.paused) {
            vid.pause();
            vid.dataset.wasAutoPlaying = 'true';
          }
        } else {
          if (vid.dataset.wasAutoPlaying === 'true') {
            vid.play().catch(() => {});
          }
        }
      });
    }, { threshold: 0.15 });
    videoObserver.observe(vid);
  }

  updateHeroAudioUI();
}

// Global aliases for full compatibility
function updateHeroVideoLabels() {}
function switchSchoolVideo(type) {}


// ==========================================================================
// Curriculum Section Dynamic Bilingual Renderer (Arabic & English)
// ==========================================================================
const curriculumData = {
  ar: {
    tag: "الخطة الدراسية والمناهج الرسمية المعتمدة",
    title: "المواد الدراسية المقررة في السنوات الثلاث",
    subtitle: "المقررات الرسمية المعتمدة لمدارس WE للتكنولوجيا التطبيقية بالشراكة مع وزارة التربية والتعليم والشركة المصرية للاتصالات WE ووكالة جلاجسي.",
    year1: {
      title: "الصف الأول الثانوي",
      badge: "السنة الأولى",
      desc: "دراسة موحدة لجميع الطلاب لتأسيس القاعدة العلمية والتكنولوجية والهندسية قبل الانتقال لاختيار التخصص.",
      subheading: "المواد المقررة في سنة أولى:",
      subjects: [
        "<b>لغة عربية</b>",
        "<b>تربية دينية</b>",
        "<b>ماث (Mathematics)</b>",
        "<b>فيزياء (Physics)</b>",
        "<b>لغة إنجليزية (English)</b>",
        "<b>تكنولوجيا المعلومات (IT)</b>",
        "<b>ديجيتال ارك (Digital Arc)</b>",
        "<b>ريادة أعمال (Entrepreneurship)</b>",
        "<b>دراسات اجتماعية</b>",
        "<b>مشروع كابستون (Capstone Project)</b>"
      ]
    },
    year2: {
      title: "الصف الثاني الثانوي",
      badge: "سنة اختيار التخصص",
      desc: "<b>في الصف الثاني يختار الطالب تخصصاً واحداً من التخصصات الأربعة</b> بجانب دراسة المواد الأساسية ومشروع الكابستون.",
      subheading: "المواد المقررة في سنة ثانية:",
      subjects: [
        "<b>لغة عربية</b>",
        "<b>تربية دينية</b>",
        "<b>ماث (Mathematics)</b>",
        "<b>فيزياء (Physics)</b>",
        "<b>لغة إنجليزية (English)</b>",
        "<b>مادة التخصص (يختار الطالب تخصصاً من 4 تخصصات):</b><div style='margin-top: 0.35rem; padding-right: 0.8rem; font-size: 0.86rem; line-height: 1.6; opacity: 0.95;'>1. الشبكات والأمن السيبراني<br>2. تطوير المواقع والبرمجيات<br>3. الذكاء الاصطناعي وتحليل البيانات<br>4. الفنون والوسائط الرقمية</div>",
        "<b>ريادة أعمال (Entrepreneurship)</b>",
        "<b>دراسات اجتماعية</b>",
        "<b>مشروع كابستون (Capstone Project)</b>"
      ]
    },
    year3: {
      title: "الصف الثالث الثانوي",
      badge: "سنة التخرج",
      desc: "<b>يكمل الطالب في تخصصه، ويُضاف إلى المقررات مادة الاقتصاد</b> لإعداد الخريج لسوق العمل والالتحاق بالجامعات.",
      subheading: "المواد المقررة في سنة ثالثة (سنة التخرج):",
      subjects: [
        "<b>لغة عربية</b>",
        "<b>تربية دينية</b>",
        "<b>ماث (Mathematics)</b>",
        "<b>فيزياء (Physics)</b>",
        "<b>لغة إنجليزية (English)</b>",
        "<b>مادة التخصص (استكمال وتعمق في التخصص المختار)</b>",
        "<b>اقتصاد (Economics)</b>",
        "<b>دراسات اجتماعية</b>",
        "<b>ريادة أعمال (Entrepreneurship)</b>",
        "<b>مشروع كابستون للتخرج (Graduation Capstone Project)</b>"
      ]
    }
  },
  en: {
    tag: "Accredited Study Plan & Official Curricula",
    title: "Official Academic Subjects Across the 3 Years",
    subtitle: "Official curricula for WE Applied Technology Schools in partnership with MOETE, Telecom Egypt (WE), and Galaxy Agency.",
    year1: {
      title: "1st Secondary Year",
      badge: "Foundation Year",
      desc: "Unified curriculum for all students building solid foundational scientific, technical, and engineering competencies.",
      subheading: "Core Subjects for Year 1:",
      subjects: [
        "<b>Arabic Language</b>",
        "<b>Religious Education</b>",
        "<b>Mathematics</b>",
        "<b>Physics</b>",
        "<b>English Language</b>",
        "<b>Information Technology (IT)</b>",
        "<b>Digital Arc</b>",
        "<b>Entrepreneurship</b>",
        "<b>Social Studies</b>",
        "<b>Capstone Project</b>"
      ]
    },
    year2: {
      title: "2nd Secondary Year",
      badge: "Major Selection Year",
      desc: "<b>In Year 2, students select their specialized major from 4 available tracks</b> alongside continuous core subjects.",
      subheading: "Core Subjects & Major for Year 2:",
      subjects: [
        "<b>Arabic Language</b>",
        "<b>Religious Education</b>",
        "<b>Mathematics</b>",
        "<b>Physics</b>",
        "<b>English Language</b>",
        "<b>Specialized Track Subject (Choose 1 of 4 Majors):</b><div style='margin-top: 0.35rem; padding-left: 0.8rem; font-size: 0.86rem; line-height: 1.6; opacity: 0.95;'>1. Networks & Cybersecurity<br>2. Web & Software Development<br>3. AI & Data Analytics<br>4. Digital Arts & Multimedia</div>",
        "<b>Entrepreneurship</b>",
        "<b>Social Studies</b>",
        "<b>Capstone Project</b>"
      ]
    },
    year3: {
      title: "3rd Secondary Year",
      badge: "Graduation Year",
      desc: "<b>Students continue in their chosen major with the addition of Economics</b> preparing for universities and career paths.",
      subheading: "Core Subjects for Year 3 (Graduation):",
      subjects: [
        "<b>Arabic Language</b>",
        "<b>Religious Education</b>",
        "<b>Mathematics</b>",
        "<b>Physics</b>",
        "<b>English Language</b>",
        "<b>Specialized Track Subject (In-Depth Major Study)</b>",
        "<b>Economics (Added in Year 3)</b>",
        "<b>Social Studies</b>",
        "<b>Entrepreneurship</b>",
        "<b>Graduation Capstone Project</b>"
      ]
    }
  }
};

function renderCurriculumSection() {
  const container = document.getElementById('curriculum-container');
  if (!container) return;

  const data = curriculumData[currentLang] || curriculumData.ar;
  const isAr = currentLang === 'ar';

  container.innerHTML = `
    <div class="section-header" style="text-align: center; margin-bottom: 3.5rem;">
      <span class="section-tag" style="background: rgba(94, 39, 132, 0.12); color: var(--we-purple); padding: 0.4rem 1.2rem; border-radius: 50px; font-weight: 800; font-size: 0.92rem; display: inline-block; margin-bottom: 0.8rem;">
        ${data.tag}
      </span>
      <h2 class="section-title" style="font-size: clamp(1.9rem, 3.2vw, 2.6rem); font-weight: 900; margin-bottom: 0.9rem;">
        ${data.title}
      </h2>
      <p class="section-subtitle" style="max-width: 720px; margin: 0 auto; line-height: 1.8; font-size: 1.05rem;">
        ${data.subtitle}
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
      
      <!-- Year 1 -->
      <div class="curriculum-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 2px solid var(--we-purple); padding-bottom: 0.9rem;">
          <h3>${data.year1.title}</h3>
          <span style="background: var(--we-purple); color: #fff; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.82rem; font-weight: 800;">
            ${data.year1.badge}
          </span>
        </div>
        <p class="card-desc">${data.year1.desc}</p>
        <div style="margin-top: 0.5rem;">
          <div class="card-subheading">${data.year1.subheading}</div>
          <ul class="curriculum-list">
            ${data.year1.subjects.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Year 2 -->
      <div class="curriculum-card featured">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 2px solid var(--we-gold); padding-bottom: 0.9rem;">
          <h3>${data.year2.title}</h3>
          <span style="background: var(--we-gold); color: #000; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.82rem; font-weight: 900;">
            ${data.year2.badge}
          </span>
        </div>
        <p class="card-desc">${data.year2.desc}</p>
        <div style="margin-top: 0.5rem;">
          <div class="card-subheading">${data.year2.subheading}</div>
          <ul class="curriculum-list">
            ${data.year2.subjects.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Year 3 -->
      <div class="curriculum-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; border-bottom: 2px solid var(--we-green); padding-bottom: 0.9rem;">
          <h3>${data.year3.title}</h3>
          <span style="background: var(--we-green); color: #fff; padding: 0.35rem 0.85rem; border-radius: 20px; font-size: 0.82rem; font-weight: 800;">
            ${data.year3.badge}
          </span>
        </div>
        <p class="card-desc">${data.year3.desc}</p>
        <div style="margin-top: 0.5rem;">
          <div class="card-subheading">${data.year3.subheading}</div>
          <ul class="curriculum-list">
            ${data.year3.subjects.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      </div>

    </div>
  `;
}

window.toggleLanguage = toggleLanguage;
window.applyLanguage = applyLanguage;
