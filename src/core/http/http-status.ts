/**
 * @file: http-status.ts
 * @description: Diccionario estático, inmutable y centralizado de códigos de estado del protocolo de transferencia hipertexto HTTP (conforme al estándar RFC 9110).
 * @context: Capa del Núcleo de Utilidades / Capacidad Transversal de Transporte (Core Utilities / HTTP Transport Layer).
 * 
 * @behavior: 
 * - Mapea identificadores semánticos altamente legibles en mayúsculas (tales como `BAD_REQUEST`, `NOT_FOUND` o `INTERNAL_SERVER_ERROR`) a sus respectivos equivalentes numéricos enteros definidos por el estándar web.
 * - Emplea la aserción de tipo literal `as const` nativa de TypeScript en tiempo de compilación, lo que congela la estructura del diccionario completo, transformando cada propiedad en un valor estrictamente de solo lectura (`readonly`) y bloqueando cualquier intento de mutación o reasignación en tiempo de ejecución.
 * 
 * @benefits: 
 * - Erradica por completo la propagación de "Números Mágicos" (Magic Numbers) dentro de los controladores, middlewares de enrutamiento y manejadores de excepciones, logrando que la semántica detrás de cada respuesta de red sea evidente de manera inmediata para cualquier desarrollador.
 * - Asegura una consistencia absoluta en el contrato de salida de la API a lo largo de todos los módulos del sistema; si bien no representa una restricción estructural crítica cuya ausencia detenga el proceso físico, opera como una herramienta fundamental de cohesión técnica que optimiza los procesos de revisión de código, refactorización masiva y legibilidad del protocolo de comunicación global.
 */

export const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,

    INTERNAL_SERVER_ERROR: 500,
} as const

