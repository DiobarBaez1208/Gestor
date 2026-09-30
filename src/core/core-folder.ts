/**
 * @folder: /core
 * @description: Núcleo de infraestructura global, transversal y agnóstica al dominio de negocio de la aplicación.
 * @context: Capa Base del Sistema (Cross-Cutting Concerns / Core Infrastructure).
 * 
 * @behavior: 
 * - Centraliza y expone las capacidades compartidas, utilidades técnicas y configuraciones del sistema que requieren persistencia global.
 * - Actúa como una capa base sobre la cual se montan y consumen los diferentes módulos o dominios verticales del backend.
 * 
 * @benefits: 
 * - Evita la duplicación de lógica de infraestructura (como clientes de bases de datos, loggers globales o configuraciones base) a lo largo del proyecto.
 * - Asegura un acoplamiento limpio al prohibir estrictamente la presencia de reglas o flujos lógicos pertenecientes al negocio dentro de esta carpeta.
 */
