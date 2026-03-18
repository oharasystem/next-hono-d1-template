/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { helloSchema } from '@next-hono-d1-template/shared';
import { createDb, usersTable } from '@next-hono-d1-template/db';

type Bindings = {
  DB: D1Database;
};

// Cloudflare Workers の環境変数や bindings を型安全に定義
const app = new Hono<{ Bindings: Bindings }>();

// 全てのリクエストに CORS を適用 (開発用や外部 API 公開用)
app.use('*', cors());

/**
 * API ルートの定義
 * メソッドチェーンによって AppType を構築し、フロントエンドでの RPC を可能にします。
 */
const route = app
  // シンプルな GET エンドポイント
  .get('/hello', (c) => {
    return c.json({
      message: 'Hello from Hono API (Monorepo)!',
      timestamp: new Date().toISOString(),
    });
  })
  // D1 データベースからデータを取得するエンドポイント
  .get('/users', async (c) => {
    const db = createDb(c.env.DB);
    const users = await db.select().from(usersTable).all();
    return c.json(users);
  })
  // Zod バリデーション付きの POST エンドポイント
  .post('/greet', zValidator('json', helloSchema), (c) => {
    const data = c.req.valid('json');
    return c.json({
      message: `Hello, ${data.name || 'Anonymous'}!`,
    });
  });

// フロントエンドで AppType を import することで、API 通信が型安全になります
export type AppType = typeof route;

export default app;
