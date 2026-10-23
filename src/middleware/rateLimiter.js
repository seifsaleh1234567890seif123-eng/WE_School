// High-performance In-Memory Rate Limiter
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000; // 1 minute window
  const max = options.max || 60; // 60 requests per minute
  const message = options.message || 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة بعد دقيقة.';

  const hits = new Map();

  // Periodically clean up expired entries
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of hits.entries()) {
      if (now - data.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, windowMs).unref();

  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = hits.get(ip);
    if (!record || now - record.startTime > windowMs) {
      record = { count: 1, startTime: now };
      hits.set(ip, record);
      return next();
    }

    record.count++;
    if (record.count > max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfterMs: windowMs - (now - record.startTime)
      });
    }

    next();
  };
}

module.exports = { createRateLimiter };
