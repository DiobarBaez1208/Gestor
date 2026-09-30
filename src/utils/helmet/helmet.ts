import type { RequestHandler } from "express";
import type { HelmetOptions } from "helmet";
import helmet from "helmet";

/**
 * Configuración estrictamente tipada del CSP
 */
const CONFIG_CONTENT_SECURITY_POLICY: HelmetOptions["contentSecurityPolicy"] = {
    directives: {
        scriptSrc: ["'self'", "'unsafe-eval'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'self'"],
        childSrc: ["'self'"],
        mediaSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:3000"],
        defaultSrc: ["'self'"],
    },
};

/**
 * Helmet devuelve funciones que son middlewares de Express
 * ⇒ El tipo correcto es RequestHandler[]
 */
const helmetUtil: RequestHandler[] = [
    helmet.contentSecurityPolicy(CONFIG_CONTENT_SECURITY_POLICY),
    helmet.frameguard({ action: "deny" }),
    helmet.referrerPolicy({ policy: "no-referrer" }),
    helmet.noSniff(),
    helmet.hidePoweredBy(),
];

export { helmetUtil };
