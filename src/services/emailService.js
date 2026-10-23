const nodemailer = require('nodemailer');
const db = require('../config/db');

let transporter = null;
let lastSentEmails = []; // Keeps in-memory record for testing & dev inspection

function getDbSetting(key) {
  try {
    const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get(key);
    return row ? row.value : null;
  } catch (e) {
    return null;
  }
}

function setDbSetting(key, value) {
  try {
    db.prepare(`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now', 'localtime'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
    `).run(key, value);
    return true;
  } catch (e) {
    console.error('Error saving setting:', e);
    return false;
  }
}

function resetTransporter() {
  transporter = null;
}

async function getTransporter() {
  if (transporter) return transporter;

  // 1. Brevo (Sendinblue) Cloud SMTP (Recommended: 300 free emails/day to any recipient)
  const brevoUser = getDbSetting('brevo_user') || process.env.BREVO_USER;
  const brevoKey = getDbSetting('brevo_key') || process.env.BREVO_KEY;

  if (brevoUser && brevoKey) {
    transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: brevoUser,
        pass: brevoKey
      }
    });
    console.log('📧 Nodemailer initialized with Brevo Cloud SMTP:', brevoUser);
    return transporter;
  }

  const gmailUser = getDbSetting('gmail_user') || process.env.GMAIL_USER;
  const gmailPass = getDbSetting('gmail_app_pass') || process.env.GMAIL_APP_PASS;

  // 2. Direct Gmail Configuration
  if (gmailUser && gmailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
    console.log('📧 Nodemailer initialized with Real Gmail Service:', gmailUser);
    return transporter;
  }

  // 2. Custom SMTP Server Configuration
  const smtpHost = getDbSetting('smtp_host') || process.env.SMTP_HOST;
  const smtpUser = getDbSetting('smtp_user') || process.env.SMTP_USER;
  const smtpPass = getDbSetting('smtp_pass') || process.env.SMTP_PASS;
  const smtpPort = parseInt(getDbSetting('smtp_port') || process.env.SMTP_PORT || '587', 10);
  const smtpSecure = (getDbSetting('smtp_secure') || process.env.SMTP_SECURE) === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    console.log('📧 Nodemailer initialized with Custom SMTP Host:', smtpHost);
    return transporter;
  }

  // 3. Fallback to auto-generated test Ethereal account for development
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('📧 Nodemailer initialized with Ethereal Test Account:', testAccount.user);
    console.log('💡 To receive REAL emails in your Gmail inbox, provide GMAIL_USER & GMAIL_APP_PASS in .env or via Admin Dashboard');
    return transporter;
  } catch (err) {
    console.warn('⚠️ Could not connect to external SMTP, using local mock logger:', err.message);
    transporter = {
      sendMail: async (mailOpts) => {
        console.log('\n================== [LOCAL EMAIL SENT] ==================');
        console.log(`TO:      ${mailOpts.to}`);
        console.log(`SUBJECT: ${mailOpts.subject}`);
        console.log('========================================================\n');
        return { messageId: 'mock-' + Date.now() };
      }
    };
    return transporter;
  }
}

