/**
 * @file: server.ts
 * @description: Fábrica asíncrona encargada de la inicialización de la red, validación del puerto físico y binding del servidor HTTP de Node.js utilizando configuración tipada.
 * @context: Capa de Infraestructura de Red (Network Layer / HTTP Infrastructure).
 * 
 * @behavior: 
 * - Migra la lectura directa de variables de entorno globales (`process.env`) hacia un objeto centralizado y estructurado (`appConfig`).
 * - Valida en tiempo de ejecución que el puerto extraído de la abstracción de configuración cumpla con los requisitos del protocolo TCP (entero positivo mayor a cero).
 * - Enuelve el método tradicional `app.listen()` basado en callbacks dentro de una Promesa nativa para acoplar el arranque de red al flujo asíncrono de la aplicación.
 * 
 * @benefits: 
 * - Desacopla el código de infraestructura de las variables globales del sistema (`process.env`), incrementando la mantenibilidad y facilitando la inyección de configuraciones ficticias (mocking) durante pruebas unitarias.
 * - Sigue el principio de robustez al validar estrictamente el puerto configurado antes de intentar ocupar un socket del sistema operativo.
 */

import {appConfig} from "@core/config/app-config.js";
import createApp from "@src/app.js";
import type { Server } from "node:http";
import type { Express } from "express";

const createServer = async (): Promise<Server> => {

    const app: Express = await createApp();

    const port: number = Number(appConfig.port);

    console.log("diobar");

    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        throw new Error(`Puerto TCP inválido o no configurado: ${appConfig.port}`);
    }

    return new Promise<Server>((resolve, reject) => {
        const server: Server = app.listen(port);
        server.once("listening", () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
            resolve(server);
        });
        server.once("error", (err: Error) => {
            reject(err);
        });
    });
    
};

export default createServer;
