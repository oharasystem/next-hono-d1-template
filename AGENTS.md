# ロール: AI開発者

このプロジェクトでは、以下のコーディング規約と実装方針を遵守してください。

## Next.js (App Router) ページ実装ガイドライン

### 1. Edge Runtime の強制適用
Cloudflare Workers/Pages 上で動作するため、すべてのページは Edge Runtime で動作する必要があります。
特に Server Actions を使用するページでは、`export const runtime = "edge";` を明示的に宣言してください。

### 2. Client Component の分離
ページコンポーネント (`app/**/page.tsx`) は、原則として Server Component として実装し、クライアントサイドのロジック（`useState`, `useEffect` など）を含むコンポーネントは別ファイルに分離してください。

#### 実装パターン
1. **Server Component (`app/**/page.tsx`)**
   - ファイルの先頭で `export const runtime = "edge";` を宣言する。
   - クライアントコンポーネントを import してレンダリングするだけの責務とする。

2. **Client Component (`components/**/PageClient.tsx`)**
   - ファイルの先頭で `"use client";` を宣言する。
   - 実際のUIロジックや状態管理を行う。

### 3. Server Actions の使用
Server Actions は Edge Runtime で実行されるため、データベース操作などを行う際は適切な環境変数が利用可能であることを確認してください。

## UIスタイルガイドライン

### 1. インタラクティブ要素のカーソルスタイル
`<button>`, クリック可能な `<div>`, カスタムコントロールなど、すべてのインタラクティブ要素には必ず `cursor-pointer` クラスを付与してください。

### 2. 型安全性
Server Actions の戻り値には明示的な型定義を付与してください。`as any` キャストの使用は避け、適切なインターフェースを定義してください。
