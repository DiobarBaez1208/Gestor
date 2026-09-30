import { InferEndpoint } from "@core/http/endpoint/infer-endpoint";
import { z } from "zod";

const loginBodySchema = z.object({ email: z.string().email(), password: z.string().min(1)}).strict();

const loginResponseSchema = z.object({ accessToken: z.string(), refreshToken: z.string()}).strict();

export const loginSchema = z.object({
    params: z.object({}).strict(),
    query: z.object({}).strict(),
    body: loginBodySchema,
    response: loginResponseSchema,
});

export type LoginEndpoint = InferEndpoint<typeof loginSchema>;