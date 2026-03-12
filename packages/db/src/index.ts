import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1Client: D1Database) {
  return drizzle(d1Client, { schema });
}

export * from "./schema";
