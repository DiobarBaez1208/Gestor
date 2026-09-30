import type { LoginCommand } from "./login.command";
import type { LoginResult } from "./login.result";

import type { UserAuthenticationRepository } from "../../contracts/repositories/user-authentication.repository";
import type { SessionRepository } from "../../contracts/repositories/session.repository";

import type { PasswordHasher } from "../../contracts/services/password-hasher";
import type { TokenService } from "../../contracts/services/token-service";

import { InvalidCredentialsError } from "../../../domain/errors/invalid-credentials.error";
import { SessionId } from "../../../domain/value-objects/session-id.value-object";
import { RefreshToken } from "../../../domain/value-objects/refresh-token.value-object";
import { Session } from "../../../domain/entities/session.aggregate";

import crypto from "node:crypto";

export class LoginHandler {

    constructor(
        // persistencia 
        private readonly userAuthenticationRepository: UserAuthenticationRepository,
        private readonly sessionRepository: SessionRepository,
        // servicios
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenService: TokenService,
    ) { }

    async execute(command: LoginCommand): Promise<LoginResult> {

        const user = await this.userAuthenticationRepository.findByEmail(
            command.email,
        );

        if (!user) throw new InvalidCredentialsError();

        const passwordValid = await this.passwordHasher.verify(
            command.password,
            user.passwordHash,
        );

        if (!passwordValid) throw new InvalidCredentialsError();

        const accessToken = this.tokenService.generateAccessToken({
            userId: user.userId,
            roleId: user.roleId,
        });

        const refreshTokenValue = crypto.randomBytes(64).toString("hex");

        const session = Session.create(
            SessionId.create(crypto.randomUUID()),
            user.userId,
            RefreshToken.create(refreshTokenValue),
            new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        );

        await this.sessionRepository.save(session);

        return {
            accessToken,
            refreshToken: refreshTokenValue,
        };
    }
}