// 1. Send 6-Digit OTP Verification Email
async function sendVerificationOtp(email, fullName, code) {
  try {
    const mailClient = await getTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"مدارس WE للتكنولوجيا التطبيقية" <admissions@we-ats.edu.eg>',
      to: email,
      subject: `رمز التحقق لتسجيل طلب الالتحاق [${code}] - مدارس WE للتكنولوجيا التطبيقية`,
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0517; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #5C148C; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #5E2784, #1B0C30); padding: 25px 20px; text-align: center; border-bottom: 2px solid #E5A93C;">
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">مدارس WE للتكنولوجيا التطبيقية</h1>
            <p style="margin: 5px 0 0; color: #E5A93C; font-size: 13px; font-weight: bold;">منظومة القبول والتسجيل الرقمية 2026/2027</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 25px; text-align: right;">
            <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 12px;">أهلاً بك يا ${fullName || 'طالبنا العزيز'} 👋</h2>
            <p style="font-size: 14px; color: #C5BFD4; line-height: 1.7; margin-bottom: 20px;">
              نشكرك على رغبتك في الانضمام إلى صرح التكنولوجيا الأول في مصر. لإتمام تسجيل طلبك بنجاح والتحقق من بريدك الإلكتروني، يرجى إدخال رمز التحقق التالي في الموقع:
            </p>

            <!-- OTP Box -->
            <div style="text-align: center; margin: 25px 0;">
              <div style="display: inline-block; background: rgba(94, 39, 132, 0.25); border: 2px dashed #E5A93C; border-radius: 12px; padding: 15px 35px;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #E5A93C; font-family: 'Courier New', Courier, monospace;">${code}</span>
              </div>
              <p style="font-size: 12px; color: #9A92A8; margin-top: 10px;">⏰ هذا الرمز صالح لمدة 10 دقائق فقط ولا تشاركه مع أي شخص.</p>
            </div>

            <p style="font-size: 13px; color: #C5BFD4; line-height: 1.6;">
              إذا لم تقم بطلب تسجيل الالتحاق بمدارس WE، يمكنك تجاهل هذه الرسالة بأمان.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #7E778D;">
            جميع الحقوق محفوظة © 2026 مدارس WE للتكنولوجيا التطبيقية - الشركة المصرية للاتصالات
          </div>
        </div>
      `
    };

    const info = await mailClient.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    console.log(`✅ Verification OTP sent to ${email} (Code: ${code})`);
    if (previewUrl) console.log(`🔗 Email Preview: ${previewUrl}`);

    lastSentEmails.push({
      type: 'otp',
      to: email,
      code,
      previewUrl,
      timestamp: new Date().toISOString()
    });

    return { success: true, previewUrl, code };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: error.message };
  }
}

// 2. Send Official Interview & Aptitude Exam Invitation Email
async function sendInterviewInvitation({ to, studentName, appCode, interviewDate, schoolName, location, notes }) {
  try {
    const mailClient = await getTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || '"مدارس WE للتكنولوجيا التطبيقية" <admissions@we-ats.edu.eg>',
      to,
      subject: `🎉 إخطار رسمي: تحديد موعد المقابلة واختبار القدرات - مدارس WE (${appCode})`,
      html: `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0517; color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #5C148C; box-shadow: 0 10px 40px rgba(0,0,0,0.6);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00B09B, #5C148C); padding: 25px 20px; text-align: center; border-bottom: 2px solid #00FF88;">
            <div style="font-size: 36px; margin-bottom: 5px;">🎯</div>
            <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">إخطار بموعد المقابلة الشخصية واختبار الذكاء</h1>
            <p style="margin: 5px 0 0; color: #00FF88; font-size: 13px; font-weight: bold;">مدارس WE للتكنولوجيا التطبيقية — التنسيق المركزي</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px 25px; text-align: right;">
            <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 12px;">تهانينا يا ${studentName} 🎉</h2>
            <p style="font-size: 14px; color: #C5BFD4; line-height: 1.7; margin-bottom: 20px;">
              يسعدنا إبلاغك بأنه بعد الفحص الأولي لملفك ودرجات الشهادة الإعدادية، تم قبولك مبدئياً وتحديد موعد حضورك لأداء اختبار القدرات (IQ) والمقابلة الشخصية.
            </p>

            <!-- Appointment Dossier Card -->
            <div style="background: rgba(94, 39, 132, 0.15); border: 1.5px solid rgba(229, 169, 60, 0.4); border-radius: 12px; padding: 20px; margin-bottom: 25px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 10px 5px; color: #9A92A8; width: 35%;">📋 كود التقديم:</td>
                  <td style="padding: 10px 5px; color: #E5A93C; font-weight: 800; font-family: monospace; font-size: 16px;">${appCode}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 10px 5px; color: #9A92A8;">🏫 المدرسة المقررة:</td>
                  <td style="padding: 10px 5px; color: #ffffff; font-weight: 700;">${schoolName || 'مدرسة WE للتكنولوجيا التطبيقية'}</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding: 10px 5px; color: #9A92A8;">📅 الموعد والساعة:</td>
                  <td style="padding: 10px 5px; color: #00FF88; font-weight: 800; font-size: 15px;">${interviewDate || 'سيتم تأكيده عبر الهاتف'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 5px; color: #9A92A8;">📍 مقر الحضور والقاعة:</td>
                  <td style="padding: 10px 5px; color: #ffffff;">${location || 'مبنى المدرسة الرئيسي'}</td>
                </tr>
              </table>

              ${notes ? `
                <div style="margin-top: 15px; padding: 10px 12px; background: rgba(94, 39, 132, 0.25); border-radius: 8px; font-size: 13px; color: #E5A93C;">
                  💡 <b>ملاحظات لجنة الإدارة:</b> ${notes}
                </div>
              ` : ''}
            </div>

            <!-- Documents Checklist -->
            <div style="background: rgba(94, 39, 132, 0.12); border-radius: 12px; padding: 18px 20px; margin-bottom: 20px; border-inline-start: 4px solid #E5A93C;">
              <h3 style="font-size: 14px; color: #E5A93C; margin: 0 0 10px 0;">📑 المستندات المطلوبة عند الحضور:</h3>
              <ul style="margin: 0; padding-inline-start: 20px; font-size: 13px; color: #D6D0E0; line-height: 1.8;">
                <li>أصل أو صورة طبق الأصل من استمارة نجاح الشهادة الإعدادية.</li>
                <li>أصل شهادة الميلاد المميكنة وصورة واضحة منها.</li>
                <li>صورة بطاقة الرقم القومي لولي الأمر (الأب / الأم).</li>
                <li>عدد (4) صور شخصية حديثة للطالب بخلفية بيضاء (4×6).</li>
                <li>إشعار التقديم المطبوع بكود الطالب: <b>${appCode}</b>.</li>
              </ul>
            </div>

            <p style="font-size: 13px; color: #9A92A8; line-height: 1.6;">
              ⚠️ يُرجى الحضور قبل الموعد بنصف ساعة على الأقل بزي رسمي ولائق وبصحبة ولي الأمر.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: rgba(255,255,255,0.03); padding: 15px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #7E778D;">
            مدارس WE للتكنولوجيا التطبيقية — شراكة وزارة الاتصالات ووزارة التربية والتعليم والشركة المصرية للاتصالات WE
          </div>
        </div>
      `
    };

    const info = await mailClient.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    console.log(`✅ Interview invitation email sent to ${to} for student ${studentName}`);
    if (previewUrl) console.log(`🔗 Email Preview: ${previewUrl}`);

    lastSentEmails.push({
      type: 'interview_invitation',
      to,
      studentName,
      appCode,
      interviewDate,
      schoolName,
      previewUrl,
      timestamp: new Date().toISOString()
    });

    return { success: true, previewUrl };
  } catch (error) {
    console.error('Failed to send interview invitation email:', error);
    return { success: false, error: error.message };
  }
}

async function getSmtpStatus() {
  const brevoKey = getDbSetting('brevo_key') || process.env.BREVO_KEY;
  const brevoUser = getDbSetting('brevo_user') || process.env.BREVO_USER;
  const gmailUser = getDbSetting('gmail_user') || process.env.GMAIL_USER;
  const smtpHost = getDbSetting('smtp_host') || process.env.SMTP_HOST;
  const isReal = !!(brevoKey || gmailUser || smtpHost);

  let type = 'test_ethereal';
  let email = null;
  if (brevoKey) {
    type = 'brevo';
    email = brevoUser || 'Brevo Cloud SMTP';
  } else if (gmailUser) {
    type = 'gmail';
    email = gmailUser;
  } else if (smtpHost) {
    type = 'custom';
    email = getDbSetting('smtp_user') || process.env.SMTP_USER || smtpHost;
  }

  return {
    isRealConfigured: isReal,
    type,
    email
  };
}

async function saveSmtpSettings({ serviceType, brevoUser, brevoKey, gmailUser, gmailAppPass, smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom }) {
  if (serviceType === 'brevo') {
    if (brevoUser) setDbSetting('brevo_user', brevoUser.trim());
    if (brevoKey) setDbSetting('brevo_key', brevoKey.trim());
  } else if (serviceType === 'gmail') {
    if (gmailUser) setDbSetting('gmail_user', gmailUser);
    if (gmailAppPass) setDbSetting('gmail_app_pass', gmailAppPass.trim().replace(/\s+/g, ''));
  } else if (serviceType === 'custom') {
    if (smtpHost) setDbSetting('smtp_host', smtpHost);
    if (smtpPort) setDbSetting('smtp_port', String(smtpPort));
    if (smtpUser) setDbSetting('smtp_user', smtpUser);
    if (smtpPass) setDbSetting('smtp_pass', smtpPass);
  }
  if (smtpFrom) setDbSetting('smtp_from', smtpFrom);

  resetTransporter();
  return await getSmtpStatus();
}

async function sendTestEmail(targetEmail) {
  const mailClient = await getTransporter();
  const fromEmail = getDbSetting('smtp_from') || process.env.SMTP_FROM || (getDbSetting('gmail_user') || process.env.GMAIL_USER) || '"مدارس WE للتكنولوجيا التطبيقية" <admissions@we-ats.edu.eg>';

  const info = await mailClient.sendMail({
    from: fromEmail,
    to: targetEmail,
    subject: '🧪 اختبار نجاح تفعيل البريد الحقيقي - مدارس WE للتكنولوجيا التطبيقية',
    html: `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; max-width: 500px; padding: 25px; background: #0B0517; color: #fff; border-radius: 12px; border: 2px solid #E5A93C; text-align: center;">
        <h2 style="color: #E5A93C; margin-top: 0;">مبروك! تم تفعيل البريد الحقيقي بنجاح 🚀</h2>
        <p style="font-size: 14px; color: #C5BFD4; line-height: 1.6;">
          هذه رسالة تأكيد بأن بوابة مدارس WE للتكنولوجيا التطبيقية أصبحت متصلة بالبريد الإلكتروني الحقيقي، وسيصل كود التحقق ومواعيد المقابلات إلى صندوق الوارد مباشرة.
        </p>
      </div>
    `
  });

  return { success: true, messageId: info.messageId };
}

function getLastSentEmails() {
  return lastSentEmails;
}

module.exports = {
  sendVerificationOtp,
  sendInterviewInvitation,
  getLastSentEmails,
  getSmtpStatus,
  saveSmtpSettings,
  sendTestEmail,
  resetTransporter,
  getDbSetting,
  setDbSetting
};
