import type { z } from "zod";

export type EndpointZodSchema = z.ZodObject<{
    params: z.ZodObject<z.ZodRawShape>;
    query: z.ZodObject<z.ZodRawShape>;
    body: z.ZodObject<z.ZodRawShape>;
    response: z.ZodTypeAny;
}>;