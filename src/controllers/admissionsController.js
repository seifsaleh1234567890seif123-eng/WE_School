const db = require('../config/db');
const { parseEgyptianNationalID, sanitizeString } = require('../middleware/validator');
const emailService = require('../services/emailService');

// Helper: Check if OTP expiration time has passed (immune to system/database timezones)
function isCodeExpired(expiresAt) {
  if (!expiresAt) return true;
  const num = Number(expiresAt);
  if (!isNaN(num) && num > 1000000000000) {
    return Date.now() > num;
  }
  const parsed = new Date(expiresAt).getTime();
  if (!isNaN(parsed)) {
    return Date.now() > parsed;
  }
  return true;
}

// 0.1 Send 6-Digit OTP to Student's Email
async function sendOtp(req, res) {
  try {
    const { email, fullName } = req.body;
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanName = sanitizeString(fullName) || 'الطالب العزيز';

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صالح لاستلام رمز التحقق.'
      });
    }

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 10 minutes expiry stored as epoch millisecond string (universal, timezone-independent)
    const expiresAt = (Date.now() + 10 * 60 * 1000).toString();

    db.prepare(`
      INSERT INTO verification_codes (email, code, expires_at)
      VALUES (?, ?, ?)
    `).run(cleanEmail, code, expiresAt);

    // Send email via emailService
    const emailResult = await emailService.sendVerificationOtp(cleanEmail, cleanName, code);

    return res.json({
      success: true,
      message: `تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني (${cleanEmail}).`,
      email: cleanEmail,
      previewUrl: emailResult.previewUrl || null
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل إرسال رمز التحقق إلى البريد الإلكتروني. يرجى المحاولة لاحقاً.'
    });
  }
}

// 0.2 Verify OTP Code
function verifyOtp(req, res) {
  try {
    const { email, code } = req.body;
    const cleanEmail = sanitizeString(email).toLowerCase();
    const cleanCode = sanitizeString(code);

    if (!cleanEmail || !cleanCode) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال البريد الإلكتروني ورمز التحقق.'
      });
    }

    const row = db.prepare(`
      SELECT id, expires_at FROM verification_codes
      WHERE email = ? AND code = ? AND is_used = 0
      ORDER BY id DESC LIMIT 1
    `).get(cleanEmail, cleanCode);

    if (!row || isCodeExpired(row.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح أو انتهت صلاحيته (صلاحية الرمز 10 دقائق).'
      });
    }

    // Mark as used
    db.prepare('UPDATE verification_codes SET is_used = 1 WHERE id = ?').run(row.id);

    return res.json({
      success: true,
      message: 'تم التحقق من البريد الإلكتروني بنجاح! يمكنك الآن إتمام التسجيل.'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء فحص رمز التحقق.'
    });
  }
}

