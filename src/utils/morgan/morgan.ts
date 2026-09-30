import type { IncomingMessage, ServerResponse } from "http";
import type { StreamOptions, Options } from "morgan";
import {winstonLogger} from "../winston/winston.js";
import type { RequestHandler } from "express";
import morgan from "morgan";

/**
 * STREAM PERSONALIZADO PARA MORGAN
 * --------------------------------
 * Morgan por defecto envía los logs a stdout (console.log),
 * pero en un ERP profesional necesitamos centralizar todo el logging
 * en Winston (o cualquier sistema corporativo).
 *
 * StreamOptions garantiza estrictamente que `write` reciba un string
 * y devuelva void. No usa `any`.
 */
const stream: StreamOptions = {
  write: (message: string): void => {
    // Se recorta para eliminar saltos finales que Morgan agrega automáticamente.
    winstonLogger.info(message.trim());
  },
};

/**
 * FORMATO DEL LOG HTTP
 * ---------------------
 * Morgan tiene varios formatos predefinidos: tiny, dev, common, short, combined.
 * "combined" es el más completo (método, URL, status, tamaño, user-agent, IP, tiempo).
 *
 * `as const` asegura que TypeScript lo trate como el literal "combined",
 * no como un string genérico.
 */
const environment = "combined" as const;

/**
 * OPCIONES DE MORGAN (TIPO ESTRICTO)
 * ----------------------------------
 * Morgan internamente trabaja con Node.js puro, NO con Express.Request.
 *
 * Por eso usamos:
 *    IncomingMessage  → request nativo Node
 *    ServerResponse   → response nativo Node
 *
 * Esto evita que TypeScript degrade tipos a `any`.
 *
 * Además evita errores complejos como:
 *   Request<Request<...>> incompatible con ParamsDictionary
 *
 * En pocas palabras:
 *   → Morgan usa Node internamente
 *   → Express extiende Node
 *   → Tipar con Node = la forma correcta y estricta
 */
const options: Options<IncomingMessage, ServerResponse> = {
  stream,
};

/**
 * MIDDLEWARE FINAL PARA EXPRESS
 * -----------------------------
 * Morgan devuelve un middleware compatible con Express,
 * por lo tanto lo tipamos como RequestHandler.
 *
 * MUY IMPORTANTE:
 * No se deben pasar generics a RequestHandler (como RequestHandler<Request,Response>)
 * porque Express no los admite y rompe la compatibilidad,
 * causando errores enormes de tipos y aparición de ANY.
 *
 * Esto:
 *    RequestHandler
 * es la forma correcta, estricta y totalmente segura.
 */
const morganUtil: RequestHandler = morgan(environment, options);

export {morganUtil};
