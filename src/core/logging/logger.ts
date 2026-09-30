import { consoleTransport, applicationTransport, exceptionTransport, rejectionTransport } from "./logger-transports";
import type { Logger, LoggerOptions } from "winston";
import { loggerConfig } from "./logger-config.js";
import winston from "winston";


const loggerOptions: LoggerOptions = {

    level: loggerConfig.level,

    transports: [
        consoleTransport,
        applicationTransport,
    ],

    exceptionHandlers: [
        exceptionTransport,
    ],

    rejectionHandlers: [
        rejectionTransport,
    ],
};


export const winstonLogger: Logger = winston.createLogger(
    loggerOptions,
);


