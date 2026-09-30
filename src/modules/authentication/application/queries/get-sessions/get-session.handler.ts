import type { SessionRepository } from "../../contracts/repositories/session.repository";
import { SessionNotFoundError } from "../../../domain/errors/session-not-found.error";
import type { GetSessionQuery } from "./get-session.query";
import type { GetSessionResult } from "./get-session.result";

export class GetSessionHandler {

    constructor(private readonly sessionRepository: SessionRepository) { }

    async execute(query: GetSessionQuery): Promise<GetSessionResult> {

        const session = await this.sessionRepository.findById(
            query.sessionId,
        );

        if (!session) throw new SessionNotFoundError();

        return {
            id: session.getId().getValue(),
            userId: session.getUserId(),
            createdAt: session.getCreatedAt(),
            expiresAt: session.getExpiresAt(),
            revokedAt: session.getRevokedAt(),
            active: session.isActive(),
        };
    }
}