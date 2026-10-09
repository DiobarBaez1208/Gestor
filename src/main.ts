/**
 * @file: main.ts / index.ts (Punto de entrada de la aplicación)
 * @description: Orquestador del arranque del proceso, encargado del bootstraping inicial antes de montar la lógica de negocio.
 * @context: Capa superior de ciclo de vida del proceso (Process Lifecycle / Entry Point).
 * 
 * @behavior: 
 * - Asegura la carga y validación estricta de las variables de entorno mediante `dotenv-safe` antes de evaluar cualquier otra importación.
 * - Encapsula la inicialización del servidor HTTP en un bloque `try/catch` global para capturar fallos fatales en tiempo de arranque (Bootstrap Phase).
 * - Delega la creación del servidor y sus configuraciones internas al módulo `./src/server`.
 * 
 * @benefits: 
 * - Desacopla por completo la infraestructura del proceso de la lógica de Express/HTTP, permitiendo que la aplicación (`app.ts`) sea testeable de forma aislada sin levantar puertos reales.
 * - Previene que la aplicación intente arrancar con una configuración corrupta o incompleta gracias a la validación estricta del archivo `.env.example`.
 */

import createServer from "./server";
import dotenvSafe from 'dotenv-safe'

dotenvSafe.config()

try { 
    console.log("diobar");
    createServer() 
} catch (error: unknown) {
    if (error instanceof Error) console.error(`An unexpected error occurred: ${error}`);
}
