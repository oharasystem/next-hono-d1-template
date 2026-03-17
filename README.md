# Next.js + Hono + D1 Monorepo Template

Cloudflare Pages (Next.js) と Cloudflare Workers (Hono) を組み合わせた、実用的なモノレポ構成のテンプレートリポジトリです。

## 🚀 技術スタック

| カテゴリ | 選定技術 | 理由 |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | 高速なレンダリングとSEO、Cloudflare Pagesとの抜群の相性。 |
| **API / Backend** | Hono | Workers/Pages Functionsの標準。RPCによる強力な型安全。 |
| **ORM** | Drizzle ORM | 軽量でTypeScriptの型補完が強力。Edgeランタイムに最適。 |
| **Validation** | Zod | APIの入出力やスキーマ定義を安全に扱える。 |
| **UI Component** | shadcn/ui | Tailwind CSSベースの美しく拡張性の高いUI。 |
| **State Management** | TanStack Query | 非同期通信の管理をシンプルかつ強力に。 |
| **Package Manager** | pnpm (Workspaces) | 高速かつ効率的なモノレポ管理。 |

## 📂 プロジェクト構成

```text
next-hono-d1-template/
├── apps/
│   ├── api/          # Hono (Cloudflare Workers) - バックエンドAPI
│   └── web/          # Next.js (App Router) - フロントエンド
├── packages/
│   ├── shared/       # Zodスキーマ、共通の型定義
│   └── db/           # Drizzle ORM スキーマ、データベース接続
├── package.json      # ルート設定（Turbo, scripts）
└── pnpm-workspace.yaml
```

## 🛠 セットアップ & 開発

### 1. 依存関係のインストール

```bash
pnpm install
```

### 2. 開発サーバーの起動

```bash
pnpm dev
```
- フロントエンド (Next.js): [http://localhost:3000](http://localhost:3000)
- バックエンド (Hono): [http://localhost:8787](http://localhost:8787)

#### 💡 API プロキシを利用した開発 (推奨)

ブラウザから `/api/*` を経由してバックエンドと通信する場合、Cloudflare Pages Functions のプロキシ機能をローカルでシミュレートするために以下のコマンドを使用します。

```bash
# 別のターミナルで実行
pnpm -F @next-hono-d1-template/web pages:dev
```
- **統合プロキシサーバー**: [http://localhost:8888](http://localhost:8888)

このポート（8888）にアクセスすることで、フロントエンドの表示と `/api/*` へのプロキシが同一ドメインとして動作し、CORS を意識せずに開発できます。

また、`apps/web` は [Next.js](https://nextjs.org) プロジェクトです。Cloudflare Pages で動作させるため、すべてのページとレイアウトで **Edge Runtime** (`export const runtime = "edge";`) が適用されています。詳細なドキュメントは [Next.js Documentation](https://nextjs.org/docs) を参照してください。

## 🗄 データベース (Drizzle / D1)

### マイグレーションの管理

```bash
# マイグレーションファイルの生成
pnpm db:generate

# ローカルDBへの適用
pnpm db:migrate

# 本番DBへの適用
pnpm db:migrate:remote

# サンプルデータの投入 (ローカル)
pnpm db:seed
```

### Drizzle Studio

```bash
pnpm -F @next-hono-d1-template/db studio
```

## 🌐 デプロイ

### Cloudflare D1 セットアップ

```bash
# D1データベースの作成
npx wrangler d1 create next-hono-d1-template-db

# 表示された database_id を apps/api/wrangler.toml に設定
```

### Cloudflare Workers (API)

1. **ルートディレクトリ**: `apps/api`
2. **デプロイコマンド**: `npx wrangler deploy`

### Cloudflare Pages (Web)

1. **ルートディレクトリ**: `apps/web`
2. **ビルドコマンド**: `pnpm pages:build`
3. **ビルド出力ディレクトリ**: `.vercel/output/static`
4. **環境変数の設定**:
   - `NEXT_PUBLIC_API_URL`: デプロイされた API (Cloudflare Workers) の URL を設定してください。
   - 例: `https://next-hono-d1-template-api.xxxx.workers.dev`
   - 未設定の場合、ローカル開発用の `http://localhost:8787` が使用されます。

## 💡 特徴: RPCによる型安全な開発

`apps/api` でエクスポートされた `AppType` を `apps/web` で読み込むことで、APIクライアント (`hono/client`) を通じて**ドキュメント不要・型補完あり**の爆速開発が可能です。

```typescript
// apps/web/src/lib/api.ts
const res = await client.hello.$get();
const data = await res.json(); // ここで型が効く！
```
