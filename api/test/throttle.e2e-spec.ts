import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createApp } from './helpers';

describe('rate limits', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    process.env.DISABLE_THROTTLE = 'false';
    ({ app } = await createApp());
  });
  afterEach(async () => {
    await app.close();
    process.env.DISABLE_THROTTLE = 'true';
  });

  const attempt = (headers: Record<string, string> = {}) =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .set(headers)
      .send({ email: 'nobody@test.local', password: 'password123' });
  const exhaust = async (headers: Record<string, string> = {}) => {
    for (let i = 0; i < 10; i++) await attempt(headers).expect(401);
  };

  it('allows 10 login attempts per minute, then 429', async () => {
    await exhaust();
    await attempt().expect(429);
  });

  it('gives each visitor behind the web proxy their own limit', async () => {
    const secret = { 'x-proxy-secret': 'test-proxy-secret' };
    await exhaust({ ...secret, 'x-client-ip': '203.0.113.1' });
    await attempt({ ...secret, 'x-client-ip': '203.0.113.1' }).expect(429);
    await attempt({ ...secret, 'x-client-ip': '203.0.113.2' }).expect(401);
  });

  it('ignores a forwarded IP that comes without the proxy secret', async () => {
    await exhaust();
    await attempt({ 'x-client-ip': '203.0.113.9' }).expect(429);
    await attempt({
      'x-client-ip': '203.0.113.9',
      'x-proxy-secret': 'wrong-secret',
    }).expect(429);
  });
});
