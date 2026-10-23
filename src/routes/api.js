const express = require('express');
const router = express.Router();

const admissionsController = require('../controllers/admissionsController');
const schoolsController = require('../controllers/schoolsController');
const contactController = require('../controllers/contactController');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiters for public submission endpoints
const applyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'تم تجاوز عدد محاولات التقديم المسموح بها من هذا الجهاز. يرجى المحاولة بعد 15 دقيقة.'
});

const contactLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'تم تجاوز عدد الرسائل المسموح بها. يرجى الانتظار قليلاً.'
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'WE Applied Technology Schools Core API',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version
  });
});

// Stats & Metadata
router.get('/stats', schoolsController.getPublicStats);

// Schools
router.get('/schools', schoolsController.getAllSchools);
router.get('/schools/:id', schoolsController.getSchoolById);

// Specializations
router.get('/specializations', schoolsController.getAllSpecializations);

// News & Announcements
router.get('/news', schoolsController.getNews);

// FAQs
router.get('/faqs', schoolsController.getFaqs);

// Eligibility Calculator
router.post('/eligibility/check', admissionsController.checkEligibility);

// Admissions & OTP Verification (Unlimited submissions allowed)
router.post('/admissions/send-otp', admissionsController.sendOtp);
router.post('/admissions/verify-otp', admissionsController.verifyOtp);
router.post('/admissions/apply', admissionsController.apply);
router.get('/admissions/track/:query', admissionsController.track);
router.get('/admissions/track', admissionsController.track);

// Quiz
router.post('/quiz/submit', admissionsController.submitQuiz);

// Contact & Newsletter
router.post('/contact', contactLimiter, contactController.submitContact);
router.post('/newsletter', contactLimiter, contactController.subscribeNewsletter);

module.exports = router;