// 1. Submit Admission Application (Requires Verified Email)
function apply(req, res) {
  try {
    const {
      fullName,
      nationalId,
      email,
      otpCode,
      prepScore,
      governorate,
      studentPhone,
      guardianName,
      guardianPhone,
      schoolId,
      specId,
      gender
    } = req.body;

    // Validate Full Name
    const cleanName = sanitizeString(fullName);
    if (!cleanName || cleanName.split(' ').filter(Boolean).length < 3) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال الاسم الرباعي للطالب بالكامل كما هو في شهادة الميلاد.'
      });
    }

    // Validate Egyptian National ID
    const nidResult = parseEgyptianNationalID(nationalId);
    if (!nidResult.valid) {
      return res.status(400).json({
        success: false,
        error: nidResult.error
      });
    }


    // Validate Email
    const cleanEmail = sanitizeString(email).toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صحيح لتلقي رمز التحقق وموعد المقابلة.'
      });
    }

    // Verify OTP Code
    const cleanOtp = sanitizeString(otpCode);
    if (!cleanOtp) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رمز التحقق (OTP) المرسل إلى بريدك الإلكتروني لتأكيد التسجيل.'
      });
    }

    const validOtp = db.prepare(`
      SELECT id, expires_at, is_used FROM verification_codes
      WHERE email = ? AND code = ?
      ORDER BY id DESC LIMIT 1
    `).get(cleanEmail, cleanOtp);

    if (!validOtp || validOtp.is_used === 1 || isCodeExpired(validOtp.expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'رمز التحقق غير صحيح أو تم استخدامه مسبقاً أو انتهت صلاحيته. يرجى طلب رمز تحقق جديد.'
      });
    }

    // Mark OTP as used
    db.prepare('UPDATE verification_codes SET is_used = 1 WHERE id = ?').run(validOtp.id);

    // Validate Score
    const numScore = parseFloat(prepScore);
    if (isNaN(numScore) || numScore < 0 || numScore > 280) {
      return res.status(400).json({
        success: false,
        error: 'مجموع الشهادة الإعدادية يجب أن يكون رقماً صحيحاً بين 0 و 280 درجة.'
      });
    }

    if (numScore < 225) {
      return res.status(400).json({
        success: false,
        error: 'عذراً، الحد الأدنى للقبول بمدارس WE للتكنولوجيا التطبيقية هو 225 درجة.'
      });
    }

    // Age validation
    if (nidResult.age > 18) {
      return res.status(400).json({
        success: false,
        error: 'شرط القبول ألا يزيد سن الطالب عن 18 عاماً في أول أكتوبر 2026.'
      });
    }

    // Validate School
    const cleanSchoolId = sanitizeString(schoolId);
    const targetSchool = db.prepare('SELECT id, name_ar, governorate_ar FROM schools WHERE id = ?').get(cleanSchoolId);
    if (!targetSchool) {
      return res.status(400).json({
        success: false,
        error: 'المدرسة المختارة غير صالحة أو غير مسجلة في قاعدة البيانات.'
      });
    }

    // Phones
    const cleanStudentPhone = sanitizeString(studentPhone);
    const cleanGuardianPhone = sanitizeString(guardianPhone);
    const cleanGuardianName = sanitizeString(guardianName);

    if (!cleanGuardianPhone || !cleanGuardianPhone.startsWith('01')) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رقم هاتف ولي الأمر بشكل صحيح (يبدأ بـ 01).'
      });
    }

    // Generate Unique Application Code
    let appCode;
    let codeExists = true;
    while (codeExists) {
      const randomSix = Math.floor(100000 + Math.random() * 900000);
      appCode = `WE-2026-${randomSix}`;
      const checkCode = db.prepare('SELECT id FROM applications WHERE app_code = ?').get(appCode);
      if (!checkCode) codeExists = false;
    }

    const appGender = gender || nidResult.gender;
    const cleanGov = sanitizeString(governorate) || nidResult.governorate;
    const cleanSpec = sanitizeString(specId) || 'digital-arc';

    // If application already exists for this National ID, update it smoothly so the user can register/test without limits
    const existing = db.prepare('SELECT id, app_code, status FROM applications WHERE national_id = ?').get(nationalId.trim());
    if (existing) {
      db.prepare(`
        UPDATE applications SET
          full_name = ?,
          gender = ?,
          prep_score = ?,
          governorate = ?,
          student_phone = ?,
          guardian_name = ?,
          guardian_phone = ?,
          email = ?,
          email_verified = 1,
          primary_school_id = ?,
          preferred_spec_id = ?,
          updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).run(
        cleanName,
        appGender,
        numScore,
        cleanGov,
        cleanStudentPhone,
        cleanGuardianName,
        cleanGuardianPhone,
        cleanEmail,
        cleanSchoolId,
        cleanSpec,
        existing.id
      );

      return res.status(200).json({
        success: true,
        message: 'تم تسجيل وتحديث طلب الالتحاق بنجاح! احتفظ برقم الكود للاستعلام ومتابعة موعد الاختبارات.',
        data: {
          appCode: existing.app_code,
          fullName: cleanName,
          email: cleanEmail,
          schoolName: targetSchool.name_ar,
          governorate: targetSchool.governorate_ar,
          score: numScore,
          status: existing.status || 'submitted',
          statusLabelAr: 'تم تحديث بيانات طلبك بنجاح',
          instructions: `سيتم إرسال موعد المقابلة واختبار الذكاء ومقر المدرسة إلى بريدك الإلكتروني (${cleanEmail}) فور اعتماده.`
        }
      });
    }

    const insertStmt = db.prepare(`
      INSERT INTO applications (
        app_code, full_name, national_id, gender, prep_score,
        governorate, student_phone, guardian_name, guardian_phone,
        email, email_verified, primary_school_id, preferred_spec_id,
        status, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, 'submitted', 'طلب جديد معتمد وموثق بالبريد الإلكتروني')
    `);

    insertStmt.run(
      appCode,
      cleanName,
      nationalId.trim(),
      appGender,
      numScore,
      cleanGov,
      cleanStudentPhone,
      cleanGuardianName,
      cleanGuardianPhone,
      cleanEmail,
      cleanSchoolId,
      cleanSpec
    );

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل طلب الالتحاق بنجاح! احتفظ برقم الكود للاستعلام ومتابعة موعد الاختبارات.',
      data: {
        appCode,
        fullName: cleanName,
        email: cleanEmail,
        schoolName: targetSchool.name_ar,
        governorate: targetSchool.governorate_ar,
        score: numScore,
        status: 'submitted',
        statusLabelAr: 'تم استلام الطلب وبانتظار المراجعة الإدارية',
        instructions: `سيتم إرسال موعد المقابلة واختبار الذكاء ومقر المدرسة إلى بريدك الإلكتروني (${cleanEmail}) فور اعتماده.`
      }
    });

  } catch (error) {
    console.error('Error in admission application:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ في النظام أثناء معالجة طلبك. يرجى المحاولة لاحقاً.'
    });
  }
}

// 2. Track Application Status by Code or National ID
function track(req, res) {
  try {
    const query = (req.params.query || req.query.q || '').trim();
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال رقم كود الطلب (مثل WE-2026-XXXXXX) أو الرقم القومي للطالب.'
      });
    }

    const row = db.prepare(`
      SELECT 
        a.id, a.app_code, a.full_name, a.national_id, a.gender,
        a.prep_score, a.governorate, a.status, a.interview_date,
        a.interview_location, a.admin_notes, a.created_at,
        s.name_ar as school_name_ar, s.name_en as school_name_en,
        s.address_ar as school_address, s.phone as school_phone,
        sp.title_ar as spec_title_ar, sp.title_en as spec_title_en
      FROM applications a
      LEFT JOIN schools s ON a.primary_school_id = s.id
      LEFT JOIN specializations sp ON a.preferred_spec_id = sp.id
      WHERE a.app_code = ? OR a.national_id = ?
    `).get(query, query);

    if (!row) {
      return res.status(404).json({
        success: false,
        error: 'لم يتم العثور على أي طلب مسجل بهذا الرقم. يرجى التأكد من الرقم القومي أو كود التقديم.'
      });
    }

    const statusMap = {
      submitted: {
        labelAr: 'تم استلام الطلب',
        labelEn: 'Submitted',
        color: '#E5A93C',
        descAr: 'طلبك قيد التحقق الأولي من الشهادة الإعدادية والمستندات.'
      },
      under_review: {
        labelAr: 'قيد المراجعة والتدقيق',
        labelEn: 'Under Review',
        color: '#FFA500',
        descAr: 'يتم حالياً مراجعة درجاتك وترتيب أولوية القبول بالمحافظة.'
      },
      interview_scheduled: {
        labelAr: 'تم تحديد موعد المقابلة واختبار القدرات',
        labelEn: 'Interview Scheduled',
        color: '#8A2BE2',
        descAr: 'تم تحديد موعد حضورك لاختبارات الذكاء والمقابلة الشخصية بالمدرسة.'
      },
      accepted: {
        labelAr: 'مقبول مبدئياً 🎯',
        labelEn: 'Provisionally Accepted',
        color: '#00FF88',
        descAr: 'تهانينا! تم قبولك مبدئياً بمدارس WE. يرجى تقديم أصل الملف بالمدرسة.'
      },
      rejected: {
        labelAr: 'غير مستوفي للشروط',
        labelEn: 'Not Accepted',
        color: '#FF0055',
        descAr: 'نعتذر، لم يستوف الطلب شروط التنسيق والمفاضلة لهذا العام.'
      }
    };

    const currentStatus = statusMap[row.status] || statusMap.submitted;

    // Mask sensitive national ID for privacy
    const maskedNid = row.national_id.substring(0, 4) + '******' + row.national_id.substring(10);

    return res.json({
      success: true,
      data: {
        appCode: row.app_code,
        fullName: row.full_name,
        nationalIdMasked: maskedNid,
        prepScore: row.prep_score,
        governorate: row.governorate,
        schoolNameAr: row.school_name_ar,
        schoolNameEn: row.school_name_en,
        schoolAddress: row.school_address,
        schoolPhone: row.school_phone,
        specializationAr: row.spec_title_ar || 'ديجيتال ارك',
        specializationEn: row.spec_title_en || 'Digital Arc',
        status: row.status,
        statusMeta: currentStatus,
        interviewDate: row.interview_date || 'سيتم إعلانه قريباً',
        interviewLocation: row.interview_location || row.school_address,
        notes: row.admin_notes || '',
        createdAt: row.created_at
      }
    });

  } catch (error) {
    console.error('Error tracking application:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء الاستعلام. يرجى المحاولة لاحقاً.'
    });
  }
}

// 3. Server-side Eligibility Calculator
function checkEligibility(req, res) {
  try {
    const { score, governorate, age } = req.body;

    const numScore = parseFloat(score);
    const numAge = parseInt(age, 10);
    const gov = sanitizeString(governorate);

    const reasons = [];
    let isEligible = true;

    if (isNaN(numScore) || numScore < 0 || numScore > 280) {
      return res.status(400).json({
        success: false,
        error: 'درجة الشهادة الإعدادية غير صحيحة.'
      });
    }

    if (numScore < 225) {
      isEligible = false;
      reasons.push('مجموعك أقل من الحد الأدنى للقبول بمدارس WE وهو 225 درجة.');
    }

    if (!isNaN(numAge) && numAge > 18) {
      isEligible = false;
      reasons.push('عمر الطالب يزيد عن الحد الأقصى المسموح به (18 عاماً في أول أكتوبر 2026).');
    }

    // Match schools in the chosen governorate
    let matchedSchools = [];
    if (gov) {
      matchedSchools = db.prepare(`
        SELECT id, name_ar, name_en, governorate_ar, address_ar, min_score, phone
        FROM schools
        WHERE governorate_ar LIKE ? OR governorate_en LIKE ?
      `).all(`%${gov}%`, `%${gov}%`);
    }

    if (isEligible) {
      reasons.push('مجموعك وسنك مستوفيان تماماً لجميع الشروط الرسمية للتقديم!');
      if (numScore >= 260) {
        reasons.push('مجموعك يمنحك أولوية تنافسية فائقة للالتحاق بجميع التخصصات التكنولوجية المتقدمة.');
      }
    }

    // Log the check
    try {
      const ip = req.ip || req.connection.remoteAddress || '';
      db.prepare(`
        INSERT INTO eligibility_logs (prep_score, governorate, age, is_eligible, reasons, ip_address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(numScore, gov || 'غير محدد', numAge || 15, isEligible ? 1 : 0, JSON.stringify(reasons), ip);
    } catch (e) {
      // non-fatal
    }

    return res.json({
      success: true,
      eligible: isEligible,
      score: numScore,
      percentage: ((numScore / 280) * 100).toFixed(1),
      reasons,
      matchedSchools,
      hasSchoolInGov: matchedSchools.length > 0
    });

  } catch (error) {
    console.error('Error checking eligibility:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل فحص الأهلية. يرجى التأكد من البيانات المدخلة.'
    });
  }
}

