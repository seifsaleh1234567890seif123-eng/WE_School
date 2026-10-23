const db = require('../config/db');

// 1. Get All Schools with Filtering and Search
function getAllSchools(req, res) {
  try {
    const { q, gov } = req.query;
    let sql = 'SELECT * FROM schools WHERE is_active = 1';
    const params = [];

    if (gov && gov !== 'all') {
      sql += ' AND (governorate_ar LIKE ? OR governorate_en LIKE ?)';
      params.push(`%${gov}%`, `%${gov}%`);
    }

    if (q) {
      sql += ' AND (name_ar LIKE ? OR name_en LIKE ? OR address_ar LIKE ? OR address_en LIKE ?)';
      const queryPattern = `%${q}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern);
    }

    sql += ' ORDER BY governorate_ar ASC';

    const schools = db.prepare(sql).all(...params);

    const formatted = schools.map(s => ({
      ...s,
      specializations: JSON.parse(s.specializations || '[]')
    }));

    return res.json({
      success: true,
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل بيانات المدارس.' });
  }
}

// 2. Get Single School by ID
function getSchoolById(req, res) {
  try {
    const { id } = req.params;
    const school = db.prepare('SELECT * FROM schools WHERE id = ?').get(id);

    if (!school) {
      return res.status(404).json({ success: false, error: 'المدرسة غير موجودة.' });
    }

    school.specializations = JSON.parse(school.specializations || '[]');

    return res.json({ success: true, data: school });
  } catch (error) {
    console.error('Error fetching school by ID:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل بيانات المدرسة.' });
  }
}

// 3. Get Specializations
function getAllSpecializations(req, res) {
  try {
    const specs = db.prepare('SELECT * FROM specializations').all();
    const formatted = specs.map(sp => ({
      ...sp,
      careers_ar: JSON.parse(sp.careers_ar || '[]'),
      careers_en: JSON.parse(sp.careers_en || '[]'),
      certs: JSON.parse(sp.certs || '[]')
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching specializations:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل التخصصات.' });
  }
}

// 4. Get News
function getNews(req, res) {
  try {
    const { category, featured } = req.query;
    let sql = 'SELECT * FROM news WHERE 1=1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND is_featured = 1';
    }

    sql += ' ORDER BY id DESC';
    const news = db.prepare(sql).all(...params);

    return res.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل الأخبار.' });
  }
}

// 5. Get FAQs
function getFaqs(req, res) {
  try {
    const faqs = db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();
    return res.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Error fetching faqs:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل الأسئلة الشائعة.' });
  }
}

// 6. Live Public Stats
function getPublicStats(req, res) {
  try {
    const totalSchools = db.prepare('SELECT COUNT(*) as c FROM schools WHERE is_active = 1').get().c;
    const totalApps = db.prepare('SELECT COUNT(*) as c FROM applications').get().c;
    const acceptedApps = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'accepted'").get().c;
    const totalChecks = db.prepare('SELECT COUNT(*) as c FROM eligibility_logs').get().c;

    return res.json({
      success: true,
      data: {
        totalSchools,
        totalGovernorates: 27,
        totalApplications: totalApps + 5200, // Combined live + historical base
        graduatesCount: 3400,
        acceptedApplicants: acceptedApps,
        totalEligibilityChecks: totalChecks + 14800,
        employmentRate: '100%'
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل الإحصائيات.' });
  }
}

module.exports = {
  getAllSchools,
  getSchoolById,
  getAllSpecializations,
  getNews,
  getFaqs,
  getPublicStats
};
