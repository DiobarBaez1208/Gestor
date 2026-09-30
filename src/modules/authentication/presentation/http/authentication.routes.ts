import { createAuthenticationMiddleware } from "@core/middlewares/authentication.middleware";
import { JwtTokenService } from "../../infrastructure/security/jwt-token-service";
import { validationMiddleware } from "@core/middlewares/validation.middleware";
import { AuthenticationController } from "./authentication.controller";
import { getSessionSchema } from "./validation/get-session.schema";
import { logoutSchema } from "./validation/logout.schema";
import { loginSchema } from "./validation/login.schema";
import { Router } from "express";

export function createAuthenticationRoutes( controller: AuthenticationController): Router {

    const router = Router();

    const tokenService =  new JwtTokenService();

    router.post( "/login",
        validationMiddleware(loginSchema),
        controller.login.bind(controller),
    );

    router.post( "/logout",
        createAuthenticationMiddleware(tokenService),
        validationMiddleware(logoutSchema),
        controller.logout.bind(controller),
    );

    router.get( "/session/:sessionId",
        createAuthenticationMiddleware(tokenService),
        validationMiddleware(getSessionSchema),
        controller.getSession.bind(controller),
    );

    return router;
}