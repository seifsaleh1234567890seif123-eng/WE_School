const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');
const { sanitizeString } = require('../middleware/validator');
const emailService = require('../services/emailService');

// 1. Admin Authentication
function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال اسم المستخدم وكلمة المرور.'
      });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username.trim());
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
      });
    }

    const validPassword = bcrypt.compareSync(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة.'
      });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role, fullName: admin.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Error in admin login:', error);
    return res.status(500).json({ success: false, error: 'حدث خطأ أثناء تسجيل الدخول.' });
  }
}

// 2. Dashboard Advanced Metrics & Analytics
function getDashboardMetrics(req, res) {
  try {
    const totalApps = db.prepare('SELECT COUNT(*) as count FROM applications').get().count;
    const avgScore = db.prepare('SELECT AVG(prep_score) as avg FROM applications').get().avg || 0;

    // Status breakdown
    const statusRows = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM applications
      GROUP BY status
    `).all();

    const statusCounts = {
      submitted: 0,
      under_review: 0,
      interview_scheduled: 0,
      accepted: 0,
      rejected: 0
    };
    for (const r of statusRows) {
      statusCounts[r.status] = r.count;
    }

    // Top Governorates
    const govBreakdown = db.prepare(`
      SELECT governorate, COUNT(*) as count
      FROM applications
      GROUP BY governorate
      ORDER BY count DESC
      LIMIT 6
    `).all();

    // Specializations Breakdown
    const specBreakdown = db.prepare(`
      SELECT sp.title_ar, COUNT(a.id) as count
      FROM applications a
      LEFT JOIN specializations sp ON a.preferred_spec_id = sp.id
      GROUP BY a.preferred_spec_id
      ORDER BY count DESC
    `).all();

    // Gender Breakdown
    const genderBreakdown = db.prepare(`
      SELECT gender, COUNT(*) as count
      FROM applications
      GROUP BY gender
    `).all();

    // Recent 5 applications
    const recentApps = db.prepare(`
      SELECT a.id, a.app_code, a.full_name, a.prep_score, a.governorate, a.status, a.created_at,
             s.name_ar as school_name
      FROM applications a
      LEFT JOIN schools s ON a.primary_school_id = s.id
      ORDER BY a.id DESC
      LIMIT 5
    `).all();

    // Unread Contact Messages Count
    const unreadMsgs = db.prepare("SELECT COUNT(*) as count FROM contact_messages WHERE status = 'new'").get().count;

    return res.json({
      success: true,
      data: {
        totalApplications: totalApps,
        averageScore: Number(avgScore).toFixed(1),
        statusCounts,
        govBreakdown,
        specBreakdown,
        genderBreakdown,
        recentApplications: recentApps,
        unreadMessages: unreadMsgs
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard metrics:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل بيانات لوحة التحكم.' });
  }
}

// 3. List Applications with Filtering, Search, and Pagination
function getApplications(req, res) {
  try {
    const { status, schoolId, q, page = 1, limit = 20 } = req.query;

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      whereSql += ' AND a.status = ?';
      params.push(status);
    }

    if (schoolId && schoolId !== 'all') {
      whereSql += ' AND a.primary_school_id = ?';
      params.push(schoolId);
    }

    if (q) {
      whereSql += ' AND (a.full_name LIKE ? OR a.app_code LIKE ? OR a.national_id LIKE ? OR a.governorate LIKE ?)';
      const p = `%${q}%`;
      params.push(p, p, p, p);
    }

    // Count total matching
    const countRow = db.prepare(`
      SELECT COUNT(*) as total
      FROM applications a
      ${whereSql}
    `).get(...params);

    const total = countRow.total;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const offset = (pageNum - 1) * limitNum;

    // Fetch page rows
    const apps = db.prepare(`
      SELECT 
        a.id, a.app_code, a.full_name, a.national_id, a.gender,
        a.email, a.prep_score, a.governorate, a.student_phone, a.guardian_name,
        a.guardian_phone, a.status, a.interview_date, a.interview_location,
        a.admin_notes, a.created_at,
        s.name_ar as school_name_ar,
        sp.title_ar as spec_title_ar
      FROM applications a
      LEFT JOIN schools s ON a.primary_school_id = s.id
      LEFT JOIN specializations sp ON a.preferred_spec_id = sp.id
      ${whereSql}
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    return res.json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      data: apps
    });

  } catch (error) {
    console.error('Error fetching applications for admin:', error);
    return res.status(500).json({ success: false, error: 'فشل استرجاع طلبات التقديم.' });
  }
}

