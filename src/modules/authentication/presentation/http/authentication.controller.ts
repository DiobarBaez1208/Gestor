import type { LoginHandler } from "../../application/command/login/login.handler";
import type { LogoutHandler } from "../../application/command/logout/logout.handler";
import type { GetSessionHandler } from "../../application/queries/get-sessions/get-session.handler";

import { SessionId } from "../../domain/value-objects/session-id.value-object";

import type { ApiRequest } from "@core/http/endpoint/api-request";
import type { ApiResponse } from "@core/http/endpoint/api-response";
import { HttpStatus } from "@core/http/http-status";

import type { LoginEndpoint } from "./validation/login.schema";
import type { LogoutEndpoint } from "./validation/logout.schema";
import type { GetSessionEndpoint } from "./validation/get-session.schema";

export class AuthenticationController {

    constructor(
        private readonly loginHandler: LoginHandler,
        private readonly logoutHandler: LogoutHandler,
        private readonly getSessionHandler: GetSessionHandler,
    ) { }

    async login(req: ApiRequest<LoginEndpoint>, res: ApiResponse<LoginEndpoint>): Promise<void> {
        const result = await this.loginHandler.execute({ email: req.body.email, password: req.body.password, });
        res.status(HttpStatus.OK).json({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    }

    async logout(req: ApiRequest<LogoutEndpoint>, res: ApiResponse<LogoutEndpoint>): Promise<void> {
        await this.logoutHandler.execute({ sessionId: SessionId.create(req.body.sessionId) });
        res.status(HttpStatus.NO_CONTENT).send();
    }

    async getSession(req: ApiRequest<GetSessionEndpoint>, res: ApiResponse<GetSessionEndpoint>): Promise<void> {
        const sessionId = SessionId.create(req.params.sessionId);
        const result = await this.getSessionHandler.execute({ sessionId });
        res.status(HttpStatus.OK).json({
            id: result.id,
            userId: result.userId,
            createdAt: result.createdAt.toISOString(),
            expiresAt: result.expiresAt.toISOString(),
            revokedAt:
                result.revokedAt?.toISOString() ?? null,
            active: result.active,
        });
    }
}