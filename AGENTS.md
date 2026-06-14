# ロール: AI開発者

このプロジェクトは、**Next.js (App Router) + Hono + Cloudflare D1** のモノレポテンプレートです。
以下のコーディング規約と実装方針を遵守してください。

## プロジェクト構成

```text
next-hono-d1-template/
├── apps/
│   ├── api/          # Hono (Cloudflare Workers) - バックエンドAPI
│   │   └── src/index.ts  # APIルート定義、AppType のエクスポート
│   └── web/          # Next.js (App Router) - フロントエンド (Cloudflare Workers / OpenNext)
│       └── src/
│           ├── app/          # App Router ページ・レイアウト
│           │   └── api/[[...path]]/route.ts  # API プロキシルート
│           ├── components/   # Client Components (UIロジック)
│           ├── lib/          # ユーティリティ (api.ts, utils.ts)
│           └── providers/    # Context Providers (TanStack Query等)
├── packages/
│   ├── shared/       # Zodスキーマ、共通の型定義
│   └── db/           # Drizzle ORM スキーマ、マイグレーション、シード
└── turbo.json        # Turborepo タスク設定
```

## パッケージ名規則

モノレポ内のパッケージは `@next-hono-d1-template/` スコープを使用します。

| パッケージ | スコープ名 |
| :--- | :--- |
| `apps/api` | `@next-hono-d1-template/api` |
| `apps/web` | `@next-hono-d1-template/web` |
| `packages/shared` | `@next-hono-d1-template/shared` |
| `packages/db` | `@next-hono-d1-template/db` |

## Next.js (App Router) ページ実装ガイドライン

### 1. ランタイムについて
OpenNextの導入により、Node.js互換APIもCloudflare Workers/Pages上で動作可能になりました。なお、モジュールの競合防止や適切なプリレンダリングを行うため、Next.jsの個別ファイル（layout.tsxやpage.tsx等）で `export const runtime = "edge"` を記述することは禁止し、OpenNext側の変換構成にすべて任せるルールとしています。

### 2. Client Component の分離
ページコンポーネント (`app/**/page.tsx`) は、原則として **Server Component** として実装してください。
クライアントサイドのロジック（`useState`, `useEffect`, `useQuery` など）を含むコンポーネントは別ファイルに分離します。

#### 実装パターン
1. **Server Component (`app/**/page.tsx`)**
   - Client Component を import してレンダリングするだけの責務とする。

2. **Client Component (`components/**/*Client.tsx`)**
   - ファイルの先頭で `"use client";` を宣言する。
   - 実際のUIロジック、状態管理、データフェッチ（TanStack Query）を行う。

### 3. API プロキシパターン
フロントエンドからバックエンドへのアクセスは、Next.js の **プロキシルート** (`app/api/[[...path]]/route.ts`) を経由します。
- ブラウザからは `/api/*` という相対パスでアクセス
- プロキシルートが `API_BASE_URL`（環境変数）またはローカルの `http://localhost:8787` にリクエストを転送
- CORS を回避し、バックエンドURLをクライアントに露出させない

### 4. Hono RPC による型安全な API 呼び出し
`apps/api` の `AppType` を `apps/web` で import し、`hono/client` の `hc` 関数で型安全なクライアントを作成します。

```typescript
// apps/web/src/lib/api.ts
import { hc } from "hono/client";
import type { AppType } from "@next-hono-d1-template/api";
const client = hc<AppType>(getBaseUrl());
```

### 5. Hono API ルート定義
API ルートはメソッドチェーンで定義し、`typeof route` を`AppType` としてエクスポートします。
Zod バリデーション (`@hono/zod-validator`) を使い、入出力を型安全にしてください。

```typescript
// apps/api/src/index.ts
const route = app
  .get('/hello', (c) => c.json({ message: 'Hello!' }))
  .post('/greet', zValidator('json', helloSchema), (c) => { ... });

export type AppType = typeof route;
```

## データベース (Drizzle ORM / Cloudflare D1)

- スキーマ定義: `packages/db/src/schema.ts`
- マイグレーション: `packages/db/drizzle/` ディレクトリ
- DB生成: `pnpm db:generate` → `pnpm db:migrate` (ローカル) / `pnpm db:migrate:remote` (本番)
- シード: `pnpm db:seed` (ローカル) / `pnpm db:seed:remote` (本番)

## UI スタイルガイドライン

### 1. UI ライブラリ
- **shadcn/ui** (Tailwind CSS v4 ベース) を使用
- コンポーネント追加: `apps/web` ディレクトリで `npx shadcn@latest add <component>` を実行

### 2. インタラクティブ要素のカーソルスタイル
`<button>`, クリック可能な `<div>`, カスタムコントロールなど、すべてのインタラクティブ要素には必ず `cursor-pointer` クラスを付与してください。

### 3. 型安全性
Server Actions の戻り値には明示的な型定義を付与してください。`as any` キャストの使用は避け、適切なインターフェースを定義してください。

## 環境変数

| 変数名 | 場所 | 説明 |
| :--- | :--- | :--- |
| `API_BASE_URL` | `apps/web/.env` | バックエンドAPI のベースURL。ローカルでは `http://localhost:8787` |
| `DB` (Binding) | `apps/api/wrangler.toml` | Cloudflare D1 データベースバインディング |

## 開発・デプロイコマンド

| コマンド | 説明 |
| :--- | :--- |
| `pnpm dev` | Next.js (3000) + Hono (8787) を同時起動 |
| `pnpm build` | 全パッケージのビルド・型チェック |
| `pnpm -F @next-hono-d1-template/web pages:build` | Cloudflare Webアプリ (OpenNext) のビルド |
| `npx wrangler deploy -c apps/web/wrangler.toml` | Webアプリの Cloudflare Pages デプロイ |
| `npx wrangler versions upload -c apps/web/wrangler.toml` | Webアプリのバージョンアップロード |
| `pnpm db:generate` | Drizzle マイグレーションファイル生成 |
| `pnpm db:migrate` | ローカル D1 へマイグレーション適用 |
| `pnpm db:seed` | ローカル D1 へサンプルデータ投入 |
| `pnpm api:deploy` | Cloudflare Workers に API をデプロイ |
