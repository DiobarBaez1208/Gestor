import { InferEndpoint } from "@core/http/endpoint/infer-endpoint";
import { z } from "zod";

const logoutBodySchema = z.object({ sessionId: z.string().min(1) }).strict();

export const logoutSchema = z.object({
    params: z.object({}).strict(),
    query: z.object({}).strict(),
    body: logoutBodySchema,
    response: z.null(),
});

export type LogoutEndpoint = InferEndpoint<typeof logoutSchema>;