import { Session } from "../../../../domain/entities/session.aggregate";
import { SessionId } from "../../../../domain/value-objects/session-id.value-object";
import { RefreshToken } from "../../../../domain/value-objects/refresh-token.value-object";
import type { SessionModel } from "../models/session.model";

export class SessionMapper {

    static toDomain(model: SessionModel): Session {

        const session = Session.rehydrate(
            SessionId.create(model.id),
            model.userId,
            RefreshToken.create(model.refreshToken),
            model.createdAt,
            model.expiresAt,
            model.revokedAt,
        );

        return session;
    }

    static toPersistence( session: Session ) {
        return {
            id: session.getId().getValue(),
            userId: session.getUserId(),
            refreshToken: session.getRefreshToken().getValue(),
            createdAt: session.getCreatedAt(),
            expiresAt: session.getExpiresAt(),
            revokedAt: session.getRevokedAt(),
        };
    }
}