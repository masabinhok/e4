import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { cookiesOf, createApp, signUp } from './helpers';

describe('auth hardening', () => {
  let app: INestApplication<App>;
  let db: Connection;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => ({ app, db } = await createApp()));
  afterAll(() => app.close());

  it('rejects a refresh token once it has been rotated', async () => {
    const { cookie: first } = await signUp(app, db);
    const rotated = await http()
      .post('/api/auth/refresh')
      .set('Cookie', first)
      .expect(201);
    await http().post('/api/auth/refresh').set('Cookie', first).expect(401);
    await http()
      .post('/api/auth/refresh')
      .set('Cookie', cookiesOf(rotated))
      .expect(201);
  });

  it('stores only a hash of the refresh token', async () => {
    const { email, cookie } = await signUp(app, db);
    const token = /refreshToken=([^;]+)/.exec(cookie)![1];
    const user = await db.collection('users').findOne({ email });
    expect(user!.refreshToken).toMatch(/^[0-9a-f]{64}$/);
    expect(user!.refreshToken).not.toContain(token);
  });

  it('gives the same 401 for an unknown email and a wrong password', async () => {
    const { email } = await signUp(app, db);
    const unknown = await http()
      .post('/api/auth/login')
      .send({ email: 'nobody@test.local', password: 'password123' })
      .expect(401);
    const wrong = await http()
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' })
      .expect(401);
    expect(unknown.body.message).toBe('Invalid email or password');
    expect(wrong.body.message).toBe(unknown.body.message);
  });

  it.each([
    ['a short password', { password: 'short' }],
    ['a password over 72 characters', { password: 'x'.repeat(73) }],
    ['an empty name', { fullName: '' }],
  ])('rejects signup with %s', async (_, override) => {
    await http()
      .post('/api/auth/signup')
      .send({
        fullName: 'Valid Name',
        email: 'valid@test.local',
        password: 'password123',
        ...override,
      })
      .expect(400);
  });
});
