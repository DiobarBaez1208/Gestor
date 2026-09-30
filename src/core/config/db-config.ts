/**
 * @file: db-config.ts
 * @description: Objeto de configuración centralizado que modela las credenciales y parámetros de conectividad hacia el motor de persistencia.
 * @context: Capa del Núcleo de Configuración / Infraestructura de Persistencia (Database Infrastructure Config).
 * 
 * @behavior: 
 * - Reúne el host, puerto de red, identificador de base de datos y llaves de acceso del almacenamiento relacional/no relacional desde las variables de entorno.
 * - Resuelve el puerto de la base de datos bajo un estándar numérico estricto con un fallback común orientado a bases de datos relacionales (puerto 3306).
 * 
 * @benefits: 
 * - Actúa como el único proveedor de datos de configuración (Data Source Config) para el cliente o pool de conexiones (ej. Prisma, TypeORM, Mongoose).
 * - Aísla los secretos y strings de conexión del resto del sistema, simplificando auditorías de seguridad sobre cómo se manejan las credenciales de la base de datos.
 */

export const databaseConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? '',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASS ?? '',
}