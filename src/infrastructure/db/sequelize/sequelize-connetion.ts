/**
 * @file: sequelize-connection.ts
 *
 * @description:
 * Instancia única y centralizada de Sequelize encargada de configurar
 * el cliente ORM utilizado por la infraestructura de persistencia.
 *
 * @context:
 * Infraestructura de Persistencia / Database Infrastructure.
 *
 * @behavior:
 * - Consume exclusivamente la configuración proporcionada por `databaseConfig`.
 * - Crea una única instancia de Sequelize para toda la aplicación.
 * - Configura el dialecto MySQL.
 * - Configura el pool de conexiones.
 * - Define el comportamiento global de los modelos.
 * - Configura opciones específicas del driver MySQL.
 * - Mantiene la instancia disponible para Models, Repositories y Unit of Work.
 *
 * @architecture:
 * Este archivo pertenece a Infrastructure porque Sequelize es una
 * tecnología concreta de persistencia.
 *
 * Domain y Application NO deben importar esta instancia.
 */

import { Sequelize } from "sequelize";

import {
    databaseConfig,
} from "@core/config/db-config.js";


/**
 * Instancia única de Sequelize.
 *
 * Esta instancia representa el cliente ORM compartido por toda
 * la infraestructura de persistencia.
 *
 * No se debe crear un `new Sequelize()` dentro de cada Model
 * o Repository.
 */
export const sequelize = new Sequelize(
    databaseConfig.name,
    databaseConfig.user,
    databaseConfig.password,
    {

        /**
         * Host donde se encuentra ejecutándose el servidor MySQL.
         *
         * Ejemplo:
         *
         * DB_HOST=localhost
         */
        host: databaseConfig.host,


        /**
         * Puerto TCP utilizado por MySQL.
         *
         * Por defecto:
         *
         * 3306
         */
        port: databaseConfig.port,


        /**
         * Dialecto utilizado por Sequelize.
         *
         * En este caso:
         *
         * Sequelize → MySQL
         *
         * Si posteriormente se cambia de motor, esta parte pertenece
         * exclusivamente a Infrastructure.
         */
        dialect: "mysql",


        /**
         * Logging de las consultas SQL.
         *
         * `false` evita que Sequelize escriba directamente en
         * `console.log`.
         *
         * Esto permite que posteriormente el logging de Sequelize
         * pueda integrarse con nuestro sistema centralizado de Winston.
         */
        logging: false,


        /**
         * Configuración del pool de conexiones.
         *
         * Sequelize no necesita abrir una conexión TCP nueva para
         * cada consulta.
         *
         * Mantiene un conjunto reutilizable de conexiones hacia MySQL.
         */
        pool: {

            /**
             * Número máximo de conexiones simultáneas que Sequelize
             * puede mantener abiertas.
             *
             * Este valor debe dimensionarse de acuerdo con:
             *
             * - capacidad de MySQL
             * - tráfico de la aplicación
             * - número de instancias del backend
             * - límite de conexiones permitido por el servidor
             */
            max: 10,


            /**
             * Número mínimo de conexiones que el pool intenta mantener.
             *
             * `0` permite que el pool libere todas las conexiones cuando
             * no existe actividad.
             */
            min: 0,


            /**
             * Tiempo máximo, en milisegundos, que Sequelize esperará
             * para obtener una conexión disponible del pool.
             *
             * 30000 ms = 30 segundos.
             */
            acquire: 30_000,


            /**
             * Tiempo máximo, en milisegundos, que una conexión inactiva
             * puede permanecer dentro del pool antes de ser liberada.
             *
             * 10000 ms = 10 segundos.
             */
            idle: 10_000,
        },


        /**
         * Opciones globales aplicadas a los modelos Sequelize.
         */
        define: {

            /**
             * Agrega automáticamente:
             *
             * created_at
             * updated_at
             *
             * a los modelos.
             */
            timestamps: true,


            /**
             * Hace que Sequelize utilice nombres snake_case
             * para los nombres generados automáticamente.
             *
             * Ejemplo:
             *
             * createdAt → created_at
             * updatedAt → updated_at
             */
            underscored: true,
        },


        /**
         * Opciones específicas del dialecto MySQL.
         *
         * Estas opciones son enviadas al driver utilizado por
         * Sequelize para comunicarse con MySQL.
         */
        dialectOptions: {

            /**
             * Utiliza UTF-8 completo para soportar correctamente
             * caracteres Unicode.
             *
             * `utf8mb4` permite almacenar, entre otras cosas,
             * caracteres fuera del BMP como emojis.
             */
            charset: "utf8mb4",
        },


        /**
         * Permite activar el modo benchmark de Sequelize.
         *
         * Cuando se habilita, Sequelize proporciona el tiempo que
         * tardó cada consulta.
         *
         * Se mantiene deshabilitado para evitar overhead innecesario
         * en el funcionamiento normal.
         */
        benchmark: false,
    },
);