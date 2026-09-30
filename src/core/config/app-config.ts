/**
 * @file: app-config.ts
 * @description: Abstracción estática y tipada de los parámetros globales de identidad y red del proceso de la aplicación.
 * @context: Capa del Núcleo de Configuración / Dominio del Proceso (Application Context Config).
 * 
 * @behavior: 
 * - Mapea y tipa las variables de entorno asociadas al comportamiento operativo central de la aplicación (nombre del servicio y puerto HTTP).
 * - Castea de forma segura el puerto a tipo primitivo `number` y define un estado de contingencia por defecto (puerto 3000) si la variable del sistema no está presente.
 * 
 * @benefits: 
 * - Oculta la dependencia directa de `process.env` para la configuración del servidor, facilitando la inicialización segura en `server.ts`.
 * - Permite identificar la identidad y el puerto de escucha del proceso de manera centralizada sin mezclar variables de infraestructura externa.
 */

export const appConfig = {
    name: process.env.APP_NAME ?? 'Backend',
    port: Number(process.env.APP_PORT ?? 3000),
    jwt_secret: process.env.APP_JWT_SECRET ?? ""
}