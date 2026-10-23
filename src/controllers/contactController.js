const db = require('../config/db');
const { sanitizeString } = require('../middleware/validator');

function submitContact(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email);
    const cleanSubject = sanitizeString(subject) || 'استفسار عام';
    const cleanMsg = sanitizeString(message);
    const cleanPhone = sanitizeString(phone);

    if (!cleanName || !cleanEmail || !cleanMsg) {
      return res.status(400).json({
        success: false,
        error: 'يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، والرسالة).'
      });
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        error: 'البريد الإلكتروني المدخل غير صالح.'
      });
    }

    db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMsg);

    return res.status(201).json({
      success: true,
      message: 'تم استلام رسالتك بنجاح! سيقوم فريق الدعم الفني لمدارس WE بالرد عليك في أقرب وقت.'
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.'
    });
  }
}

function subscribeNewsletter(req, res) {
  try {
    const { email } = req.body;
    const cleanEmail = sanitizeString(email).toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({
        success: false,
        error: 'يرجى إدخال بريد إلكتروني صحيح.'
      });
    }

    try {
      db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(cleanEmail);
    } catch (e) {
      // If already subscribed, return friendly ok
    }

    return res.json({
      success: true,
      message: 'تم اشتراكك بنجاح في النشرة البريدية لمدارس WE للتكنولوجيا التطبيقية!'
    });
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل الاشتراك في النشرة.'
    });
  }
}

module.exports = {
  submitContact,
  subscribeNewsletter
};
