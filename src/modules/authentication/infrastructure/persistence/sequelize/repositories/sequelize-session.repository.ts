import { SessionRepository } from "@src/modules/authentication/application/contracts/repositories/session.repository";
import { SessionId } from "@src/modules/authentication/domain/value-objects/session-id.value-object";
import { Session } from "@src/modules/authentication/domain/entities/session.aggregate";
import { SessionMapper } from "../mappers/session.mapper";
import { SessionModel } from "../models/session.model";

export class SequelizeSessionRepository implements SessionRepository {

    async findById(id: SessionId): Promise<Session | null> {
        const model = await SessionModel.findByPk(
            id.getValue(),
        );
        if (!model) return null
        return SessionMapper.toDomain(model);
    }

    async save(session: Session): Promise<void> {
        const data = SessionMapper.toPersistence(session);
        await SessionModel.upsert(data);
    }
}