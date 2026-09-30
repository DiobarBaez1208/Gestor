/**
 * @file authentication.middleware.ts
 *
 * Middleware encargado de autenticar las peticiones HTTP.
 *
 * Responsabilidades:
 *
 * 1. Obtener el Access Token del header Authorization.
 * 2. Validar el esquema Bearer.
 * 3. Delegar la verificación del token al TokenService.
 * 4. Obtener el RequestContext actual.
 * 5. Incorporar la identidad autenticada al contexto.
 * 6. Permitir que la petición continúe.
 *
 * No conoce:
 *
 * - Controllers
 * - Handlers
 * - Repositories
 * - Base de datos
 * - Entidades de dominio
 *
 * Su responsabilidad termina en la frontera HTTP.
 */

import type {
    RequestHandler,
} from "express";

import {
    getRequestContext,
} from "../http/request-context.storage";

import type {
    TokenService,
} from "@modules/authentication/application/contracts/services/token-service";


/**
 * Crea el middleware de autenticación.
 *
 * El TokenService se recibe mediante Dependency Injection.
 *
 * La función devuelve directamente un RequestHandler
 * compatible con Express.
 */
export function createAuthenticationMiddleware(
    tokenService: TokenService,
): RequestHandler {

    return (
        req,
        res,
        next,
    ): void => {

        /*
         * 1. Obtener el header Authorization.
         *
         * Formato esperado:
         *
         * Authorization: Bearer <access-token>
         */
        const authorization =
            req.header("authorization");

        if (!authorization) {
            res.status(401).json({
                message: "Authentication required.",
            });

            return;
        }


        /*
         * 2. Separar el esquema del token.
         */
        const [scheme, token] =
            authorization.split(" ");


        /*
         * 3. Validar el esquema Bearer.
         */
        if (
            scheme !== "Bearer"
            || !token
        ) {
            res.status(401).json({
                message: "Invalid authentication scheme.",
            });

            return;
        }


        try {

            /*
             * 4. Delegar la validación criptográfica
             *    al TokenService.
             *
             * El middleware no sabe cómo funciona JWT.
             */
            const payload =
                tokenService.verifyAccessToken(
                    token,
                );


            /*
             * 5. Obtener el contexto de la petición.
             */
            const context =
                getRequestContext();


            /*
             * El RequestContext debe existir porque
             * requestContextMiddleware debe ejecutarse
             * antes que este middleware.
             */
            if (!context) {
                throw new Error(
                    "RequestContext is not initialized.",
                );
            }


            /*
             * 6. Incorporar la identidad autenticada
             *    al contexto de la petición.
             *
             * A partir de aquí, cualquier componente
             * técnico que tenga acceso al contexto puede
             * conocer quién realizó la petición.
             */
            context.userId =
                String(payload.userId);


            /*
             * 7. Continuar con el siguiente middleware
             *    o con el controller.
             */
            next();

        } catch {

            /*
             * El token no pudo validarse.
             */
            res.status(401).json({
                message: "Invalid or expired access token.",
            });

            return;
        }
    };
}