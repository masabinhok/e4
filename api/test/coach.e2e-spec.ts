import { INestApplication } from '@nestjs/common';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { createApp, signUp } from './helpers';

describe('AI coach', () => {
  let app: INestApplication<App>;
  let db: Connection;
  let cookie: string;
  let lineId: string;
  let stub: Server;
  let calls: { body: { messages: { content: string }[] } }[] = [];
  let failNext = false;
  const http = () => request(app.getHttpServer());
  const ask = (body: object) =>
    http().post('/api/coach').set('Cookie', cookie).send(body);

  beforeAll(async () => {
    // A stand-in for the provider's OpenAI-compatible chat endpoint.
    stub = createServer((req, res) => {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', () => {
        calls.push({ body: JSON.parse(raw) });
        if (failNext) {
          res.writeHead(500).end();
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            choices: [{ message: { content: `Stub reply ${calls.length}` } }],
          }),
        );
      });
    }).listen(0);
    ({ app, db } = await createApp());
    ({ cookie } = await signUp(app, db));
    await db.collection('openings').insertOne({
      name: 'Caro-Kann Defense',
      code: 'carokann',
      side: 'black',
      description: 'd',
      status: 'ACCEPTED',
      variations: [],
    });
    const { insertedId } = await db.collection('variations').insertOne({
      title: 'Short System',
      code: 'carokann',
      moves: ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'],
      notes: ['', 'Prepares ...d5.', '', 'Hit e4.', '', 'Bishop out first.'],
      boardflip: 'black',
      description: '',
      status: 'ACCEPTED',
    });
    lineId = String(insertedId);
  });
  beforeEach(() => {
    calls = [];
    failNext = false;
    delete process.env.COACH_API_KEY;
    process.env.COACH_API_URL = `http://127.0.0.1:${(stub.address() as AddressInfo).port}`;
    process.env.COACH_DAILY_LIMIT = '100';
  });
  afterAll(async () => {
    await app.close();
    stub.close();
  });

  it('without a key, answers with the checked note', async () => {
    const res = await ask({ variationId: lineId, index: 5 }).expect(200);
    expect(res.body).toEqual({ text: 'Bishop out first.', source: 'note' });
    expect(calls).toHaveLength(0);
  });

  it('asks the model once, then serves everyone from the cache', async () => {
    process.env.COACH_API_KEY = 'test-key';
    const first = await ask({ variationId: lineId, index: 3 }).expect(200);
    expect(first.body).toEqual({ text: 'Stub reply 1', source: 'ai' });
    const prompt = calls[0].body.messages[1].content;
    expect(prompt).toContain('Verified note: Hit e4.');
    expect(prompt).toContain('Move: 2...d5, played by the learner');

    const other = await signUp(app, db);
    const second = await http()
      .post('/api/coach')
      .set('Cookie', other.cookie)
      .send({ variationId: lineId, index: 3 })
      .expect(200);
    expect(second.body).toEqual({ text: 'Stub reply 1', source: 'cache' });
    expect(calls).toHaveLength(1);
  });

  it("passes the learner's wrong move, normalised to SAN", async () => {
    process.env.COACH_API_KEY = 'test-key';
    await ask({ variationId: lineId, index: 5, played: 'Bg4' }).expect(200);
    expect(calls[0].body.messages[1].content).toContain(
      'The learner tried Bg4 instead',
    );
  });

  it('falls back to the note when the daily limit is reached or the provider fails', async () => {
    process.env.COACH_API_KEY = 'test-key';
    process.env.COACH_DAILY_LIMIT = '0';
    expect(
      (await ask({ variationId: lineId, index: 1 }).expect(200)).body.source,
    ).toBe('note');
    process.env.COACH_DAILY_LIMIT = '100';
    failNext = true;
    expect(
      (await ask({ variationId: lineId, index: 1 }).expect(200)).body,
    ).toEqual({ text: 'Prepares ...d5.', source: 'note' });
  });

  it('rejects bad input and unknown lines', async () => {
    await ask({ variationId: lineId, index: 99 }).expect(400);
    await ask({ variationId: lineId, index: 5, played: 'Ke8' }).expect(400); // illegal there
    await ask({ variationId: lineId, index: 5, played: 'hello world' }).expect(
      400,
    );
    await ask({
      variationId: new Types.ObjectId().toString(),
      index: 0,
    }).expect(404);
    await http()
      .post('/api/coach')
      .send({ variationId: lineId, index: 0 })
      .expect(401);
  });
});
