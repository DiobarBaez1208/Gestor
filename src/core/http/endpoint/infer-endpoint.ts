import type { z } from "zod";

import type { EndpointSchema } from "./endpoint.interface";
import type { EndpointZodSchema } from "./endpoint-zod-schema";

export type InferEndpoint<
    TSchema extends EndpointZodSchema,
> = EndpointSchema<
    z.infer<TSchema>["params"],
    z.infer<TSchema>["body"],
    z.infer<TSchema>["query"],
    z.infer<TSchema>["response"]
>;