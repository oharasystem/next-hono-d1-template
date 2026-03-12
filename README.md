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
- フロントエンド: [http://localhost:3000](http://localhost:3000)
- バックエンド: [http://localhost:8787](http://localhost:8787)

### 3. 型チェック

```bash
pnpm lint
# または個別に
pnpm --filter @next-hono-d1-template/api exec npx tsc --noEmit
```

## 💡 特徴: RPCによる型安全な開発

`apps/api` でエクスポートされた `AppType` を `apps/web` で読み込むことで、APIクライアント (`hono/client`) を通じて**ドキュメント不要・型補完あり**の爆速開発が可能です。

```typescript
// apps/web/src/lib/api.ts
const res = await client.hello.$get();
const data = await res.json(); // ここで型が効く！
```
