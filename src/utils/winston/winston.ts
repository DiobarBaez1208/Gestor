import type { Logger, LoggerOptions, Logform } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import winston from "winston";
import path from "path";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  __dirname EN COMMONJS
 * ──────────────────────────────────────────────────────────────────────────────
 * En CommonJS (el entorno de Node.js por defecto), __dirname se expone
 * automáticamente como una variable global.
 *
 * ¿Por qué usar __dirname aquí?
 *   - Siempre apunta al directorio ACTUAL donde está este archivo.
 *   - Es estable y no depende del directorio desde donde se ejecute Node.
 *   - Permite construir rutas absolutas para los archivos del logger.
 *
 * ¿Qué problema resuelve?
 *   - Evita que los logs se escriban en ubicaciones inesperadas cuando:
 *       · Ejecutas tu app con PM2
 *       · Haces build a /dist
 *       · Corres node desde una carpeta distinta
 *
 * Tener rutas absolutas asegura que los logs SIEMPRE terminen en la carpeta correcta.
 */
const dirname: string = __dirname;

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  TIPO DE NIVELES DE LOG
 * ──────────────────────────────────────────────────────────────────────────────
 * Definimos estrictamente qué niveles acepta nuestro logger.
 *
 * ¿Por qué?
 *   - Evita escribir niveles inválidos (typos como "inf0" o "erro").
 *   - Mejora autocompletado.
 *   - Documenta explícitamente qué niveles usa tu ERP.
 *
 * Winston soporta estos niveles por defecto.
 */
type LogLevel = "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  CONFIGURACIÓN DE ROTACIÓN DE LOGS GENERALES
 * ──────────────────────────────────────────────────────────────────────────────
 * DailyRotateFile es un transporte especial para Winston que:
 *   - Crea un archivo de log POR DÍA (o por tamaño).
 *   - Genera historial automático (app-2025-01-01.log, app-2025-01-02.log…)
 *   - Elimina logs antiguos según maxFiles.
 *
 * ¿Por qué usarlo en un ERP?
 *   - Evita que un archivo único crezca a tamaños absurdos.
 *   - Mejora rendimiento del disco.
 *   - Facilita auditoría y análisis histórico.
 */
const fileRotationOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",            // Rota si supera 20 MB
    maxFiles: "14d",           // Mantiene solo 14 días
    filename: path.join(dirname, "../../../dist/logs/generals/app-%DATE%.log") // Archivo por día
};

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  CONFIG DE ROTACIÓN PARA EXCEPCIONES NO MANEJADAS
 * ──────────────────────────────────────────────────────────────────────────────
 * Winston puede capturar:
 *   - Excepciones no controladas (throw sin catch)
 *   - Promesas rechazadas
 *
 * Queremos registrar estas fallas en un archivo SEPARADO para:
 *   - Auditorías de fallos graves.
 *   - Seguridad y análisis forense.
 *   - Mayor claridad al investigar errores críticos del backend.
 */
const exceptionRotationOptions: DailyRotateFile.DailyRotateFileTransportOptions = {
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    filename: path.join(dirname, "../../../dist/logs/exceptions/exceptions-%DATE%.log")
};

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  INSTANCIA DEL TRANSPORTE ROTATIVO
 * ──────────────────────────────────────────────────────────────────────────────
 * Se define fuera del logger para:
 *   - mantener tipado explícito
 *   - poder reutilizarlo si fuera necesario
 */
const rotatingFileTransport: DailyRotateFile = new DailyRotateFile(fileRotationOptions);

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  FORMATO DE LOGS
 * ──────────────────────────────────────────────────────────────────────────────
 * Winston usa "format" para transformar el contenido antes de escribirlo.
 *
 * Combinamos varios formatos:
 *
 *   1) colorize()
 *       - Agrega colores a la consola para mejorar legibilidad.
 *
 *   2) timestamp()
 *       - Añade fecha y hora en cada línea del log.
 *       - Es esencial en sistemas ERP donde depuración y auditoría
 *         requieren exactitud temporal.
 *
 *   3) printf()
 *       - Permite controlar EXACTAMENTE cómo se ve cada línea del log.
 *
 * Con este formato obtenemos líneas como:
 *   2025-01-10 14:22:33 [INFO]: Usuario 42 creó un producto
 */
const loggerFormat: Logform.Format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
        (info): string =>
            `${info.timestamp as string} [${String(info.level).toUpperCase()}]: ${info.message as string
            }`
    )
);

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  OPCIONES DEL LOGGER PRINCIPAL
 * ──────────────────────────────────────────────────────────────────────────────
 * LoggerOptions asegura que no se agreguen propiedades inválidas.
 *
 * Transports:
 *   - Console(): logs en consola (útil en dev)
 *   - rotatingFileTransport: logs persistentes diarios
 *
 * exceptionHandlers:
 *   - Captura excepciones fatales y las escribe en archivos separados.
 *
 * El nivel "info" significa:
 *   - se registrarán: info, warn, error
 *   - NO se registrarán: debug, verbose, silly
 */
const loggerOptions: LoggerOptions = {
    level: "info" satisfies LogLevel,
    format: loggerFormat,
    transports: [
        new winston.transports.Console(),
        rotatingFileTransport
    ],
    exceptionHandlers: [
        new DailyRotateFile(exceptionRotationOptions)
    ]
};

/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  INSTANCIA FINAL DEL LOGGER
 * ──────────────────────────────────────────────────────────────────────────────
 * winston.createLogger() devuelve la instancia central del sistema de logs.
 *
 * ¿Por qué exportarla así?
 *   - Un solo logger para toda la aplicación → consistencia total.
 *   - Centralización de formatos → mantenimiento más fácil.
 *   - Si mañana quieres enviar logs a:
 *         · ElasticSearch
 *         · Loki
 *         · Datadog
 *         · Graylog
 *     Solo debes agregar un transporte aquí.
 *
 * ¿Ventajas en un ERP?
 *   - Auditoría empresarial real.
 *   - Diagnóstico rápido de fallos.
 *   - Registros separados de errores críticos.
 *   - Facilidad para debugging en producción.
 */
const winstonLogger: Logger = winston.createLogger(loggerOptions);

export { winstonLogger };
