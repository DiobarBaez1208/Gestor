import type { TokenPayload, TokenService } from "@src/modules/authentication/application/contracts/services/token-service"
import { appConfig } from "@core/config/app-config"
import jwt from "jsonwebtoken";

export class JwtTokenService implements TokenService {

    generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, appConfig.jwt_secret);
    }

    verifyAccessToken(token: string): TokenPayload {
        return jwt.verify(
            token,
            appConfig.jwt_secret,
        ) as TokenPayload;
    }
}