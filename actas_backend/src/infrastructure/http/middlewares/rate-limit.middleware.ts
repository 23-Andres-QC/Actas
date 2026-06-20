import { NextFunction, Request, Response } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter en memoria por IP, suficiente para una sola instancia.
 * Para múltiples réplicas, sustituir por un store compartido (ej. Redis).
 */
export function rateLimit(maxRequests: number, windowMs: number) {
  const buckets = new Map<string, Bucket>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= maxRequests) {
      res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes, intenta más tarde' } });
      return;
    }

    bucket.count += 1;
    next();
  };
}
