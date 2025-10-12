import { Request, Response, NextFunction } from 'express';

// Simple rate limiter - in production use redis-based solution
const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // max requests per window

  if (!requests.has(ip)) {
    requests.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const requestData = requests.get(ip)!;

  if (now > requestData.resetTime) {
    // Reset window
    requestData.count = 1;
    requestData.resetTime = now + windowMs;
    return next();
  }

  if (requestData.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
    });
  }

  requestData.count++;
  next();
};