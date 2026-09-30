import path from "node:path";

export type LogLevel =
    | "error"
    | "warn"
    | "info"
    | "http"
    | "verbose"
    | "debug"
    | "silly";


export const loggerConfig = {
    level: "info" satisfies LogLevel,
    directory: path.resolve(process.cwd(), "logs"),
    application: {
        filename: "application-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d"
    },
    exceptions: {
        filename: "exceptions-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
    },
    rejections: {
        filename: "rejections-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
    }
} as const;