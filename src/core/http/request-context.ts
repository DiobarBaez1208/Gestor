/**
 * @file: request-context.ts
 * @description: Contrato de abstracción (Interface) que define la estructura y propiedades del metadato operativo asociado a una única petición HTTP.
 * @context: Capa del Núcleo de Utilidades / Gestión Transversal de Estado (Core Utilities / Cross-Cutting Context Domain).
 * 
 * @behavior: 
 * - Modela las propiedades de identidad y rastreabilidad de un flujo de ejecución, incluyendo identificadores únicos obligatorios (`requestId`) y opcionales (`userId`, `correlationId`, `locale`).
 * - Provee un diccionario genérico extensible (`metadata`) basado en pares clave-valor (`Record<string, unknown>`) para inyectar datos contextuales dinámicos sin alterar la firma estructural base.
 * - Sirve como el contrato de datos unificado que será consumido y propagado de forma invisible por los mecanismos de almacenamiento contextual del hilo de Node.js (como `AsyncLocalStorage`).
 * 
 * @benefits: 
 * - Erradica el fenómeno de "Parameter Drilling" en la capa de servicios y casos de uso, evitando que las firmas de negocio requieran mutar constantemente para transportar datos técnicos de auditoría.
 * - Centraliza y estandariza los datos críticos requeridos por subsistemas transversales del ecosistema backend, facilitando tareas complejas de telemetría distribuida (`tracing`), auditoría de accesos, correlación de hilos de logs concurrentes (`logging`) y depuración selectiva (`debugging`).
 * - Reduce drásticamente el ruido transaccional entre las capas lógicas de la aplicación, permitiendo que un servicio se enfoque estrictamente en resolver su entrada de datos de negocio (`input`) mientras la infraestructura de transporte resuelve el contexto.
 */


export interface RequestContext {
    requestId: string
    userId?: string
    correlationId?: string
    locale?: string
    metadata?: Record<string, unknown>
}