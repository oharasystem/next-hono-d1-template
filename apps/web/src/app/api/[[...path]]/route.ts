import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request);
}

async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  
  // /api プレフィックスを削除してバックエンドのパスを取得
  const backendPath = url.pathname.replace(/^\/api/, "");
  const backendUrl = new URL(backendPath + url.search, backendBaseUrl);
  
  // 元のリクエストを転送（ヘッダーなども維持）
  // 注意: request.body は ReadableStream なのでそのまま渡せる
  return fetch(backendUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    // @ts-ignore - duplex is required for streaming bodies in some environments
    duplex: 'half',
  });
}
