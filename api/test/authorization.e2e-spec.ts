import { INestApplication } from '@nestjs/common';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createApp, signUp } from './helpers';

describe('authorization', () => {
  let app: INestApplication<App>;
  let db: Connection;
  let user: Awaited<ReturnType<typeof signUp>>;
  let other: Awaited<ReturnType<typeof signUp>>;
  let admin: Awaited<ReturnType<typeof signUp>>;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    ({ app, db } = await createApp());
    user = await signUp(app, db);
    other = await signUp(app, db);
    admin = await signUp(app, db, 'ADMIN');
  });
  afterAll(() => app.close());

  describe('admin routes', () => {
    const id = new Types.ObjectId().toString();
    const routes: ['get' | 'post' | 'delete', string][] = [
      ['get', '/api/admin'],
      ['post', `/api/admin/variation/toggle-status/${id}`],
      ['post', `/api/admin/opening/toggle-status/${id}`],
      ['delete', `/api/admin/variation/${id}`],
      ['delete', `/api/admin/user/${id}`],
      ['delete', `/api/admin/opening/${id}`],
    ];

    it.each(routes)('%s %s is 403 for a USER', async (method, url) => {
      await http()[method](url).set('Cookie', user.cookie).expect(403);
    });

    it.each(routes)('%s %s is 401 when logged out', async (method, url) => {
      await http()[method](url).expect(401);
    });

    it('a USER cannot delete another user', async () => {
      await http()
        .delete(`/api/admin/user/${other.id}`)
        .set('Cookie', user.cookie)
        .expect(403);
      expect(
        await db
          .collection('users')
          .countDocuments({ _id: new Types.ObjectId(other.id) }),
      ).toBe(1);
    });

    it('an ADMIN can read admin data', async () => {
      const res = await http()
        .get('/api/admin')
        .set('Cookie', admin.cookie)
        .expect(200);
      expect(res.body.users.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('cancelling an opening contribution', () => {
    const addOpening = async (cookie: string, code: string) => {
      await http()
        .post('/api/openings/add')
        .set('Cookie', cookie)
        .send({ name: code, code, description: 'd' })
        .expect(201);
      const o = await db.collection('openings').findOne({ code });
      return String(o!._id);
    };
    const exists = async (id: string) =>
      (await db
        .collection('openings')
        .countDocuments({ _id: new Types.ObjectId(id) })) === 1;

    it("cannot cancel someone else's pending opening", async () => {
      const id = await addOpening(other.cookie, 'others-pending');
      await http()
        .delete(`/api/openings/cancel/${id}`)
        .set('Cookie', user.cookie)
        .expect(404);
      expect(await exists(id)).toBe(true);
    });

    it('cannot cancel an opening once it is accepted', async () => {
      const id = await addOpening(user.cookie, 'own-accepted');
      await db
        .collection('openings')
        .updateOne(
          { _id: new Types.ObjectId(id) },
          { $set: { status: 'ACCEPTED' } },
        );
      await http()
        .delete(`/api/openings/cancel/${id}`)
        .set('Cookie', user.cookie)
        .expect(404);
      expect(await exists(id)).toBe(true);
    });

    it('can cancel own pending opening', async () => {
      const id = await addOpening(user.cookie, 'own-pending');
      await http()
        .delete(`/api/openings/cancel/${id}`)
        .set('Cookie', user.cookie)
        .expect(200);
      expect(await exists(id)).toBe(false);
    });
  });
});