// 4. Update Application Status and Schedule Interview
async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, interviewDate, interviewLocation, adminNotes } = req.body;

    const allowedStatuses = ['submitted', 'under_review', 'interview_scheduled', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'الحالة المحددة غير صالحة.'
      });
    }

    const app = db.prepare(`
      SELECT a.id, a.app_code, a.full_name, a.email, a.interview_date, a.interview_location,
             s.name_ar as school_name_ar, s.address_ar as school_address
      FROM applications a
      LEFT JOIN schools s ON a.primary_school_id = s.id
      WHERE a.id = ?
    `).get(id);

    if (!app) {
      return res.status(404).json({ success: false, error: 'الطلب غير موجود.' });
    }

    db.prepare(`
      UPDATE applications
      SET status = ?,
          interview_date = COALESCE(?, interview_date),
          interview_location = COALESCE(?, interview_location),
          admin_notes = COALESCE(?, admin_notes),
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      status,
      interviewDate ? sanitizeString(interviewDate) : null,
      interviewLocation ? sanitizeString(interviewLocation) : null,
      adminNotes ? sanitizeString(adminNotes) : null,
      id
    );

    let emailSent = false;
    let emailPreviewUrl = null;

    // Send automated email if interview is scheduled or date is assigned
    if ((status === 'interview_scheduled' || interviewDate) && app.email) {
      const emailResult = await emailService.sendInterviewInvitation({
        to: app.email,
        studentName: app.full_name,
        appCode: app.app_code,
        interviewDate: interviewDate || app.interview_date,
        schoolName: app.school_name_ar,
        location: interviewLocation || app.interview_location || app.school_address,
        notes: adminNotes || ''
      });
      emailSent = emailResult.success;
      emailPreviewUrl = emailResult.previewUrl;
    }

    const message = emailSent
      ? `تم تحديث حالة الطلب وإرسال إخطار بموعد المقابلة والمدرسة إلى بريد الطالب (${app.email}) بنجاح!`
      : 'تم تحديث حالة الطلب وبيانات المقابلة بنجاح!';

    return res.json({
      success: true,
      message,
      emailSent,
      emailPreviewUrl
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return res.status(500).json({ success: false, error: 'فشل تحديث حالة الطلب.' });
  }
}

// 5. Export Applications to CSV with Arabic Support
function exportApplicationsCSV(req, res) {
  try {
    const apps = db.prepare(`
      SELECT 
        a.app_code, a.full_name, a.national_id, a.gender,
        a.prep_score, a.governorate, a.student_phone,
        a.guardian_name, a.guardian_phone,
        s.name_ar as school_name,
        sp.title_ar as spec_title,
        a.status, a.interview_date, a.interview_location,
        a.admin_notes, a.created_at
      FROM applications a
      LEFT JOIN schools s ON a.primary_school_id = s.id
      LEFT JOIN specializations sp ON a.preferred_spec_id = sp.id
      ORDER BY a.prep_score DESC
    `).all();

    const headers = [
      'كود التقديم',
      'الاسم بالكامل',
      'الرقم القومي',
      'النوع',
      'مجموع الإعدادية',
      'المحافظة',
      'هاتف الطالب',
      'اسم ولي الأمر',
      'هاتف ولي الأمر',
      'المدرسة المرغوبة',
      'التخصص المفضل',
      'حالة الطلب',
      'موعد المقابلة',
      'مكان المقابلة',
      'ملاحظات الإدارة',
      'تاريخ التقديم'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel Arabic support
    csvContent += headers.map(escapeCsv).join(',') + '\r\n';

    for (const a of apps) {
      const row = [
        a.app_code,
        a.full_name,
        a.national_id,
        a.gender,
        a.prep_score,
        a.governorate,
        a.student_phone,
        a.guardian_name,
        a.guardian_phone,
        a.school_name || '',
        a.spec_title || '',
        a.status,
        a.interview_date || '',
        a.interview_location || '',
        a.admin_notes || '',
        a.created_at
      ];
      csvContent += row.map(escapeCsv).join(',') + '\r\n';
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="we_ats_applications_2026.csv"');
    return res.send(csvContent);

  } catch (error) {
    console.error('Error exporting CSV:', error);
    return res.status(500).json({ success: false, error: 'فشل تصدير ملف البيانات.' });
  }
}

// 6. View Inquiries
function getMessages(req, res) {
  try {
    const messages = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all();
    return res.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ success: false, error: 'فشل تحميل الرسائل.' });
  }
}

// 7. Update Message Status
function updateMessageStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    return res.json({ success: true, message: 'تم تحديث حالة الرسالة.' });
  } catch (error) {
    console.error('Error updating message:', error);
    return res.status(500).json({ success: false, error: 'فشل تحديث الرسالة.' });
  }
}

// 8. SMTP Settings Management
async function getSmtpSettings(req, res) {
  try {
    const status = await emailService.getSmtpStatus();
    const brevoUser = emailService.getDbSetting('brevo_user') || process.env.BREVO_USER || '';
    const gmailUser = emailService.getDbSetting('gmail_user') || process.env.GMAIL_USER || '';
    const smtpHost = emailService.getDbSetting('smtp_host') || process.env.SMTP_HOST || '';
    const smtpPort = emailService.getDbSetting('smtp_port') || process.env.SMTP_PORT || '587';
    const smtpUser = emailService.getDbSetting('smtp_user') || process.env.SMTP_USER || '';
    const smtpFrom = emailService.getDbSetting('smtp_from') || process.env.SMTP_FROM || '';

    return res.json({
      success: true,
      data: {
        ...status,
        brevoUser,
        gmailUser,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpFrom,
        hasBrevoKey: !!(emailService.getDbSetting('brevo_key') || process.env.BREVO_KEY),
        hasGmailPass: !!(emailService.getDbSetting('gmail_app_pass') || process.env.GMAIL_APP_PASS),
        hasSmtpPass: !!(emailService.getDbSetting('smtp_pass') || process.env.SMTP_PASS)
      }
    });
  } catch (err) {
    console.error('Error getting SMTP settings:', err);
    return res.status(500).json({ success: false, error: 'فشل استرجاع إعدادات البريد.' });
  }
}

async function updateSmtpSettings(req, res) {
  try {
    const { serviceType, brevoUser, brevoKey, gmailUser, gmailAppPass, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = req.body;
    const status = await emailService.saveSmtpSettings({
      serviceType,
      brevoUser: sanitizeString(brevoUser),
      brevoKey: brevoKey ? sanitizeString(brevoKey) : null,
      gmailUser: sanitizeString(gmailUser),
      gmailAppPass: gmailAppPass ? sanitizeString(gmailAppPass) : null,
      smtpHost: sanitizeString(smtpHost),
      smtpPort,
      smtpUser: sanitizeString(smtpUser),
      smtpPass: smtpPass ? sanitizeString(smtpPass) : null,
      smtpFrom: sanitizeString(smtpFrom)
    });

    return res.json({
      success: true,
      message: 'تم حفظ وتفعيل إعدادات خادم البريد الإلكتروني بنجاح!',
      data: status
    });
  } catch (err) {
    console.error('Error updating SMTP settings:', err);
    return res.status(500).json({ success: false, error: 'فشل حفظ إعدادات البريد.' });
  }
}

async function testSmtpSettings(req, res) {
  try {
    const { testEmail } = req.body;
    if (!testEmail || !testEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال بريد إلكتروني صالح للاختبار.' });
    }

    await emailService.sendTestEmail(testEmail.trim());
    return res.json({
      success: true,
      message: `تم إرسال رسالة اختبار بنجاح إلى (${testEmail})! يرجى فحص صندوق الوارد.`
    });
  } catch (err) {
    console.error('Error testing SMTP:', err);
    return res.status(500).json({
      success: false,
      error: `فشل إرسال رسالة الاختبار: ${err.message}`
    });
  }
}

module.exports = {
  login,
  getDashboardMetrics,
  getApplications,
  updateApplicationStatus,
  exportApplicationsCSV,
  getMessages,
  updateMessageStatus,
  getSmtpSettings,
  updateSmtpSettings,
  testSmtpSettings
};
