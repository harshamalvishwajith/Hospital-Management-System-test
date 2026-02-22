import rateLimit from 'express-rate-limit';

// Rate limiter for file uploads
export const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 file upload requests per windowMs
  message: {
    error: "Too many file upload attempts. Please try again later.",
    retryAfter: "15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for certain conditions if needed
    return false;
  }
});

// Stricter rate limiter for file uploads from same user
export const userFileUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 file uploads per hour
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise fall back to IP
    return req.user?.id || req.ip;
  },
  message: {
    error: "Upload limit exceeded. Please try again later.",
    retryAfter: "1 hour"
  }
});