/**
 * @file request-context.storage.ts
 *
 * Proporciona acceso al RequestContext asociado
 * al flujo asíncrono actual.
 */

import { AsyncLocalStorage } from "node:async_hooks";

import type { RequestContext } from "./request-context";

/**
 * Almacenamiento contextual de Node.js.
 *
 * Cada flujo asíncrono mantiene su propio contexto.
 */
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Ejecuta una función dentro de un RequestContext.
 *
 * Todo código ejecutado dentro del callback
 * podrá recuperar este mismo contexto.
 */
export function runWithRequestContext<T>( context: RequestContext, callback: () => T ): T {
    return requestContextStorage.run( context, callback );
}

/**
 * Obtiene el RequestContext correspondiente
 * a la ejecución asíncrona actual.
 *
 * Devuelve undefined si el código se ejecuta
 * fuera del contexto de una petición HTTP.
 */
export function getRequestContext(): RequestContext | undefined {
    return requestContextStorage.getStore();
}