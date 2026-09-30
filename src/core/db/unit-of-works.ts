/**
 * @file: unit-of-work.ts
 * @description: Contrato de abstracción que define la firma y el comportamiento de los límites transaccionales atómicos para operaciones concurrentes complejas.
 * @context: Frontera de Abstracción de Persistencia / Núcleo del Sistema (Core Database Domain Abstraction).
 * 
 * @behavior: 
 * - Delimita estrictamente el inicio, confirmación o reversión de una transacción dentro de la capa de aplicación/dominio, manteniendo el código completamente agnóstico de la persistencia física, de la base de datos subyacente (MySQL, PostgreSQL) y del ORM de turno (Sequelize, Prisma).
 * - Concede autonomía absoluta a la capa de infraestructura para inyectar y gestionar de forma encubierta un almacén de contexto asíncrono (`AsyncLocalStorage`), unificando múltiples llamadas del hilo del Event Loop de Node.js bajo un mismo identificador transaccional.
 * - Desliga de forma definitiva la firma de todos los métodos del dominio y los casos de uso de cualquier parámetro técnico de transporte, erradicando el "Parameter Drilling" y la necesidad de arrastrar el objeto de conexión (`tx`) a lo largo del software.
 * 
 * @benefits: 
 * - Aislamiento de la "Magia" Tecnológica: Al encapsular el mecanismo de `AsyncLocalStorage` estrictamente en la carpeta `infrastructure/database/sequelize/`, se blinda el núcleo de la aplicación. Si el día de mañana Node.js altera su API interna para contextos asíncronos o se decide migrar a una solución sin hilos contextuales, la capa `core` y la lógica de negocio no sufrirán ningún impacto ni requerirán refactorización.
 * - Repositorios Autónomos pero Coordinados: Permite que los repositorios en la capa de infraestructura consulten silenciosamente el almacén de ALS en tiempo de ejecución. Si se detecta una transacción activa para esa petición, Sequelize la inyectará en la consulta de manera automática garantizando atomicidad; en caso contrario (ej. consultas de lectura simple), ejecutarán el query de forma estándar en el pool común, todo esto sin alterar una sola línea del caso de uso.
 * - Cumplimiento del Principio Abierto/Cerrado (OCP): Eleva la escalabilidad y mantenibilidad al permitir el reemplazo integral del stack de datos en la infraestructura sin propagar efectos secundarios, errores de compilación o cambios lógicos en las reglas de negocio superiores del sistema.
 */


export interface UnitOfWork {
    execute<T>(
        work: () => Promise<T>,
    ): Promise<T>
}
