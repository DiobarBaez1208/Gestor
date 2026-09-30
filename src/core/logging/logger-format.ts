
import type { Logform } from "winston";
import winston from "winston";


export const loggerFormat: Logform.Format = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);


export const consoleFormat: Logform.Format = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),

    winston.format.printf(
        (info): string => {
            const { timestamp, level, message, ...metadata } = info;
            const extra = Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";
            return (
                `${timestamp} ` +
                `[${String(level).toUpperCase()}] ` +
                `${String(message)}` +
                extra
            );
        },
    ),
);