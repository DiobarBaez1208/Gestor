import type { Response } from "express";
import type { EndpointSchema } from "./endpoint.interface";

export type ApiResponse<S extends EndpointSchema = EndpointSchema> = Response<S["response"]>;