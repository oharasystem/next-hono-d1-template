import { z } from "zod";

export const helloSchema = z.object({
  name: z.string().optional(),
});

export type HelloRequest = z.infer<typeof helloSchema>;
