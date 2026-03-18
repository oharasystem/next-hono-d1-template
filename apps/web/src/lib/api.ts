import { hc } from "hono/client";
import type { AppType } from "@next-hono-d1-template/api";

/**
 * Hono RPC クライアントの初期化
 * 
 * - ブラウザ側: 相対パス `/api` を使用（Next.js のプロキシ経由）
 * - サーバー側 (Edge Runtime): 環境変数 `API_BASE_URL` を使用して Workers を直接呼ぶか、プロキシ URL を使用
 */
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // ブラウザ環境では、Next.js プロキシールート経由で呼び出す
    return "/api";
  }
  
  // サーバー側 (Next.js Edge Runtime / SSR)
  // デプロイ時は API_BASE_URL を設定することを推奨
  return process.env.API_BASE_URL || "http://localhost:8787";
};

const client = hc<AppType>(getBaseUrl());

export default client;
