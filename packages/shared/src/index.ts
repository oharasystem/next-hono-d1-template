import { z } from "zod";

/**
 * Greet API の入力バリデーションスキーマ
 */
export const helloSchema = z.object({
  name: z.string().optional(),
});

export type HelloRequest = z.infer<typeof helloSchema>;

/**
 * API レスポンスの共通インターフェース
 */
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

/**
 * Greet API のレスポンス型
 */
export interface GreetResponse {
  message: string;
}

/**
 * ユーザーデータの共通モデル
 */
export interface User {
  id: number;
  name: string;
  createdAt: Date | string;
}
