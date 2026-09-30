/**
 * @file: app.ts / (Composición de la Aplicación)
 * @description: Fábrica asíncrona (`Factory Pattern`) encargada de la instanciación, configuración y composición de la aplicación Express.
 * @context: Capa de Composición y Configuración HTTP (Application Bootstrap / Middleware Pipeline).
 * 
 * @behavior: 
 * - Inicializa la instancia central de Express de manera aislada al entorno de red.
 * - Inyecta de forma secuencial la canalización de middlewares globales: seguridad de cabeceras (`helmet`), políticas de origen (`cors`), auditoría de peticiones (`morgan`) y parseo de estado (`cookie-parser`).
 * - Configura las políticas de transferencia de carga útil (payloads JSON y URL-encoded hasta 10MB) y aplica algoritmos de deflación (`compression`) para optimizar el ancho de banda en respuestas mayores a 1KB.
 * 
 * @benefits: 
 * - Permite realizar pruebas de integración y de extremo a extremo (E2E) con herramientas como `supertest` de forma determinista y ultrarrápida, sin colisionar con puertos TCP del sistema operativo.
 * - Consigue un desacoplamiento arquitectónico absoluto entre la definición de la lógica de transporte/negocio y el protocolo de red físico (HTTP/HTTPS/HTTP2).
 */


import { createAuthenticationRoutes } from "./modules/authentication/presentation/http/authentication.routes";
import { requestContextMiddleware } from "@core/middlewares/request-context.middleware";
import { corsMiddleware } from "./shared/http/middlewares/cors/cors.middleware"
import { helmetUtil } from "@utils/helmet/helmet";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import compression from "compression";
import { httpLogger } from "@core/logging/http-logger";

const createApp = async (): Promise<Express> => {

    const app: Express = express();

    /*
     * 1. Seguridad HTTP global.
     */
    app.use(corsMiddleware);
    app.use(helmetUtil);
    app.use(cookieParser());

    /*
     * 2. Crear el contexto de la petición.
     *
     * DEBE ocurrir antes del HTTP logger,
     * porque httpLogger necesita acceder
     * al RequestContext.
     */
    app.use(requestContextMiddleware);


    /*
    * 3. HTTP logging.
    *
    * Morgan utiliza el RequestContext existente
    * y envía el resultado a Winston.
    */
    app.use(httpLogger);

    // 4. Parseo del body
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // 5. Compresión de respuestas
    app.use(compression({ threshold: 1024 }));

    // 6. Rutas públicas y autenticación
    app.use("/authentication", createAuthenticationRoutes);

    // 7. Manejo global de errores
    // app.use(errorMiddleware);

    return app;
};

export default createApp;
