import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

/**
 * Cloudflare Pages (Next.js) から Cloudflare Workers (Hono) へのプロキシ
 * 本番環境およびプレビュー環境で CORS を回避し、同一ドメインとして扱うためのルートです。
 */
async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  
  // バックエンドURLの選定
  // 1. 環境変数 NEXT_PUBLIC_API_URL (デプロイ時に設定)
  // 2. ローカル開発時のデフォルト (http://localhost:8787)
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  
  // /api プレフィックスを除去してバックエンドのパスを構築
  const backendPath = url.pathname.replace(/^\/api/, "");
  const backendUrl = new URL(backendPath + url.search, backendBaseUrl);
  
  console.log(`[Proxy] ${request.method} ${url.pathname} -> ${backendUrl.toString()}`);
  
  const headers = new Headers(request.headers);
  // Hostヘッダーをバックエンドのものに上書き（Cloudflare Workers へのルーティングに必要）
  headers.set('host', backendUrl.host);

  try {
    const response = await fetch(backendUrl.toString(), {
      method: request.method,
      headers,
      body: (request.method !== 'GET' && request.method !== 'HEAD') ? request.body : undefined,
      // @ts-ignore: Next.js/Edge Runtime でのストリーミング転送に必要
      duplex: 'half',
      cache: 'no-store',
    });

    // レスポンスヘッダーのコピー
    const responseHeaders = new Headers(response.headers);
    // CORS関連のヘッダーはプロキシ側で制御するため、バックエンドからのものは削除または調整
    responseHeaders.delete('content-encoding'); // ブラウザ/Next.jsが再圧縮する場合があるため

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Proxy Error] ${url.pathname}:`, error);
    return NextResponse.json(
      { error: "Proxy connection failed", details: error instanceof Error ? error.message : String(error) },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
export const OPTIONS = proxyRequest;
export const HEAD = proxyRequest;
