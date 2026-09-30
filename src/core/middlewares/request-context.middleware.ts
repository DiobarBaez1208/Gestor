/**
 * @file request-context.middleware.ts
 *
 * Inicializa el RequestContext asociado
 * a cada petición HTTP.
 */

import type {
    Request,
    Response,
    NextFunction,
} from "express";

import crypto from "node:crypto";

import {
    runWithRequestContext,
} from "../http/request-context.storage";
import { RequestContext } from "@core/http/request-context";

export function requestContextMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
): void {

    /**
     * Utilizamos el request ID proporcionado
     * por el cliente si existe.
     *
     * Si no existe, generamos uno nuevo.
     */
    const requestId =
        req.header("x-request-id")
        ?? crypto.randomUUID();

    /**
     * El correlation ID permite relacionar
     * diferentes operaciones pertenecientes
     * al mismo flujo.
     *
     * Si no viene definido, utilizamos
     * el request ID como identificador inicial.
     */
    const correlationId =
        req.header("x-correlation-id")
        ?? requestId;

    /**
     * Obtenemos el locale solicitado por el cliente.
     *
     * Ejemplo:
     *
     * Accept-Language: es-MX
     */
    const locale =
        req.header("accept-language")
        ?.split(",")[0];

    /**
     * Creamos el contexto inicial.
     *
     * userId todavía no existe porque
     * la autenticación todavía no se ha ejecutado.
     */

    const context: RequestContext = {

        requestId,

        correlationId,

        locale,

        metadata: {},
    };

    runWithRequestContext(
        context,
        () => {
            /**
             * Todo lo que se ejecute después
             * permanecerá asociado a este contexto.
             */
            next();
        },
    );
}