import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createApp, signUp } from './helpers';

describe('request hardening', () => {
  let app: INestApplication<App>;
  let db: Connection;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => ({ app, db } = await createApp()));
  afterAll(() => app.close());

  it('returns 400, not 500, for a malformed id', async () => {
    const admin = await signUp(app, db, 'ADMIN');
    await http()
      .delete('/api/admin/user/not-an-id')
      .set('Cookie', admin.cookie)
      .expect(400);
    await http()
      .delete('/api/openings/cancel/not-an-id')
      .set('Cookie', admin.cookie)
      .expect(400);
  });

  it('sends security headers', async () => {
    const res = await http().get('/api/health').expect(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
