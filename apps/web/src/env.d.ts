/**
 * Cloudflare Bindings の型定義
 * @opennextjs/cloudflare の CloudflareEnv を拡張して、
 * wrangler.toml で定義したバインディングを型安全に利用できるようにします。
 */
declare global {
  interface CloudflareEnv {
    /** Hono API ワーカーへの Service Binding */
    API: Service;
    /** バックエンド API のベース URL（ローカル開発時のフォールバック用） */
    API_BASE_URL?: string;
  }
}
export {};
