import { getRequestContext } from "@core/http/request-context.storage.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { StreamOptions, Options } from "morgan";
import type { RequestHandler } from "express";
import { winstonLogger } from "./logger";
import morgan from "morgan";

const stream: StreamOptions = {
    write: (message: string): void => {
        const context = getRequestContext();
        winstonLogger.http(message.trim(), {
            requestId: context?.requestId,
            correlationId: context?.correlationId,
            userId: context?.userId,
        });
    },
};

const options: Options<IncomingMessage, ServerResponse> = {
    stream
};

const httpLogger: RequestHandler = morgan("combined", options);

export { httpLogger };