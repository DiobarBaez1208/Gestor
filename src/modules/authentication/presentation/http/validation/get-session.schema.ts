import { InferEndpoint } from "@core/http/endpoint/infer-endpoint";
import { z } from "zod";

const getSessionParamsSchema = z.object({ sessionId: z.string().min(1)}).strict();

const sessionResponseSchema = z.object({
    id: z.string(),
    userId: z.number().int(),
    createdAt: z.string(),
    expiresAt: z.string(),
    revokedAt: z.string().nullable(),
    active: z.boolean(),
}).strict();

export const getSessionSchema = z.object({
    params: getSessionParamsSchema,
    query: z.object({}).strict(),
    body: z.object({}).strict(),
    response: sessionResponseSchema,
});

export type GetSessionEndpoint = InferEndpoint<typeof getSessionSchema>;