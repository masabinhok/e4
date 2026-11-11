import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { cookiesOf, createApp } from './helpers';

describe('demo login', () => {
  let app: INestApplication<App>;
  let db: Connection;
  let cookie: string;
  const http = () => request(app.getHttpServer());
  const line = {
    title: 'Demo line',
    description: 'd',
    moves: ['e4', 'e5'],
    boardflip: 'white',
  };

  beforeAll(async () => {
    ({ app, db } = await createApp());
    cookie = cookiesOf(await http().post('/api/auth/demo').expect(201));
  });
  afterAll(() => app.close());

  it('logs in as a fresh demo user that expires in about 24h', async () => {
    const me = await http()
      .get('/api/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(me.body).toMatchObject({ isDemo: true, role: 'USER' });
    const hours =
      (new Date(me.body.expiresAt as string).getTime() - Date.now()) / 36e5;
    expect(hours).toBeGreaterThan(23);
    expect(hours).toBeLessThanOrEqual(24);
  });

  it('gives each visitor their own account', async () => {
    await http().post('/api/auth/demo').expect(201);
    expect(await db.collection('users').countDocuments({ isDemo: true })).toBe(
      2,
    );
  });

  it('has a TTL index on users.expiresAt', async () => {
    const indexes = await db.collection('users').indexes();
    expect(indexes).toContainEqual(
      expect.objectContaining({
        key: { expiresAt: 1 },
        expireAfterSeconds: 0,
      }),
    );
  });

  it('can record a private line', async () => {
    await http()
      .post('/api/variations/record')
      .set('Cookie', cookie)
      .send(line)
      .expect(201);
  });

  it('cannot contribute openings or lines', async () => {
    await http()
      .post('/api/openings/add')
      .set('Cookie', cookie)
      .send({ name: 'x', code: 'x', description: 'x' })
      .expect(403);
    await http()
      .post('/api/variations/contribute/carokann')
      .set('Cookie', cookie)
      .send(line)
      .expect(403);
  });

  it('stays a demo session after a token refresh', async () => {
    const res = await http()
      .post('/api/auth/refresh')
      .set('Cookie', cookie)
      .expect(201);
    await http()
      .post('/api/openings/add')
      .set('Cookie', cookiesOf(res))
      .send({ name: 'y', code: 'y', description: 'y' })
      .expect(403);
  });
});
