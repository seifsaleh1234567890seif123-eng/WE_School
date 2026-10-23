const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Brute-force protection for admin login
const loginLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: 'تم تجاوز الحد الأقصى لمحاولات تسجيل الدخول. يرجى الانتظار 5 دقائق.'
});

// Admin Auth
router.post('/login', loginLimiter, adminController.login);

// Protected Admin Routes (JWT Required)
router.get('/dashboard', authenticateAdmin, adminController.getDashboardMetrics);
router.get('/applications', authenticateAdmin, adminController.getApplications);
router.patch('/applications/:id/status', authenticateAdmin, adminController.updateApplicationStatus);
router.get('/applications/export', authenticateAdmin, adminController.exportApplicationsCSV);

router.get('/messages', authenticateAdmin, adminController.getMessages);
router.patch('/messages/:id/status', authenticateAdmin, adminController.updateMessageStatus);

// SMTP Mail Settings
router.get('/settings/smtp', authenticateAdmin, adminController.getSmtpSettings);
router.post('/settings/smtp', authenticateAdmin, adminController.updateSmtpSettings);
router.post('/settings/smtp/test', authenticateAdmin, adminController.testSmtpSettings);

module.exports = router;