// 4. Submit Aptitude / Quiz
function submitQuiz(req, res) {
  try {
    const { studentName, score, total, answers } = req.body;
    const cleanName = sanitizeString(studentName) || 'طالب متميز';
    const numScore = parseInt(score, 10) || 0;
    const numTotal = parseInt(total, 10) || 10;

    let recommendation = 'ديجيتال ارك (العمارة الرقمية والمدن الذكية)';
    if (numScore >= 8) {
      recommendation = 'الذكاء الاصطناعي وتحليل البيانات والأنظمة السحابية';
    } else if (numScore >= 6) {
      recommendation = 'الأمن السيبراني والشبكات المتقدمة';
    } else {
      recommendation = 'تطوير المواقع والبرمجيات وتطبيقات الويب';
    }

    db.prepare(`
      INSERT INTO quiz_submissions (student_name, score, total, recommended_spec)
      VALUES (?, ?, ?, ?)
    `).run(cleanName, numScore, numTotal, recommendation);

    return res.json({
      success: true,
      message: 'تم تسجيل نتيجة اختبار القدرات بنجاح!',
      data: {
        score: numScore,
        total: numTotal,
        percentage: Math.round((numScore / numTotal) * 100),
        recommendation
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل حفظ نتيجة الاختبار.'
    });
  }
}

module.exports = {
  apply,
  sendOtp,
  verifyOtp,
  track,
  checkEligibility,
  submitQuiz
};
