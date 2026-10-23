const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { schoolsData, specializationsData } = require('../../js/schools-data');

function seedDatabase() {
  // 1. Seed Admin Account
  const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
  if (!adminExists) {
    const passwordHash = bcrypt.hashSync('weATS@2026!', 10);
    const insertAdmin = db.prepare(`
      INSERT INTO admins (username, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `);
    insertAdmin.run('admin', passwordHash, 'مدير المنصة الرئيسي (Superadmin)', 'superadmin');
    console.log('✅ Seeded default admin account: username "admin", password "weATS@2026!"');
  }

  // 2. Seed Specializations
  const specCount = db.prepare('SELECT COUNT(*) as count FROM specializations').get().count;
  if (specCount === 0 && specializationsData && specializationsData.length > 0) {
    const insertSpec = db.prepare(`
      INSERT INTO specializations (
        id, title_ar, title_en, short_desc_ar, short_desc_en,
        careers_ar, careers_en, certs, icon_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of specializationsData) {
      insertSpec.run(
        s.id,
        s.titleAr || s.shortTitleAr,
        s.titleEn || s.shortTitleEn,
        s.descAr || '',
        s.descEn || '',
        JSON.stringify(s.careersAr || []),
        JSON.stringify(s.careersEn || []),
        JSON.stringify(s.certs || []),
        s.icon || ''
      );
    }
    console.log(`✅ Seeded ${specializationsData.length} specializations`);
  }

  // 3. Seed Schools (27 Governorates)
  const schoolCount = db.prepare('SELECT COUNT(*) as count FROM schools').get().count;
  if (schoolCount === 0 && schoolsData && schoolsData.length > 0) {
    const insertSchool = db.prepare(`
      INSERT INTO schools (
        id, name_ar, name_en, governorate_ar, governorate_en,
        city_ar, city_en, address_ar, address_en, phone, email,
        min_score, accepts_gender, specializations, lat, lng, image_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const sc of schoolsData) {
      insertSchool.run(
        sc.id,
        sc.nameAr,
        sc.nameEn,
        sc.govAr,
        sc.govEn,
        sc.regionAr || sc.govAr,
        sc.regionEn || sc.govEn,
        sc.addressAr,
        sc.addressEn,
        sc.phone || '111 / 02-22601111',
        'info@we-ats.edu.eg',
        225,
        sc.gender || 'بنين وبنات (مشترك)',
        JSON.stringify(sc.specializations || []),
        30.0444, // Default lat
        31.2357, // Default lng
        'assets/images/students-lab.webp',
        1
      );
    }
    console.log(`✅ Seeded ${schoolsData.length} schools across 27 governorates`);
  }

  // 4. Seed News & Announcements
  const newsCount = db.prepare('SELECT COUNT(*) as count FROM news').get().count;
  if (newsCount === 0) {
    const insertNews = db.prepare(`
      INSERT INTO news (
        title_ar, title_en, desc_ar, desc_en, category, date_text, image_url, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initialNews = [
      {
        titleAr: 'اختتام موسم حافل لدوري مدارس WE 2026 في نسخته الثالثة',
        titleEn: 'Grand Finale of WE Schools League 2026 Season 3',
        descAr: 'بحضور قيادات وزارة الاتصالات والتربية والتعليم، شهد ختام دوري مدارس WE منافسات مشتعلة وتكريم الطلاب المتميزين رياضياً وتكنولوجياً.',
        descEn: 'In presence of MOE and MCIT leaders, WE Schools League concluded with thrilling sportsmanship and tech honors.',
        category: 'sports',
        dateText: '30 مارس 2026',
        imageUrl: 'assets/images/students-activity.webp',
        isFeatured: 1
      },
      {
        titleAr: 'افتتاح معامل الذكاء الاصطناعي والحوسبة السحابية الجديدة',
        titleEn: 'Inauguration of Next-Gen AI & Cloud Computing Labs',
        descAr: 'تدشين أحدث المعامل التقنية المجهزة بخوادم عملاقة بالشراكة مع كبرى الشركات الدولية لتأهيل الطلاب لسوق العمل الدولي.',
        descEn: 'Launch of cutting-edge AI labs with international tech giants to prepare students for global careers.',
        category: 'academic',
        dateText: '15 أبريل 2026',
        imageUrl: 'assets/images/hero-bg.webp',
        isFeatured: 1
      },
      {
        titleAr: 'توقيع بروتوكول تدريب صيفي مع سنترالات المصرية للاتصالات WE',
        titleEn: 'Summer Practical Training Protocol Signed with Telecom Egypt',
        descAr: 'إتاحة تدريب ميداني مدفوع الأجر لأكثر من 3000 طالب وطالبة داخل مواقع وسنترالات الشركة بمختلف المحافظات.',
        descEn: 'Hands-on paid summer internships launched for 3000+ students inside Telecom Egypt central offices nationwide.',
        category: 'partnership',
        dateText: '2 مايو 2026',
        imageUrl: 'assets/images/students-lab.webp',
        isFeatured: 0
      }
    ];

    for (const n of initialNews) {
      insertNews.run(
        n.titleAr, n.titleEn, n.descAr, n.descEn,
        n.category, n.dateText, n.imageUrl, n.isFeatured
      );
    }
    console.log('✅ Seeded news announcements');
  }

  // 5. Seed FAQs
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get().count;
  if (faqCount === 0) {
    const insertFaq = db.prepare(`
      INSERT INTO faqs (category, question_ar, question_en, answer_ar, answer_en, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const initialFaqs = [
      {
        qAr: 'هل خريج مدارس WE مؤهل للالتحاق بكليات الهندسة والحاسبات؟',
        qEn: 'Are WE School graduates eligible for Engineering & Computer Science Colleges?',
        aAr: 'نعم بالتأكيد! يحصل خريج مدارس WE على دبلوم فني تكنولوجي متقدم يؤهله مباشرة للالتحاق بكليات الهندسة والحاسبات بعد اجتياز المعادلة، وكليات الجامعات التكنولوجية بدون معادلة.',
        aEn: 'Yes! Graduates receive an accredited 3-year diploma qualifying them for Engineering, CS, and all Technology Universities across Egypt.',
        sort: 1
      },
      {
        qAr: 'ما هو تخصص ديجيتال ارك (العمارة الرقمية والمدن الذكية)؟',
        qEn: 'What is the Digital Arc (Smart Architecture) specialization?',
        aAr: 'تخصص تكنولوجي فريد يجمع بين النمذجة ثلاثية الأبعاد BIM والتوأم الرقمي للمدن الذكية وتصميم البنية التحتية المتطورة.',
        aEn: 'A state-of-the-art specialization integrating 3D BIM, Digital Twins, and IoT smart city architectural modeling.',
        sort: 2
      },
      {
        qAr: 'ما هي شروط المجموع والسن للقبول؟',
        qEn: 'What are the score and age admission requirements?',
        aAr: 'يشترط ألا يقل مجموع الطالب في الشهادة الإعدادية عن 225 درجة، وألا يزيد عمره عن 18 عاماً في أول أكتوبر، واجتياز اختبارات القدرات والمقابلة الشخصية.',
        aEn: 'Minimum prep school score is 225/280, max age is 18 years on October 1st, and passing aptitude exams and personal interviews.',
        sort: 3
      }
    ];

    for (const f of initialFaqs) {
      insertFaq.run('admission', f.qAr, f.qEn, f.aAr, f.aEn, f.sort);
    }
    console.log('✅ Seeded FAQs');
  }

  // 6. Seed Sample Applications (for realistic admin dashboard metrics)
  const appCount = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
  if (appCount === 0) {
    const insertApp = db.prepare(`
      INSERT INTO applications (
        app_code, full_name, national_id, gender, prep_score,
        governorate, student_phone, guardian_name, guardian_phone,
        primary_school_id, preferred_spec_id, status, interview_date,
        interview_location, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleApps = [
      {
        code: 'WE-2026-884102',
        name: 'يوسف أحمد عبد الرحمن علي',
        nid: '30908120104512',
        gender: 'بنين',
        score: 274.5,
        gov: 'القاهرة',
        phone: '01012345678',
        gName: 'أحمد عبد الرحمن علي',
        gPhone: '01223456789',
        school: 'cairo-nasr-city',
        spec: 'digital-arc',
        status: 'accepted',
        date: '2026-08-10 10:00 AM',
        loc: 'مقر مدرسة مدينة نصر - معمل 3',
        notes: 'طالب متفوق في الرياضيات واجتاز اختبار الـ IQ بنسبة 95%'
      },
      {
        code: 'WE-2026-729143',
        name: 'سارة محمود حسني إبراهيم',
        nid: '30905151203426',
        gender: 'بنات',
        score: 268.0,
        gov: 'الجيزة',
        phone: '01198765432',
        gName: 'محمود حسني إبراهيم',
        gPhone: '01054321678',
        school: 'giza-sheikh-zayed',
        spec: 'web',
        status: 'interview_scheduled',
        date: '2026-08-15 11:30 AM',
        loc: 'مقر مدرسة الشيخ زايد - قاعة المؤتمرات',
        notes: 'مهتمة بالبرمجة وقدمت مشروعاً برمجياً مميزاً'
      },
      {
        code: 'WE-2026-551980',
        name: 'عمر خالد كمال الشربيني',
        nid: '30911041401234',
        gender: 'بنين',
        score: 259.0,
        gov: 'الإسكندرية',
        phone: '01287654321',
        gName: 'خالد كمال الشربيني',
        gPhone: '01123456780',
        school: 'alexandria-mustafa-kamel',
        spec: 'networks',
        status: 'under_review',
        date: null,
        loc: null,
        notes: 'جاري مراجعة مستندات الشهادة الإعدادية'
      },
      {
        code: 'WE-2026-318492',
        name: 'مريم طارق سعيد حسن',
        nid: '30903220205678',
        gender: 'بنات',
        score: 280.0,
        gov: 'الدقهلية',
        phone: '01511223344',
        gName: 'طارق سعيد حسن',
        gPhone: '01099887766',
        school: 'dakahlia-mansoura',
        spec: 'ai',
        status: 'accepted',
        date: '2026-08-12 09:00 AM',
        loc: 'مدرسة المنصورة - مبنى التكنولوجيا',
        notes: 'المركز الأول على الإدارة التعليمية، قبول فوري بمنحة تميز'
      },
      {
        code: 'WE-2026-194038',
        name: 'محمد شريف عبد الله',
        nid: '30907101809876',
        gender: 'بنين',
        score: 242.0,
        gov: 'أسوان',
        phone: '01066778899',
        gName: 'شريف عبد الله',
        gPhone: '01144332211',
        school: 'aswan-corniche',
        spec: 'digital-arc',
        status: 'submitted',
        date: null,
        loc: null,
        notes: 'طلب حديث مسجل عبر البوابة الإلكترونية'
      }
    ];

    for (const app of sampleApps) {
      insertApp.run(
        app.code, app.name, app.nid, app.gender, app.score,
        app.gov, app.phone, app.gName, app.gPhone,
        app.school, app.spec, app.status, app.date,
        app.loc, app.notes
      );
    }
    console.log(`✅ Seeded ${sampleApps.length} sample applications`);
  }
}

module.exports = { seedDatabase };
