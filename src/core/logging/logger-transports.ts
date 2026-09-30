import { loggerFormat, consoleFormat } from "./logger-format.js";
import DailyRotateFile from "winston-daily-rotate-file";
import { loggerConfig } from "./logger-config.js";
import winston from "winston";

const consoleTransport = new winston.transports.Console({ format: consoleFormat });

const applicationTransport = new DailyRotateFile({
    dirname: loggerConfig.directory,
    filename: loggerConfig.application.filename,
    datePattern: loggerConfig.application.datePattern,
    maxSize: loggerConfig.application.maxSize,
    maxFiles: loggerConfig.application.maxFiles,
    format: loggerFormat,
});

const exceptionTransport = new DailyRotateFile({
    dirname: loggerConfig.directory,
    filename: loggerConfig.exceptions.filename,
    datePattern: loggerConfig.exceptions.datePattern,
    maxSize: loggerConfig.exceptions.maxSize,
    maxFiles: loggerConfig.exceptions.maxFiles,
    format: loggerFormat,
});

const rejectionTransport = new DailyRotateFile({
    dirname: loggerConfig.directory,
    filename: loggerConfig.rejections.filename,
    datePattern: loggerConfig.rejections.datePattern,
    maxSize: loggerConfig.rejections.maxSize,
    maxFiles: loggerConfig.rejections.maxFiles,
    format: loggerFormat,
});

export {
    consoleTransport,
    applicationTransport,
    exceptionTransport,
    rejectionTransport,
};