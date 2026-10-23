const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'we-ats-super-secure-jwt-secret-key-2026';

function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized access. Token required.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired session token.'
    });
  }
}

module.exports = { authenticateAdmin, JWT_SECRET };
