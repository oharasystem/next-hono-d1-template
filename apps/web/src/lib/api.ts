import { hc } from "hono/client";
import type { AppType } from "@next-hono-d1-template/api";

const client = hc<AppType>(
  typeof window !== "undefined"
    ? "/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787"
);

export default client;
