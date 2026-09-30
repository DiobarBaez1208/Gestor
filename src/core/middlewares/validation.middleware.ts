/**
 * @file validation.middleware.ts
 *
 * Middleware genérico encargado de validar
 * los datos HTTP de un endpoint mediante Zod.
 */

import type { EndpointZodSchema } from "@core/http/endpoint/endpoint-zod-schema";
import type { ApiResponse } from "@core/http/endpoint/api-response";
import { InferEndpoint } from "@core/http/endpoint/infer-endpoint";
import type { ApiRequest } from "@core/http/endpoint/api-request";
import { HttpStatus } from "@core/http/http-status";
import type { NextFunction } from "express";

export function validationMiddleware<TSchema extends EndpointZodSchema>(schema: TSchema) {

    return (
        req: ApiRequest<InferEndpoint<TSchema>>,
        res: ApiResponse<InferEndpoint<TSchema>>,
        next: NextFunction,
    ): void => {

        const result = schema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });

        if (!result.success) {
            res.status(HttpStatus.BAD_REQUEST).json({
                message: "Validation failed.",
                errors: result.error.flatten(),
            });
            return;
        }

        /**
         * Los datos ya fueron validados por Zod.
         *
         * Aquí podríamos reemplazar los datos
         * originales por los datos normalizados
         * producidos por Zod.
         */
        req.params = result.data.params;

        req.query = result.data.query;

        req.body = result.data.body;

        next();
    };
}