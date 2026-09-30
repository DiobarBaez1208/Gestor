import type { EndpointSchema } from "./endpoint.interface";
import type { Request } from "express";

export type ApiRequest< S extends EndpointSchema = EndpointSchema > = Request<
    S["params"],
    S["response"],
    S["body"],
    S["query"]
>;