const rateLimit = {};

/**
 * In-memory sliding window rate limiter middleware.
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} maxRequests - Maximum number of requests allowed in the window
 */
module.exports = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!rateLimit[ip]) {
      rateLimit[ip] = [];
    }

    // Filter out timestamps older than the sliding window
    rateLimit[ip] = rateLimit[ip].filter(timestamp => now - timestamp < windowMs);

    if (rateLimit[ip].length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.'
      });
    }

    rateLimit[ip].push(now);
    next();
  };
};
