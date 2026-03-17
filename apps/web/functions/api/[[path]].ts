export const onRequest: PagesFunction<{ NEXT_PUBLIC_API_URL: string }> = async (context) => {
  const url = new URL(context.request.url);
  const backendBaseUrl = context.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
  
  // /api プレフィックスを削除してバックエンドのパスを取得
  const backendPath = url.pathname.replace(/^\/api/, "");
  const backendUrl = new URL(backendPath + url.search, backendBaseUrl);
  
  // 元のリクエストを転送（ヘッダーなども維持）
  return fetch(backendUrl.toString(), context.request);
};
