import { NextRequest } from "next/server";

export const runtime = "edge";

async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  // 環境変数からバックエンドのURLを取得（未設定の場合はローカルホスト）
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  
  // /api プレフィックスを削除してバックエンドのパスを取得
  const backendPath = url.pathname.replace(/^\/api/, "");
  const backendUrl = new URL(backendPath + url.search, backendBaseUrl);
  
  console.log(`[Proxy] ${request.method} ${url.pathname} -> ${backendUrl.toString()}`);
  
  const headers = new Headers(request.headers);
  // 場合によっては host ヘッダーの上書きが必要になるため
  headers.set('host', backendUrl.host);

  // Next.js Edge Runtime でのプロキシ転送
  return fetch(backendUrl.toString(), {
    method: request.method,
    headers,
    body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
    // @ts-ignore
    duplex: 'half',
    cache: 'no-store',
  });
}

// すべての主要なHTTPメソッドに対してプロキシを適用
export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;
