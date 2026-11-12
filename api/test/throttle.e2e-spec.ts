import * as request from 'supertest';
import { createApp } from './helpers';

it('rate-limits login attempts to 10 per minute', async () => {
  process.env.DISABLE_THROTTLE = 'false';
  const { app } = await createApp();
  const attempt = () =>
    request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@test.local', password: 'password123' });

  for (let i = 0; i < 10; i++) await attempt().expect(401);
  await attempt().expect(429);

  await app.close();
  process.env.DISABLE_THROTTLE = 'true';
});
