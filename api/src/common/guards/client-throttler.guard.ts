import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

function sameSecret(given: unknown, expected: string | undefined) {
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Requests from the web app arrive through its /api proxy, where the socket IP
// is a Vercel server. The proxy passes the visitor's IP along with a shared
// secret; the header is trusted only when the secret matches, so a client
// calling the API directly can't pick its own rate-limit bucket.
export function clientIp(req: Request): string {
  const forwarded = req.headers['x-client-ip'];
  if (
    typeof forwarded === 'string' &&
    forwarded &&
    sameSecret(req.headers['x-proxy-secret'], process.env.PROXY_SECRET)
  ) {
    return forwarded;
  }
  return req.ip ?? 'unknown';
}

@Injectable()
export class ClientThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(clientIp(req as Request));
  }
}
