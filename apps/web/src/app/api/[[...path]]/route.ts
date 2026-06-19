import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

/**
 * Cloudflare Pages (Next.js) から Cloudflare Workers (Hono) へのプロキシ
 *
 * 優先順位:
 * 1. Service Binding (本番/wrangler dev): HTTP通信なしで直接 API Worker を呼び出す
 * 2. HTTP fetch (ローカル next dev): API_BASE_URL または http://localhost:8787 へフォールバック
 */
async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);

  // /api プレフィックスを除去してバックエンドのパスを構築
  const backendPath = url.pathname.replace(/^\/api/, "") || "/";

  // Next.js のキャッチオールパラメータ ([[...path]]) がクエリに含まれるため除去
  const searchParams = new URLSearchParams(url.search);
  searchParams.delete("path");
  const search = searchParams.toString();
  const queryString = search ? `?${search}` : "";

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? request.body
      : undefined;

  // --- Service Binding 経由（本番・wrangler dev 環境）---
  try {
    const { env } = await getCloudflareContext({ async: true });

    if (env.API) {
      // Service Binding の fetch は URL のホスト部分を無視し、パスのみでルーティングする
      const serviceUrl = `http://worker${backendPath}${queryString}`;
      console.log(
        `[Proxy/Binding] ${request.method} ${url.pathname} -> ${serviceUrl}`
      );

      const headers = new Headers(request.headers);
      const bindingRequest = new Request(serviceUrl, {
        method: request.method,
        headers,
        body,
        // @ts-ignore: ストリーミング転送に必要
        duplex: "half",
      });

      const response = await env.API.fetch(bindingRequest);
      const responseHeaders = new Headers(response.headers);
      responseHeaders.delete("content-encoding");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    }
  } catch {
    // Cloudflare コンテキスト外（ローカル next dev）の場合は HTTP fetch へフォールバック
  }

  // --- HTTP fetch 経由（ローカル開発環境フォールバック）---
  const backendBaseUrl = process.env.API_BASE_URL || "http://localhost:8787";
  const backendUrl = new URL(backendPath + queryString, backendBaseUrl);
  console.log(
    `[Proxy/HTTP] ${request.method} ${url.pathname} -> ${backendUrl.toString()}`
  );

  const headers = new Headers(request.headers);
  headers.set("host", backendUrl.host);

  try {
    const response = await fetch(backendUrl.toString(), {
      method: request.method,
      headers,
      body,
      // @ts-ignore: Next.js/Edge Runtime でのストリーミング転送に必要
      duplex: "half",
      cache: "no-store",
      redirect: "manual",
    });

    if (response.status === 0 || response.type === "opaqueredirect") {
      return response;
    }

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error(`[Proxy Error] ${url.pathname}:`, error);
    return NextResponse.json(
      {
        error: "Proxy connection failed",
        details: error instanceof Error ? error.message : String(error),
      },
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
