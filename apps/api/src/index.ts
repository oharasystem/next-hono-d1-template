/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { helloSchema } from '@next-hono-d1-template/shared';
import { createDb, usersTable } from '@next-hono-d1-template/db';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

const route = app
  .get('/hello', (c) => {
    return c.json({
      message: 'Hello from Hono API (Monorepo)!',
      timestamp: new Date().toISOString(),
    });
  })
  .get('/users', async (c) => {
    const db = createDb(c.env.DB);
    const users = await db.select().from(usersTable).all();
    return c.json(users);
  })
  .post('/greet', zValidator('json', helloSchema), (c) => {
    const data = c.req.valid('json');
    return c.json({
      message: `Hello, ${data.name || 'Anonymous'}!`,
    });
  });

export type AppType = typeof route;
export default app;
