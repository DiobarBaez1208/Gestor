/**
 * @file: environment.ts
 * @description: Inicialización y validación estricta del entorno de ejecución de la aplicación.
 * @context: Capa base de configuración (Bootstrap / Core Config).
 * 
 * @behavior: 
 * - Declara el tipo literal `EnvironmentName` restringido únicamente a tres estados válidos: desarrollo, pruebas o producción.
 * - Lee la variable nativa de Node `process.env.NODE_ENV` y mitiga valores nulos o indefinidos asignando un fallback seguro.
 * - Evalúa expresiones booleanas en tiempo de carga del módulo para determinar si el proceso actual es local, de testing o productivo.
 * 
 * @benefits: 
 * - Actúa como una "fuente única de verdad" para el comportamiento condicional de la app (ej. activar logs detallados solo en development).
 * - Elimina la redundancia y el costo computacional de evaluar cadenas de texto (`=== 'production'`) en múltiples peticiones HTTP o middleware.
 */


export type EnvironmentName =
  | 'development'
  | 'test'
  | 'production'

const environmentName = process.env.NODE_ENV ?? 'development'

export const environment = {
  environmentName,
  isDevelopment: environmentName === 'development',
  isTest: environmentName === 'test',
  isProduction: environmentName === 'production',
}